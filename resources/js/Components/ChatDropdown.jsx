import { useState, useEffect } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

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

export default function ChatDropdown() {
    const { auth, conversations } = usePage().props;
    const [convList, setConvList] = useState(conversations ?? []);

    useEffect(() => {
        setConvList(conversations ?? []);
    }, [conversations]);

    const totalUnread = convList.reduce((sum, c) => sum + (c.unread_count || 0), 0);

    const handleConvClick = (convId) => {
        router.get(route('messages.index', { conversation: convId }));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="al-icon-btn">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {totalUnread > 0 && <span className="notif-dot" />}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 bg-white border border-gray-100 shadow-2xl rounded-xl overflow-hidden z-[999]">
                <div className="bg-slate-50 border-b border-gray-100 px-4 py-2.5 flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-700">Pesan</span>
                    {totalUnread > 0 && (
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                            {totalUnread} Baru
                        </span>
                    )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {convList.length > 0 ? (
                        convList.map((conv) => {
                            const other = conv.other_user;
                            const rb = roleBadge(other?.role);
                            const hasUnread = conv.unread_count > 0;
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => handleConvClick(conv.id)}
                                    className="w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition flex gap-3"
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                            other?.role === 'Super Admin' ? 'bg-red-600' :
                                            other?.role === 'Admin PT' ? 'bg-blue-600' :
                                            other?.role === 'Admin Kampus' ? 'bg-purple-600' :
                                            'bg-green-600'
                                        }`}>
                                            {other?.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        {hasUnread && (
                                            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-1">
                                            <span className={`text-sm truncate ${hasUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                {other?.name || 'Pengguna'}
                                            </span>
                                            <span className="text-[10px] text-slate-400 flex-shrink-0">
                                                {formatTime(conv.updated_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[9px] font-semibold px-1 py-0.5 rounded" style={{ background: rb.bg, color: rb.color }}>
                                                {rb.text}
                                            </span>
                                            {conv.last_message && (
                                                <span className={`text-xs truncate ${hasUnread ? 'font-semibold text-slate-700' : 'text-slate-400'}`}>
                                                    {conv.last_message.sender_id === auth.user.id ? 'Anda: ' : ''}
                                                    {conv.last_message.body || '📎 Lampiran'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="px-4 py-10 text-center text-sm text-slate-400">
                            Belum ada percakapan.
                        </div>
                    )}
                </div>
                <Link href={route('messages.index')}
                    className="block w-full text-center text-xs font-semibold text-orange-600 bg-white hover:bg-orange-50 py-2.5 border-t border-gray-100 transition"
                >
                    Lihat Semua Pesan
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
