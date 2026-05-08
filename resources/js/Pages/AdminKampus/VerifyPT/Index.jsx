import React, { useState, useEffect } from 'react';
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
};

/* ─── Modal ──────────────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children, footer }) {
    const [visible, setVisible] = useState(false);
    const [render, setRender] = useState(false);
    useEffect(() => {
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
            {/* Blur backdrop - separate div so it doesn't create stacking context for the flex layer */}
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)', cursor: 'default' }} />
            <div style={{
                position: 'relative',
                background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
                boxShadow: '0 24px 60px rgba(10,20,40,0.2)',
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
                {footer && <>
                    <div style={{ height: 1, background: T.borderSoft, margin: '0 22px' }} />
                    <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div>
                </>}
            </div>
        </div>
    );
}

/* ─── Buttons ────────────────────────────────────────────────────────────── */
const BtnGhost = ({ children, onClick }) => (
    <button type="button" onClick={onClick} style={{ height: 36, padding: '0 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: 'transparent', color: T.mutedDark, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.background = T.bg; e.currentTarget.style.borderColor = '#c8d6e5'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = T.border; }}
    >{children}</button>
);

const BtnPrimary = ({ children, disabled, color = T.navyMid }) => (
    <button type="submit" disabled={disabled} style={{ height: 36, padding: '0 18px', borderRadius: 8, border: 'none', background: disabled ? T.muted : color, color: '#fff', fontSize: 13, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', boxShadow: disabled ? 'none' : `0 2px 8px ${color}44` }}
        onMouseEnter={e => { if (!disabled) { e.currentTarget.style.filter = 'brightness(0.88)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
        onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none'; }}
    >{children}</button>
);

/* ─── Status badge ───────────────────────────────────────────────────────── */
const statusMap = {
    verified: { bg: T.greenLight, color: T.green, label: 'Terverifikasi' },
    rejected: { bg: T.redLight, color: T.red, label: 'Ditolak' },
    pending: { bg: T.orangeLight, color: '#92400e', label: 'Menunggu' },
};
const StatusBadge = ({ status }) => {
    const s = statusMap[status] ?? statusMap.pending;
    return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>;
};

const fieldBase = { height: 42, padding: '0 13px', border: `1.5px solid ${T.border}`, borderRadius: 9, background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none', width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box' };
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; e.target.style.boxShadow = 'none'; };

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function VerifyPTIndex({ companies }) {
    const [q, setQ] = useState('');
    const [selected, setSelected] = useState(null);
    const { data, setData, patch, processing } = useForm({ verification_status: '' });

    const filtered = companies.filter(c =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        (c.industry && c.industry.toLowerCase().includes(q.toLowerCase()))
    );

    const openModal = company => {
        setSelected(company);
        setData('verification_status', company.verification_status);
    };

    const submitStatus = e => {
        e.preventDefault();
        patch(route('adminkampus.verify-pt.status', selected.id), { onSuccess: () => setSelected(null) });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Verifikasi Perusahaan Mitra</h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Tinjau legalitas perusahaan sebelum dapat memposting lowongan</p>
                </div>
            }
        >
            <Head title="Verifikasi PT — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                /* Radix portal z-index fix - must be above modal overlay */
                [data-radix-popper-content-wrapper] { z-index: 99999 !important; }

                .ak-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes rowIn  { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
                .tbl-row:hover td { background:#fafbfc; }
            `}</style>

            <div className="ak-root">
                <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20, animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>

                    {/* Summary + Search */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {Object.entries(statusMap).map(([key, s]) => {
                                const count = companies.filter(c => c.verification_status === key).length;
                                return (
                                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, background: s.bg, border: `1px solid ${s.color}22` }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{count} {s.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#b0bec5' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input style={{ ...fieldBase, paddingLeft: 33, width: 240 }} placeholder="Cari nama atau industri..."
                                value={q} onChange={e => setQ(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.borderSoft}` }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                                    {['Perusahaan', 'Sektor Industri', 'Website', 'Status', 'Aksi'].map((h, i) => (
                                        <th key={i} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c, i) => (
                                    <tr key={c.id} className="tbl-row" style={{ borderBottom: `1px solid ${T.borderSoft}`, animation: `rowIn 0.26s ${i * 0.04}s both` }}>
                                        <td style={{ padding: '13px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: 8, background: T.navyLight, color: T.navyMid, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {c.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: T.navy }}>{c.name}</div>
                                                    <div style={{ fontSize: 11.5, color: T.muted }}>{c.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '13px 14px', fontSize: 13, color: T.mutedDark }}>{c.industry || '—'}</td>
                                        <td style={{ padding: '13px 14px', fontSize: 13 }}>
                                            {c.website
                                                ? <a href={c.website} target="_blank" style={{ color: T.orange, textDecoration: 'underline', textUnderlineOffset: 2 }}>Kunjungi</a>
                                                : '—'}
                                        </td>
                                        <td style={{ padding: '13px 14px' }}><StatusBadge status={c.verification_status} /></td>
                                        <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                                            <button onClick={() => openModal(c)} style={{
                                                height: 30, padding: '0 13px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.14s',
                                                border: `1.5px solid ${c.verification_status === 'pending' ? T.orange : T.border}`,
                                                background: c.verification_status === 'pending' ? T.orangeLight : T.bg,
                                                color: c.verification_status === 'pending' ? T.orange : T.navyMid,
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.93)'}
                                                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                                            >Tinjau</button>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', fontSize: 13, color: T.muted }}>
                                        Tidak ada perusahaan ditemukan.
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Verifikasi */}
            <Modal open={!!selected} onClose={() => setSelected(null)} title="Tinjau Perusahaan"
                footer={<>
                    <BtnGhost onClick={() => setSelected(null)}>Batal</BtnGhost>
                    <BtnPrimary disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan Status'}</BtnPrimary>
                </>}
            >
                {selected && (
                    <form onSubmit={submitStatus} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Company info card */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 10, background: T.bg, border: `1px solid ${T.borderSoft}` }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: T.navyLight, color: T.navyMid, fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {selected.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: T.navy }}>{selected.name}</div>
                                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{selected.industry || '—'}</div>
                            </div>
                            <div style={{ marginLeft: 'auto' }}><StatusBadge status={selected.verification_status} /></div>
                        </div>

                        {selected.address && (
                            <div style={{ fontSize: 13, color: T.mutedDark, padding: '10px 14px', borderRadius: 8, background: T.bg, border: `1px solid ${T.borderSoft}` }}>
                                📍 {selected.address}
                            </div>
                        )}
                        {selected.description && (
                            <div style={{ fontSize: 13, color: T.mutedDark, padding: '10px 14px', borderRadius: 8, background: T.bg, border: `1px solid ${T.borderSoft}`, lineHeight: 1.6 }}>
                                {selected.description}
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 6 }}>Status Verifikasi</label>
                            <Select value={data.verification_status} onValueChange={v => setData('verification_status', v)}>
                                <SelectTrigger className="focus:ring-0 focus:ring-offset-0" style={{ height: 42, borderRadius: 9, border: `1.5px solid ${T.border}`, background: T.bg, fontSize: 13.5 }}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent position="popper" sideOffset={4} className="z-[500] rounded-xl overflow-hidden border border-gray-200 shadow-xl" style={{ background: "#ffffff", minWidth: "var(--radix-select-trigger-width)" }}>
                                    <SelectItem className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50" style={{ color: "#1e293b", background: "transparent" }} value="pending">Menunggu Peninjauan</SelectItem>
                                    <SelectItem className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50" style={{ color: "#1e293b", background: "transparent" }} value="verified">Terverifikasi — Izinkan Posting</SelectItem>
                                    <SelectItem className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50" style={{ color: "#1e293b", background: "transparent" }} value="rejected">Tolak Perusahaan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </form>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
