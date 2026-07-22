import { useState, useEffect, useRef } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import axios from 'axios';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

const typeConfig = {
    job_application: { dot: '#0e7490', bg: '#ecfeff', icon: '💼' },
    application_status: { dot: '#7c3aed', bg: '#f5f3ff', icon: '📋' },
    company_verification: { dot: '#b45309', bg: '#fffbeb', icon: '🏢' },
    mou_approved: { dot: '#15803d', bg: '#f0fdf4', icon: '📄' },
    forum_reply: { dot: '#0369a1', bg: '#f0f9ff', icon: '💬' },
    chat: { dot: '#0891b2', bg: '#ecfeff', icon: '💬' },
    lowongan: { dot: '#ea580c', bg: '#fff7ed', icon: '💼' },
    warning: { dot: '#dc2626', bg: '#fef2f2', icon: '⚠️' },
    system: { dot: '#64748b', bg: '#f8fafc', icon: '🔔' },
};

const roleBadge = (role) => {
    if (role === 'Super Admin') return { text: 'Super Admin', bg: '#fef2f2', color: '#dc2626' };
    if (role === 'Admin Kampus') return { text: 'Admin', bg: '#f3e8ff', color: '#9333ea' };
    if (role === 'Admin PT') return { text: 'Perusahaan', bg: '#dbeafe', color: '#2563eb' };
    if (role === 'Alumni') return { text: 'Alumni', bg: '#dcfce7', color: '#16a34a' };
    return { text: role, bg: '#f1f5f9', color: '#64748b' };
};

const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Baru saja';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'j';
    if (d.getFullYear() === now.getFullYear()) return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function MobileNavDropdown() {
    const { auth, conversations: sharedConvs } = usePage().props;
    const [tab, setTab] = useState('notif');
    const [notifications, setNotifications] = useState(auth?.user?.notifications ?? []);
    const [unreadCount, setUnreadCount] = useState(auth?.user?.unread_count ?? 0);
    const [conversations, setConversations] = useState(sharedConvs ?? []);
    const [open, setOpen] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        setNotifications(auth?.user?.notifications ?? []);
        setUnreadCount(auth?.user?.unread_count ?? 0);
    }, [auth?.user?.notifications, auth?.user?.unread_count]);

    useEffect(() => {
        setConversations(sharedConvs ?? []);
    }, [sharedConvs]);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            axios.get(route('notifications.poll'))
                .then(res => {
                    setNotifications(res.data.notifications);
                    setUnreadCount(res.data.unread_count);
                })
                .catch(() => {});
        }, 10000);
        return () => clearInterval(intervalRef.current);
    }, []);

    const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
    const hasBadge = unreadCount > 0 || totalUnread > 0;

    const handleNotifClick = (e, notif) => {
        e.preventDefault();
        router.post(route('notifications.read', notif.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setNotifications(prev => prev.filter(n => n.id !== notif.id));
                setUnreadCount(prev => Math.max(0, prev - 1));
            },
        });
    };

    const handleConvClick = (convId) => {
        setOpen(false);
        router.get(route('messages.index', { conversation: convId }));
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button className="al-icon-btn relative">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    {hasBadge && <span className="notif-dot" />}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 bg-white border border-gray-100 shadow-2xl rounded-xl overflow-hidden z-[999]">
                <div className="flex border-b border-gray-100 bg-slate-50">
                    <button
                        onClick={() => setTab('notif')}
                        className={`flex-1 py-2.5 text-xs font-bold text-center transition-colors relative ${
                            tab === 'notif' ? 'text-orange-600 bg-white' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Notifikasi
                        {unreadCount > 0 && (
                            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600">{unreadCount}</span>
                        )}
                        {tab === 'notif' && <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-orange-500 rounded-full" />}
                    </button>
                    <button
                        onClick={() => setTab('chat')}
                        className={`flex-1 py-2.5 text-xs font-bold text-center transition-colors relative ${
                            tab === 'chat' ? 'text-orange-600 bg-white' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Pesan
                        {totalUnread > 0 && (
                            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600">{totalUnread}</span>
                        )}
                        {tab === 'chat' && <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-orange-500 rounded-full" />}
                    </button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {tab === 'notif' ? (
                        notifications.length > 0 ? (
                            notifications.map((notif) => {
                                const cfg = typeConfig[notif.data.type] ?? typeConfig.system;
                                return (
                                    <button key={notif.id} onClick={(e) => handleNotifClick(e, notif)}
                                        className="w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition flex gap-3">
                                        <span className="text-base flex-shrink-0 mt-0.5">{cfg.icon}</span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-slate-800">{notif.data.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.data.message}</p>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-4 py-10 text-center text-sm text-slate-400">Tidak ada notifikasi baru.</div>
                        )
                    ) : (
                        conversations.length > 0 ? (
                            conversations.map((conv) => {
                                const other = conv.other_user;
                                const rb = roleBadge(other?.role);
                                const hasUnread = conv.unread_count > 0;
                                return (
                                    <button key={conv.id} onClick={() => handleConvClick(conv.id)}
                                        className="w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition flex gap-3">
                                        <div className="relative flex-shrink-0">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                                other?.role === 'Super Admin' ? 'bg-red-600' :
                                                other?.role === 'Admin PT' ? 'bg-blue-600' :
                                                other?.role === 'Admin Kampus' ? 'bg-purple-600' : 'bg-green-600'
                                            }`}>
                                                {other?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            {hasUnread && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-1">
                                                <span className={`text-sm truncate ${hasUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                    {other?.name || 'Pengguna'}
                                                </span>
                                                <span className="text-[10px] text-slate-400 flex-shrink-0">{formatTime(conv.updated_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[9px] font-semibold px-1 py-0.5 rounded" style={{ background: rb.bg, color: rb.color }}>{rb.text}</span>
                                                {conv.last_message && (
                                                    <span className={`text-xs truncate ${hasUnread ? 'font-semibold text-slate-700' : 'text-slate-400'}`}>
                                                        {conv.last_message.sender_id === auth.user.id ? 'Anda: ' : ''}{conv.last_message.body || '📎 Lampiran'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-4 py-10 text-center text-sm text-slate-400">Belum ada percakapan.</div>
                        )
                    )}
                </div>

                {tab === 'notif' ? (
                    <Link href={route('notifications.index')} className="block w-full text-center text-xs font-semibold text-blue-600 bg-white hover:bg-blue-50 py-2.5 border-t border-gray-100 transition">
                        Lihat Semua Notifikasi
                    </Link>
                ) : (
                    <Link href={route('messages.index')} onClick={() => setOpen(false)} className="block w-full text-center text-xs font-semibold text-orange-600 bg-white hover:bg-orange-50 py-2.5 border-t border-gray-100 transition">
                        Lihat Semua Pesan
                    </Link>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
