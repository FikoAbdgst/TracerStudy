import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
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

const formatDate = d => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
const formatShort = d => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));

const fieldBase = { padding: '10px 13px', border: `1.5px solid ${T.border}`, borderRadius: 9, background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none', width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' };
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; e.target.style.boxShadow = 'none'; };

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

function formatRichText(text) {
    if (!text) return '';
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#1a3560;text-decoration:underline">$1</a>')
        .replace(/\n/g, '<br>');
    return html;
}

function RichContent({ text }) {
    return (
        <span dangerouslySetInnerHTML={{ __html: formatRichText(text) }} style={{ fontSize: 14, color: '#334155', lineHeight: 1.7 }} />
    );
}

export default function ForumShow({ topic }) {
    const { auth, flash } = usePage().props;
    const userId = auth?.user?.id;
    const isTopicOwner = userId && topic.user_id === userId;

    const [toastMsg, setToastMsg] = useState(null);
    const [toastType, setToastType] = useState('success');
    const [replyTo, setReplyTo] = useState(null);

    const replyForm = useForm({ content: '', attachments: [], parent_id: null });

    /* --- Topic edit --- */
    const [editTopic, setEditTopic] = useState(false);
    const topicForm = useForm({ title: topic.title, content: topic.content, attachments: [], deleted_attachments: [] });

    /* --- Topic delete --- */
    const [deleteTopic, setDeleteTopic] = useState(false);
    const topicDeleteForm = useForm({});

    /* --- Reply edit --- */
    const [editReplyId, setEditReplyId] = useState(null);
    const replyEditForm = useForm({ content: '', attachments: [], deleted_attachments: [] });

    /* --- Reply delete --- */
    const [deleteReplyId, setDeleteReplyId] = useState(null);
    const replyDeleteForm = useForm({});

    useEffect(() => {
        if (flash?.message) {
            setToastMsg(flash.message);
            setToastType(flash.error ? 'error' : 'success');
        }
    }, [flash]);

    const handleReply = e => {
        e.preventDefault();
        replyForm.post(route('alumni.forum.reply', topic.id), {
            onSuccess: () => { replyForm.reset('content', 'attachments', 'parent_id'); setReplyTo(null); },
        });
    };

    const handleTopicEdit = e => {
        e.preventDefault();
        topicForm.put(route('alumni.forum.update', topic.id), {
            onSuccess: () => { setEditTopic(false); setToastMsg('Topik berhasil diperbarui.'); setToastType('success'); },
        });
    };

    const handleTopicDelete = () => {
        topicDeleteForm.delete(route('alumni.forum.destroy', topic.id), {
            onSuccess: () => { },
        });
    };

    const openReplyEdit = reply => {
        setEditReplyId(reply.id);
        replyEditForm.setData({ content: reply.content, attachments: [], deleted_attachments: [] });
        replyEditForm.clearErrors();
    };

    const handleReplyEdit = e => {
        e.preventDefault();
        if (!editReplyId) return;
        replyEditForm.put(route('alumni.forum.reply.update', [topic.id, editReplyId]), {
            onSuccess: () => { setEditReplyId(null); setToastMsg('Balasan berhasil diperbarui.'); setToastType('success'); },
        });
    };

    const handleReplyDelete = () => {
        if (!deleteReplyId) return;
        replyDeleteForm.delete(route('alumni.forum.reply.destroy', [topic.id, deleteReplyId]), {
            onSuccess: () => { setDeleteReplyId(null); },
        });
    };

    const formRef = useRef(null);
    const isFormActive = replyTo || replyForm.data.content.trim() || (replyForm.data.attachments?.length > 0);

    useEffect(() => {
        if (replyTo && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [replyTo]);

    const getInitials = name => name ? name.charAt(0).toUpperCase() : '?';

    const renderReplyCard = (reply, depth = 0) => {
        const isReplyOwner = userId && reply.user_id === userId;
        const isEditing = editReplyId === reply.id;
        const childReplies = (topic.replies || []).filter(r => r.parent_id === reply.id);
        return (
            <div key={reply.id} style={{
                background: '#fff', borderRadius: 12, border: `1px solid ${T.borderSoft}`,
                padding: '14px 18px', boxShadow: '0 1px 4px rgba(15,31,61,0.04)',
                animation: `slideIn 0.26s ${depth * 0.03}s cubic-bezier(0.22,1,0.36,1) both`,
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: T.orangeLight, color: T.orange, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {getInitials(reply.user?.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{reply.user?.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 11.5, color: T.muted, flexShrink: 0 }}>{formatShort(reply.created_at)}</span>
                                {!isEditing && (
                                    <div style={{ display: 'flex', gap: 2 }}>
                                        <button onClick={() => { setReplyTo({ id: reply.id, name: reply.user?.name, content: reply.content }); replyForm.setData('parent_id', reply.id); }}
                                            style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.mutedDark, transition: 'all 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = T.navyMid}
                                            onMouseLeave={e => e.currentTarget.style.color = T.mutedDark}
                                            title="Balas">
                                            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                                        </button>
                                        {isReplyOwner && (
                                            <>
                                                <button onClick={() => openReplyEdit(reply)}
                                                    style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.mutedDark, transition: 'all 0.15s' }}
                                                    onMouseEnter={e => e.currentTarget.style.color = T.navyMid}
                                                    onMouseLeave={e => e.currentTarget.style.color = T.mutedDark}
                                                    title="Edit">
                                                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                                                </button>
                                                <button onClick={() => setDeleteReplyId(reply.id)}
                                                    style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.mutedDark, transition: 'all 0.15s' }}
                                                    onMouseEnter={e => e.currentTarget.style.color = T.red}
                                                    onMouseLeave={e => e.currentTarget.style.color = T.mutedDark}
                                                    title="Hapus">
                                                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        {isEditing ? (
                            <form onSubmit={handleReplyEdit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <textarea style={{ ...fieldBase, minHeight: 72 }}
                                    value={replyEditForm.data.content}
                                    onChange={e => replyEditForm.setData('content', e.target.value)}
                                    onFocus={onFocus} onBlur={onBlur} />
                                <InputError message={replyEditForm.errors.content} />
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', border: `1.5px dashed ${T.border}`, borderRadius: 7, background: T.bg, cursor: 'pointer', fontSize: 11.5, color: T.mutedDark }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = T.navyMid}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                                >
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={T.mutedDark} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
                                    <span style={{ flex: 1 }}>{replyEditForm.data.attachments?.length > 0 ? `${replyEditForm.data.attachments.length} gambar baru dipilih` : 'Tambah gambar'}</span>
                                    <input type="file" multiple accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" style={{ display: 'none' }}
                                        onChange={e => {
                                            const newFiles = Array.from(e.target.files);
                                            if (newFiles.length === 0) return;
                                            const current = replyEditForm.data.attachments || [];
                                            replyEditForm.setData('attachments', [...current, ...newFiles]);
                                            e.target.value = null;
                                        }} />
                                </label>
                                {replyEditForm.data.attachments?.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {replyEditForm.data.attachments.map((file, i) => (
                                            <div key={i} style={{ position: 'relative', width: 60, height: 60, borderRadius: 6, overflow: 'hidden', border: `1px solid ${T.border}`, background: T.bg }}>
                                                <img src={URL.createObjectURL(file)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button type="button" onClick={() => {
                                                    const updated = replyEditForm.data.attachments.filter((_, idx) => idx !== i);
                                                    replyEditForm.setData('attachments', updated);
                                                }} style={{ position: 'absolute', top: 1, right: 1, width: 16, height: 16, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.55)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, padding: 0, lineHeight: 1 }}>
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <InputError message={replyEditForm.errors.attachments} />
                                {reply.attachment?.length > 0 && reply.attachment.filter(p => !(replyEditForm.data.deleted_attachments || []).includes(p)).length > 0 && (
                                    <div style={{ marginTop: 6 }}>
                                        <div style={{ fontSize: 10.5, color: T.muted, marginBottom: 4 }}>Gambar saat ini (klik × untuk hapus):</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {reply.attachment.map((path, i) => {
                                                if ((replyEditForm.data.deleted_attachments || []).includes(path)) return null;
                                                return (
                                                    <div key={i} style={{ position: 'relative', width: 60, height: 60, borderRadius: 6, overflow: 'hidden', border: `1px solid ${T.border}`, background: T.bg }}>
                                                        <img src={reply.attachment_urls[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        <button type="button" onClick={() => {
                                                            replyEditForm.setData('deleted_attachments', [...(replyEditForm.data.deleted_attachments || []), path]);
                                                        }} style={{ position: 'absolute', top: 1, right: 1, width: 16, height: 16, borderRadius: '50%', border: 'none', background: 'rgba(220,38,38,0.8)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, padding: 0, lineHeight: 1 }}>
                                                            ×
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setEditReplyId(null)}
                                        style={{ height: 30, padding: '0 12px', borderRadius: 6, border: `1px solid ${T.border}`, background: 'transparent', color: T.mutedDark, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        Batal
                                    </button>
                                    <button type="submit" disabled={replyEditForm.processing}
                                        style={{ height: 30, padding: '0 12px', borderRadius: 6, border: 'none', background: replyEditForm.processing ? T.muted : T.navyMid, color: '#fff', fontSize: 11, fontWeight: 700, cursor: replyEditForm.processing ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                                        {replyEditForm.processing ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <RichContent text={reply.content} />
                                {reply.attachment_urls?.length > 0 && (
                                    <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {reply.attachment_urls.map((url, i) => (
                                            <img key={i} src={url} alt={`Lampiran ${i + 1}`} style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 8, border: `1px solid ${T.borderSoft}`, objectFit: 'cover' }} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
                {childReplies.length > 0 && (
                    <div style={{ marginTop: 10, borderLeft: `2px solid ${T.border}`, paddingLeft: 14 }}>
                        {childReplies.map(child => renderReplyCard(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link href={route('alumni.forum.index')} style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textDecoration: 'none', transition: 'all 0.15s', flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.navyLight; e.currentTarget.style.borderColor = T.navyMid; }}
                        onMouseLeave={e => { e.currentTarget.style.background = T.bg; e.currentTarget.style.borderColor = T.border; }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={T.navyMid} strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                    </Link>
                    <div>
                        <h2 style={{ fontSize: 15, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>{topic.title}</h2>
                        <p style={{ fontSize: 12, color: T.muted, margin: '2px 0 0' }}>Ruang Diskusi Alumni</p>
                    </div>
                </div>
            }
        >
            <Head title={topic.title} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .al-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes slideIn { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
                @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                @keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
            `}</style>

            <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />

            <div className="al-root" style={{ maxWidth: 700, margin: '0 auto' }}>

                {/* Main Post */}
                <div style={{
                    background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`,
                    overflow: 'hidden', marginBottom: 16,
                    boxShadow: '0 2px 8px rgba(15,31,61,0.06)',
                    animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both',
                }}>
                    <div style={{ padding: '18px 20px 16px', borderBottom: `1px solid ${T.borderSoft}`, background: `linear-gradient(to bottom, ${T.bg}, #fff)` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                            <h1 style={{ fontSize: 18, fontWeight: 800, color: T.navy, margin: '0 0 14px', letterSpacing: '-0.01em', lineHeight: 1.4, flex: 1 }}>{topic.title}</h1>
                            {isTopicOwner && (
                                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                    <button onClick={() => { topicForm.setData({ title: topic.title, content: topic.content, attachments: [], deleted_attachments: [] }); setEditTopic(true); }}
                                        style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', color: T.mutedDark }}
                                        onMouseEnter={e => { e.currentTarget.style.background = T.navyLight; e.currentTarget.style.color = T.navyMid; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.mutedDark; }}
                                        title="Edit">
                                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                                    </button>
                                    <button onClick={() => setDeleteTopic(true)}
                                        style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', color: T.mutedDark }}
                                        onMouseEnter={e => { e.currentTarget.style.background = T.redLight; e.currentTarget.style.color = T.red; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.mutedDark; }}
                                        title="Hapus">
                                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                    </button>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.navyMid, color: '#fff', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {getInitials(topic.user?.name)}
                            </div>
                            <div>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.navy }}>{topic.user?.name}</div>
                                <div style={{ fontSize: 11.5, color: T.muted }}>{formatDate(topic.created_at)}</div>
                            </div>
                            <div style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 20, background: T.navyLight, border: `1px solid ${T.navyMid}22` }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: T.navyMid }}>Pembuat Topik</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '18px 20px' }}>
                        <RichContent text={topic.content} />
                        {topic.attachment_urls?.length > 0 && (
                            <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {topic.attachment_urls.map((url, i) => (
                                    <img key={i} src={url} alt={`Lampiran ${i + 1}`} style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 10, border: `1px solid ${T.borderSoft}`, objectFit: 'cover' }} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Replies header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: T.navy }}>Balasan</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: T.navyLight, color: T.navyMid }}>
                        {topic.replies?.length || 0}
                    </span>
                </div>

                {/* Replies list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {(() => {
                        const roots = (topic.replies || []).filter(r => !r.parent_id);
                        if (roots.length === 0) {
                            return (
                                <div style={{ padding: '32px 20px', textAlign: 'center', background: T.bg, borderRadius: 12, border: `1.5px dashed ${T.border}` }}>
                                    <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
                                    <div style={{ fontSize: 13, color: T.muted }}>Belum ada balasan. Jadilah yang pertama membalas!</div>
                                </div>
                            );
                        }
                        return roots.map(reply => renderReplyCard(reply));
                    })()}
                </div>

                {/* Reply form */}
                <div ref={formRef} style={{
                    background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`,
                    padding: '18px 20px',
                    boxShadow: isFormActive ? '0 -8px 30px rgba(15,31,61,0.12)' : '0 2px 8px rgba(15,31,61,0.05)',
                    animation: 'cardIn 0.38s 0.2s cubic-bezier(0.22,1,0.36,1) both',
                    ...(isFormActive ? { position: 'sticky', bottom: 0, zIndex: 20 } : {}),
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <div style={{ width: 3, height: 16, background: T.orange, borderRadius: 2 }} />
                        <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.navy }}>Tulis Balasan</span>
                    </div>
                    {replyTo && (
                        <div style={{ marginBottom: 10, border: `1.5px dashed ${T.border}`, borderRadius: 10, background: T.bg, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderBottom: `1px solid ${T.borderSoft}`, fontSize: 11.5, color: T.muted }}>
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={T.muted} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                                <span style={{ flex: 1 }}>Membalas <strong style={{ color: T.navyMid }}>{replyTo.name}</strong></span>
                                <button type="button" onClick={() => { setReplyTo(null); replyForm.setData('parent_id', null); }}
                                    style={{ width: 20, height: 20, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.mutedDark, fontSize: 16, fontWeight: 700, padding: 0, lineHeight: 1 }}>
                                    ×
                                </button>
                            </div>
                            <div style={{ padding: '8px 11px', fontSize: 13, color: T.mutedDark, lineHeight: 1.6, maxHeight: 80, overflowY: 'auto' }}>
                                {replyTo.content}
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleReply} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                            <textarea style={{ ...fieldBase, minHeight: 96 }} rows={4}
                                placeholder="Tulis balasan Anda di sini... "
                                value={replyForm.data.content} onChange={e => replyForm.setData('content', e.target.value)}
                                onFocus={onFocus} onBlur={onBlur} />
                            <InputError message={replyForm.errors.content} className="mt-1.5" />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', border: `1.5px dashed ${T.border}`, borderRadius: 9, background: T.bg, cursor: 'pointer', transition: 'all 0.15s', fontSize: 12.5, color: T.mutedDark }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = T.navyMid}
                                onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                            >
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke={T.mutedDark} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
                                <span style={{ flex: 1 }}>{replyForm.data.attachments?.length > 0 ? `${replyForm.data.attachments.length} gambar dipilih` : 'Lampirkan gambar (opsional, max 2MB per gambar)'}</span>
                                <input type="file" multiple accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" style={{ display: 'none' }}
                                    onChange={e => {
                                        const newFiles = Array.from(e.target.files);
                                        if (newFiles.length === 0) return;
                                        const current = replyForm.data.attachments || [];
                                        replyForm.setData('attachments', [...current, ...newFiles]);
                                        e.target.value = null;
                                    }} />
                            </label>
                            {replyForm.data.attachments?.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                                    {replyForm.data.attachments.map((file, i) => (
                                        <div key={i} style={{ position: 'relative', width: 68, height: 68, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.border}`, background: T.bg }}>
                                            <img src={URL.createObjectURL(file)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button type="button" onClick={() => {
                                                const updated = replyForm.data.attachments.filter((_, idx) => idx !== i);
                                                replyForm.setData('attachments', updated);
                                            }} style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.55)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, padding: 0, lineHeight: 1 }}>
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <InputError message={replyForm.errors.attachments} className="mt-1.5" />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" disabled={replyForm.processing || !replyForm.data.content.trim()} style={{
                                height: 38, padding: '0 20px', borderRadius: 9, border: 'none',
                                background: (replyForm.processing || !replyForm.data.content.trim()) ? T.muted : T.orange,
                                color: '#fff', fontSize: 13, fontWeight: 700,
                                cursor: (replyForm.processing || !replyForm.data.content.trim()) ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit', transition: 'all 0.15s',
                                display: 'flex', alignItems: 'center', gap: 7,
                                boxShadow: (replyForm.processing || !replyForm.data.content.trim()) ? 'none' : '0 2px 8px rgba(249,115,22,0.25)',
                            }}
                                onMouseEnter={e => { if (!replyForm.processing && replyForm.data.content.trim()) { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                                onMouseLeave={e => { e.currentTarget.style.background = (replyForm.processing || !replyForm.data.content.trim()) ? T.muted : T.orange; e.currentTarget.style.transform = 'none'; }}
                            >
                                {replyForm.processing
                                    ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}><path strokeLinecap="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>Mengirim...</>
                                    : <><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>Kirim Balasan</>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal Edit Topik */}
            <Modal open={editTopic} onClose={() => setEditTopic(false)} title="Edit Topik Diskusi"
                footer={<>
                    <button type="button" onClick={() => setEditTopic(false)} style={{ height: 36, padding: '0 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: 'transparent', color: T.mutedDark, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Batal
                    </button>
                    <button type="submit" form="edit-topic-form" disabled={topicForm.processing} style={{
                        height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
                        background: topicForm.processing ? T.muted : T.navyMid, color: '#fff',
                        fontSize: 13, fontWeight: 700, cursor: topicForm.processing ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit',
                    }}>
                        {topicForm.processing ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </>}
            >
                <form id="edit-topic-form" onSubmit={handleTopicEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 5 }}>Judul</label>
                        <input style={{ ...fieldBase, height: 42, padding: '0 13px' }}
                            value={topicForm.data.title} onChange={e => topicForm.setData('title', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                        <InputError message={topicForm.errors.title} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 5 }}>Konten</label>
                        <textarea style={{ ...fieldBase, minHeight: 120 }} rows={5}
                            value={topicForm.data.content} onChange={e => topicForm.setData('content', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                        <InputError message={topicForm.errors.content} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 5 }}>Lampiran Gambar</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', border: `1.5px dashed ${T.border}`, borderRadius: 9, background: T.bg, cursor: 'pointer', fontSize: 12.5, color: T.mutedDark }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = T.navyMid}
                            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                        >
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke={T.mutedDark} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
                            <span style={{ flex: 1 }}>{topicForm.data.attachments?.length > 0 ? `${topicForm.data.attachments.length} gambar baru dipilih` : 'Tambah gambar (opsional, max 2MB per gambar)'}</span>
                            <input type="file" multiple accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" style={{ display: 'none' }}
                                onChange={e => {
                                    const newFiles = Array.from(e.target.files);
                                    if (newFiles.length === 0) return;
                                    const current = topicForm.data.attachments || [];
                                    topicForm.setData('attachments', [...current, ...newFiles]);
                                    e.target.value = null;
                                }} />
                        </label>
                        {topicForm.data.attachments?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                                {topicForm.data.attachments.map((file, i) => (
                                    <div key={i} style={{ position: 'relative', width: 68, height: 68, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.border}`, background: T.bg }}>
                                        <img src={URL.createObjectURL(file)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button type="button" onClick={() => {
                                            const updated = topicForm.data.attachments.filter((_, idx) => idx !== i);
                                            topicForm.setData('attachments', updated);
                                        }} style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.55)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, padding: 0, lineHeight: 1 }}>
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <InputError message={topicForm.errors.attachments} />
                        {topic.attachment?.length > 0 && topic.attachment.filter(p => !(topicForm.data.deleted_attachments || []).includes(p)).length > 0 && (
                            <div style={{ marginTop: 8 }}>
                                <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>Gambar saat ini (klik × untuk hapus):</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {topic.attachment.map((path, i) => {
                                        if ((topicForm.data.deleted_attachments || []).includes(path)) return null;
                                        return (
                                            <div key={i} style={{ position: 'relative', width: 68, height: 68, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.border}`, background: T.bg }}>
                                                <img src={topic.attachment_urls[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button type="button" onClick={() => {
                                                    topicForm.setData('deleted_attachments', [...(topicForm.data.deleted_attachments || []), path]);
                                                }} style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', border: 'none', background: 'rgba(220,38,38,0.8)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, padding: 0, lineHeight: 1 }}>
                                                    ×
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </Modal>

            {/* Modal Hapus Topik */}
            <ConfirmModal
                open={deleteTopic}
                onClose={() => setDeleteTopic(false)}
                onConfirm={handleTopicDelete}
                title="Hapus Topik"
                message="Apakah Anda yakin ingin menghapus topik ini? Semua balasan juga akan dihapus."
                processing={topicDeleteForm.processing}
            />

            {/* Modal Hapus Balasan */}
            <ConfirmModal
                open={!!deleteReplyId}
                onClose={() => setDeleteReplyId(null)}
                onConfirm={handleReplyDelete}
                title="Hapus Balasan"
                message="Apakah Anda yakin ingin menghapus balasan ini?"
                processing={replyDeleteForm.processing}
            />
        </AuthenticatedLayout>
    );
}
