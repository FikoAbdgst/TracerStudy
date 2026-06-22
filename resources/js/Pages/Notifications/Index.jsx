import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const typeConfig = {
    job_application:       { dot: '#0e7490', bg: '#ecfeff', icon: '💼', label: 'Lamaran Kerja' },
    application_status:    { dot: '#7c3aed', bg: '#f5f3ff', icon: '📋', label: 'Status Lamaran' },
    company_verification:  { dot: '#b45309', bg: '#fffbeb', icon: '🏢', label: 'Verifikasi PT' },
    mou_approved:          { dot: '#15803d', bg: '#f0fdf4', icon: '📄', label: 'Dokumen MoU' },
    forum_reply:           { dot: '#0369a1', bg: '#f0f9ff', icon: '💬', label: 'Forum Diskusi' },
    warning:               { dot: '#dc2626', bg: '#fef2f2', icon: '⚠️', label: 'Peringatan' },
    chat:                  { dot: '#0891b2', bg: '#ecfeff', icon: '💬', label: 'Pesan' },
    system:                { dot: '#64748b', bg: '#f8fafc', icon: '🔔', label: 'Sistem' },
};

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
};

const formatDate = d => new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
}).format(new Date(d));

export default function NotificationIndex({ notifications }) {
    const { auth, flash } = usePage().props;
    const [processing, setProcessing] = useState(false);
    const [toast, setToast] = useState(null);

    const notifList = notifications?.data || [];
    const pagination = notifications?.meta || {};

    useEffect(() => {
        if (flash?.message) {
            setToast(flash.message);
            const t = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const handleClick = (e, notif) => {
        e.preventDefault();
        router.post(route('notifications.read', notif.id));
    };

    const handleReadAll = () => {
        setProcessing(true);
        router.post(route('notifications.read-all'), {}, {
            onFinish: () => setProcessing(false),
        });
    };

    const goToPage = url => { if (url) router.get(url, {}, { preserveState: true, replace: true }); };

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Notifikasi</h2>
                        <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Riwayat pemberitahuan dan aktivitas akun Anda</p>
                    </div>
                    {auth?.user?.unread_count > 0 && (
                        <button onClick={handleReadAll} disabled={processing} style={{
                            height: 36, padding: '0 14px', borderRadius: 8, border: `1.5px solid ${T.border}`,
                            background: '#fff', color: T.navyMid, fontSize: 12, fontWeight: 700,
                            cursor: processing ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
                        }}
                            onMouseEnter={e => { if (!processing) { e.currentTarget.style.background = T.navyLight; e.currentTarget.style.borderColor = T.navyMid; } }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = T.border; }}
                        >
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {processing ? 'Memproses...' : 'Tandai Semua Dibaca'}
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Notifikasi — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .al-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
            `}</style>

            {toast && (
                <div style={{
                    position: 'fixed', top: 20, right: 20, zIndex: 9999,
                    background: '#f0fdf4', border: '1px solid #16a34a',
                    borderRadius: 12, padding: '14px 18px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    maxWidth: 400,
                }}>
                    <span style={{ fontSize: 18 }}>✅</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a', flex: 1 }}>{toast}</span>
                    <button onClick={() => setToast(null)} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#16a34a', fontSize: 16, lineHeight: 1 }}>×</button>
                </div>
            )}

            <div className="al-root" style={{ maxWidth: 720, margin: '0 auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {notifList.length > 0 ? (
                        notifList.map((notif, i) => {
                            const cfg = typeConfig[notif.data?.type] ?? typeConfig.system;
                            const isUnread = !notif.read_at;
                            return (
                                <button key={notif.id} onClick={e => handleClick(e, notif)}
                                    style={{
                                        width: '100%', textAlign: 'left', cursor: 'pointer',
                                        background: isUnread ? '#f8faff' : '#fff',
                                        borderRadius: 14, border: `1px solid ${isUnread ? T.navyLight : T.borderSoft}`,
                                        padding: '16px 18px', display: 'flex', gap: 14,
                                        boxShadow: isUnread ? '0 2px 8px rgba(26,53,96,0.06)' : '0 1px 4px rgba(15,31,61,0.04)',
                                        transition: 'all 0.2s ease', fontFamily: 'inherit',
                                        animation: `fadeIn 0.3s ${i * 0.04}s cubic-bezier(0.22,1,0.36,1) both`,
                                        borderLeft: isUnread ? `3px solid ${cfg.dot}` : '3px solid transparent',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(15,31,61,0.08)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isUnread ? '0 2px 8px rgba(26,53,96,0.06)' : '0 1px 4px rgba(15,31,61,0.04)'; }}
                                >
                                    <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{cfg.icon}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                                            <span style={{ fontSize: 13.5, fontWeight: 700, color: T.navy }}>{notif.data?.title}</span>
                                            <span style={{ fontSize: 11, color: T.muted, flexShrink: 0, whiteSpace: 'nowrap' }}>{formatDate(notif.created_at)}</span>
                                        </div>
                                        <p style={{ fontSize: 13, color: T.mutedDark, lineHeight: 1.5, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {notif.data?.message}
                                        </p>
                                        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {!isUnread && (
                                                <span style={{ fontSize: 10.5, fontWeight: 600, color: T.muted }}>✓ Dibaca</span>
                                            )}
                                            <span style={{
                                                fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 8,
                                                background: cfg.bg, color: cfg.dot, border: `1px solid ${cfg.dot}22`,
                                            }}>
                                                {cfg.label}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div style={{
                            padding: '56px 20px', textAlign: 'center', background: '#fff',
                            borderRadius: 14, border: `2px dashed ${T.borderSoft}`,
                        }}>
                            <div style={{ fontSize: 36, marginBottom: 10 }}>🔔</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 4 }}>
                                Belum ada notifikasi
                            </div>
                            <div style={{ fontSize: 12, color: T.muted }}>
                                Notifikasi akan muncul di sini saat ada aktivitas yang melibatkan akun Anda.
                            </div>
                        </div>
                    )}
                </div>

                {pagination?.last_page > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24 }}>
                        {pagination.links?.map((link, i) => (
                            <button key={i} onClick={() => goToPage(link.url)}
                                disabled={!link.url || link.active}
                                style={{
                                    minWidth: 36, height: 36, borderRadius: 8,
                                    border: `1px solid ${link.active ? '#f97316' : T.border}`,
                                    background: link.active ? '#f97316' : '#fff',
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
        </AuthenticatedLayout>
    );
}
