import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
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
                background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520,
                boxShadow: '0 24px 60px rgba(10,20,40,0.2)',
                display: 'flex', flexDirection: 'column', maxHeight: '90vh',
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

function ConfirmModal({ open, onClose, onConfirm, title, message, processing }) {
    return (
        <Modal open={open} onClose={onClose} title={title || 'Konfirmasi'}
            footer={<>
                <button type="button" onClick={onClose} style={{ height: 36, padding: '0 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: 'transparent', color: T.mutedDark, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Batal
                </button>
                <button type="button" onClick={onConfirm} disabled={processing} style={{
                    height: 36, padding: '0 16px', borderRadius: 8, border: 'none',
                    background: processing ? T.muted : T.red, color: '#fff',
                    fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                }}>
                    {processing ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
            </>}
        >
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: 0 }}>{message || 'Apakah Anda yakin ingin menghapus?'}</p>
        </Modal>
    );
}

const BtnGhost = ({ children, onClick, style }) => (
    <button type="button" onClick={onClick} style={{ height: 36, padding: '0 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: 'transparent', color: T.mutedDark, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', ...style }}
        onMouseEnter={e => e.currentTarget.style.background = T.bg}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >{children}</button>
);

const fieldBase = { padding: '0 13px', border: `1.5px solid ${T.border}`, borderRadius: 9, background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none', width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box' };
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; e.target.style.boxShadow = 'none'; };

const formatDate = d => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));

function Toast({ message, type, onClose }) {
    useEffect(() => {
        if (!message) return;
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [message, onClose]);

    if (!message) return null;

    const isError = type === 'error';
    return (
        <div style={{
            position: 'fixed', top: 20, right: 20, zIndex: 9999,
            background: isError ? T.redLight : T.greenLight,
            border: `1px solid ${isError ? T.red : T.green}`,
            borderRadius: 12, padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            maxWidth: 400, animation: 'slideDown 0.3s ease',
        }}>
            <span style={{ fontSize: 18 }}>{isError ? '❌' : '✅'}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: isError ? T.red : T.green, flex: 1, lineHeight: 1.4 }}>{message}</span>
            <button onClick={onClose} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isError ? T.red : T.green, fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
    );
}

