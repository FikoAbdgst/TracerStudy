import React, { useState, useEffect } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626', redLight: '#fff1f2',
};

/* ─── Custom Switch ──────────────────────────────────────────────────────── */
function CustomSwitch({ checked, onChange }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                width: 48,
                height: 26,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                padding: 3,
                transition: 'background 0.22s cubic-bezier(0.22,1,0.36,1)',
                background: checked ? T.orange : '#cbd5e1',
                boxShadow: checked
                    ? '0 0 0 3px rgba(249,115,22,0.18), inset 0 1px 2px rgba(0,0,0,0.08)'
                    : 'inset 0 1px 2px rgba(0,0,0,0.08)',
                flexShrink: 0,
                outline: 'none',
            }}
        >
            <span style={{
                display: 'block',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                transform: checked ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform 0.22s cubic-bezier(0.22,1,0.36,1)',
            }} />
        </button>
    );
}

/* ─── Modal ──────────────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children, footer, wide = false }) {
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
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)', cursor: 'default' }} />
            <div style={{
                background: '#fff', borderRadius: 16,
                position: 'relative', width: '100%', maxWidth: wide ? 720 : 460,
                boxShadow: '0 24px 60px rgba(10,20,40,0.2)',
                display: 'flex', flexDirection: 'column',
                maxHeight: '90vh',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
                transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1)',
            }}>
                <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.borderSoft}`, flexShrink: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: T.navy }}>{title}</span>
                    <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: T.bg, color: T.mutedDark, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
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

/* ─── Alert Dialog — konsisten dengan desain proyek ─────────────────────── */
function AlertDialog({ open, onClose, onConfirm, title, message, processing }) {
    const [visible, setVisible] = useState(false);
    const [render, setRender] = useState(false);

    useEffect(() => {
        if (open) { setRender(true); requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); }
        else { setVisible(false); const t = setTimeout(() => setRender(false), 260); return () => clearTimeout(t); }
    }, [open]);

    if (!render) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease',
        }}>
            {/* Backdrop — sama persis dengan Modal */}
            <div onClick={!processing ? onClose : undefined} style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)', cursor: 'default' }} />

            <div style={{
                background: '#fff', borderRadius: 16,
                position: 'relative', width: '100%', maxWidth: 420,
                boxShadow: '0 24px 60px rgba(10,20,40,0.2)',
                display: 'flex', flexDirection: 'column',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
                transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1)',
                overflow: 'hidden',
            }}>
                {/* Header — sama dengan Modal */}
                <div style={{
                    padding: '18px 22px 14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: `1px solid ${T.borderSoft}`, flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Icon kecil inline — tidak mencolok, selaras */}
                        <div style={{
                            width: 30, height: 30, borderRadius: 8,
                            background: T.redLight, color: T.red,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 800, color: T.navy }}>{title}</span>
                    </div>
                    <button
                        onClick={!processing ? onClose : undefined}
                        disabled={processing}
                        style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: T.bg, color: T.mutedDark, cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', opacity: processing ? 0.4 : 1 }}
                        onMouseEnter={e => { if (!processing) e.currentTarget.style.background = T.border; }}
                        onMouseLeave={e => e.currentTarget.style.background = T.bg}
                    >
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '16px 22px 20px' }}>
                    <p style={{ fontSize: 13, color: T.mutedDark, lineHeight: 1.65, margin: 0 }}>{message}</p>
                </div>

                {/* Footer — sama dengan Modal */}
                <div style={{ height: 1, background: T.borderSoft, flexShrink: 0 }} />
                <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <button
                        onClick={onClose}
                        disabled={processing}
                        style={{
                            height: 36, padding: '0 16px', borderRadius: 8,
                            border: `1.5px solid ${T.border}`, background: 'transparent',
                            color: T.mutedDark, fontSize: 13, fontWeight: 700,
                            cursor: processing ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', transition: 'all 0.15s',
                            opacity: processing ? 0.5 : 1,
                        }}
                        onMouseEnter={e => { if (!processing) e.currentTarget.style.background = T.bg; }}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={processing}
                        style={{
                            height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
                            background: processing ? T.muted : T.red,
                            color: '#fff', fontSize: 13, fontWeight: 700,
                            cursor: processing ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', transition: 'all 0.15s',
                            boxShadow: processing ? 'none' : '0 2px 8px rgba(220,38,38,0.25)',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}
                        onMouseEnter={e => { if (!processing) e.currentTarget.style.filter = 'brightness(0.9)'; }}
                        onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                    >
                        {processing ? (
                            <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                                    <path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                </svg>
                                Menghapus...
                            </>
                        ) : (
                            <>
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Ya, Hapus
                            </>
                        )}
                    </button>
                </div>
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

const FieldLabel = ({ children }) => (
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 5 }}>{children}</label>
);

