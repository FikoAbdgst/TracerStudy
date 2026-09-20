import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

/* ─── Shared Style Tokens ───────────────────────────────────────────────── */
const TOKEN = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    danger: '#ef4444', dangerLight: '#fef2f2',
    success: '#10b981', successLight: '#ecfdf5',
};

const fieldBase = {
    height: '38px', padding: '0 13px', border: `1.5px solid ${TOKEN.border}`,
    borderRadius: '8px', background: TOKEN.bg, color: TOKEN.navy,
    fontSize: '13px', outline: 'none', width: '100%',
    transition: 'border-color 0.18s, background 0.18s, box-shadow 0.18s',
    fontFamily: 'inherit', boxSizing: 'border-box',
};

const onFocus = (e) => {
    e.target.style.borderColor = TOKEN.navyMid;
    e.target.style.background = '#fff';
};
const onBlur = (e) => {
    e.target.style.borderColor = TOKEN.border;
    e.target.style.background = TOKEN.bg;
};

/* ─── Sub-components ─────────────────────────────────────────────────────── */
const FieldLabel = ({ children }) => (
    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 5 }}>
        {children}
    </label>
);

const BtnGhost = ({ children, onClick }) => (
    <button type="button" onClick={onClick} style={{
        height: '38px', padding: '0 16px', background: 'transparent', color: '#64748b',
        border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px',
        fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
    }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
    >
        {children}
    </button>
);

/* ─── Modal (Portal) ─────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children, footer }) {
    const [visible, setVisible] = useState(false);
    const [render, setRender] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        if (open) {
            setRender(true); document.body.style.overflow = 'hidden';
            requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
        } else {
            setVisible(false); document.body.style.overflow = '';
            const t = setTimeout(() => setRender(false), 260); return () => clearTimeout(t);
        }
    }, [open]);

    if (!render || !mounted) return null;

    return createPortal(
        <>
            <div style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(10, 20, 40, 0.45)', backdropFilter: 'blur(3px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 20, opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease'
            }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
                <div style={{
                    background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 460,
                    boxShadow: '0 24px 60px rgba(10,20,40,0.2), 0 4px 12px rgba(10,20,40,0.08)',
                    overflow: 'hidden', opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
                    transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)'
                }}>
                    <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: TOKEN.navy }}>{title}</span>
                        <button type="button" onClick={onClose} style={{
                            width: 30, height: 30, borderRadius: 7, border: 'none', background: '#f0f4f9',
                            color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
                        }} onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.background = '#f0f4f9'}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div style={{ padding: '0 24px 20px' }}>{children}</div>
                    {footer && (
                        <>
                            <div style={{ height: 1, background: '#f1f5f9', margin: '0 24px 16px' }} />
                            <div style={{ padding: '0 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div>
                        </>
                    )}
                </div>
            </div>
        </>,
        document.body
    );
}

/* ─── Delete Confirm Dialog (Portal) ─────────────────────────────────────── */
function DeleteConfirmDialog({ open, item, categoryName, onClose, onConfirm }) {
    const [visible, setVisible] = useState(false);
    const [render, setRender] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        if (open) {
            setRender(true); document.body.style.overflow = 'hidden';
            requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
        } else {
            setVisible(false); document.body.style.overflow = '';
            const t = setTimeout(() => setRender(false), 260); return () => clearTimeout(t);
        }
    }, [open]);

    if (!render || !mounted) return null;

    return createPortal(
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(10, 20, 40, 0.45)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease'
        }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{
                background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 420,
                boxShadow: '0 24px 60px rgba(10,20,40,0.2), 0 4px 12px rgba(10,20,40,0.08)',
                overflow: 'hidden', opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
                transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)'
            }}>
                <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${TOKEN.borderSoft}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: TOKEN.dangerLight, color: TOKEN.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 800, color: TOKEN.navy }}>Hapus Master Data?</span>
                    </div>
                    <button type="button" onClick={onClose} style={{
                        width: 28, height: 28, borderRadius: 7, border: 'none', background: TOKEN.borderSoft,
                        color: TOKEN.mutedDark, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0
                    }} onMouseEnter={e => e.currentTarget.style.background = TOKEN.border} onMouseLeave={e => e.currentTarget.style.background = TOKEN.borderSoft}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div style={{ padding: '16px 22px 20px' }}>
                    <p style={{ fontSize: 13, color: TOKEN.mutedDark, lineHeight: 1.65, margin: 0 }}>
                        Yakin ingin menghapus master data <strong style={{ color: TOKEN.navy }}>{item?.name}</strong> dari kategori <strong style={{ color: TOKEN.navy }}>{categoryName}</strong>? Tindakan ini tidak dapat dibatalkan.
                    </p>
                </div>
                <div style={{ height: 1, background: TOKEN.borderSoft }} />
                <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button type="button" onClick={onClose} style={{
                        height: 36, padding: '0 16px', borderRadius: 8, border: `1.5px solid ${TOKEN.border}`,
                        background: 'transparent', color: TOKEN.mutedDark, fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'
                    }} onMouseEnter={e => e.currentTarget.style.background = TOKEN.bg} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        Batal
                    </button>
                    <button type="button" onClick={onConfirm} style={{
                        height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
                        background: TOKEN.danger, color: '#fff', fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s'
                    }} onMouseEnter={e => e.currentTarget.style.background = '#dc2626'} onMouseLeave={e => e.currentTarget.style.background = TOKEN.danger}>
                        Ya, Hapus
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ─── Toast Alert (Portal) ───────────────────────────────────────────────── */
function Toast({ message, type, onClose }) {
    useEffect(() => {
        if (!message) return;
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [message]);

    if (!message) return null;

    const isError = type === 'error';

    return createPortal(
        <div style={{
            position: 'fixed', top: 20, right: 20, zIndex: 99999,
            background: isError ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${isError ? '#fecaca' : '#86efac'}`,
            borderRadius: 12, padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            maxWidth: 400, width: 'calc(100vw - 40px)',
            animation: 'toastIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
        }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{isError ? '❌' : '✅'}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: isError ? '#dc2626' : '#16a34a', flex: 1, lineHeight: 1.4 }}>{message}</span>
            <button type="button" onClick={onClose} style={{
                width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent',
                cursor: 'pointer', color: isError ? '#dc2626' : '#16a34a', fontSize: 16, lineHeight: 1, flexShrink: 0,
            }}>×</button>
        </div>,
        document.body
    );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function MasterDataIndex({ categoriesData }) {
    // State untuk mengontrol Tab mana yang aktif
    const [activeTab, setActiveTab] = useState('sektor-industri');

    // State untuk Toast Alert
    const [toastMsg, setToastMsg] = useState(null);
    const [toastType, setToastType] = useState('success');
    const showToast = (msg, type = 'success') => { setToastMsg(msg); setToastType(type); };

    // Definisi Statis untuk Tab Bar
    const tabs = [
        { id: 'sektor-industri', label: 'Sektor Industri', icon: '🏭' },
        { id: 'program-studi', label: 'Program Studi', icon: '🎓' },
        { id: 'keahlian', label: 'Keahlian / Skill', icon: '💡' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: '17px', fontWeight: 800, color: TOKEN.navy, margin: 0, letterSpacing: '-0.01em' }}>Manajemen Master Data</h2>
                    <p style={{ fontSize: '12px', color: TOKEN.muted, margin: '3px 0 0' }}>Kelola daftar sektor industri, program studi, dan keahlian di satu tempat</p>
                </div>
            }
        >
            <Head title="Master Data — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .md-root * { font-family: 'Plus Jakarta Sans', sans-serif; }

                /* Tab Bar Styling */
                .md-tabbar {
                    display: flex; gap: 8px; margin-bottom: 24px; padding: 6px;
                    background: #eef2f8; border-radius: 12px; width: fit-content;
                }
                .md-tab {
                    padding: 10px 24px; border-radius: 8px; font-size: 13.5px; font-weight: 700; cursor: pointer;
                    border: none; background: transparent; color: ${TOKEN.mutedDark}; transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
                    display: flex; align-items: center; gap: 8px;
                }
                .md-tab.active { background: #ffffff; color: ${TOKEN.navy}; box-shadow: 0 2px 8px rgba(26,53,96,0.08); }
                .md-tab:hover:not(.active) { color: ${TOKEN.navyMid}; background: rgba(255,255,255,0.5); }

                /* Cards */
                .md-card { background: #fff; border-radius: 14px; border: 1px solid ${TOKEN.borderSoft}; overflow: hidden; box-shadow: 0 4px 14px rgba(26,53,96,0.03); }

                /* Submit button */
                .md-submit {
                    height: 38px; padding: 0 16px; border-radius: 8px; border: none; background: ${TOKEN.orange}; color: #fff; font-size: 13px; font-weight: 700;
                    cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0;
                }
                .md-submit:hover:not(:disabled) { background: #ea6c0a; transform: translateY(-1px); }
                .md-submit:disabled { background: #94a3b8; cursor: not-allowed; }

                /* Table Utils */
                .md-row:hover { background: #f8fafc !important; }
                @keyframes rowIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes panelIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes toastIn { from { opacity: 0; transform: translateY(-10px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

                /* Action Buttons */
                .action-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; border: none; cursor: pointer; transition: all 0.15s; background: transparent; padding: 0; outline: none; }
                .action-btn.edit { color: ${TOKEN.navyMid}; }
                .action-btn.edit:hover { background: ${TOKEN.navyLight}; }
                .action-btn.delete { color: ${TOKEN.danger}; }
                .action-btn.delete:hover { background: ${TOKEN.dangerLight}; }

                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            <div className="md-root">
                <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />

                {/* ─── DYNAMIC TABS BAR ─── */}
                <div className="md-tabbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`md-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span style={{ fontSize: 16 }}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ─── PANEL KONTEN UTAMA ─── */}
                <div style={{ animation: 'panelIn 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
                    {/* Render hanya kategori yang sedang aktif berdasarkan klik tab */}
                    {categoriesData[activeTab] ? (
                        <MasterDataBlock key={activeTab} category={categoriesData[activeTab]} onToast={showToast} />
                    ) : (
                        <div style={{ padding: 40, textAlign: 'center', background: '#fff', borderRadius: 14, border: `1px solid ${TOKEN.borderSoft}` }}>
                            <p style={{ color: TOKEN.mutedDark }}>Memuat data {activeTab}...</p>
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}

/* ─── KOMPONEN BLOCK TABEL & FORM ────────────────────────────────────────── */
function MasterDataBlock({ category, onToast }) {
    const [q, setQ] = useState('');
    const form = useForm({ master_category_id: category.id, name: '', parameter_value: '' });

    // States untuk Edit Modal
    const [editingItem, setEditingItem] = useState(null);
    const editForm = useForm({ name: '', parameter_value: '' });

    // States untuk Hapus (custom dialog)
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const filtered = (category.items || []).filter(item =>
        item.name.toLowerCase().includes(q.toLowerCase()) ||
        (item.parameter_value && item.parameter_value.toLowerCase().includes(q.toLowerCase()))
    );

    // Fungsi Tambah
    const submitItem = (e) => {
        e.preventDefault();
        form.post(route('adminkampus.master-data.item.store'), {
            preserveScroll: true,
            onSuccess: (page) => {
                form.reset('name', 'parameter_value');
                onToast?.(page.props.flash?.message || 'Data berhasil ditambahkan.');
            },
        });
    };

    // Fungsi Buka Modal Edit
    const openEditModal = (item) => {
        setEditingItem(item);
        editForm.setData({
            name: item.name,
            parameter_value: item.parameter_value || ''
        });
    };

    // Fungsi Submit Edit
    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(route('adminkampus.master-data.item.update', editingItem.id), {
            preserveScroll: true,
            onSuccess: (page) => {
                setEditingItem(null);
                editForm.reset();
                onToast?.(page.props.flash?.message || 'Data berhasil diperbarui.');
            }
        });
    };

    // Fungsi Hapus (buka dialog konfirmasi custom)
    const confirmDelete = (item) => setDeleteTarget(item);
    const executeDelete = () => {
        setDeleting(true);
        router.delete(route('adminkampus.master-data.item.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: (page) => {
                setDeleteTarget(null); setDeleting(false);
                onToast?.(page.props.flash?.message || 'Data berhasil dihapus.');
            },
            onError: () => setDeleting(false),
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <div className="md-card">

            {/* Form Tambah Cepat di Atas Tabel */}
            <form onSubmit={submitItem} style={{ padding: '20px 24px', borderBottom: `1px solid ${TOKEN.borderSoft}`, display: 'flex', gap: 12, background: '#fafbfc', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                    <input
                        style={fieldBase}
                        placeholder={`Masukkan nama ${category.name.toLowerCase()} baru...`}
                        value={form.data.name}
                        onChange={e => form.setData('name', e.target.value)}
                        onFocus={onFocus} onBlur={onBlur} required
                    />
                    {form.errors.name && (
                        <div style={{ fontSize: 11, color: TOKEN.danger, fontWeight: 600, marginTop: 6 }}>{form.errors.name}</div>
                    )}
                </div>

                {category.use_parameter && (
                    <div style={{ width: '200px' }}>
                        <input
                            style={fieldBase}
                            placeholder={category.parameter_label}
                            value={form.data.parameter_value}
                            onChange={e => form.setData('parameter_value', e.target.value)}
                            onFocus={onFocus} onBlur={onBlur} required
                        />
                    </div>
                )}

                <button type="submit" className="md-submit" disabled={form.processing} title="Simpan Data">
                    {form.processing ? (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite', marginRight: 6 }}><path strokeLinecap="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            Tambah Baru
                        </>
                    )}
                </button>
            </form>

            {/* Area Tabel Data */}
            <div style={{ padding: '0', background: '#fff' }}>

                {/* Search Bar di atas Tabel */}
                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${TOKEN.borderSoft}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: TOKEN.navy }}>
                        Total Data: <span style={{ color: TOKEN.orange }}>{filtered.length}</span>
                    </div>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
                        <input
                            style={{ ...fieldBase, height: 36, paddingLeft: 34, fontSize: 13 }}
                            placeholder="Cari data..."
                            value={q}
                            onChange={e => setQ(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, boxShadow: `0 1px 0 ${TOKEN.borderSoft}` }}>
                            <tr>
                                <th style={{ padding: '12px 24px', fontSize: 11, fontWeight: 700, color: TOKEN.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', width: 60 }}>No</th>
                                <th style={{ padding: '12px 24px', fontSize: 11, fontWeight: 700, color: TOKEN.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Nama {category.name}</th>
                                {category.use_parameter && <th style={{ padding: '12px 24px', fontSize: 11, fontWeight: 700, color: TOKEN.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>{category.parameter_label}</th>}
                                <th style={{ padding: '12px 24px', fontSize: 11, fontWeight: 700, color: TOKEN.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right', width: 100 }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: TOKEN.muted, fontSize: 13 }}>Tidak ada data ditemukan.</td></tr>
                            ) : filtered.map((item, i) => (
                                <tr key={item.id} className="md-row" style={{ borderBottom: `1px solid ${TOKEN.borderSoft}`, animation: 'rowIn 0.2s both', animationDelay: `${(i % 15) * 0.02}s` }}>
                                    <td style={{ padding: '14px 24px', fontSize: 12, fontWeight: 700, color: '#cbd5e1' }}>
                                        {(i + 1).toString().padStart(2, '0')}
                                    </td>
                                    <td style={{ padding: '14px 24px', fontSize: 13.5, fontWeight: 600, color: TOKEN.navy }}>
                                        {item.name}
                                    </td>

                                    {category.use_parameter && (
                                        <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: TOKEN.navyLight, color: TOKEN.navyMid }}>
                                                {item.parameter_value}
                                            </span>
                                        </td>
                                    )}

                                    <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                            <button onClick={() => openEditModal(item)} className="action-btn edit" title="Edit Data">
                                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                            <button onClick={() => confirmDelete(item)} className="action-btn delete" title="Hapus Data">
                                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Edit Khusus untuk Block ini */}
            <Modal open={!!editingItem} onClose={() => setEditingItem(null)} title={`Edit ${category.name}`}
                footer={
                    <>
                        <BtnGhost onClick={() => setEditingItem(null)}>Batal</BtnGhost>
                        <button onClick={submitEdit} disabled={editForm.processing} style={{
                            height: 38, padding: '0 20px', background: TOKEN.orange, color: '#fff', border: 'none',
                            borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: editForm.processing ? 'not-allowed' : 'pointer',
                            transition: 'background 0.15s'
                        }}>
                            {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </>
                }
            >
                <form id={`edit-form-${category.id}`} onSubmit={submitEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <FieldLabel>Nama {category.name}</FieldLabel>
                        <input
                            style={fieldBase}
                            value={editForm.data.name}
                            onChange={e => editForm.setData('name', e.target.value)}
                            onFocus={onFocus} onBlur={onBlur} required
                        />
                        {editForm.errors.name && (
                            <div style={{ fontSize: 11, color: TOKEN.danger, fontWeight: 600, marginTop: 6 }}>{editForm.errors.name}</div>
                        )}
                    </div>
                    {category.use_parameter && (
                        <div>
                            <FieldLabel>{category.parameter_label}</FieldLabel>
                            <input
                                style={fieldBase}
                                value={editForm.data.parameter_value}
                                onChange={e => editForm.setData('parameter_value', e.target.value)}
                                onFocus={onFocus} onBlur={onBlur} required
                            />
                        </div>
                    )}
                </form>
            </Modal>

            {/* Dialog Konfirmasi Hapus (custom, bukan confirm() bawaan) */}
            <DeleteConfirmDialog
                open={!!deleteTarget}
                item={deleteTarget}
                categoryName={category.name}
                onClose={() => { if (!deleting) setDeleteTarget(null); }}
                onConfirm={executeDelete}
            />
        </div>
    );
}