export default function ForumIndex({ topics, filters }) {
    const { auth, flash } = usePage().props;
    const [searchInput, setSearchInput] = useState(filters?.search || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [toastMsg, setToastMsg] = useState(null);
    const [toastType, setToastType] = useState('success');
    const debounceRef = useRef(null);

    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const createForm = useForm({ title: '', content: '', attachment: null });
    const editForm = useForm({ title: '', content: '', attachment: null });
    const deleteForm = useForm({});

    const topicList = topics?.data || [];
    const total = topics?.total || topics?.meta?.total || 0;
    const userId = auth?.user?.id;

    useEffect(() => {
        if (flash?.message) {
            setToastMsg(flash.message);
            setToastType(flash.error ? 'error' : 'success');
        }
    }, [flash]);

    const openCreate = () => { createForm.reset(); createForm.clearErrors(); setModalOpen(true); };
    const handleCreate = e => {
        e.preventDefault();
        createForm.post(route('alumni.forum.store'), {
            onSuccess: () => { setModalOpen(false); setToastMsg('Topik diskusi berhasil dibuat.'); setToastType('success'); },
        });
    };

    const handleSearch = value => {
        setSearchInput(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            router.get(route('alumni.forum.index'), { search: value || null }, {
                preserveState: true, replace: true,
            });
        }, 350);
    };

    useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

    const goToPage = url => { if (url) router.get(url, {}, { preserveState: true, replace: true }); };

    const openEdit = (topic, e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditTarget(topic);
        editForm.setData({ title: topic.title, content: topic.content });
        editForm.clearErrors();
    };

    const handleEdit = e => {
        e.preventDefault();
        if (!editTarget) return;
        editForm.put(route('alumni.forum.update', editTarget.id), {
            onSuccess: () => { setEditTarget(null); setToastMsg('Topik berhasil diperbarui.'); setToastType('success'); },
        });
    };

    const openDelete = (topic, e) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteTarget(topic);
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        deleteForm.delete(route('alumni.forum.destroy', deleteTarget.id), {
            onSuccess: () => { setDeleteTarget(null); },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Ruang Diskusi Alumni</h2>
                        <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Berbagi informasi, tips karir, dan menjalin relasi antar alumni</p>
                    </div>
                    <div style={{ padding: '4px 10px', borderRadius: 8, background: T.navyLight, border: `1px solid ${T.navyMid}22`, fontSize: 12, fontWeight: 700, color: T.navyMid }}>
                        {total} Topik
                    </div>
                </div>
            }
        >
            <Head title="Forum Diskusi — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .al-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes rowIn  { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
                @keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
                .forum-card { transition:all 0.2s ease; }
                .forum-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(15,31,61,0.1); border-color: ${T.navyMid}44 !important; }
            `}</style>

            <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />

            <div className="al-root">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20, animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
                        <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#b0bec5', pointerEvents: 'none' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input style={{ ...fieldBase, height: 42, paddingLeft: 32 }} placeholder="Cari topik diskusi..."
                            value={searchInput} onChange={e => handleSearch(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    <button onClick={openCreate} style={{
                        height: 42, padding: '0 18px', borderRadius: 9, border: 'none',
                        background: T.orange, color: '#fff', fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: 7,
                        boxShadow: '0 2px 8px rgba(249,115,22,0.28)',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = T.orange; e.currentTarget.style.transform = 'none'; }}
                    >
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Buat Topik
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {topicList.map((topic, i) => {
                        const isOwner = userId && topic.user_id === userId;
                        return (
                            <div key={topic.id} className="forum-card" style={{
                                background: '#fff', borderRadius: 14,
                                border: `1px solid ${T.borderSoft}`,
                                padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
                                boxShadow: '0 1px 4px rgba(15,31,61,0.05)',
                                animation: `rowIn 0.28s ${i * 0.05}s cubic-bezier(0.22,1,0.36,1) both`,
                            }}>
                                <Link href={route('alumni.forum.show', topic.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0, textDecoration: 'none' }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, background: T.navyLight, color: T.navyMid, fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {topic.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{topic.title}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.muted }}>
                                            <span style={{ fontWeight: 600, color: T.mutedDark }}>{topic.user?.name}</span>
                                            <span>·</span>
                                            <span>{formatDate(topic.created_at)}</span>
                                            {topic.attachment_url && (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: T.mutedDark }}>
                                                    <span>·</span>
                                                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: T.bg, border: `1px solid ${T.border}`, flexShrink: 0 }}>
                                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke={T.muted} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: T.mutedDark }}>{topic.replies_count ?? 0}</span>
                                    </div>
                                </Link>
                                {isOwner && (
                                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                        <button onClick={e => openEdit(topic, e)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', color: T.mutedDark }}
                                            onMouseEnter={e => { e.currentTarget.style.background = T.navyLight; e.currentTarget.style.color = T.navyMid; e.currentTarget.style.borderColor = T.navyMid; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.mutedDark; e.currentTarget.style.borderColor = T.border; }}
                                            title="Edit">
                                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                                        </button>
                                        <button onClick={e => openDelete(topic, e)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', color: T.mutedDark }}
                                            onMouseEnter={e => { e.currentTarget.style.background = T.redLight; e.currentTarget.style.color = T.red; e.currentTarget.style.borderColor = T.red; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.mutedDark; e.currentTarget.style.borderColor = T.border; }}
                                            title="Hapus">
                                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {topicList.length === 0 && (
                        <div style={{ padding: '56px 20px', textAlign: 'center', background: '#fff', borderRadius: 14, border: `2px dashed ${T.borderSoft}` }}>
                            <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 4 }}>
                                {searchInput ? 'Topik tidak ditemukan' : 'Belum ada topik diskusi'}
                            </div>
                            <div style={{ fontSize: 12, color: T.muted }}>
                                {searchInput ? 'Coba kata kunci lain.' : 'Jadilah yang pertama memulai diskusi!'}
                            </div>
                        </div>
                    )}
                </div>

                {topics?.last_page > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24 }}>
                        {topics.links?.map((link, i) => (
                            <button key={i} onClick={() => goToPage(link.url)}
                                disabled={!link.url || link.active}
                                style={{
                                    minWidth: 36, height: 36, borderRadius: 8,
                                    border: `1px solid ${link.active ? T.orange : T.border}`,
                                    background: link.active ? T.orange : '#fff',
                                    color: link.active ? '#fff' : (link.url ? T.mutedDark : T.muted),
                                    fontSize: 13, fontWeight: 700,
                                    cursor: link.url && !link.active ? 'pointer' : 'default',
                                    fontFamily: 'inherit', transition: 'all 0.15s',
                                }}>
                                {link.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Buat Topik */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Buat Topik Diskusi Baru"
                footer={<>
                    <BtnGhost onClick={() => setModalOpen(false)}>Batal</BtnGhost>
                    <button type="submit" form="forum-form" disabled={createForm.processing} style={{
                        height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
                        background: createForm.processing ? T.muted : T.orange, color: '#fff',
                        fontSize: 13, fontWeight: 700, cursor: createForm.processing ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.15s',
                        boxShadow: createForm.processing ? 'none' : '0 2px 8px rgba(249,115,22,0.3)',
                    }}>
                        {createForm.processing ? 'Memposting...' : 'Posting Topik'}
                    </button>
                </>}
            >
                <form id="forum-form" onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 5 }}>
                            Judul Topik <span style={{ color: T.red }}>*</span>
                        </label>
                        <input style={{ ...fieldBase, height: 42 }} placeholder="Misal: Info Loker IT Bandung 2026"
                            value={createForm.data.title} onChange={e => createForm.setData('title', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                        <InputError message={createForm.errors.title} className="mt-1.5" />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 5 }}>
                            Isi Pesan <span style={{ color: T.red }}>*</span>
                        </label>
                        <textarea style={{ ...fieldBase, height: 'auto', padding: '10px 13px', minHeight: 110, resize: 'vertical' }} rows={5}
                            placeholder="Tuliskan pesan atau pertanyaan Anda di sini..."
                            value={createForm.data.content} onChange={e => createForm.setData('content', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                        <InputError message={createForm.errors.content} className="mt-1.5" />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 5 }}>
                            Lampiran Gambar
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: `1.5px dashed ${T.border}`, borderRadius: 9, background: T.bg, cursor: 'pointer', transition: 'all 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = T.navyMid}
                            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                        >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={T.mutedDark} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
                            <span style={{ fontSize: 12.5, color: T.mutedDark, flex: 1 }}>{createForm.data.attachment ? createForm.data.attachment.name : 'Pilih gambar (opsional, max 2MB)'}</span>
                            <input type="file" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" style={{ display: 'none' }}
                                onChange={e => { const file = e.target.files[0]; if (file) createForm.setData('attachment', file); }} />
                        </label>
                        <InputError message={createForm.errors.attachment} className="mt-1.5" />
                    </div>
                </form>
            </Modal>

            {/* Modal Edit Topik */}
            <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Topik Diskusi"
                footer={<>
                    <BtnGhost onClick={() => setEditTarget(null)}>Batal</BtnGhost>
                    <button type="submit" form="edit-forum-form" disabled={editForm.processing} style={{
                        height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
                        background: editForm.processing ? T.muted : T.navyMid, color: '#fff',
                        fontSize: 13, fontWeight: 700, cursor: editForm.processing ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.15s',
                        boxShadow: editForm.processing ? 'none' : '0 2px 8px rgba(26,53,96,0.3)',
                    }}>
                        {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </>}
            >
                <form id="edit-forum-form" onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 5 }}>
                            Judul Topik <span style={{ color: T.red }}>*</span>
                        </label>
                        <input style={{ ...fieldBase, height: 42 }}
                            value={editForm.data.title} onChange={e => editForm.setData('title', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                        <InputError message={editForm.errors.title} className="mt-1.5" />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 5 }}>
                            Isi Pesan <span style={{ color: T.red }}>*</span>
                        </label>
                        <textarea style={{ ...fieldBase, height: 'auto', padding: '10px 13px', minHeight: 110, resize: 'vertical' }} rows={5}
                            value={editForm.data.content} onChange={e => editForm.setData('content', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                        <InputError message={editForm.errors.content} className="mt-1.5" />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 5 }}>
                            Lampiran Gambar
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: `1.5px dashed ${T.border}`, borderRadius: 9, background: T.bg, cursor: 'pointer', transition: 'all 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = T.navyMid}
                            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                        >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={T.mutedDark} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
                            <span style={{ fontSize: 12.5, color: T.mutedDark, flex: 1 }}>{editForm.data.attachment?.name ? editForm.data.attachment.name : (editTarget?.attachment_url ? 'Ganti gambar' : 'Pilih gambar (opsional, max 2MB)')}</span>
                            <input type="file" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" style={{ display: 'none' }}
                                onChange={e => { const file = e.target.files[0]; if (file) editForm.setData('attachment', file); }} />
                        </label>
                        <InputError message={editForm.errors.attachment} className="mt-1.5" />
                        {editTarget?.attachment_url && !editForm.data.attachment && (
                            <div style={{ marginTop: 8, fontSize: 12, color: T.muted, fontStyle: 'italic' }}>Gambar sebelumnya akan tetap digunakan jika tidak memilih gambar baru.</div>
                        )}
                    </div>
                </form>
            </Modal>

            {/* Modal Hapus Topik */}
            <ConfirmModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Hapus Topik"
                message={`Apakah Anda yakin ingin menghapus topik "${deleteTarget?.title}"? Semua balasan dalam topik ini juga akan dihapus.`}
                processing={deleteForm.processing}
            />
        </AuthenticatedLayout>
    );
}
