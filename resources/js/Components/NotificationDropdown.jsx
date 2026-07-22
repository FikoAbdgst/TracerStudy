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

export default function NotificationDropdown() {
    const { auth } = usePage().props;
    const [notifications, setNotifications] = useState(auth?.user?.notifications ?? []);
    const [unreadCount, setUnreadCount] = useState(auth?.user?.unread_count ?? 0);
    const intervalRef = useRef(null);

    useEffect(() => {
        setNotifications(auth?.user?.notifications ?? []);
        setUnreadCount(auth?.user?.unread_count ?? 0);
    }, [auth?.user?.notifications, auth?.user?.unread_count]);

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

    const handleClick = (e, notif) => {
        e.preventDefault();
        router.post(route('notifications.read', notif.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setNotifications(prev => prev.filter(n => n.id !== notif.id));
                setUnreadCount(prev => Math.max(0, prev - 1));
            },
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="al-icon-btn">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && <span className="notif-dot" />}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 bg-white border border-gray-100 shadow-2xl rounded-xl overflow-hidden z-[999]">
                <div className="bg-slate-50 border-b border-gray-100 px-4 py-2.5 flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-700">Notifikasi</span>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {unreadCount} Baru
                    </span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => {
                            const cfg = typeConfig[notif.data.type] ?? typeConfig.system;
                            return (
                                <button
                                    key={notif.id}
                                    onClick={(e) => handleClick(e, notif)}
                                    className="w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition flex gap-3"
                                >
                                    <span className="text-base flex-shrink-0 mt-0.5">{cfg.icon}</span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-800">{notif.data.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.data.message}</p>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="px-4 py-10 text-center text-sm text-slate-400">
                            Tidak ada notifikasi baru.
                        </div>
                    )}
                </div>
                <Link href={route('notifications.index')}
                    className="block w-full text-center text-xs font-semibold text-blue-600 bg-white hover:bg-blue-50 py-2.5 border-t border-gray-100 transition"
                >
                    Lihat Semua Notifikasi
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