const fieldBase = { height: 42, padding: '0 13px', border: `1.5px solid ${T.border}`, borderRadius: 9, background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none', width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box' };
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; e.target.style.boxShadow = 'none'; };

export default function TracerStudyIndex({ forms }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [alertOpen, setAlertOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, setData, post, put, processing, reset } = useForm({
        title: '', description: '', questions: [],
    });

    const openCreate = () => { reset(); setIsEditing(false); setModalOpen(true); };
    const openEdit = form => {
        setSelectedId(form.id);
        setData({ title: form.title, description: form.description || '', questions: form.questions || [] });
        setIsEditing(true); setModalOpen(true);
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (isEditing) put(route('adminkampus.tracer.update', selectedId), { onSuccess: () => setModalOpen(false) });
        else post(route('adminkampus.tracer.store'), { onSuccess: () => setModalOpen(false) });
    };

    const toggleStatus = (id) => router.patch(route('adminkampus.tracer.toggle', id), {}, { preserveScroll: true });

    const confirmDelete = (id) => { setIdToDelete(id); setAlertOpen(true); };

    const executeDelete = () => {
        setIsDeleting(true);
        router.delete(route('adminkampus.tracer.destroy', idToDelete), {
            preserveScroll: true,
            onSuccess: () => { setAlertOpen(false); setIdToDelete(null); },
            onFinish: () => setIsDeleting(false),
        });
    };

    const addQuestion = () => setData('questions', [...data.questions, { id: Date.now(), type: 'text', question: '', options: [] }]);
    const removeQuestion = id => setData('questions', data.questions.filter(q => q.id !== id));
    const updateQuestion = (id, field, value) => setData('questions', data.questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    const addOption = qId => setData('questions', data.questions.map(q => q.id === qId ? { ...q, options: [...q.options, 'Opsi Baru'] } : q));
    const updateOption = (qId, idx, val) => setData('questions', data.questions.map(q => {
        if (q.id !== qId) return q;
        const opts = [...q.options]; opts[idx] = val; return { ...q, options: opts };
    }));

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Kuesioner Tracer Study</h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Buat dan kelola form kuesioner untuk alumni</p>
                </div>
            }
        >
            <Head title="Tracer Study — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                [data-radix-popper-content-wrapper] { z-index: 99999 !important; }
                .ak-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes rowIn  { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
                @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                .tbl-row:hover td { background:#fafbfc; }
                .q-card { background:#fff; border-radius:10px; border:1px solid ${T.borderSoft}; padding:16px; margin-bottom:10px; }
                .q-card:last-child { margin-bottom:0; }
            `}</style>

            <div className="ak-root">
                <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20, animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', marginBottom: 18 }}>
                        <p style={{ fontSize: 13, color: T.muted, margin: 0, flex: 1 }}>
                            Total <span style={{ fontWeight: 700, color: T.navy }}>{forms.length}</span> kuesioner
                            {forms.filter(f => f.is_active).length > 0 && (
                                <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: T.orangeLight, color: T.orange }}>
                                    {forms.filter(f => f.is_active).length} Aktif
                                </span>
                            )}
                        </p>
                        <button onClick={openCreate} style={{
                            height: 40, padding: '0 16px', borderRadius: 9, border: 'none',
                            background: T.orange, color: '#fff', fontSize: 13, fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: 6,
                            boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = T.orange; e.currentTarget.style.transform = 'none'; }}
                        >
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            Buat Kuesioner
                        </button>
                    </div>

                    <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.borderSoft}` }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                                    {['Judul Kuesioner', 'Pertanyaan', 'Status (Aktif/Draft)', 'Aksi'].map((h, i) => (
                                        <th key={i} style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {forms.map((form, i) => (
                                    <tr key={form.id} className="tbl-row" style={{ borderBottom: `1px solid ${T.borderSoft}`, animation: `rowIn 0.26s ${i * 0.04}s both` }}>
                                        <td style={{ padding: '14px' }}>
                                            <div style={{ fontSize: 13.5, fontWeight: 700, color: T.navy }}>{form.title}</div>
                                            {form.description && <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2, maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.description}</div>}
                                        </td>
                                        <td style={{ padding: '14px' }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: T.navyLight, color: T.navyMid }}>
                                                {form.questions?.length || 0} Pertanyaan
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <CustomSwitch
                                                    checked={form.is_active}
                                                    onChange={() => toggleStatus(form.id)}
                                                />
                                                <span style={{
                                                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                                    background: form.is_active ? T.orangeLight : T.borderSoft,
                                                    color: form.is_active ? T.orange : T.mutedDark,
                                                }}>
                                                    {form.is_active ? 'Status Aktif' : 'Draft Tersimpan'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                                <Link href={route('adminkampus.tracer.responses', form.id)}>
                                                    <button style={{
                                                        height: 32, padding: '0 12px', borderRadius: 7,
                                                        border: `1.5px solid ${T.border}`, background: T.bg,
                                                        color: T.navyMid, fontSize: 12, fontWeight: 700,
                                                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.14s',
                                                    }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = T.bg; }}
                                                    >Data Jawaban</button>
                                                </Link>
                                                <button onClick={() => openEdit(form)} style={{
                                                    height: 32, padding: '0 12px', borderRadius: 7,
                                                    border: `1.5px solid ${T.border}`, background: T.bg,
                                                    color: T.navyMid, fontSize: 12, fontWeight: 600,
                                                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.14s',
                                                }}
                                                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.navyMid; e.currentTarget.style.background = T.navyLight; }}
                                                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.bg; }}
                                                >Edit Form</button>
                                                <button
                                                    onClick={() => confirmDelete(form.id)}
                                                    style={{
                                                        height: 32, padding: '0 12px', borderRadius: 7,
                                                        border: `1.5px solid #fecaca`, background: '#fff5f5',
                                                        color: T.red, fontSize: 12, fontWeight: 600,
                                                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.14s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#f87171'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.borderColor = '#fecaca'; }}
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {forms.length === 0 && (
                                    <tr><td colSpan={4} style={{ padding: '48px 16px', textAlign: 'center', fontSize: 13, color: T.muted }}>Belum ada form kuesioner. Klik tombol buat kuesioner di atas.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Alert Dialog — konsisten dengan desain proyek */}
            <AlertDialog
                open={alertOpen}
                onClose={() => !isDeleting && setAlertOpen(false)}
                onConfirm={executeDelete}
                processing={isDeleting}
                title="Hapus Kuesioner?"
                message="Tindakan ini tidak dapat dibatalkan. Semua daftar pertanyaan dan jawaban dari alumni terkait kuesioner ini akan dihapus secara permanen dari sistem."
            />

            {/* Form Builder Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}
                title={isEditing ? 'Edit Kuesioner' : 'Rancang Kuesioner Baru'}
                wide
                footer={<>
                    <BtnGhost onClick={() => setModalOpen(false)}>Batal</BtnGhost>
                    <button type="submit" form="tracer-form" disabled={processing} style={{
                        height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
                        background: processing ? T.muted : T.orange, color: '#fff',
                        fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.15s',
                        boxShadow: processing ? 'none' : '0 2px 8px rgba(249,115,22,0.3)',
                    }}>
                        {processing ? 'Menyimpan...' : 'Simpan Kuesioner'}
                    </button>
                </>}
            >
                <form id="tracer-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ padding: '14px 16px', borderRadius: 10, background: T.bg, border: `1px solid ${T.borderSoft}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                            <FieldLabel>Judul Kuesioner</FieldLabel>
                            <input style={fieldBase} value={data.title} onChange={e => setData('title', e.target.value)}
                                placeholder="Contoh: Tracer Study Lulusan 2025" onFocus={onFocus} onBlur={onBlur} required />
                        </div>
                        <div>
                            <FieldLabel>Deskripsi (Opsional)</FieldLabel>
                            <textarea
                                style={{ ...fieldBase, height: 'auto', padding: '10px 13px', resize: 'vertical' }}
                                rows={2} value={data.description} onChange={e => setData('description', e.target.value)}
                                placeholder="Penjelasan singkat tujuan kuesioner..." onFocus={onFocus} onBlur={onBlur} />
                        </div>
                    </div>

                    {/* ── PERTANYAAN WAJIB SISTEM (LOCKED) ── */}
                    <div style={{ marginBottom: 20, padding: '16px 18px', borderRadius: 10, background: '#fffbeb', border: `1.5px solid #fed7aa` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#d97706" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#92400e' }}>
                                Preview Pertanyaan Wajib Sistem (Statis)
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: '#fed7aa', color: '#92400e' }}>LOCKED</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fff', border: `1px solid #fde68a` }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 2 }}>Q1 — Status Pekerjaan Saat Ini <span style={{ color: '#ef4444' }}>*</span></div>
                                <div style={{ fontSize: 12.5, color: T.mutedDark }}>Pilihan: Bekerja / Mencari Kerja / Wiraswasta</div>
                            </div>
                            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fff', border: `1px solid #fde68a` }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 2 }}>Q2 — Nama Perusahaan / Instansi / Usaha</div>
                                <div style={{ fontSize: 12.5, color: T.mutedDark }}>Input teks (opsional jika tidak bekerja)</div>
                            </div>
                            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fff', border: `1px solid #fde68a` }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 2 }}>Q3 — Kesesuaian Bidang Ilmu dengan Pekerjaan</div>
                                <div style={{ fontSize: 12.5, color: T.mutedDark }}>Pilihan: Sesuai / Cukup Sesuai / Kurang Sesuai / Tidak Sesuai (muncul jika status = Bekerja/Wiraswasta)</div>
                            </div>
                        </div>
                        <div style={{ fontSize: 11, color: '#b45309', marginTop: 10, fontStyle: 'italic' }}>
                            ⚠️ Pertanyaan di atas bersifat bawaan sistem dan tidak dapat diubah. Jawaban alumni akan otomatis menyimpan ke profil alumni dan laporan.
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 3, height: 16, background: T.orange, borderRadius: 2 }} />
                                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: T.navy }}>
                                    Pertanyaan ({data.questions.length})
                                </span>
                            </div>
                            <button type="button" onClick={addQuestion} style={{
                                height: 30, padding: '0 12px', borderRadius: 7,
                                border: `1.5px solid ${T.orange}`, background: T.orangeLight,
                                color: T.orange, fontSize: 12, fontWeight: 700,
                                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.14s',
                                display: 'flex', alignItems: 'center', gap: 5,
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = '#ffedd5'}
                                onMouseLeave={e => e.currentTarget.style.background = T.orangeLight}
                            >
                                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                Tambah Pertanyaan
                            </button>
                        </div>

                        {data.questions.map((q, idx) => (
                            <div key={q.id} className="q-card">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: T.navyLight, color: T.navyMid }}>Pertanyaan {idx + 1}</span>
                                    <button type="button" onClick={() => removeQuestion(q.id)} style={{
                                        height: 26, padding: '0 10px', borderRadius: 6,
                                        border: `1.5px solid #fecaca`, background: T.redLight,
                                        color: T.red, fontSize: 11, fontWeight: 600,
                                        cursor: 'pointer', fontFamily: 'inherit',
                                    }}>Hapus</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: q.type === 'radio' ? 10 : 0 }}>
                                    <div>
                                        <FieldLabel>Teks Pertanyaan</FieldLabel>
                                        <input style={fieldBase} value={q.question} onChange={e => updateQuestion(q.id, 'question', e.target.value)}
                                            placeholder="Tulis pertanyaan..." onFocus={onFocus} onBlur={onBlur} required />
                                    </div>
                                    <div style={{ minWidth: 160 }}>
                                        <FieldLabel>Tipe Jawaban</FieldLabel>
                                        <Select value={q.type} onValueChange={v => updateQuestion(q.id, 'type', v)}>
                                            <SelectTrigger className="focus:ring-0 focus:ring-offset-0" style={{ height: 42, borderRadius: 9, border: `1.5px solid ${T.border}`, background: T.bg, fontSize: 13 }}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent position="popper" sideOffset={4} className="z-[500] rounded-xl overflow-hidden border border-gray-200 shadow-xl" style={{ background: "#ffffff", minWidth: "var(--radix-select-trigger-width)" }}>
                                                <SelectItem className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50" style={{ color: "#1e293b", background: "transparent" }} value="text">Teks Singkat</SelectItem>
                                                <SelectItem className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50" style={{ color: "#1e293b", background: "transparent" }} value="textarea">Paragraf</SelectItem>
                                                <SelectItem className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50" style={{ color: "#1e293b", background: "transparent" }} value="radio">Pilihan Ganda</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {q.type === 'radio' && (
                                    <div style={{ paddingLeft: 12, borderLeft: `3px solid ${T.orange}` }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 6 }}>Pilihan Jawaban</div>
                                        {q.options.map((opt, oi) => (
                                            <input key={oi} style={{ ...fieldBase, height: 36, marginBottom: 5, width: '65%', fontSize: 13 }}
                                                value={opt} onChange={e => updateOption(q.id, oi, e.target.value)}
                                                placeholder={`Opsi ${oi + 1}`} onFocus={onFocus} onBlur={onBlur} />
                                        ))}
                                        <button type="button" onClick={() => addOption(q.id)} style={{ fontSize: 12, fontWeight: 600, color: T.orange, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'inherit' }}>
                                            + Tambah Opsi
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {data.questions.length === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', borderRadius: 10, border: `2px dashed ${T.borderSoft}`, gap: 8 }}>
                                <div style={{ fontSize: 28 }}>📝</div>
                                <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>Belum ada pertanyaan. Klik "+ Tambah Pertanyaan" untuk mulai.</p>
                            </div>
                        )}
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
