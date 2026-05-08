import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';

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
    height: '42px', padding: '0 13px', border: `1.5px solid ${TOKEN.border}`,
    borderRadius: '9px', background: TOKEN.bg, color: TOKEN.navy,
    fontSize: '13.5px', outline: 'none', width: '100%',
    transition: 'border-color 0.18s, background 0.18s, box-shadow 0.18s',
    fontFamily: 'inherit', boxSizing: 'border-box',
};

const editFieldBase = {
    ...fieldBase, height: '32px', fontSize: '12.5px', borderRadius: '6px', padding: '0 10px',
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
    <button type="button" onClick={onClick} style={{
        height: '38px', padding: '0 16px', background: 'transparent', color: '#64748b',
        border: '1.5px solid #e2e8f0', borderRadius: '9px', fontSize: '13px',
        fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
        transition: 'background 0.15s, border-color 0.15s',
    }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f0f4f9'; e.currentTarget.style.borderColor = '#d1d9e3'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
    >
        {children}
    </button>
);

function EmptyState({ message }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '52px 24px', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: TOKEN.navyLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={TOKEN.navyMid} strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
                </svg>
            </div>
            <p style={{ fontSize: 13, color: TOKEN.muted, margin: 0, fontWeight: 500 }}>{message}</p>
        </div>
    );
}

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
            <style>{`
                .modal-backdrop {
                    position: fixed; inset: 0; z-index: 9999;
                    background: rgba(10, 20, 40, 0.45); backdrop-filter: blur(3px);
                    display: flex; align-items: center; justify-content: center;
                    padding: 20px; transition: opacity 0.25s ease;
                }
                .modal-backdrop.in  { opacity: 1; }
                .modal-backdrop.out { opacity: 0; }
                .modal-box {
                    background: #ffffff; border-radius: 16px; width: 100%; max-width: 480px;
                    box-shadow: 0 24px 60px rgba(10,20,40,0.2), 0 4px 12px rgba(10,20,40,0.08);
                    overflow: hidden; transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1);
                }
                .modal-box.in  { opacity: 1; transform: translateY(0) scale(1); }
                .modal-box.out { opacity: 0; transform: translateY(10px) scale(0.97); }
                .modal-header { padding: 22px 24px 0; display: flex; align-items: center; justify-content: space-between; }
                .modal-title { font-size: 16px; font-weight: 800; color: #0f1f3d; letter-spacing: -0.01em; }
                .modal-close {
                    width: 30px; height: 30px; border-radius: 7px; border: none; background: #f0f4f9;
                    color: #64748b; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: background 0.15s, color 0.15s;
                }
                .modal-close:hover { background: #e2e8f0; color: #1a3560; }
                .modal-body { padding: 20px 24px; }
                .modal-footer { padding: 0 24px 20px; display: flex; justify-content: flex-end; gap: 8px; }
                .modal-divider { height: 1px; background: #f1f5f9; margin: 0 24px 16px; }
            `}</style>

            <div className={`modal-backdrop ${visible ? 'in' : 'out'}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
                <div className={`modal-box ${visible ? 'in' : 'out'}`}>
                    <div className="modal-header">
                        <span className="modal-title">{title}</span>
                        <button type="button" className="modal-close" onClick={onClose}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="modal-body">{children}</div>
                    {footer && <><div className="modal-divider" /><div className="modal-footer">{footer}</div></>}
                </div>
            </div>
        </>,
        document.body
    );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function MasterDataIndex({ categories }) {
    const [activeTabId, setActiveTabId] = useState(categories.length > 0 ? categories[0].id : null);

    // States untuk Kategori (Tab)
    const [modalCatOpen, setModalCatOpen] = useState(false);
    const catForm = useForm({ name: '', use_parameter: false, parameter_label: '' });
    const [catToDelete, setCatToDelete] = useState(null);

    const activeCat = categories.find(c => c.id === activeTabId);

    // Sync active tab
    useEffect(() => {
        if (categories.length > 0 && !categories.find(c => c.id === activeTabId)) {
            setActiveTabId(categories[0].id);
        } else if (categories.length === 0) {
            setActiveTabId(null);
        }
    }, [categories]);

    const submitCategory = (e) => {
        e.preventDefault();
        catForm.post(route('superadmin.master-data.category.store'), {
            onSuccess: () => { catForm.reset(); setModalCatOpen(false); },
        });
    };

    const confirmDeleteCat = () => {
        if (!catToDelete) return;
        router.delete(route('superadmin.master-data.category.destroy', catToDelete.id), {
            preserveScroll: true, onSuccess: () => setCatToDelete(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <h2 style={{ fontSize: '17px', fontWeight: 800, color: TOKEN.navy, margin: 0, letterSpacing: '-0.01em' }}>Manajemen Master Data</h2>
                        <p style={{ fontSize: '12px', color: TOKEN.muted, margin: '3px 0 0' }}>Kelola data referensi dengan sistem tab dinamis</p>
                    </div>
                </div>
            }
        >
            <Head title="Master Data — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .md-root * { font-family: 'Plus Jakarta Sans', sans-serif; }

                /* Tab bar */
                .md-tabbar { display: flex; gap: 4px; background: #eef2f8; border-radius: 10px; padding: 4px; width: fit-content; flex-wrap: wrap; margin-bottom: 24px; }
                .md-tab {
                    padding: 7px 20px; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer;
                    border: none; background: transparent; color: ${TOKEN.muted}; transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
                    display: flex; align-items: center; gap: 7px; white-space: nowrap;
                }
                .md-tab.active { background: #ffffff; color: ${TOKEN.navy}; font-weight: 700; box-shadow: 0 1px 4px rgba(26,53,96,0.10), 0 1px 2px rgba(26,53,96,0.06); }
                .md-tab:hover:not(.active) { color: ${TOKEN.navyMid}; background: rgba(255,255,255,0.5); }
                .md-tab-badge {
                    display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px; border-radius: 9px;
                    font-size: 10px; font-weight: 800; padding: 0 5px; transition: all 0.2s;
                }
                .md-tab.active .md-tab-badge { background: ${TOKEN.orange}; color: #fff; }
                .md-tab:not(.active) .md-tab-badge { background: #dde5f0; color: ${TOKEN.mutedDark}; }

                /* Layout */
                .md-layout { display: grid; grid-template-columns: 300px 1fr; gap: 20px; align-items: start; }
                @media (max-width: 860px) { .md-layout { grid-template-columns: 1fr; } }

                /* Cards */
                .md-form-card, .md-table-card { background: #fff; border-radius: 14px; border: 1px solid ${TOKEN.borderSoft}; overflow: hidden; box-shadow: 0 1px 3px rgba(26,53,96,0.05); }
                .md-form-card-header, .md-table-card-header { padding: 16px 20px; border-bottom: 1px solid ${TOKEN.borderSoft}; display: flex; align-items: center; }
                .md-form-card-header { gap: 10px; }
                .md-table-card-header { justify-content: space-between; }
                .md-form-card-icon { width: 32px; height: 32px; border-radius: 8px; background: ${TOKEN.navyLight}; color: ${TOKEN.navyMid}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .md-form-card-title, .md-table-card-title { font-size: 13px; font-weight: 800; color: ${TOKEN.navy}; letter-spacing: -0.01em; }
                .md-form-card-sub { font-size: 11px; color: ${TOKEN.muted}; margin-top: 1px; }
                .md-form-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }

                /* Submit button */
                .md-submit {
                    height: 42px; width: 100%; border-radius: 9px; border: none; background: ${TOKEN.orange}; color: #fff; font-size: 13px; font-weight: 700;
                    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
                    box-shadow: 0 2px 8px rgba(249,115,22,0.2); margin-top: 4px;
                }
                .md-submit:hover:not(:disabled) { background: #ea6c0a; box-shadow: 0 4px 14px rgba(249,115,22,0.32); transform: translateY(-1px); }
                .md-submit:active:not(:disabled) { transform: translateY(0); }
                .md-submit:disabled { background: #94a3b8; cursor: not-allowed; box-shadow: none; transform: none; }

                /* Table Utils */
                .md-count-badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: ${TOKEN.navyLight}; color: ${TOKEN.navyMid}; }
                .md-row:hover { background: #fafbfc !important; }
                @keyframes rowIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
                .md-panel { animation: panelIn 0.22s cubic-bezier(0.22,1,0.36,1) both; }
                @keyframes panelIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

                /* Search */
                .md-search-wrap { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid ${TOKEN.borderSoft}; }
                .md-search-input {
                    flex: 1; height: 36px; border: 1.5px solid ${TOKEN.border}; border-radius: 8px; background: ${TOKEN.bg}; padding: 0 12px 0 34px;
                    font-size: 13px; color: ${TOKEN.navy}; outline: none; transition: border-color 0.15s, box-shadow 0.15s;
                }
                .md-search-input:focus { border-color: ${TOKEN.navyMid}; box-shadow: 0 0 0 3px rgba(26,53,96,0.08); }
                .md-search-input::placeholder { color: #b0bec5; }
                .md-search-wrap-inner { position: relative; flex: 1; }
                .md-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #b0bec5; }

                /* Action Buttons */
                .action-btn { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 6px; border: none; cursor: pointer; transition: all 0.15s; background: transparent; padding: 0; outline: none; }
                .action-btn.edit { color: ${TOKEN.navyMid}; }
                .action-btn.edit:hover { background: ${TOKEN.navyLight}; }
                .action-btn.delete { color: ${TOKEN.danger}; }
                .action-btn.delete:hover { background: ${TOKEN.dangerLight}; }
                .action-btn.save { color: ${TOKEN.success}; }
                .action-btn.save:hover { background: ${TOKEN.successLight}; }
                .action-btn.cancel { color: ${TOKEN.mutedDark}; }
                .action-btn.cancel:hover { background: ${TOKEN.borderSoft}; }

                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            <div className="md-root">
                {/* ─── DYNAMIC TABS ─── */}
                <div className="md-tabbar">
                    {categories.map(cat => (
                        <button key={cat.id} className={`md-tab ${activeTabId === cat.id ? 'active' : ''}`} onClick={() => setActiveTabId(cat.id)}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            {cat.name}
                            <span className="md-tab-badge">{cat.items.length}</span>
                        </button>
                    ))}

                    <button className="md-tab" style={{ background: TOKEN.navyLight, color: TOKEN.navyMid, border: `1px dashed ${TOKEN.navyMid}55` }} onClick={() => setModalCatOpen(true)}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Tambah Tab Baru
                    </button>
                </div>

                {/* ─── ACTIVE PANEL ─── */}
                {activeCat ? (
                    <div className="md-panel md-layout">
                        <DynamicForm activeCat={activeCat} activeTabId={activeTabId} />
                        <DynamicTable activeCat={activeCat} onDeleteCat={() => setCatToDelete(activeCat)} />
                    </div>
                ) : (
                    <div className="md-form-card" style={{ padding: 60, textAlign: 'center' }}>
                        <div style={{ fontSize: 40, marginBottom: 10 }}>📑</div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: TOKEN.navy }}>Belum ada Master Data</h3>
                        <p style={{ fontSize: 13, color: TOKEN.mutedDark }}>Silakan "Tambah Tab Baru" untuk mulai membuat kategori Master Data.</p>
                    </div>
                )}
            </div>

            {/* ─── MODAL TAMBAH KATEGORI ─── */}
            <Modal open={modalCatOpen} onClose={() => setModalCatOpen(false)} title="Tambah Tab Kategori"
                footer={<>
                    <BtnGhost onClick={() => setModalCatOpen(false)}>Batal</BtnGhost>
                    <button onClick={submitCategory} disabled={catForm.processing} style={{ height: 38, padding: '0 20px', background: TOKEN.navyMid, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        {catForm.processing ? 'Menyimpan...' : 'Buat Tab Baru'}
                    </button>
                </>}
            >
                <form id="cat-form" onSubmit={submitCategory}>
                    <div style={{ marginBottom: 16 }}>
                        <FieldLabel>Nama Tab Kategori</FieldLabel>
                        <input style={fieldBase} value={catForm.data.name} onChange={e => catForm.setData('name', e.target.value)} placeholder="Contoh: Program Studi, Agama..." required onFocus={onFocus} onBlur={onBlur} />
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: TOKEN.bg, padding: 12, borderRadius: 10, border: `1px solid ${TOKEN.borderSoft}` }}>
                        <input type="checkbox" style={{ width: 18, height: 18, accentColor: TOKEN.orange, cursor: 'pointer' }} checked={catForm.data.use_parameter} onChange={e => catForm.setData('use_parameter', e.target.checked)} />
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: TOKEN.navy }}>Butuh 1 Kolom Ekstra?</div>
                            <div style={{ fontSize: 11, color: TOKEN.mutedDark }}>Centang jika data ini butuh kolom tambahan (Misal: Jenjang Pendidikan).</div>
                        </div>
                    </label>

                    {catForm.data.use_parameter && (
                        <div style={{ marginTop: 16, animation: 'panelIn 0.2s' }}>
                            <FieldLabel>Nama Label Kolom Ekstra</FieldLabel>
                            <input style={fieldBase} value={catForm.data.parameter_label} onChange={e => catForm.setData('parameter_label', e.target.value)} placeholder="Contoh: Jenjang, Singkatan..." required onFocus={onFocus} onBlur={onBlur} />
                        </div>
                    )}
                </form>
            </Modal>

            {/* ─── MODAL HAPUS KATEGORI ─── */}
            <Modal open={!!catToDelete} onClose={() => setCatToDelete(null)} title="Konfirmasi Hapus Tab"
                footer={<>
                    <BtnGhost onClick={() => setCatToDelete(null)}>Batal</BtnGhost>
                    <button onClick={confirmDeleteCat} style={{ height: 38, padding: '0 20px', background: TOKEN.danger, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = '#b91c1c'} onMouseLeave={e => e.currentTarget.style.background = TOKEN.danger}>
                        Ya, Hapus Tab Ini
                    </button>
                </>}
            >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '4px 0' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff1f2', color: TOKEN.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                    </div>
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: TOKEN.navy, margin: '0 0 4px' }}>Hapus Tab <em style={{ fontStyle: 'normal', color: TOKEN.danger }}>{catToDelete?.name}</em>?</p>
                        <p style={{ fontSize: 13, color: TOKEN.mutedDark, margin: 0, lineHeight: 1.5 }}>Seluruh baris data di dalam tab ini akan ikut terhapus secara permanen.</p>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}

/* ─── DYNAMIC FORM ITEM ──────────────────────────────────────────────────── */
function DynamicForm({ activeCat, activeTabId }) {
    const itemForm = useForm({ master_category_id: activeTabId, name: '', parameter_value: '' });

    useEffect(() => {
        itemForm.setData('master_category_id', activeTabId);
        itemForm.clearErrors();
    }, [activeTabId]);

    const submitItem = (e) => {
        e.preventDefault();
        itemForm.post(route('superadmin.master-data.item.store'), {
            preserveScroll: true, onSuccess: () => itemForm.reset('name', 'parameter_value'),
        });
    };

    return (
        <div className="md-form-card">
            <div className="md-form-card-header">
                <div className="md-form-card-icon">
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </div>
                <div>
                    <div className="md-form-card-title">Tambah {activeCat.name}</div>
                    <div className="md-form-card-sub">Input data referensi baru</div>
                </div>
            </div>

            <form onSubmit={submitItem} className="md-form-body">
                <div>
                    <FieldLabel>Nama {activeCat.name}</FieldLabel>
                    <input style={fieldBase} value={itemForm.data.name} onChange={e => itemForm.setData('name', e.target.value)} onFocus={onFocus} onBlur={onBlur} required />
                    <InputError message={itemForm.errors.name} className="mt-1.5" />
                </div>

                {activeCat.use_parameter && (
                    <div style={{ animation: 'panelIn 0.2s' }}>
                        <FieldLabel>{activeCat.parameter_label}</FieldLabel>
                        <input style={fieldBase} value={itemForm.data.parameter_value} onChange={e => itemForm.setData('parameter_value', e.target.value)} onFocus={onFocus} onBlur={onBlur} required />
                        <InputError message={itemForm.errors.parameter_value} className="mt-1.5" />
                    </div>
                )}

                <button type="submit" className="md-submit" disabled={itemForm.processing}>
                    {itemForm.processing ? (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}><path strokeLinecap="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg> Menyimpan...</>
                    ) : (
                        <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> Tambah Data</>
                    )}
                </button>
            </form>
        </div>
    );
}

/* ─── DYNAMIC TABLE ITEM ─────────────────────────────────────────────────── */
function DynamicTable({ activeCat, onDeleteCat }) {
    const [q, setQ] = useState('');
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({ name: '', parameter_value: '' });

    const filtered = activeCat.items.filter(item =>
        item.name.toLowerCase().includes(q.toLowerCase()) ||
        (item.parameter_value && item.parameter_value.toLowerCase().includes(q.toLowerCase()))
    );

    const saveEdit = (id) => {
        router.put(route('superadmin.master-data.item.update', id), editData, {
            preserveScroll: true, onSuccess: () => setEditId(null),
        });
    };

    const deleteItem = (id) => {
        if (confirm('Yakin ingin menghapus baris ini?')) {
            router.delete(route('superadmin.master-data.item.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <div className="md-table-card">
            <div className="md-table-card-header">
                <div>
                    <span className="md-table-card-title">Daftar {activeCat.name}</span>
                    <span className="md-count-badge" style={{ marginLeft: 10 }}>{filtered.length} data</span>
                </div>
                <button onClick={onDeleteCat} style={{ background: TOKEN.dangerLight, color: TOKEN.danger, border: 'none', padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', gap: 5, alignItems: 'center' }}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Hapus Tab
                </button>
            </div>

            <div className="md-search-wrap">
                <div className="md-search-wrap-inner">
                    <svg className="md-search-icon" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
                    <input className="md-search-input" placeholder="Pencarian..." value={q} onChange={e => setQ(e.target.value)} />
                </div>
            </div>

            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: TOKEN.bg, borderBottom: `1px solid ${TOKEN.border}` }}>
                            <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#374151', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', width: '52px' }}>#</th>
                            <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#374151', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'left' }}>Nama {activeCat.name}</th>
                            {activeCat.use_parameter && <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#374151', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center' }}>{activeCat.parameter_label}</th>}
                            <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#374151', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', width: '100px' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={4}><EmptyState message={q ? `Tidak ditemukan untuk "${q}"` : `Belum ada data ${activeCat.name}.`} /></td></tr>
                        ) : filtered.map((item, i) => {
                            const isEditing = editId === item.id;
                            return (
                                <tr key={item.id} className="md-row" style={{ borderBottom: `1px solid ${TOKEN.borderSoft}`, animation: 'rowIn 0.28s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${i * 0.04}s` }}>
                                    <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                                        <span style={{ fontSize: 11, color: '#b0bec5', fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</span>
                                    </td>

                                    <td style={{ padding: '12px 16px' }}>
                                        {isEditing ? <input style={editFieldBase} value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} onFocus={onFocus} onBlur={onBlur} autoFocus />
                                            : <span style={{ fontWeight: 600, fontSize: 13.5, color: TOKEN.navy }}>{item.name}</span>}
                                    </td>

                                    {activeCat.use_parameter && (
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            {isEditing ? <input style={{ ...editFieldBase, textAlign: 'center' }} value={editData.parameter_value} onChange={e => setEditData({ ...editData, parameter_value: e.target.value })} onFocus={onFocus} onBlur={onBlur} />
                                                : <span style={{ display: 'inline-flex', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: TOKEN.navyLight, color: TOKEN.navyMid }}>{item.parameter_value}</span>}
                                        </td>
                                    )}

                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                            {isEditing ? (
                                                <>
                                                    <button onClick={() => saveEdit(item.id)} className="action-btn save" title="Simpan">
                                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                    </button>
                                                    <button onClick={() => setEditId(null)} className="action-btn cancel" title="Batal">
                                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => { setEditId(item.id); setEditData({ name: item.name, parameter_value: item.parameter_value || '' }); }} className="action-btn edit" title="Edit">
                                                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button onClick={() => deleteItem(item.id)} className="action-btn delete" title="Hapus">
                                                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
