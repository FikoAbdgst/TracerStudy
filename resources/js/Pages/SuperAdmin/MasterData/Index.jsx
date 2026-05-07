import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // <--- Tambahkan import ini
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';

/* ─── shared style tokens ───────────────────────────────────────────────── */
const TOKEN = {
    navy: '#0f1f3d',
    navyMid: '#1a3560',
    navyLight: '#e8f0fb',
    orange: '#f97316',
    orangeLight: '#fff3eb',
    border: '#e2e8f0',
    borderSoft: '#f1f5f9',
    bg: '#f8fafc',
    muted: '#94a3b8',
    mutedDark: '#64748b',
    danger: '#ef4444',
    dangerLight: '#fef2f2',
    success: '#10b981',
    successLight: '#ecfdf5',
};

const fieldBase = {
    height: '42px',
    padding: '0 13px',
    border: `1.5px solid ${TOKEN.border}`,
    borderRadius: '9px',
    background: TOKEN.bg,
    color: TOKEN.navy,
    fontSize: '13.5px',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.18s, background 0.18s, box-shadow 0.18s',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
};

const editFieldBase = {
    ...fieldBase,
    height: '32px',
    fontSize: '12.5px',
    borderRadius: '6px',
    padding: '0 10px',
};

const onFocus = (e) => {
    e.target.style.borderColor = TOKEN.navyMid;
    e.target.style.background = '#fff';
    e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)';
};
const onBlur = (e) => {
    e.target.style.borderColor = TOKEN.border;
    e.target.style.background = TOKEN.bg;
    e.target.style.boxShadow = 'none';
};

/* ─── Sub-components ─────────────────────────────────────────────────────── */

const FieldLabel = ({ children }) => (
    <label style={{
        display: 'block', fontSize: '11px', fontWeight: 700,
        color: '#374151', letterSpacing: '0.06em',
        textTransform: 'uppercase', marginBottom: '5px',
    }}>
        {children}
    </label>
);

const BtnGhost = ({ children, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        style={{
            height: '38px', padding: '0 16px',
            background: 'transparent', color: '#64748b',
            border: '1.5px solid #e2e8f0', borderRadius: '9px',
            fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
            cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f0f4f9'; e.currentTarget.style.borderColor = '#d1d9e3'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
    >
        {children}
    </button>
);

/* ─── Perbaikan Komponen Modal (Menggunakan Portal) ──────────────────────── */
function Modal({ open, onClose, title, children, footer }) {
    const [visible, setVisible] = useState(false);
    const [render, setRender] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (open) {
            setRender(true);
            document.body.style.overflow = 'hidden'; // Mencegah background bisa di-scroll
            requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
        } else {
            setVisible(false);
            document.body.style.overflow = ''; // Mengembalikan scroll
            const t = setTimeout(() => setRender(false), 260);
            return () => clearTimeout(t);
        }
    }, [open]);

    if (!render || !mounted) return null;

    return createPortal(
        <>
            <style>{`
                .modal-backdrop {
                    position: fixed; inset: 0; z-index: 9999; /* Pastikan z-index tertinggi */
                    background: rgba(10, 20, 40, 0.45);
                    backdrop-filter: blur(3px);
                    display: flex; align-items: center; justify-content: center;
                    padding: 20px;
                    transition: opacity 0.25s ease;
                }
                .modal-backdrop.in  { opacity: 1; }
                .modal-backdrop.out { opacity: 0; }

                .modal-box {
                    background: #ffffff;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 480px;
                    box-shadow: 0 24px 60px rgba(10,20,40,0.2), 0 4px 12px rgba(10,20,40,0.08);
                    overflow: hidden;
                    transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1);
                }
                .modal-box.in  { opacity: 1; transform: translateY(0) scale(1); }
                .modal-box.out { opacity: 0; transform: translateY(10px) scale(0.97); }

                .modal-header {
                    padding: 22px 24px 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .modal-title {
                    font-size: 16px;
                    font-weight: 800;
                    color: #0f1f3d;
                    letter-spacing: -0.01em;
                }
                .modal-close {
                    width: 30px; height: 30px;
                    border-radius: 7px;
                    border: none;
                    background: #f0f4f9;
                    color: #64748b;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                    transition: background 0.15s, color 0.15s;
                }
                .modal-close:hover { background: #e2e8f0; color: #1a3560; }

                .modal-body {
                    padding: 20px 24px;
                }

                .modal-footer {
                    padding: 0 24px 20px;
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                }

                .modal-divider {
                    height: 1px;
                    background: #f1f5f9;
                    margin: 0 24px 16px;
                }
            `}</style>

            <div
                className={`modal-backdrop ${visible ? 'in' : 'out'}`}
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div className={`modal-box ${visible ? 'in' : 'out'}`}>
                    <div className="modal-header">
                        <span className="modal-title">{title}</span>
                        <button className="modal-close" onClick={onClose}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="modal-body">{children}</div>
                    {footer && (
                        <>
                            <div className="modal-divider" />
                            <div className="modal-footer">{footer}</div>
                        </>
                    )}
                </div>
            </div>
        </>,
        document.body
    );
}
/* ────────────────────────────────────────────────────────────────────────── */

function EmptyState({ message }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '52px 24px', gap: 10,
        }}>
            <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: TOKEN.navyLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={TOKEN.navyMid} strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
                </svg>
            </div>
            <p style={{ fontSize: 13, color: TOKEN.muted, margin: 0, fontWeight: 500 }}>{message}</p>
        </div>
    );
}

