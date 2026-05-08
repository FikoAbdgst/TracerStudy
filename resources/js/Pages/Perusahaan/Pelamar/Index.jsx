import React, { useState, useMemo, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

/* ─── Tokens ─────────────────────────────────────────────────────────────── */
const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626', redLight: '#fff1f2',
    purple: '#7c3aed', purpleLight: '#f5f3ff',
};

const fieldBase = { height: 42, padding: '0 13px', border: `1.5px solid ${T.border}`, borderRadius: 9, background: '#fff', color: T.navy, fontSize: 13.5, outline: 'none', width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box' };
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; };

/* ─── Status ─────────────────────────────────────────────────────────────── */
const statusMap = {
    pending: { bg: T.borderSoft, color: T.mutedDark, label: 'Menunggu' },
    direview: { bg: T.navyLight, color: T.navyMid, label: 'Direview' },
    wawancara: { bg: T.purpleLight, color: T.purple, label: 'Wawancara' },
    diterima: { bg: T.greenLight, color: T.green, label: 'Diterima' },
    ditolak: { bg: T.redLight, color: T.red, label: 'Ditolak' },
};
const StatusBadge = ({ status }) => {
    const s = statusMap[status] ?? statusMap.pending;
    return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{s.label}</span>;
};

/* ─── Info Row helper ────────────────────────────────────────────────────── */
const InfoRow = ({ label, value }) => (
    <div>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{value}</div>
    </div>
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function PelamarIndex({ applications }) {
    const [activeJobId, setActiveJobId] = useState(null);
    const [activeAppId, setActiveAppId] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); // State pencarian/filter skill

    const { data, setData, patch, processing } = useForm({ status: '', notes: '' });

    // Grouping aplikasi berdasarkan Job Posting
    const groupedJobs = useMemo(() => {
        const groups = {};
        applications.forEach(app => {
            const jobId = app.job_posting.id;
            if (!groups[jobId]) {
                groups[jobId] = {
                    id: jobId,
                    title: app.job_posting.title,
                    location: app.job_posting.location,
                    salary_range: app.job_posting.salary_range,
                    requirements: app.job_posting.requirements, // <-- Ambil data requirements
                    applications: []
                };
            }
            groups[jobId].applications.push(app);
        });
        return Object.values(groups);
    }, [applications]);

    const activeJob = groupedJobs.find(j => j.id === activeJobId);

    // Filter Pelamar Aktif berdasarkan Nama ATAU Skills
    const filteredApps = useMemo(() => {
        if (!activeJob) return [];
        if (!searchQuery) return activeJob.applications;

        return activeJob.applications.filter(app => {
            const q = searchQuery.toLowerCase();
            const nameMatch = app.alumni?.user?.name?.toLowerCase().includes(q);
            const skillsMatch = app.alumni?.skills?.toLowerCase().includes(q);
            return nameMatch || skillsMatch;
        });
    }, [activeJob, searchQuery]);

    const activeApp = filteredApps.find(a => a.id === activeAppId);

    // Sync data form
    useEffect(() => {
        if (activeApp) {
            setData({ status: activeApp.status || 'pending', notes: activeApp.notes || '' });
        }
    }, [activeAppId, applications]);

    const submitStatus = e => {
        e.preventDefault();
        if (!activeApp) return;
        patch(route('perusahaan.pelamar.status', activeApp.id), { preserveScroll: true });
    };

    const formatDate = d => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>
                        {activeJob ? `Pelamar: ${activeJob.title}` : 'Daftar Pelamar'}
                    </h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>
                        {activeJob ? 'Tinjau kecocokan profil pelamar dengan kebutuhan posisi' : 'Kelola dan proses lamaran masuk berdasarkan posisi'}
                    </p>
                </div>
            }
        >
            <Head title="Daftar Pelamar — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                [data-radix-popper-content-wrapper] { z-index: 99999 !important; }
                .ak-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes fadeCard { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
            `}</style>

            <div className="ak-root">

                {/* ─── GRID KARTU LOWONGAN ─── */}
                {!activeJob && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                        {groupedJobs.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', background: '#fff', padding: 40, textAlign: 'center', borderRadius: 14, border: `1px solid ${T.borderSoft}` }}>
                                <p style={{ fontSize: 14, color: T.mutedDark, fontWeight: 600 }}>Belum ada pelamar yang masuk ke lowongan Anda.</p>
                            </div>
                        ) : (
                            groupedJobs.map((job, idx) => (
                                <div key={job.id} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20, animation: `fadeCard 0.3s ${idx * 0.05}s both`, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: 16, fontWeight: 800, color: T.navy, margin: '0 0 4px', lineHeight: 1.3 }}>{job.title}</h3>
                                            <div style={{ fontSize: 12, color: T.mutedDark }}>{job.location || 'Lokasi tidak spesifik'}</div>
                                        </div>
                                        <div style={{ background: T.orangeLight, color: T.orange, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 800 }}>
                                            {job.applications.length} Pelamar
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', gap: -8, marginTop: 10, marginBottom: 20, paddingLeft: 8 }}>
                                            {job.applications.slice(0, 5).map((app, i) => (
                                                <div key={app.id} style={{ width: 30, height: 30, borderRadius: '50%', background: T.navyLight, color: T.navyMid, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, marginLeft: -8, zIndex: 10 - i }}>
                                                    {app.alumni?.user?.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                            ))}
                                            {job.applications.length > 5 && (
                                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: T.borderSoft, color: T.mutedDark, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, marginLeft: -8 }}>
                                                    +{job.applications.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveJobId(job.id)} style={{ width: '100%', height: 38, borderRadius: 8, border: `1.5px solid ${T.orange}`, background: '#fff', color: T.orange, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.orangeLight}
                                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                    >Tinjau Pelamar</button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ─── SPLIT SCREEN MASTER-DETAIL ─── */}
                {activeJob && (
                    <div style={{ animation: 'fadeCard 0.3s both' }}>
                        <button onClick={() => { setActiveJobId(null); setActiveAppId(null); setSearchQuery(''); }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: T.mutedDark, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 16 }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Kembali ke Daftar Lowongan
                        </button>

                        <div style={{ display: 'flex', gap: 0, background: '#fff', border: `1px solid ${T.borderSoft}`, borderRadius: 14, minHeight: '75vh', overflow: 'hidden' }}>

                            {/* KIRI: Daftar Pelamar + Filter */}
                            <div style={{ width: '340px', borderRight: `1px solid ${T.borderSoft}`, display: 'flex', flexDirection: 'column', background: T.bg }}>
                                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.borderSoft}`, background: '#fff' }}>
                                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Daftar Pelamar</h4>

                                    {/* Kolom Filter Skill / Nama */}
                                    <div style={{ position: 'relative' }}>
                                        <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                                        </svg>
                                        <input
                                            style={{ height: 36, padding: '0 12px 0 32px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12.5, width: '100%', outline: 'none' }}
                                            placeholder="Filter Nama atau Keahlian (Skill)..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div style={{ fontSize: 11, color: T.mutedDark, marginTop: 8 }}>{filteredApps.length} pelamar ditemukan</div>
                                </div>

                                <div style={{ overflowY: 'auto', flex: 1 }}>
                                    {filteredApps.map(app => {
                                        const isActive = activeAppId === app.id;
                                        return (
                                            <div key={app.id} onClick={() => setActiveAppId(app.id)} style={{
                                                padding: '16px 20px', borderBottom: `1px solid ${T.borderSoft}`, cursor: 'pointer', transition: 'all 0.15s',
                                                background: isActive ? '#fff' : 'transparent',
                                                borderLeft: `3px solid ${isActive ? T.orange : 'transparent'}`
                                            }}
                                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f1f5f9'; }}
                                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: T.navy }}>{app.alumni?.user?.name}</div>
                                                    <div style={{ fontSize: 11, color: T.muted }}>{formatDate(app.created_at)}</div>
                                                </div>
                                                {/* Tampilkan sepotong skill-nya sebagai hint */}
                                                <div style={{ fontSize: 12, color: T.mutedDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 8 }}>
                                                    {app.alumni?.skills || 'Belum mengisi keahlian'}
                                                </div>
                                                <StatusBadge status={app.status} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* KANAN: Detail & Profil & Proses */}
                            <div style={{ flex: 1, padding: 24, background: '#fff', overflowY: 'auto' }}>
                                {!activeApp ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: T.muted, textAlign: 'center' }}>
                                        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12, opacity: 0.5 }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                        </svg>
                                        <p style={{ fontSize: 14, fontWeight: 600 }}>Pilih salah satu pelamar di panel kiri<br />untuk melihat detail dan memproses lamaran.</p>
                                    </div>
                                ) : (
                                    <div style={{ animation: 'fadeCard 0.25s both' }}>

                                        {/* --- Header Pelamar --- */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                                            <div style={{ width: 64, height: 64, borderRadius: 16, background: T.orangeLight, color: T.orange, fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {activeApp.alumni?.user?.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ fontSize: 20, fontWeight: 800, color: T.navy, margin: '0 0 4px' }}>{activeApp.alumni?.user?.name}</h3>
                                                <div style={{ fontSize: 13, color: T.mutedDark, display: 'flex', gap: 12 }}>
                                                    <span>✉️ {activeApp.alumni?.user?.email}</span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 11, color: T.mutedDark, marginBottom: 4 }}>Dokumen Terlampir</div>
                                                {activeApp.cv_path ? (
                                                    <a href={`/storage/${activeApp.cv_path}`} target="_blank" style={{ fontSize: 13, fontWeight: 700, color: T.orange, textDecoration: 'none', background: T.orangeLight, padding: '6px 12px', borderRadius: 8, display: 'inline-block' }}>
                                                        Unduh / Lihat CV
                                                    </a>
                                                ) : <span style={{ fontSize: 12, color: T.muted, fontStyle: 'italic' }}>Tidak ada CV</span>}
                                            </div>
                                        </div>

                                        <hr style={{ border: 'none', borderTop: `1px dashed ${T.borderSoft}`, margin: '0 0 24px' }} />

                                        {/* --- Data Diri / Profil --- */}
                                        <h4 style={{ fontSize: 13, fontWeight: 800, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Profil & Kontak</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                                            <InfoRow label="Program Studi" value={activeApp.alumni?.major || '—'} />
                                            <InfoRow label="Tahun Lulus" value={activeApp.alumni?.graduation_year || '—'} />
                                            <InfoRow label="No. Telepon / WhatsApp" value={activeApp.alumni?.phone_number || '—'} />
                                            <InfoRow label="Alamat / Domisili" value={activeApp.alumni?.address || '—'} />
                                        </div>

                                        {/* --- Komparasi Skill vs Requirement --- */}
                                        <h4 style={{ fontSize: 13, fontWeight: 800, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Kecocokan Keahlian (Skills)</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 30 }}>
                                            {/* Kotak Skills Pelamar */}
                                            <div style={{ padding: 16, borderRadius: 10, background: T.bg, border: `1px solid ${T.borderSoft}` }}>
                                                <div style={{ fontSize: 11, fontWeight: 800, color: T.navyMid, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Keahlian Kandidat
                                                </div>
                                                <div style={{ fontSize: 13, color: T.navy, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                                    {activeApp.alumni?.skills || <span style={{ color: T.muted }}>Kandidat belum melengkapi kolom keahlian.</span>}
                                                </div>
                                            </div>

                                            {/* Kotak Requirement Lowongan */}
                                            <div style={{ padding: 16, borderRadius: 10, background: T.orangeLight, border: `1px solid #fed7aa` }}>
                                                <div style={{ fontSize: 11, fontWeight: 800, color: '#9a3412', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                                    Requirement Lowongan
                                                </div>
                                                <div style={{ fontSize: 13, color: '#7c2d12', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                                    {activeJob.requirements || <span style={{ color: T.muted }}>Anda tidak mengisi requirement spesifik.</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <hr style={{ border: 'none', borderTop: `1px dashed ${T.borderSoft}`, margin: '0 0 24px' }} />

                                        {/* --- Form Proses --- */}
                                        <h4 style={{ fontSize: 13, fontWeight: 800, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Tindakan & Proses</h4>
                                        <form onSubmit={submitStatus} style={{ background: T.bg, padding: 20, borderRadius: 12, border: `1px solid ${T.borderSoft}` }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6 }}>UBAH STATUS</label>
                                                    <Select value={data.status} onValueChange={v => setData('status', v)}>
                                                        <SelectTrigger className="focus:ring-0 focus:ring-offset-0" style={{ height: 42, borderRadius: 9, border: `1.5px solid ${T.border}`, background: '#fff', fontSize: 13.5 }}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper" sideOffset={4} className="z-[500] rounded-xl overflow-hidden border border-gray-200 shadow-xl" style={{ background: '#ffffff' }}>
                                                            <SelectItem className="text-sm cursor-pointer px-3 py-2" value="pending">Pending — Menunggu</SelectItem>
                                                            <SelectItem className="text-sm cursor-pointer px-3 py-2" value="direview">Sedang Direview</SelectItem>
                                                            <SelectItem className="text-sm cursor-pointer px-3 py-2" value="wawancara">Panggil Wawancara</SelectItem>
                                                            <SelectItem className="text-sm cursor-pointer px-3 py-2" value="diterima">Diterima (Hired)</SelectItem>
                                                            <SelectItem className="text-sm cursor-pointer px-3 py-2" value="ditolak">Ditolak (Rejected)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: 16 }}>
                                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6 }}>CATATAN INTERNAL (OPSIONAL)</label>
                                                <textarea style={{ ...fieldBase, height: 'auto', padding: '10px 13px', resize: 'vertical' }} rows={3}
                                                    placeholder="Contoh: Jadwal wawancara, catatan interview, alasan penolakan..."
                                                    value={data.notes} onChange={e => setData('notes', e.target.value)}
                                                    onFocus={onFocus} onBlur={onBlur} />
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <button type="submit" disabled={processing} style={{
                                                    height: 40, padding: '0 24px', borderRadius: 9, border: 'none',
                                                    background: processing ? T.muted : T.orange, color: '#fff',
                                                    fontSize: 13.5, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                                                    fontFamily: 'inherit', boxShadow: processing ? 'none' : '0 2px 10px rgba(249,115,22,0.3)',
                                                    transition: 'all 0.15s',
                                                }}>
                                                    {processing ? 'Menyimpan...' : 'Simpan Pembaruan'}
                                                </button>
                                            </div>
                                        </form>

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
