import React, { useState, useMemo } from 'react';
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

/* ─── Modal ──────────────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children, footer, wide = false }) {
    const [visible, setVisible] = React.useState(false);
    const [render, setRender] = React.useState(false);
    React.useEffect(() => {
        if (open) { setRender(true); requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); }
        else { setVisible(false); const t = setTimeout(() => setRender(false), 260); return () => clearTimeout(t); }
    }, [open]);
    if (!render) return null;
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease',
        }}>
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)', cursor: 'default' }} />
            <div style={{
                background: '#fff', borderRadius: 16, position: 'relative',
                width: '100%', maxWidth: wide ? 600 : 480,
                boxShadow: '0 24px 60px rgba(10,20,40,0.2)',
                display: 'flex', flexDirection: 'column', maxHeight: '90vh',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
                transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1)',
            }}>
                <div style={{ padding: '20px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.borderSoft}`, flexShrink: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: T.navy }}>{title}</span>
                    <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: T.bg, color: T.mutedDark, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.background = T.border}
                        onMouseLeave={e => e.currentTarget.style.background = T.bg}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1 }}>{children}</div>
                {footer && <>
                    <div style={{ height: 1, background: T.borderSoft, flexShrink: 0 }} />
                    <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>{footer}</div>
                </>}
            </div>
        </div>
    );
}

const BtnGhost = ({ children, onClick }) => (
    <button type="button" onClick={onClick} style={{ height: 36, padding: '0 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: 'transparent', color: T.mutedDark, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = T.bg}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >{children}</button>
);

const fieldBase = { height: 42, padding: '0 13px', border: `1.5px solid ${T.border}`, borderRadius: 9, background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none', width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box' };
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; e.target.style.boxShadow = 'none'; };

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
    return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>;
};

/* ─── Info Row helper ────────────────────────────────────────────────────── */
const InfoRow = ({ label, value }) => (
    <div>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{value}</div>
    </div>
);

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function PelamarIndex({ applications }) {
    const [searchName, setSearchName] = useState('');
    const [filterJob, setFilterJob] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);

    const { data, setData, patch, processing } = useForm({ status: '', notes: '' });

    const uniqueJobs = useMemo(() => [...new Set(applications.map(a => a.job_posting.title))], [applications]);

    const filtered = applications.filter(app => {
        const matchName = app.alumni?.user?.name.toLowerCase().includes(searchName.toLowerCase());
        const matchJob = filterJob === 'all' || app.job_posting.title === filterJob;
        const matchStatus = filterStatus === 'all' || app.status === filterStatus;
        return matchName && matchJob && matchStatus;
    });

    const openModal = app => {
        setSelectedApp(app);
        setData({ status: app.status || 'pending', notes: app.notes || '' });
        setModalOpen(true);
    };
    const submitStatus = e => {
        e.preventDefault();
        patch(route('perusahaan.pelamar.status', selectedApp.id), { onSuccess: () => setModalOpen(false) });
    };
    const formatDate = d => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));

    // Summary counts
    const counts = Object.keys(statusMap).reduce((acc, k) => ({ ...acc, [k]: applications.filter(a => a.status === k).length }), {});

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Daftar Pelamar</h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Kelola dan proses lamaran masuk dari alumni</p>
                </div>
            }
        >
            <Head title="Daftar Pelamar — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                [data-radix-popper-content-wrapper] { z-index: 99999 !important; }
                .ak-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes rowIn  { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
                .tbl-row:hover td { background:#fafbfc; }
            `}</style>

            <div className="ak-root">
                <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20, animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>

                    {/* Status Summary Pills */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {Object.entries(statusMap).map(([key, s]) => counts[key] > 0 && (
                                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, background: s.bg, border: `1px solid ${s.color}22`, cursor: 'pointer', transition: 'all 0.14s' }}
                                    onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                >
                                    <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{counts[key]} {s.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Filters */}
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative' }}>
                                <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#b0bec5' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                                </svg>
                                <input style={{ ...fieldBase, paddingLeft: 33, width: 200 }} placeholder="Cari nama pelamar..."
                                    value={searchName} onChange={e => setSearchName(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                            </div>
                            <Select value={filterJob} onValueChange={setFilterJob}>
                                <SelectTrigger className="focus:ring-0 focus:ring-offset-0" style={{ height: 42, width: 180, borderRadius: 9, border: `1.5px solid ${T.border}`, background: T.bg, fontSize: 13 }}>
                                    <SelectValue placeholder="Semua Posisi" />
                                </SelectTrigger>
                                <SelectContent position="popper" sideOffset={4} className="z-[500] rounded-xl overflow-hidden border border-gray-200 shadow-xl" style={{ background: '#ffffff' }}>
                                    <SelectItem value="all">Semua Posisi</SelectItem>
                                    {uniqueJobs.map((j, i) => <SelectItem key={i} value={j}>{j}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.borderSoft}` }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                                    {['Pelamar', 'Posisi Dilamar', 'Tanggal', 'Status', 'Aksi'].map((h, i) => (
                                        <th key={i} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((app, i) => (
                                    <tr key={app.id} className="tbl-row" style={{ borderBottom: `1px solid ${T.borderSoft}`, animation: `rowIn 0.26s ${i * 0.04}s both` }}>
                                        <td style={{ padding: '13px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: 10, background: T.orangeLight, color: T.orange, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {app.alumni?.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: T.navy }}>{app.alumni?.user?.name ?? '—'}</div>
                                                    <div style={{ fontSize: 11.5, color: T.muted }}>{app.alumni?.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '13px 14px', fontSize: 13, color: T.mutedDark }}>{app.job_posting?.title}</td>
                                        <td style={{ padding: '13px 14px', fontSize: 12.5, color: T.muted }}>{formatDate(app.created_at)}</td>
                                        <td style={{ padding: '13px 14px' }}><StatusBadge status={app.status} /></td>
                                        <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                                            <button onClick={() => openModal(app)} style={{
                                                height: 30, padding: '0 13px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.14s',
                                                border: `1.5px solid ${T.orange}`, background: T.orangeLight, color: T.orange,
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#ffedd5'}
                                                onMouseLeave={e => e.currentTarget.style.background = T.orangeLight}
                                            >Proses</button>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', fontSize: 13, color: T.muted }}>
                                        Tidak ada pelamar yang cocok dengan filter.
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Proses Lamaran */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Detail & Proses Lamaran" wide
                footer={<>
                    <BtnGhost onClick={() => setModalOpen(false)}>Batal</BtnGhost>
                    <button type="submit" form="proses-form" disabled={processing} style={{
                        height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
                        background: processing ? T.muted : T.orange, color: '#fff',
                        fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', boxShadow: processing ? 'none' : '0 2px 8px rgba(249,115,22,0.3)',
                    }}>
                        {processing ? 'Menyimpan...' : 'Simpan Keputusan'}
                    </button>
                </>}
            >
                {selectedApp && (
                    <form id="proses-form" onSubmit={submitStatus} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Pelamar card */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 10, background: T.bg, border: `1px solid ${T.borderSoft}` }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: T.orangeLight, color: T.orange, fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {selectedApp.alumni?.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 800, color: T.navy }}>{selectedApp.alumni?.user?.name}</div>
                                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{selectedApp.alumni?.user?.email}</div>
                            </div>
                            <StatusBadge status={selectedApp.status} />
                        </div>

                        {/* Info Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 14px', borderRadius: 10, background: T.bg, border: `1px solid ${T.borderSoft}` }}>
                            <InfoRow label="Posisi Dilamar" value={selectedApp.job_posting?.title} />
                            <InfoRow label="Lampiran CV" value={
                                selectedApp.cv_path
                                    ? <a href={`/storage/${selectedApp.cv_path}`} target="_blank" style={{ color: T.orange, textDecoration: 'underline', textUnderlineOffset: 2 }}>Lihat Dokumen CV</a>
                                    : <span style={{ color: T.muted, fontStyle: 'italic' }}>Tidak ada CV</span>
                            } />
                        </div>

                        {/* Status */}
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 6 }}>Status Lamaran</label>
                            <Select value={data.status} onValueChange={v => setData('status', v)}>
                                <SelectTrigger className="focus:ring-0 focus:ring-offset-0" style={{ height: 42, borderRadius: 9, border: `1.5px solid ${T.border}`, background: T.bg, fontSize: 13.5 }}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent position="popper" sideOffset={4} className="z-[500] rounded-xl overflow-hidden border border-gray-200 shadow-xl" style={{ background: '#ffffff' }}>
                                    <SelectItem className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50" value="pending">Pending — Menunggu</SelectItem>
                                    <SelectItem className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50" value="direview">Sedang Direview</SelectItem>
                                    <SelectItem className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50" value="wawancara">Panggil Wawancara</SelectItem>
                                    <SelectItem className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50" value="diterima">Diterima (Hired)</SelectItem>
                                    <SelectItem className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50" value="ditolak">Ditolak (Rejected)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Notes */}
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 6 }}>Catatan Internal</label>
                            <textarea style={{ ...fieldBase, height: 'auto', padding: '10px 13px', resize: 'vertical' }} rows={3}
                                placeholder="Jadwal wawancara atau catatan lainnya..."
                                value={data.notes} onChange={e => setData('notes', e.target.value)}
                                onFocus={onFocus} onBlur={onBlur} />
                        </div>
                    </form>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
