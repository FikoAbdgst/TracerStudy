// ═══ ForumIndex.jsx ═══════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626',
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

const BtnGhost = ({ children, onClick }) => (
    <button type="button" onClick={onClick} style={{ height: 36, padding: '0 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: 'transparent', color: T.mutedDark, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = T.bg}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >{children}</button>
);

const fieldBase = { padding: '0 13px', border: `1.5px solid ${T.border}`, borderRadius: 9, background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none', width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box' };
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; e.target.style.boxShadow = 'none'; };

const formatDate = d => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));

export default function ForumIndex({ topics }) {
    const [q, setQ] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({ title: '', content: '' });

    const filtered = topics.filter(t => t.title.toLowerCase().includes(q.toLowerCase()));

    const openCreate = () => { reset(); clearErrors(); setModalOpen(true); };
    const handleCreate = e => {
        e.preventDefault();
        post(route('alumni.forum.store'), { onSuccess: () => setModalOpen(false) });
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
                        {topics.length} Topik
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
                .forum-card { transition:all 0.2s ease; }
                .forum-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(15,31,61,0.1); border-color: ${T.navyMid}44 !important; }
            `}</style>

            <div className="al-root">
                {/* Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20, animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
                        <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#b0bec5' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input style={{ ...fieldBase, height: 42, paddingLeft: 32 }} placeholder="Cari topik diskusi..."
                            value={q} onChange={e => setQ(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
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

                {/* Topic list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.map((topic, i) => (
                        <Link key={topic.id} href={route('alumni.forum.show', topic.id)} style={{ textDecoration: 'none' }}>
                            <div className="forum-card" style={{
                                background: '#fff', borderRadius: 14,
                                border: `1px solid ${T.borderSoft}`,
                                padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
                                boxShadow: '0 1px 4px rgba(15,31,61,0.05)',
                                animation: `rowIn 0.28s ${i * 0.05}s cubic-bezier(0.22,1,0.36,1) both`,
                                cursor: 'pointer',
                            }}>
                                {/* Avatar */}
                                <div style={{ width: 42, height: 42, borderRadius: 12, background: T.navyLight, color: T.navyMid, fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {topic.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{topic.title}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.muted }}>
                                        <span style={{ fontWeight: 600, color: T.mutedDark }}>{topic.user?.name}</span>
                                        <span>·</span>
                                        <span>{formatDate(topic.created_at)}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: T.bg, border: `1px solid ${T.border}`, flexShrink: 0 }}>
                                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke={T.muted} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: T.mutedDark }}>{topic.replies_count ?? 0}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {filtered.length === 0 && (
                        <div style={{ padding: '56px 20px', textAlign: 'center', background: '#fff', borderRadius: 14, border: `2px dashed ${T.borderSoft}` }}>
                            <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 4 }}>
                                {q ? 'Topik tidak ditemukan' : 'Belum ada topik diskusi'}
                            </div>
                            <div style={{ fontSize: 12, color: T.muted }}>
                                {q ? 'Coba kata kunci lain.' : 'Jadilah yang pertama memulai diskusi!'}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Buat Topik */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Buat Topik Diskusi Baru"
                footer={<>
                    <BtnGhost onClick={() => setModalOpen(false)}>Batal</BtnGhost>
                    <button type="submit" form="forum-form" disabled={processing} style={{
                        height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
                        background: processing ? T.muted : T.orange, color: '#fff',
                        fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.15s',
                        boxShadow: processing ? 'none' : '0 2px 8px rgba(249,115,22,0.3)',
                    }}>
                        {processing ? 'Memposting...' : 'Posting Topik'}
                    </button>
                </>}
            >
                <form id="forum-form" onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 5 }}>
                            Judul Topik <span style={{ color: T.red }}>*</span>
                        </label>
                        <input style={{ ...fieldBase, height: 42 }} placeholder="Misal: Info Loker IT Bandung 2026"
                            value={data.title} onChange={e => setData('title', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                        <InputError message={errors.title} className="mt-1.5" />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 5 }}>
                            Isi Pesan <span style={{ color: T.red }}>*</span>
                        </label>
                        <textarea style={{ ...fieldBase, height: 'auto', padding: '10px 13px', minHeight: 110, resize: 'vertical' }} rows={5}
                            placeholder="Tuliskan pesan atau pertanyaan Anda di sini..."
                            value={data.content} onChange={e => setData('content', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                        <InputError message={errors.content} className="mt-1.5" />
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
