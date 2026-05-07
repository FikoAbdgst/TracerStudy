import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    red: '#dc2626', redLight: '#fff1f2',
};

function Modal({ open, onClose, title, children, footer }) {
    const [visible, setVisible] = useState(false);
    const [render, setRender] = useState(false);
    useEffect(() => {
        if (open) { setRender(true); requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); }
        else { setVisible(false); const t = setTimeout(() => setRender(false), 260); return () => clearTimeout(t); }
    }, [open]);
    if (!render) return null;
    return (
        <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease',
        }}>
            <div style={{
                background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440,
                boxShadow: '0 24px 60px rgba(10,20,40,0.2)', overflow: 'hidden',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
                transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1)',
            }}>
                <div style={{ padding: '20px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.borderSoft}` }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: T.navy }}>{title}</span>
                    <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: T.bg, color: T.mutedDark, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.background = T.border}
                        onMouseLeave={e => e.currentTarget.style.background = T.bg}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div style={{ padding: '18px 22px' }}>{children}</div>
                {footer && <>
                    <div style={{ height: 1, background: T.borderSoft, margin: '0 22px' }} />
                    <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div>
                </>}
            </div>
        </div>
    );
}

const BtnGhost = ({ children, onClick }) => (
    <button type="button" onClick={onClick} style={{ height: 36, padding: '0 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: 'transparent', color: T.mutedDark, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.background = T.bg; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >{children}</button>
);

const fieldBase = { height: 42, padding: '0 13px', border: `1.5px solid ${T.border}`, borderRadius: 9, background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none', width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box' };
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; e.target.style.boxShadow = 'none'; };

export default function TinjauLowonganIndex({ jobs }) {
    const [q, setQ] = useState('');
    const [confirm, setConfirm] = useState(null); // job to force-close
    const [closing, setClosing] = useState(false);

    const filtered = jobs.filter(job =>
        job.title.toLowerCase().includes(q.toLowerCase()) ||
        job.company?.name?.toLowerCase().includes(q.toLowerCase())
    );

    const handleForceClose = () => {
        setClosing(true);
        router.patch(route('adminkampus.tinjau-lowongan.force-close', confirm.id), {}, {
            preserveScroll: true,
            onFinish: () => { setClosing(false); setConfirm(null); },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Tinjau Lowongan Aktif</h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Pantau semua lowongan aktif — tutup paksa jika melanggar aturan</p>
                </div>
            }
        >
            <Head title="Tinjau Lowongan — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .ak-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes rowIn  { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
                .tbl-row:hover td { background:#fafbfc; }
            `}</style>

            <div className="ak-root">
                <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20, animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,0.2)' }} />
                            <span style={{ fontSize: 13, color: T.mutedDark }}>
                                <span style={{ fontWeight: 700, color: T.navy }}>{filtered.length}</span> lowongan aktif
                            </span>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#b0bec5' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input style={{ ...fieldBase, paddingLeft: 33, width: 240 }} placeholder="Cari posisi atau perusahaan..."
                                value={q} onChange={e => setQ(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                        </div>
                    </div>

                    <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.borderSoft}` }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                                    {['Posisi Pekerjaan', 'Perusahaan', 'Lokasi', 'Aksi'].map((h, i) => (
                                        <th key={i} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((job, i) => (
                                    <tr key={job.id} className="tbl-row" style={{ borderBottom: `1px solid ${T.borderSoft}`, animation: `rowIn 0.26s ${i * 0.04}s both` }}>
                                        <td style={{ padding: '13px 14px' }}>
                                            <div style={{ fontSize: 13.5, fontWeight: 700, color: T.navy }}>{job.title}</div>
                                            {job.salary_range && <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>{job.salary_range}</div>}
                                        </td>
                                        <td style={{ padding: '13px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 26, height: 26, borderRadius: 6, background: T.navyLight, color: T.navyMid, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {job.company?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                                </div>
                                                <span style={{ fontSize: 13, color: T.mutedDark }}>{job.company?.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '13px 14px', fontSize: 13, color: T.muted }}>{job.location || '—'}</td>
                                        <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                                            <button onClick={() => setConfirm(job)} style={{
                                                height: 30, padding: '0 13px', borderRadius: 7,
                                                border: `1.5px solid #fecaca`, background: T.redLight,
                                                color: T.red, fontSize: 12, fontWeight: 600,
                                                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.14s',
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                                onMouseLeave={e => e.currentTarget.style.background = T.redLight}
                                            >
                                                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                Tutup Paksa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={4} style={{ padding: '48px 16px', textAlign: 'center', fontSize: 13, color: T.muted }}>
                                        Tidak ada lowongan aktif ditemukan.
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Konfirmasi Tutup Paksa"
                footer={<>
                    <BtnGhost onClick={() => setConfirm(null)}>Batal</BtnGhost>
                    <button onClick={handleForceClose} disabled={closing} style={{
                        height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
                        background: closing ? T.muted : T.red, color: '#fff',
                        fontSize: 13, fontWeight: 700, cursor: closing ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.15s',
                        boxShadow: closing ? 'none' : '0 2px 8px rgba(220,38,38,0.28)',
                    }}
                        onMouseEnter={e => { if (!closing) { e.currentTarget.style.background = '#b91c1c'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.background = closing ? T.muted : T.red; e.currentTarget.style.transform = 'none'; }}
                    >
                        {closing ? 'Menutup...' : 'Ya, Tutup Paksa'}
                    </button>
                </>}
            >
                {confirm && (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: T.redLight, color: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: T.navy, margin: '0 0 5px' }}>
                                Tutup paksa lowongan <em style={{ fontStyle: 'normal', color: T.red }}>"{confirm.title}"</em>?
                            </p>
                            <p style={{ fontSize: 13, color: T.mutedDark, margin: 0, lineHeight: 1.55 }}>
                                Lowongan dari <strong>{confirm.company?.name}</strong> akan segera ditutup dan tidak bisa lagi menerima lamaran baru.
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
