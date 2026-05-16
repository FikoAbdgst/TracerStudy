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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSkillFilter, setSelectedSkillFilter] = useState('');
    const [sortBy, setSortBy] = useState('match_score'); // State baru untuk Sorting ATS

    const { data, setData, patch, processing } = useForm({ status: '', notes: '' });

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
                    requirements: app.job_posting.requirements || [],
                    applications: []
                };
            }
            groups[jobId].applications.push(app);
        });
        return Object.values(groups);
    }, [applications]);

    const activeJob = groupedJobs.find(j => j.id === activeJobId);

    // Filter & Sort Engine Terintegrasi
    const filteredApps = useMemo(() => {
        if (!activeJob) return [];
        let result = [...activeJob.applications];

        // 1. Proses Filter (Keahlian)
        if (selectedSkillFilter && selectedSkillFilter !== 'all') {
            result = result.filter(app => {
                const alumniSkills = app.alumni?.skills || [];
                return alumniSkills.includes(selectedSkillFilter);
            });
        }

        // 2. Proses Pencarian (Nama / Skill)
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(app => {
                const nameMatch = app.alumni?.user?.name?.toLowerCase().includes(q);
                const alumniSkills = Array.isArray(app.alumni?.skills) ? app.alumni.skills : (app.alumni?.skills ? [app.alumni.skills] : []);
                const skillsMatch = alumniSkills.some(skill => skill.toLowerCase().includes(q));
                return nameMatch || skillsMatch;
            });
        }

        // 3. Proses Pengurutan (Sorting)
        if (sortBy === 'match_score') {
            // Urutkan dari Skor TF-IDF tertinggi ke terendah
            result.sort((a, b) => b.match_score - a.match_score);
        } else if (sortBy === 'newest') {
            // Urutkan dari tanggal melamar terbaru
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (sortBy === 'oldest') {
            // Urutkan dari tanggal melamar paling lama
            result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }

        return result;
    }, [activeJob, searchQuery, selectedSkillFilter, sortBy]);

    const activeApp = filteredApps.find(a => a.id === activeAppId);

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

    const handleJobChange = (jobId) => {
        setActiveJobId(jobId);
        setActiveAppId(null);
        setSearchQuery('');
        setSelectedSkillFilter('');
        setSortBy('match_score'); // Reset ke algoritma ATS
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>
                        {activeJob ? `Pelamar: ${activeJob.title}` : 'Sistem Pelacakan Pelamar (ATS)'}
                    </h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>
                        {activeJob ? 'Tinjau kecocokan profil pelamar dengan kebutuhan posisi' : 'Algoritma TF-IDF otomatis mengurutkan pelamar paling relevan'}
                    </p>
                </div>
            }
        >
            <Head title="Sistem ATS Pelamar — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                [data-radix-popper-content-wrapper] { z-index: 99999 !important; }
                .ak-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes fadeCard { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                .left-panel-scroll::-webkit-scrollbar { width: 5px; }
                .left-panel-scroll::-webkit-scrollbar-track { background: transparent; }
                .left-panel-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .left-panel-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>

            <div className="ak-root">
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
                                    <button onClick={() => handleJobChange(job.id)} style={{ width: '100%', height: 38, borderRadius: 8, border: `1.5px solid ${T.orange}`, background: '#fff', color: T.orange, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.orangeLight}
                                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                    >Tinjau Pelamar</button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeJob && (
                    <div style={{ animation: 'fadeCard 0.3s both' }}>
                        <button onClick={() => handleJobChange(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: T.mutedDark, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 16 }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Kembali ke Daftar Lowongan
                        </button>

                        <div style={{ display: 'flex', gap: 0, background: '#fff', border: `1px solid ${T.borderSoft}`, borderRadius: 14, minHeight: '78vh', overflow: 'hidden' }}>
                            {/* KIRI: Daftar Pelamar + Filter */}
                            <div style={{ width: '380px', borderRight: `1px solid ${T.borderSoft}`, display: 'flex', flexDirection: 'column', background: T.bg, flexShrink: 0 }}>
                                <div style={{ padding: '20px', borderBottom: `1px solid ${T.borderSoft}`, background: '#fff' }}>

                                    {/* Kolom Pencarian */}
                                    <div style={{ position: 'relative', marginBottom: 12 }}>
                                        <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                                        </svg>
                                        <input
                                            style={{ height: 38, padding: '0 12px 0 32px', borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: 13, width: '100%', outline: 'none', transition: 'border 0.2s' }}
                                            placeholder="Cari Nama Pelamar..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            onFocus={onFocus} onBlur={onBlur}
                                        />
                                    </div>

                                    {/* Grid Dua Dropdown (Filter & Sorting) */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        {/* Dropdown 1: Pengurutan */}
                                        <Select value={sortBy} onValueChange={setSortBy}>
                                            <SelectTrigger style={{ height: 36, borderRadius: 8, border: `1.5px solid ${T.border}`, background: '#f8fafc', fontSize: 12, boxShadow: 'none' }}>
                                                <SelectValue placeholder="Urutkan..." />
                                            </SelectTrigger>
                                            <SelectContent position="popper" sideOffset={4} className="z-[500] rounded-xl overflow-hidden border border-gray-200 shadow-xl" style={{ background: '#ffffff' }}>
                                                <SelectItem className="text-sm cursor-pointer px-3 py-2" value="match_score">🌟 Skor Kecocokan</SelectItem>
                                                <SelectItem className="text-sm cursor-pointer px-3 py-2" value="newest">🕒 Terbaru Melamar</SelectItem>
                                                <SelectItem className="text-sm cursor-pointer px-3 py-2" value="oldest">⏳ Terlama Melamar</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {/* Dropdown 2: Filter */}
                                        <Select value={selectedSkillFilter} onValueChange={setSelectedSkillFilter}>
                                            <SelectTrigger style={{ height: 36, borderRadius: 8, border: `1.5px solid ${T.border}`, background: '#fff', fontSize: 12, boxShadow: 'none' }}>
                                                <SelectValue placeholder="Filter Keahlian..." />
                                            </SelectTrigger>
                                            <SelectContent position="popper" sideOffset={4} className="z-[500] rounded-xl overflow-hidden border border-gray-200 shadow-xl" style={{ background: '#ffffff' }}>
                                                <SelectItem className="text-sm cursor-pointer px-3 py-2 text-gray-500" value="all">Tanpa Filter</SelectItem>
                                                {activeJob.requirements?.map((reqSkill, idx) => (
                                                    <SelectItem key={idx} className="text-sm cursor-pointer px-3 py-2" value={reqSkill}>
                                                        {reqSkill}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="left-panel-scroll" style={{ overflowY: 'auto', flex: 1 }}>
                                    {filteredApps.length === 0 ? (
                                        <div style={{ padding: '40px 20px', textAlign: 'center', color: T.mutedDark, fontSize: 13 }}>
                                            Tidak ada pelamar yang sesuai kriteria pencarian/filter Anda.
                                        </div>
                                    ) : (
                                        filteredApps.map((app, index) => {
                                            const isActive = activeAppId === app.id;
                                            const alumniSkills = Array.isArray(app.alumni?.skills) ? app.alumni.skills : (app.alumni?.skills ? [app.alumni.skills] : []);

                                            // Menentukan warna badge skor TF-IDF
                                            const scoreColor = app.match_score >= 70 ? T.green : (app.match_score >= 40 ? T.orange : T.red);
                                            const scoreBg = app.match_score >= 70 ? T.greenLight : (app.match_score >= 40 ? T.orangeLight : T.redLight);

                                            return (
                                                <div key={app.id} onClick={() => setActiveAppId(app.id)} style={{
                                                    padding: '16px 20px', borderBottom: `1px solid ${T.borderSoft}`, cursor: 'pointer', transition: 'all 0.15s',
                                                    background: isActive ? '#fff' : 'transparent',
                                                    borderLeft: `3px solid ${isActive ? T.orange : 'transparent'}`,
                                                    position: 'relative'
                                                }}
                                                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f1f5f9'; }}
                                                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    {/* Skor TF-IDF Badge */}
                                                    <div style={{ position: 'absolute', top: 16, right: 20, background: scoreBg, color: scoreColor, fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6, border: `1px solid ${scoreColor}40` }}>
                                                        {app.match_score}% Cocok
                                                    </div>

                                                    <div style={{ fontSize: 14, fontWeight: 800, color: T.navy, marginBottom: 4, paddingRight: 70 }}>
                                                        {index + 1}. {app.alumni?.user?.name}
                                                    </div>

                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12, minHeight: 20 }}>
                                                        {alumniSkills.length > 0 ? (
                                                            <>
                                                                {alumniSkills.slice(0, 2).map((s, idx) => (
                                                                    <span key={idx} style={{ fontSize: 10, fontWeight: 600, background: T.borderSoft, color: T.mutedDark, padding: '2px 8px', borderRadius: 4 }}>
                                                                        {s}
                                                                    </span>
                                                                ))}
                                                                {alumniSkills.length > 2 && (
                                                                    <span style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>+{alumniSkills.length - 2} lagi</span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span style={{ fontSize: 11, color: T.muted, fontStyle: 'italic' }}>Belum mengisi keahlian</span>
                                                        )}
                                                    </div>

                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <StatusBadge status={app.status} />
                                                        <span style={{ fontSize: 10, color: T.muted }}>{formatDate(app.created_at)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* KANAN: Detail & Profil & Proses */}
                            <div style={{ flex: 1, padding: '30px 40px', background: '#fff', overflowY: 'auto' }}>
                                {!activeApp ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', height: '100%', color: T.muted, textAlign: 'center', paddingTop: '15%' }}>
                                        <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
                                        <p style={{ fontSize: 15, fontWeight: 600 }}>Pilih salah satu pelamar di panel kiri.<br />Algoritma kami telah memilah yang terbaik untuk Anda.</p>
                                    </div>
                                ) : (
                                    <div style={{ animation: 'fadeCard 0.25s both' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26 }}>
                                            <div style={{ width: 72, height: 72, borderRadius: 18, background: T.orangeLight, color: T.orange, fontSize: 26, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {activeApp.alumni?.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ fontSize: 22, fontWeight: 800, color: T.navy, margin: '0 0 6px' }}>{activeApp.alumni?.user?.name}</h3>
                                                <div style={{ fontSize: 13, color: T.mutedDark, display: 'flex', gap: 12 }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                                                        {activeApp.alumni?.user?.email}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 11, color: T.mutedDark, marginBottom: 6, textTransform: 'uppercase', fontWeight: 700 }}>Dokumen CV</div>
                                                {activeApp.cv_path ? (
                                                    <a href={`/storage/${activeApp.cv_path}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 700, color: T.orange, textDecoration: 'none', background: T.orangeLight, padding: '8px 14px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                        Lihat Dokumen
                                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                    </a>
                                                ) : <span style={{ fontSize: 12, color: T.muted, fontStyle: 'italic' }}>Tidak ada CV</span>}
                                            </div>
                                        </div>

                                        <hr style={{ border: 'none', borderTop: `1px solid ${T.borderSoft}`, margin: '0 0 26px' }} />

                                        <h4 style={{ fontSize: 13, fontWeight: 800, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Profil Akademik & Kontak</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 30 }}>
                                            <div style={{ background: T.bg, padding: 14, borderRadius: 10, border: `1px solid ${T.borderSoft}` }}><InfoRow label="Program Studi" value={activeApp.alumni?.major || '—'} /></div>
                                            <div style={{ background: T.bg, padding: 14, borderRadius: 10, border: `1px solid ${T.borderSoft}` }}><InfoRow label="Tahun Lulus" value={activeApp.alumni?.graduation_year || '—'} /></div>
                                            <div style={{ background: T.bg, padding: 14, borderRadius: 10, border: `1px solid ${T.borderSoft}` }}><InfoRow label="No. Telepon" value={activeApp.alumni?.phone_number || '—'} /></div>
                                            <div style={{ background: T.bg, padding: 14, borderRadius: 10, border: `1px solid ${T.borderSoft}` }}><InfoRow label="Domisili" value={activeApp.alumni?.address || '—'} /></div>
                                        </div>

                                        <h4 style={{ fontSize: 13, fontWeight: 800, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Komparasi Analisis Sistem (ATS)</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                                            <div style={{ padding: 18, borderRadius: 12, background: T.orangeLight, border: `1px solid #fed7aa` }}>
                                                <div style={{ fontSize: 11, fontWeight: 800, color: '#9a3412', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    Kebutuhan Posisi Anda
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                    {(!activeJob.requirements || activeJob.requirements.length === 0) ? (
                                                        <span style={{ fontSize: 12, color: '#9a3412', fontStyle: 'italic' }}>Tidak ada syarat spesifik.</span>
                                                    ) : (
                                                        activeJob.requirements.map((req, idx) => (
                                                            <span key={idx} style={{ background: '#ffedd5', color: '#c2410c', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, border: '1px solid #fdba74' }}>{req}</span>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ padding: 18, borderRadius: 12, background: T.navyLight, border: `1px solid #bfdbfe` }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <div style={{ fontSize: 11, fontWeight: 800, color: T.navyMid, textTransform: 'uppercase' }}>
                                                        Keahlian Kandidat
                                                    </div>
                                                    <div style={{ fontSize: 12, fontWeight: 800, background: '#fff', padding: '2px 8px', borderRadius: 6, color: activeApp.match_score >= 70 ? T.green : T.navyMid }}>
                                                        {activeApp.match_score}% Match
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                    {(!activeApp.alumni?.skills || activeApp.alumni.skills.length === 0) ? (
                                                        <span style={{ fontSize: 12, color: T.navyMid, fontStyle: 'italic' }}>Belum mengisi keahlian.</span>
                                                    ) : (
                                                        (Array.isArray(activeApp.alumni.skills) ? activeApp.alumni.skills : [activeApp.alumni.skills]).map((skill, idx) => {
                                                            const isMatch = activeJob.requirements?.includes(skill);
                                                            return (
                                                                <span key={idx} style={{
                                                                    background: isMatch ? T.greenLight : '#fff', color: isMatch ? T.green : T.navyMid,
                                                                    padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, border: `1px solid ${isMatch ? '#86efac' : '#cbd5e1'}`
                                                                }}>
                                                                    {isMatch && '★ '} {skill}
                                                                </span>
                                                            )
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <hr style={{ border: 'none', borderTop: `1px solid ${T.borderSoft}`, margin: '0 0 26px' }} />

                                        <h4 style={{ fontSize: 13, fontWeight: 800, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Tindakan Keputusan</h4>
                                        <form onSubmit={submitStatus} style={{ background: T.bg, padding: 22, borderRadius: 12, border: `1px solid ${T.borderSoft}` }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#374151', marginBottom: 6 }}>UBAH STATUS KANDIDAT</label>
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

                                            <div style={{ marginBottom: 20 }}>
                                                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#374151', marginBottom: 6 }}>CATATAN INTERNAL (OPSIONAL)</label>
                                                <textarea style={{ ...fieldBase, height: 'auto', padding: '12px 14px', resize: 'vertical' }} rows={3}
                                                    placeholder="Tambahkan catatan jadwal wawancara, hasil interview, atau alasan penolakan..."
                                                    value={data.notes} onChange={e => setData('notes', e.target.value)}
                                                    onFocus={onFocus} onBlur={onBlur} />
                                            </div>

                                            <div style={{ display: 'flex', justifyItems: 'flex-end' }}>
                                                <button type="submit" disabled={processing} style={{
                                                    height: 42, padding: '0 28px', borderRadius: 9, border: 'none', marginLeft: 'auto',
                                                    background: processing ? T.muted : T.orange, color: '#fff',
                                                    fontSize: 13.5, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                                                    boxShadow: processing ? 'none' : '0 4px 12px rgba(249,115,22,0.3)', transition: 'all 0.15s',
                                                }}
                                                    onMouseEnter={e => { if (!processing) { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                                                    onMouseLeave={e => { if (!processing) { e.currentTarget.style.background = T.orange; e.currentTarget.style.transform = 'none'; } }}
                                                >
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
