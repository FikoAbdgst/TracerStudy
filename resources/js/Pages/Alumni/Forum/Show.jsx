import React from 'react';
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

const formatDate = d => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
const formatShort = d => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));

const fieldBase = { padding: '10px 13px', border: `1.5px solid ${T.border}`, borderRadius: 9, background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none', width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' };
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; e.target.style.boxShadow = 'none'; };

export default function ForumShow({ topic }) {
    const { data, setData, post, processing, errors, reset } = useForm({ content: '' });

    const handleReply = e => {
        e.preventDefault();
        post(route('alumni.forum.reply', topic.id), { onSuccess: () => reset('content') });
    };

    const getInitials = name => name ? name.charAt(0).toUpperCase() : '?';

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
            `}</style>

            <div className="al-root" style={{ maxWidth: 700, margin: '0 auto' }}>

                {/* Main Post */}
                <div style={{
                    background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`,
                    overflow: 'hidden', marginBottom: 16,
                    boxShadow: '0 2px 8px rgba(15,31,61,0.06)',
                    animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both',
                }}>
                    {/* Post header */}
                    <div style={{ padding: '18px 20px 16px', borderBottom: `1px solid ${T.borderSoft}`, background: `linear-gradient(to bottom, ${T.bg}, #fff)` }}>
                        <h1 style={{ fontSize: 18, fontWeight: 800, color: T.navy, margin: '0 0 14px', letterSpacing: '-0.01em', lineHeight: 1.4 }}>{topic.title}</h1>
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
                    {/* Post content */}
                    <div style={{ padding: '18px 20px' }}>
                        <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{topic.content}</p>
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
                    {topic.replies?.map((reply, i) => (
                        <div key={reply.id} style={{
                            background: '#fff', borderRadius: 12, border: `1px solid ${T.borderSoft}`,
                            padding: '14px 18px', boxShadow: '0 1px 4px rgba(15,31,61,0.04)',
                            animation: `slideIn 0.26s ${i * 0.05}s cubic-bezier(0.22,1,0.36,1) both`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: T.orangeLight, color: T.orange, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {getInitials(reply.user?.name)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{reply.user?.name}</span>
                                        <span style={{ fontSize: 11.5, color: T.muted, flexShrink: 0 }}>{formatShort(reply.created_at)}</span>
                                    </div>
                                    <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>{reply.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!topic.replies || topic.replies.length === 0) && (
                        <div style={{ padding: '32px 20px', textAlign: 'center', background: T.bg, borderRadius: 12, border: `1.5px dashed ${T.border}` }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
                            <div style={{ fontSize: 13, color: T.muted }}>Belum ada balasan. Jadilah yang pertama membalas!</div>
                        </div>
                    )}
                </div>

                {/* Reply form */}
                <div style={{
                    background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`,
                    padding: '18px 20px', boxShadow: '0 2px 8px rgba(15,31,61,0.05)',
                    animation: 'cardIn 0.38s 0.2s cubic-bezier(0.22,1,0.36,1) both',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <div style={{ width: 3, height: 16, background: T.orange, borderRadius: 2 }} />
                        <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.navy }}>Tulis Balasan</span>
                    </div>
                    <form onSubmit={handleReply} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                            <textarea style={{ ...fieldBase, minHeight: 96 }} rows={4}
                                placeholder="Tulis balasan Anda di sini..."
                                value={data.content} onChange={e => setData('content', e.target.value)}
                                onFocus={onFocus} onBlur={onBlur} />
                            <InputError message={errors.content} className="mt-1.5" />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" disabled={processing || !data.content.trim()} style={{
                                height: 38, padding: '0 20px', borderRadius: 9, border: 'none',
                                background: (processing || !data.content.trim()) ? T.muted : T.orange,
                                color: '#fff', fontSize: 13, fontWeight: 700,
                                cursor: (processing || !data.content.trim()) ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit', transition: 'all 0.15s',
                                display: 'flex', alignItems: 'center', gap: 7,
                                boxShadow: (processing || !data.content.trim()) ? 'none' : '0 2px 8px rgba(249,115,22,0.25)',
                            }}
                                onMouseEnter={e => { if (!processing && data.content.trim()) { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                                onMouseLeave={e => { e.currentTarget.style.background = (processing || !data.content.trim()) ? T.muted : T.orange; e.currentTarget.style.transform = 'none'; }}
                            >
                                {processing
                                    ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}><path strokeLinecap="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>Mengirim...</>
                                    : <><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>Kirim Balasan</>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