function DataTable({ headers, rows, emptyMessage }) {
    return (
        <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${TOKEN.borderSoft}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: TOKEN.bg, borderBottom: `1px solid ${TOKEN.border}` }}>
                        {headers.map((h, i) => {
                            const isFirst = i === 0;
                            const isLast = i === headers.length - 1;
                            return (
                                <th key={i} style={{
                                    padding: '10px 16px',
                                    fontSize: '11px', fontWeight: 700,
                                    color: '#374151', letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    textAlign: isFirst || isLast ? 'center' : 'left',
                                    width: isFirst ? '52px' : (isLast ? '100px' : 'auto'),
                                }}>
                                    {h}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0
                        ? (
                            <tr>
                                <td colSpan={headers.length}>
                                    <EmptyState message={emptyMessage} />
                                </td>
                            </tr>
                        )
                        : rows.map((cells, idx) => (
                            <tr
                                key={idx}
                                className="md-row"
                                style={{
                                    borderBottom: idx < rows.length - 1 ? `1px solid ${TOKEN.borderSoft}` : 'none',
                                    transition: 'background 0.12s',
                                    animationDelay: `${idx * 0.04}s`,
                                    animation: 'rowIn 0.28s cubic-bezier(0.22,1,0.36,1) both',
                                }}
                            >
                                {cells.map((cell, ci) => {
                                    const isFirst = ci === 0;
                                    const isLast = ci === cells.length - 1;
                                    return (
                                        <td key={ci} style={{
                                            padding: '13px 16px',
                                            textAlign: isFirst || isLast ? 'center' : 'left',
                                            fontSize: '13.5px', color: TOKEN.mutedDark,
                                        }}>
                                            {cell}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function MasterDataIndex({ prodis, industries }) {
    const [activeTab, setActiveTab] = useState('prodi');

    const prodiForm = useForm({ name: '', jenjang: '' });
    const industryForm = useForm({ name: '' });

    const submitProdi = (e) => {
        e.preventDefault();
        prodiForm.post(route('superadmin.master-data.prodi.store'), {
            onSuccess: () => prodiForm.reset(),
        });
    };

    const submitIndustry = (e) => {
        e.preventDefault();
        industryForm.post(route('superadmin.master-data.industry.store'), {
            onSuccess: () => industryForm.reset(),
        });
    };

    const jenjangOptions = ['D3', 'S1', 'S2', 'S3'];

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <h2 style={{ fontSize: '17px', fontWeight: 800, color: TOKEN.navy, margin: 0, letterSpacing: '-0.01em' }}>
                            Manajemen Master Data
                        </h2>
                        <p style={{ fontSize: '12px', color: TOKEN.muted, margin: '3px 0 0' }}>
                            Kelola data referensi program studi dan sektor industri
                        </p>
                    </div>
                    {/* Summary pills */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '5px 12px', borderRadius: 8,
                            background: TOKEN.navyLight, border: `1px solid #c7d8f0`,
                        }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: TOKEN.navyMid, display: 'inline-block' }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: TOKEN.navyMid }}>
                                {prodis.length} Program Studi
                            </span>
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '5px 12px', borderRadius: 8,
                            background: TOKEN.orangeLight, border: `1px solid #fdd8b5`,
                        }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: TOKEN.orange, display: 'inline-block' }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: TOKEN.orange }}>
                                {industries.length} Sektor Industri
                            </span>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Master Data — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

                .md-root * { font-family: 'Plus Jakarta Sans', sans-serif; }

                /* Tab bar */
                .md-tabbar {
                    display: flex; gap: 4px; background: #eef2f8;
                    border-radius: 10px; padding: 4px;
                    width: fit-content; margin-bottom: 24px;
                }

                .md-tab {
                    padding: 7px 20px; border-radius: 7px;
                    font-size: 13px; font-weight: 600; cursor: pointer;
                    border: none; background: transparent; color: ${TOKEN.muted};
                    transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
                    font-family: inherit; display: flex; align-items: center;
                    gap: 7px; white-space: nowrap;
                }

                .md-tab.active {
                    background: #ffffff; color: ${TOKEN.navy}; font-weight: 700;
                    box-shadow: 0 1px 4px rgba(26,53,96,0.10), 0 1px 2px rgba(26,53,96,0.06);
                }

                .md-tab:hover:not(.active) {
                    color: ${TOKEN.navyMid}; background: rgba(255,255,255,0.5);
                }

                .md-tab-badge {
                    display: inline-flex; align-items: center; justify-content: center;
                    min-width: 18px; height: 18px; border-radius: 9px;
                    font-size: 10px; font-weight: 800; padding: 0 5px;
                    transition: all 0.2s;
                }

                .md-tab.active .md-tab-badge { background: ${TOKEN.orange}; color: #fff; }
                .md-tab:not(.active) .md-tab-badge { background: #dde5f0; color: ${TOKEN.mutedDark}; }

                /* Layout grid */
                .md-layout {
                    display: grid; grid-template-columns: 300px 1fr;
                    gap: 20px; align-items: start;
                }

                @media (max-width: 860px) { .md-layout { grid-template-columns: 1fr; } }

                /* Cards */
                .md-form-card, .md-table-card {
                    background: #fff; border-radius: 14px;
                    border: 1px solid ${TOKEN.borderSoft}; overflow: hidden;
                    box-shadow: 0 1px 3px rgba(26,53,96,0.05);
                }

                .md-form-card-header, .md-table-card-header {
                    padding: 16px 20px; border-bottom: 1px solid ${TOKEN.borderSoft};
                    display: flex; align-items: center;
                }

                .md-form-card-header { gap: 10px; }
                .md-table-card-header { justify-content: space-between; }

                .md-form-card-icon {
                    width: 32px; height: 32px; border-radius: 8px;
                    background: ${TOKEN.navyLight}; color: ${TOKEN.navyMid};
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }

                .md-form-card-title, .md-table-card-title {
                    font-size: 13px; font-weight: 800; color: ${TOKEN.navy}; letter-spacing: -0.01em;
                }
                .md-form-card-sub { font-size: 11px; color: ${TOKEN.muted}; margin-top: 1px; }

                .md-form-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }

                /* Jenjang selector */
                .jenjang-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
                .jenjang-btn {
                    height: 38px; border-radius: 8px; border: 1.5px solid ${TOKEN.border};
                    background: ${TOKEN.bg}; font-size: 12px; font-weight: 700;
                    color: ${TOKEN.mutedDark}; cursor: pointer; transition: all 0.15s;
                    font-family: inherit; letter-spacing: 0.02em;
                }
                .jenjang-btn:hover:not(.selected) {
                    border-color: ${TOKEN.navyMid}; color: ${TOKEN.navyMid}; background: ${TOKEN.navyLight};
                }
                .jenjang-btn.selected {
                    border-color: ${TOKEN.navyMid}; background: ${TOKEN.navyMid}; color: #fff;
                    box-shadow: 0 2px 6px rgba(26,53,96,0.2);
                }

                /* Submit button */
                .md-submit {
                    height: 42px; width: 100%; border-radius: 9px; border: none;
                    background: ${TOKEN.navyMid}; color: #fff; font-size: 13px; font-weight: 700;
                    font-family: inherit; cursor: pointer; display: flex; align-items: center;
                    justify-content: center; gap: 7px; transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
                    box-shadow: 0 2px 8px rgba(26,53,96,0.18); margin-top: 4px;
                }
                .md-submit:hover:not(:disabled) {
                    background: #0f2444; box-shadow: 0 4px 14px rgba(26,53,96,0.26); transform: translateY(-1px);
                }
                .md-submit:active:not(:disabled) { transform: translateY(0); }
                .md-submit:disabled { background: #94a3b8; cursor: not-allowed; box-shadow: none; transform: none; }

                /* Table Utils */
                .md-count-badge {
                    font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
                    background: ${TOKEN.navyLight}; color: ${TOKEN.navyMid};
                }
                .md-row:hover { background: #fafbfc !important; }

                @keyframes rowIn {
                    from { opacity: 0; transform: translateX(-6px); }
                    to   { opacity: 1; transform: translateX(0); }
                }

                .md-panel { animation: panelIn 0.22s cubic-bezier(0.22,1,0.36,1) both; }
                @keyframes panelIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* Search */
                .md-search-wrap {
                    display: flex; align-items: center; gap: 10px;
                    padding: 12px 16px; border-bottom: 1px solid ${TOKEN.borderSoft};
                }
                .md-search-input {
                    flex: 1; height: 36px; border: 1.5px solid ${TOKEN.border}; border-radius: 8px;
                    background: ${TOKEN.bg}; padding: 0 12px 0 34px; font-size: 13px; font-family: inherit;
                    color: ${TOKEN.navy}; outline: none; transition: border-color 0.15s, box-shadow 0.15s;
                }
                .md-search-input:focus { border-color: ${TOKEN.navyMid}; box-shadow: 0 0 0 3px rgba(26,53,96,0.08); }
                .md-search-input::placeholder { color: #b0bec5; }
                .md-search-wrap-inner { position: relative; flex: 1; }
                .md-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #b0bec5; }

                /* Action Buttons */
                .action-btn {
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 26px; height: 26px; border-radius: 6px; border: none; cursor: pointer;
                    transition: all 0.15s; background: transparent; padding: 0; outline: none;
                }
                .action-btn.edit { color: ${TOKEN.navyMid}; }
                .action-btn.edit:hover { background: ${TOKEN.navyLight}; }
                .action-btn.delete { color: ${TOKEN.danger}; }
                .action-btn.delete:hover { background: ${TOKEN.dangerLight}; }
                .action-btn.save { color: ${TOKEN.success}; }
                .action-btn.save:hover { background: ${TOKEN.successLight}; }
                .action-btn.cancel { color: ${TOKEN.mutedDark}; }
                .action-btn.cancel:hover { background: ${TOKEN.borderSoft}; }
            `}</style>

            <div className="md-root">
                {/* Tab Bar */}
                <div className="md-tabbar">
                    {[
                        {
                            key: 'prodi', label: 'Program Studi', count: prodis.length, icon: (
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                            )
                        },
                        {
                            key: 'industry', label: 'Sektor Industri', count: industries.length, icon: (
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                </svg>
                            )
                        },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            className={`md-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.icon}
                            {tab.label}
                            <span className="md-tab-badge">{tab.count}</span>
                        </button>
                    ))}
                </div>

                {/* ── Program Studi Panel ── */}
                {activeTab === 'prodi' && (
                    <div className="md-panel md-layout">
                        {/* Form */}
                        <div className="md-form-card">
                            <div className="md-form-card-header">
                                <div className="md-form-card-icon">
                                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="md-form-card-title">Tambah Program Studi</div>
                                    <div className="md-form-card-sub">Isi form untuk mendaftarkan prodi baru</div>
                                </div>
                            </div>

                            <form onSubmit={submitProdi} className="md-form-body">
                                <div>
                                    <FieldLabel>Nama Program Studi</FieldLabel>
                                    <input
                                        style={fieldBase}
                                        placeholder="Contoh: Teknik Informatika"
                                        value={prodiForm.data.name}
                                        onChange={e => prodiForm.setData('name', e.target.value)}
                                        onFocus={onFocus} onBlur={onBlur}
                                    />
                                    <InputError message={prodiForm.errors.name} className="mt-1.5" />
                                </div>

                                <div>
                                    <FieldLabel>Jenjang Pendidikan</FieldLabel>
                                    <div className="jenjang-grid">
                                        {jenjangOptions.map(j => (
                                            <button
                                                key={j}
                                                type="button"
                                                className={`jenjang-btn ${prodiForm.data.jenjang === j ? 'selected' : ''}`}
                                                onClick={() => prodiForm.setData('jenjang', j)}
                                            >
                                                {j}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        style={{ ...fieldBase, marginTop: '7px', fontSize: '12.5px' }}
                                        placeholder="Atau ketik manual (misal: D4)"
                                        value={jenjangOptions.includes(prodiForm.data.jenjang) ? '' : prodiForm.data.jenjang}
                                        onChange={e => prodiForm.setData('jenjang', e.target.value)}
                                        onFocus={onFocus} onBlur={onBlur}
                                    />
                                    <InputError message={prodiForm.errors.jenjang} className="mt-1.5" />
                                </div>

                                <button type="submit" className="md-submit" disabled={prodiForm.processing}>
                                    {prodiForm.processing ? (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                                                <path strokeLinecap="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                                            </svg>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                            Tambah Program Studi
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Table */}
                        <ProdiTable prodis={prodis} />
                    </div>
                )}

                {/* ── Industri Panel ── */}
                {activeTab === 'industry' && (
                    <div className="md-panel md-layout">
                        {/* Form */}
                        <div className="md-form-card">
                            <div className="md-form-card-header">
                                <div className="md-form-card-icon" style={{ background: TOKEN.orangeLight, color: TOKEN.orange }}>
                                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="md-form-card-title">Tambah Sektor Industri</div>
                                    <div className="md-form-card-sub">Daftarkan sektor industri baru</div>
                                </div>
                            </div>

                            <form onSubmit={submitIndustry} className="md-form-body">
                                <div>
                                    <FieldLabel>Nama Sektor Industri</FieldLabel>
                                    <input
                                        style={fieldBase}
                                        placeholder="Contoh: Teknologi Informasi"
                                        value={industryForm.data.name}
                                        onChange={e => industryForm.setData('name', e.target.value)}
                                        onFocus={onFocus} onBlur={onBlur}
                                    />
                                    <InputError message={industryForm.errors.name} className="mt-1.5" />
                                </div>

                                {/* Quick suggestions */}
                                <div>
                                    <p style={{ fontSize: '11px', fontWeight: 700, color: TOKEN.muted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '7px' }}>
                                        Saran cepat
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                        {['Perbankan', 'Manufaktur', 'Kesehatan', 'Pendidikan', 'Retail', 'Logistik'].map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => industryForm.setData('name', s)}
                                                style={{
                                                    padding: '4px 11px', borderRadius: 20,
                                                    border: `1.5px solid ${industryForm.data.name === s ? TOKEN.orange : TOKEN.border}`,
                                                    background: industryForm.data.name === s ? TOKEN.orangeLight : TOKEN.bg,
                                                    color: industryForm.data.name === s ? TOKEN.orange : TOKEN.mutedDark,
                                                    fontSize: '11.5px', fontWeight: 600,
                                                    cursor: 'pointer', transition: 'all 0.14s',
                                                    fontFamily: 'inherit',
                                                }}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit" className="md-submit" disabled={industryForm.processing}
                                    style={{ '--submit-bg': TOKEN.orange }}
                                    onMouseEnter={e => { if (!industryForm.processing) { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(249,115,22,0.32)'; } }}
                                    onMouseLeave={e => { if (!industryForm.processing) { e.currentTarget.style.background = TOKEN.orange; e.currentTarget.style.boxShadow = '0 2px 8px rgba(249,115,22,0.2)'; } }}
                                    ref={el => { if (el) { el.style.background = industryForm.processing ? '#94a3b8' : TOKEN.orange; el.style.boxShadow = industryForm.processing ? 'none' : '0 2px 8px rgba(249,115,22,0.2)'; } }}
                                >
                                    {industryForm.processing ? 'Menyimpan...' : (
                                        <>
                                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                            Tambah Sektor
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Table */}
                        <IndustryTable industries={industries} />
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </AuthenticatedLayout>
    );
}

/* ─── Prodi Table with Edit & Modal Delete ───────────────────────────────── */
function ProdiTable({ prodis }) {
    const [q, setQ] = useState('');
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({ name: '', jenjang: '' });

    // States for Delete Modal
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const filtered = prodis.filter(p =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.jenjang.toLowerCase().includes(q.toLowerCase())
    );

    const handleEdit = (p) => {
        setEditId(p.id);
        setEditData({ name: p.name, jenjang: p.jenjang });
    };

    const cancelEdit = () => {
        setEditId(null);
    };

    const saveEdit = (id) => {
        router.put(route('superadmin.master-data.prodi.update', id), editData, {
            preserveScroll: true,
            onSuccess: () => setEditId(null),
        });
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        router.delete(route('superadmin.master-data.prodi.destroy', itemToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setItemToDelete(null);
                setIsDeleting(false);
            },
            onError: () => setIsDeleting(false)
        });
    };

    return (
        <div className="md-table-card">
            <div className="md-table-card-header">
                <span className="md-table-card-title">Daftar Program Studi</span>
                <span className="md-count-badge">{filtered.length} data</span>
            </div>

            <div className="md-search-wrap">
                <div className="md-search-wrap-inner">
                    <svg className="md-search-icon" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                        className="md-search-input"
                        placeholder="Cari nama atau jenjang..."
                        value={q}
                        onChange={e => setQ(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                <DataTable
                    headers={['#', 'Nama Program Studi', 'Jenjang', 'Aksi']}
                    rows={filtered.map((p, i) => {
                        const isEditing = editId === p.id;
                        return [
                            <span style={{ fontSize: 11, color: '#b0bec5', fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</span>,

                            isEditing ? (
                                <input
                                    style={editFieldBase}
                                    value={editData.name}
                                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                                    onFocus={onFocus} onBlur={onBlur} autoFocus
                                />
                            ) : (
                                <span style={{ fontWeight: 600, color: '#0f1f3d', fontSize: 13.5 }}>{p.name}</span>
                            ),

                            isEditing ? (
                                <input
                                    style={{ ...editFieldBase, width: '70px', textAlign: 'center' }}
                                    value={editData.jenjang}
                                    onChange={e => setEditData({ ...editData, jenjang: e.target.value })}
                                    onFocus={onFocus} onBlur={onBlur}
                                />
                            ) : (
                                <span style={{
                                    display: 'inline-flex', fontSize: 11, fontWeight: 700,
                                    padding: '3px 10px', borderRadius: 20,
                                    background: '#e8f0fb', color: '#1a3560',
                                }}>{p.jenjang}</span>
                            ),

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                {isEditing ? (
                                    <>
                                        <button onClick={() => saveEdit(p.id)} className="action-btn save" title="Simpan">
                                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        </button>
                                        <button onClick={cancelEdit} className="action-btn cancel" title="Batal">
                                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEdit(p)} className="action-btn edit" title="Edit">
                                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                        <button onClick={() => setItemToDelete(p)} className="action-btn delete" title="Hapus">
                                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        ];
                    })}
                    emptyMessage={q ? `Tidak ditemukan untuk "${q}"` : 'Belum ada program studi terdaftar.'}
                />
            </div>

            {/* Modal Hapus Prodi */}
            <Modal
                open={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                title="Konfirmasi Hapus"
                footer={
                    <>
                        <BtnGhost onClick={() => setItemToDelete(null)}>Batal</BtnGhost>
                        <button
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            style={{
                                height: '38px', padding: '0 20px',
                                background: isDeleting ? '#fca5a5' : '#dc2626',
                                color: '#fff', border: 'none', borderRadius: '9px',
                                fontSize: '13px', fontWeight: 700, fontFamily: 'inherit',
                                cursor: isDeleting ? 'not-allowed' : 'pointer',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { if (!isDeleting) e.currentTarget.style.background = '#b91c1c'; }}
                            onMouseLeave={e => { if (!isDeleting) e.currentTarget.style.background = '#dc2626'; }}
                        >
                            {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '4px 0' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff1f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#0f1f3d', margin: '0 0 4px' }}>
                            Hapus program studi <em style={{ fontStyle: 'normal', color: '#dc2626' }}>{itemToDelete?.name}</em>?
                        </p>
                        <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                            Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

/* ─── Industry Table with Edit & Modal Delete ────────────────────────────── */
function IndustryTable({ industries }) {
    const [q, setQ] = useState('');
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({ name: '' });

    // States for Delete Modal
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const filtered = industries.filter(i =>
        i.name.toLowerCase().includes(q.toLowerCase())
    );

    const handleEdit = (ind) => {
        setEditId(ind.id);
        setEditData({ name: ind.name });
    };

    const cancelEdit = () => {
        setEditId(null);
    };

    const saveEdit = (id) => {
        router.put(route('superadmin.master-data.industry.update', id), editData, {
            preserveScroll: true,
            onSuccess: () => setEditId(null),
        });
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        router.delete(route('superadmin.master-data.industry.destroy', itemToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setItemToDelete(null);
                setIsDeleting(false);
            },
            onError: () => setIsDeleting(false)
        });
    };

    return (
        <div className="md-table-card">
            <div className="md-table-card-header">
                <span className="md-table-card-title">Daftar Sektor Industri</span>
                <span className="md-count-badge" style={{ background: '#fff3eb', color: '#f97316' }}>
                    {filtered.length} data
                </span>
            </div>

            <div className="md-search-wrap">
                <div className="md-search-wrap-inner">
                    <svg className="md-search-icon" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                        className="md-search-input"
                        placeholder="Cari nama sektor..."
                        value={q}
                        onChange={e => setQ(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                <DataTable
                    headers={['#', 'Nama Sektor Industri', 'Status', 'Aksi']}
                    rows={filtered.map((ind, i) => {
                        const isEditing = editId === ind.id;
                        return [
                            <span style={{ fontSize: 11, color: '#b0bec5', fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</span>,

                            isEditing ? (
                                <input
                                    style={editFieldBase}
                                    value={editData.name}
                                    onChange={e => setEditData({ name: e.target.value })}
                                    onFocus={onFocus} onBlur={onBlur} autoFocus
                                />
                            ) : (
                                <span style={{ fontWeight: 600, color: '#0f1f3d', fontSize: 13.5 }}>{ind.name}</span>
                            ),

                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                background: '#f0fdf4', color: '#166534',
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                                Aktif
                            </span>,

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                {isEditing ? (
                                    <>
                                        <button onClick={() => saveEdit(ind.id)} className="action-btn save" title="Simpan">
                                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        </button>
                                        <button onClick={cancelEdit} className="action-btn cancel" title="Batal">
                                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEdit(ind)} className="action-btn edit" title="Edit">
                                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                        <button onClick={() => setItemToDelete(ind)} className="action-btn delete" title="Hapus">
                                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        ];
                    })}
                    emptyMessage={q ? `Tidak ditemukan untuk "${q}"` : 'Belum ada sektor industri terdaftar.'}
                />
            </div>

            {/* Modal Hapus Sektor Industri */}
            <Modal
                open={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                title="Konfirmasi Hapus"
                footer={
                    <>
                        <BtnGhost onClick={() => setItemToDelete(null)}>Batal</BtnGhost>
                        <button
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            style={{
                                height: '38px', padding: '0 20px',
                                background: isDeleting ? '#fca5a5' : '#dc2626',
                                color: '#fff', border: 'none', borderRadius: '9px',
                                fontSize: '13px', fontWeight: 700, fontFamily: 'inherit',
                                cursor: isDeleting ? 'not-allowed' : 'pointer',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { if (!isDeleting) e.currentTarget.style.background = '#b91c1c'; }}
                            onMouseLeave={e => { if (!isDeleting) e.currentTarget.style.background = '#dc2626'; }}
                        >
                            {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '4px 0' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff1f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#0f1f3d', margin: '0 0 4px' }}>
                            Hapus sektor industri <em style={{ fontStyle: 'normal', color: '#dc2626' }}>{itemToDelete?.name}</em>?
                        </p>
                        <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                            Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
