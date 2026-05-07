import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
};

const fieldBase = {
    height: 42, padding: '0 13px', border: `1.5px solid ${T.border}`, borderRadius: 9,
    background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none',
    width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box',
};
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; e.target.style.boxShadow = 'none'; };

/* ─── Detail Modal ───────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children }) {
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
                background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
                boxShadow: '0 24px 60px rgba(10,20,40,0.2)', overflow: 'hidden',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
                transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1)',
            }}>
                <div style={{ padding: '20px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.borderSoft}` }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: T.navy }}>{title}</span>
                    <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: T.bg, color: T.mutedDark, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = T.border}
                        onMouseLeave={e => e.currentTarget.style.background = T.bg}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div style={{ padding: '18px 22px' }}>{children}</div>
            </div>
        </div>
    );
}

const DetailRow = ({ label, value }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted }}>{label}</span>
        <span style={{ fontSize: 14, color: T.navy, fontWeight: 500 }}>{value || '—'}</span>
    </div>
);

export default function AlumniIndex({ alumni }) {
    const [q, setQ] = useState('');
    const [detail, setDetail] = useState(null);

    const filtered = alumni.filter(item =>
        item.user?.name?.toLowerCase().includes(q.toLowerCase()) ||
        item.nim?.toLowerCase().includes(q.toLowerCase())
    );

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Manajemen Data Alumni</h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Kelola dan tinjau data alumni STMIK Mardira Indonesia</p>
                </div>
            }
        >
            <Head title="Data Alumni — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .ak-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes rowIn  { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
                .tbl-row:hover td { background:#fafbfc; }
            `}</style>

            <div className="ak-root">
                <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20, animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>

                    {/* Toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                        <div style={{ fontSize: 13, color: T.muted }}>
                            Total <span style={{ fontWeight: 700, color: T.navy }}>{filtered.length}</span> alumni terdaftar
                        </div>
                        <div style={{ position: 'relative' }}>
                            <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#b0bec5' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input
                                style={{ ...fieldBase, paddingLeft: 33, width: 240 }}
                                placeholder="Cari nama atau NIM..."
                                value={q} onChange={e => setQ(e.target.value)}
                                onFocus={onFocus} onBlur={onBlur}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.borderSoft}` }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                                    {['Nama Alumni', 'NIM', 'Program Studi', 'Tahun Lulus', 'Aksi'].map((h, i) => (
                                        <th key={i} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item, i) => (
                                    <tr key={item.id} className="tbl-row" style={{ borderBottom: `1px solid ${T.borderSoft}`, animation: `rowIn 0.26s ${i * 0.04}s both` }}>
                                        <td style={{ padding: '13px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: T.orangeLight, color: T.orange, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {item.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: T.navy }}>{item.user?.name ?? '—'}</div>
                                                    <div style={{ fontSize: 11.5, color: T.muted }}>{item.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '13px 14px', fontSize: 13, color: T.mutedDark }}>{item.nim || '—'}</td>
                                        <td style={{ padding: '13px 14px', fontSize: 13, color: T.mutedDark }}>{item.major || '—'}</td>
                                        <td style={{ padding: '13px 14px' }}>
                                            {item.graduation_year
                                                ? <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: T.navyLight, color: T.navyMid }}>{item.graduation_year}</span>
                                                : <span style={{ color: T.muted }}>—</span>}
                                        </td>
                                        <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                                            <button onClick={() => setDetail(item)} style={{
                                                height: 30, padding: '0 13px', borderRadius: 7,
                                                border: `1.5px solid ${T.border}`, background: T.bg,
                                                color: T.navyMid, fontSize: 12, fontWeight: 600,
                                                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.14s',
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = T.navyMid; e.currentTarget.style.background = T.navyLight; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.bg; }}
                                            >Detail Profil</button>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', fontSize: 13, color: T.muted }}>
                                        {q ? `Tidak ada alumni cocok dengan "${q}".` : 'Belum ada data alumni.'}
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <Modal open={!!detail} onClose={() => setDetail(null)} title="Detail Profil Alumni">
                {detail && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 0 16px', borderBottom: `1px solid ${T.borderSoft}`, marginBottom: 16 }}>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: T.orangeLight, color: T.orange, fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {detail.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: T.navy }}>{detail.user?.name ?? '—'}</div>
                                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{detail.user?.email}</div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                            <DetailRow label="NIM" value={detail.nim} />
                            <DetailRow label="Tahun Lulus" value={detail.graduation_year} />
                            <DetailRow label="Program Studi" value={detail.major} />
                            <DetailRow label="No. HP" value={detail.phone} />
                            <DetailRow label="Alamat" value={detail.address} />
                            <DetailRow label="Status Pekerjaan" value={detail.employment_status} />
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
