import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
};

const roleLabel = (role) => {
    if (role === 'Super Admin') return { text: 'Super Admin', bg: '#fef2f2', color: '#dc2626' };
    if (role === 'Admin Kampus') return { text: 'Admin', bg: '#f3e8ff', color: '#9333ea' };
    if (role === 'Admin PT') return { text: 'Perusahaan', bg: '#dbeafe', color: '#2563eb' };
    if (role === 'Alumni') return { text: 'Alumni', bg: '#dcfce7', color: '#16a34a' };
    return { text: role, bg: T.bg, color: T.mutedDark };
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'Baru saja';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'j';
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const formatFullDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return formatTime(dateStr);
    if (d.getFullYear() === now.getFullYear()) return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function MessagesIndex({ conversations: initialConvs, selectedConversation: initSelected, messages: initMessages, jobList }) {
    const { auth, flash } = usePage().props;
    const userRole = auth.user.roles[0];

    const [conversations, setConversations] = useState(initialConvs);
    const [selectedConv, setSelectedConv] = useState(initSelected);
    const [messages, setMessages] = useState(initMessages);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [sending, setSending] = useState(false);
    const [body, setBody] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [showJobPicker, setShowJobPicker] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [inviteAlumniId, setInviteAlumniId] = useState(null);
    const [draftCvName, setDraftCvName] = useState(null);
    const [draftCvPath, setDraftCvPath] = useState(null);
    const [showBlockConfirm, setShowBlockConfirm] = useState(null);
    const [showMsgMenu, setShowMsgMenu] = useState(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [mobileShowChat, setMobileShowChat] = useState(false);
    const [convSearch, setConvSearch] = useState('');

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const chatContainerRef = useRef(null);
    const pollIntervalRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToBottom = () => {
        requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }));
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    useEffect(() => {
        setConversations(initialConvs);
        setSelectedConv(initSelected);
        setMessages(initMessages);
    }, [initialConvs, initSelected, initMessages]);

    useEffect(() => {
        if (flash.draft_body) {
            setBody(flash.draft_body);
            if (flash.draft_cv_name) setDraftCvName(flash.draft_cv_name);
            if (flash.draft_cv_path) setDraftCvPath(flash.draft_cv_path);
        }
    }, []);

    useEffect(() => {
        if (!showNewChatModal || userRole === 'Admin PT') {
            setSearchQuery('');
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(() => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                setSearching(false);
                return;
            }
            setSearching(true);
            axios.get(route('messages.search-alumni'), { params: { q: searchQuery } })
                .then(res => {
                    setSearchResults(res.data.alumni);
                    setSearching(false);
                })
                .catch(() => setSearching(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, showNewChatModal]);

    useEffect(() => {
        if (selectedConv?.id) {
            axios.post(route('messages.read', selectedConv.id)).catch(() => { });
            setConversations(prev => prev.map(c =>
                c.id === selectedConv.id ? { ...c, unread_count: 0 } : c
            ));
        }
    }, [selectedConv?.id]);

    useEffect(() => {
        if (selectedConv?.id) {
            pollIntervalRef.current = setInterval(() => {
                const since = messages.length > 0 ? messages[messages.length - 1].created_at : null;
                axios.get(route('messages.poll', selectedConv.id), {
                    params: { since }
                }).then((res) => {
                    if (res.data.messages?.length > 0) {
                        setMessages(prev => {
                            const incomingIds = new Set(res.data.messages.map(m => m.id));
                            const kept = prev.filter(m => !incomingIds.has(m.id));
                            return [...kept, ...res.data.messages];
                        });
                    }
                    if (res.data.conversation) {
                        setConversations(prev => prev.map(c =>
                            c.id === res.data.conversation.id ? res.data.conversation : c
                        ));
                    }
                }).catch(() => { });
            }, 4000);

            return () => clearInterval(pollIntervalRef.current);
        }
    }, [selectedConv?.id, messages.length]);

    useEffect(() => {
        const ta = textareaRef.current;
        if (ta) {
            ta.style.height = 'auto';
            ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
        }
    }, [body]);

    const handleSelectConv = useCallback((convId) => {
        const conv = conversations.find(c => c.id === convId);
        if (conv) setSelectedConv(conv);
        if (window.innerWidth < 1024) setMobileShowChat(true);
        axios.get(route('messages.poll', convId), { params: { since: null } })
            .then(res => {
                setMessages(res.data.messages || []);
                if (res.data.conversation) {
                    setSelectedConv(res.data.conversation);
                    setConversations(prev => prev.map(c =>
                        c.id === res.data.conversation.id ? res.data.conversation : c
                    ));
                }
            }).catch(() => {});
    }, [conversations]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!body.trim() && !attachment && !draftCvPath) return;
        setSending(true);

        const formData = new FormData();
        formData.append('body', body);
        if (attachment) {
            formData.append('attachment', attachment);
        } else if (draftCvPath) {
            formData.append('draft_cv_path', draftCvPath);
        }

        axios.post(route('messages.send', selectedConv.id), formData).then((res) => {
            setBody('');
            setAttachment(null);
            setDraftCvName(null);
            setDraftCvPath(null);
            setSending(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            const since = messages.length > 0 ? messages[messages.length - 1].created_at : null;
            axios.get(route('messages.poll', selectedConv.id), { params: { since } })
                .then(pollRes => {
                    if (pollRes.data.messages?.length > 0) {
                        setMessages(prev => {
                            const incomingIds = new Set(pollRes.data.messages.map(m => m.id));
                            const kept = prev.filter(m => !incomingIds.has(m.id));
                            return [...kept, ...pollRes.data.messages];
                        });
                    }
                    if (pollRes.data.conversation) {
                        setConversations(prev => prev.map(c =>
                            c.id === pollRes.data.conversation.id ? pollRes.data.conversation : c
                        ));
                    }
                }).catch(() => {});
        }).catch((err) => {
            setSending(false);
            const msg = err.response?.data?.error || err.response?.data?.message || 'Gagal mengirim pesan.';
            alert(msg);
        });
    };

    const handleStartAdmin = () => {
        axios.post(route('messages.start-admin'))
            .then(res => {
                setShowNewChatModal(false);
                window.location.href = res.request?.responseURL || route('messages.index');
            })
            .catch(() => alert('Gagal menghubungi admin.'));
    };

    const handleStartAlumniChat = (targetId) => {
        axios.post(route('messages.start-alumni'), { user_id: targetId })
            .then(res => {
                setShowNewChatModal(false);
                setSearchQuery('');
                setSearchResults([]);
                window.location.href = res.request?.responseURL || route('messages.index');
            })
            .catch(err => alert(err.response?.data?.error || err.response?.data?.message || 'Gagal memulai percakapan.'));
    };

    const handleInviteToApply = (alumniUserId) => {
        if (!selectedJobId) return;
        axios.post(route('messages.invite-candidate'), {
            alumni_id: alumniUserId,
            job_id: selectedJobId,
        }).then(res => {
            setShowJobPicker(false);
            setInviteAlumniId(null);
            window.location.href = res.request.responseURL;
        }).catch(err => alert(err.response?.data?.error || 'Gagal mengundang.'));
    };

    const handleDeleteConfirm = () => {
        if (!deleteConfirmTarget) return;
        const { msgId, type } = deleteConfirmTarget;
        const prevMessages = messages;
        setDeleteLoading(true);

        if (type === 'for_everyone') {
            setMessages(prev => prev.map(m =>
                m.id === msgId ? { ...m, is_deleted_for_everyone: true, attachment_url: null } : m
            ));
        } else {
            setMessages(prev => prev.filter(m => m.id !== msgId));
        }

        router.delete(route('messages.delete', msgId), {
            data: { type },
            preserveScroll: true,
            onSuccess: () => {
                setDeleteConfirmTarget(null);
                setDeleteLoading(false);
                setShowMsgMenu(null);
            },
            onError: (errors) => {
                setMessages(prevMessages);
                setDeleteLoading(false);
                const msg = errors?.error || 'Gagal menghapus pesan.';
                alert(msg);
                setDeleteConfirmTarget(null);
                setShowMsgMenu(null);
            },
        });
    };

    const handleClearChat = () => {
        router.delete(route('messages.clear', selectedConv.id), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleDeleteConv = () => {
        router.delete(route('messages.destroy', selectedConv.id), {
            onSuccess: () => setShowDeleteConfirm(false),
        });
    };

    const activeConvId = selectedConv?.id;

    return (
        <AuthenticatedLayout>
            <Head title="Pesan" />

            <style>{`
                html, body, #app { height: 100%; margin: 0; overflow: hidden; }
                .al-root { height: 100vh; overflow: hidden; }
                .al-main { padding: 0 !important; flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column; }
            `}</style>

            <div className="flex-1 flex flex-col min-h-0">
                    <div className="bg-white flex-1 flex min-h-0 overflow-hidden">
                        {/* Left Column: Inbox */}
                        <div className={`relative w-full lg:w-80 xl:w-96 border-r border-gray-200 flex flex-col bg-gray-50/50 flex-shrink-0 ${mobileShowChat ? 'hidden lg:flex' : 'flex'}`}>
                            {/* Search Bar */}
                            <div className="p-3 border-b border-gray-200 bg-white">
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        value={convSearch}
                                        onChange={e => setConvSearch(e.target.value)}
                                        placeholder="Cari percakapan..."
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-orange-400 focus:ring-orange-400 focus:bg-white transition-colors"
                                    />
                                    {convSearch && (
                                        <button
                                            onClick={() => setConvSearch('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Conversation List */}
                            <div className="flex-1 overflow-y-auto">
                                {(() => {
                                    const q = convSearch.toLowerCase();
                                    const filtered = q
                                        ? conversations.filter(c => {
                                            const name = c.other_user?.name?.toLowerCase() || '';
                                            const major = c.other_user?.major?.toLowerCase() || '';
                                            const company = c.other_user?.company_name?.toLowerCase() || '';
                                            const lastMsg = c.last_message?.body?.toLowerCase() || '';
                                            return name.includes(q) || major.includes(q) || company.includes(q) || lastMsg.includes(q);
                                        })
                                        : conversations;
                                    if (filtered.length === 0) {
                                        return (
                                            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-medium text-gray-400">
                                                    {q ? 'Tidak ada percakapan ditemukan' : 'Belum ada percakapan'}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return filtered.map((conv) => {
                                        const other = conv.other_user;
                                        const rl = roleLabel(other?.role);
                                        const isActive = conv.id === activeConvId;
                                        return (
                                            <button
                                                key={conv.id}
                                                onClick={() => handleSelectConv(conv.id)}
                                                className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors hover:bg-gray-100/80 active:bg-gray-200/60 ${isActive ? 'bg-orange-50/80 lg:border-l-2 lg:border-l-orange-500' : ''}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="relative flex-shrink-0">
                                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm ${other?.role === 'Super Admin' ? 'bg-red-600' :
                                                                other?.role === 'Admin PT' ? 'bg-blue-600' :
                                                                other?.role === 'Admin Kampus' ? 'bg-purple-600' :
                                                                    'bg-green-600'
                                                            }`}>
                                                            {other?.name?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                        {conv.unread_count > 0 && (
                                                            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                                                                {conv.unread_count > 9 ? '9+' : conv.unread_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className={`text-sm truncate ${conv.unread_count > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>{other?.name || 'Pengguna'}</span>
                                                            <span className={`text-[10px] flex-shrink-0 ${conv.unread_count > 0 ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>{formatDate(conv.updated_at)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: rl.bg, color: rl.color }}>{rl.text}</span>
                                                            {other?.major && <span className="text-[11px] text-gray-400 truncate hidden sm:inline">{other.major}</span>}
                                                            {conv.status === 'closed' && (
                                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Ditutup</span>
                                                            )}
                                                        </div>
                                                        {conv.last_message && (
                                                            <p className={`text-xs truncate mt-1 ${conv.unread_count > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                                                                <span className={conv.last_message.sender_id === auth.user.id ? 'text-gray-400' : ''}>
                                                                    {conv.last_message.sender_id === auth.user.id ? 'Anda: ' : ''}
                                                                    {conv.last_message.body || (conv.last_message.attachment_url ? '📷 Lampiran' : '')}
                                                                </span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    });
                                })()}
                            </div>

                            {/* FAB: New Conversation */}
                            <button
                                onClick={() => setShowNewChatModal(true)}
                                className="absolute bottom-5 right-5 w-13 h-13 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 hover:shadow-xl flex items-center justify-center transition-all flex-shrink-0 z-10"
                                style={{ width: '52px', height: '52px', boxShadow: '0 4px 14px rgba(249,115,22,0.4)' }}
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>

                        {/* Right Column: Chat Room */}
                        <div className={`flex-1 flex flex-col bg-white min-w-0 min-h-0 ${mobileShowChat ? 'flex' : 'hidden lg:flex'}`}>
                            {selectedConv ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="px-4 lg:px-5 py-3 border-b border-gray-200 bg-white flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                                            <button
                                                onClick={() => setMobileShowChat(false)}
                                                className="lg:hidden p-1.5 -ml-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm ${selectedConv.other_user?.role === 'Super Admin' ? 'bg-red-600' :
                                                    selectedConv.other_user?.role === 'Admin PT' ? 'bg-blue-600' :
                                                    selectedConv.other_user?.role === 'Admin Kampus' ? 'bg-purple-600' :
                                                        'bg-green-600'
                                                }`}>
                                                {selectedConv.other_user?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{selectedConv.other_user?.name || 'Pengguna'}</p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                    {selectedConv.other_user?.role === 'Super Admin' ? 'Super Admin' :
                                                        selectedConv.type === 'admin' ? 'Admin Kampus' :
                                                        selectedConv.type === 'company' ? (selectedConv.other_user?.company_name || 'Perusahaan') :
                                                            selectedConv.other_user?.major || 'Alumni'}
                                                </p>
                                            </div>
                                        </div>

                                                        <div className="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
                                            {selectedConv.status === 'closed' && (
                                                <span className="hidden lg:inline text-xs font-semibold px-2 py-1 rounded-lg bg-gray-100 text-gray-500 border border-gray-200">
                                                    Obrolan Ditutup
                                                </span>
                                            )}

                                            {userRole === 'Admin PT' && selectedConv.type !== 'company' && selectedConv.other_user?.role === 'Alumni' && (
                                                <button
                                                    onClick={() => {
                                                        setInviteAlumniId(selectedConv.other_user.id);
                                                        setShowJobPicker(true);
                                                    }}
                                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 transition-colors"
                                                >
                                                    + Undang Melamar
                                                </button>
                                            )}

                                            {selectedConv.other_user && (
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setShowBlockConfirm(showBlockConfirm === selectedConv.other_user.id ? null : selectedConv.other_user.id)}
                                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="Lainnya"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                        </svg>
                                                    </button>
                                                    {showBlockConfirm === selectedConv.other_user.id && (
                                                        <>
                                                            <div className="fixed inset-0 z-10" onClick={() => setShowBlockConfirm(null)} />
                                                            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20 min-w-[160px]">
                                                                {selectedConv.is_blocked ? (
                                                                    <button
                                                                        onClick={() => {
                                                                            axios.post(route('messages.unblock'), { user_id: selectedConv.other_user.id })
                                                                                .then(() => {
                                                                                    setConversations(prev => prev.map(c =>
                                                                                        c.id === selectedConv.id ? { ...c, is_blocked: false } : c
                                                                                    ));
                                                                                    setSelectedConv(prev => ({ ...prev, is_blocked: false }));
                                                                                })
                                                                                .catch(() => {});
                                                                            setShowBlockConfirm(null);
                                                                        }}
                                                                        className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-gray-50 flex items-center gap-2"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        Buka Blokir
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => {
                                                                            axios.post(route('messages.block'), { user_id: selectedConv.other_user.id })
                                                                                .then(() => {
                                                                                    setConversations(prev => prev.map(c =>
                                                                                        c.id === selectedConv.id ? { ...c, is_blocked: true } : c
                                                                                    ));
                                                                                    setSelectedConv(prev => ({ ...prev, is_blocked: true }));
                                                                                })
                                                                                .catch(() => {});
                                                                            setShowBlockConfirm(null);
                                                                        }}
                                                                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                        </svg>
                                                                        Blokir Pengguna
                                                                    </button>
                                                                )}
                                                                <div className="border-t border-gray-100 my-1" />
                                                                <button
                                                                    onClick={() => { setShowBlockConfirm(null); setShowClearConfirm(true); }}
                                                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                    Bersihkan Chat
                                                                </button>
                                                                <button
                                                                    onClick={() => { setShowBlockConfirm(null); setShowDeleteConfirm(true); }}
                                                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                    Hapus Chat
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto px-3 lg:px-5 pt-3 lg:pt-4 pb-3 lg:pb-4 space-y-2 lg:space-y-3 bg-[#e5ddd5]/30">
                                        {messages.length === 0 && (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-400 mb-1">Belum ada pesan</p>
                                                    <p className="text-xs text-gray-300">Kirim pesan pertama untuk memulai percakapan</p>
                                                </div>
                                            </div>
                                        )}
                                        {messages.map((msg, idx) => {
                                            const isOwn = msg.sender_id === auth.user.id;
                                            const isDeleted = msg.is_deleted_for_everyone;
                                            const msgAgeHours = (Date.now() - new Date(msg.created_at).getTime()) / (1000 * 60 * 60);
                                            const canDeleteEveryone = isOwn && msgAgeHours <= 48;
                                            const showDate = idx === 0 || new Date(msg.created_at).toDateString() !== new Date(messages[idx - 1]?.created_at).toDateString();
                                            return (
                                                <div key={msg.id}>
                                                    {showDate && (
                                                        <div className="flex justify-center my-3">
                                                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                                                                {new Date(msg.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                                                        <div className={`max-w-[85%] lg:max-w-[70%] ${isOwn ? 'order-1' : 'order-1'}`}>
                                                            <div className={`flex items-end gap-1 ${isOwn ? 'flex-row' : 'flex-row-reverse'}`}>
                                                                {!isDeleted && (
                                                                    <div className="relative opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                                        <button
                                                                            onClick={() => setShowMsgMenu(showMsgMenu === msg.id ? null : msg.id)}
                                                                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                                            </svg>
                                                                        </button>
                                                                        {showMsgMenu === msg.id && (
                                                                            <>
                                                                                <div className="fixed inset-0 z-10" onClick={() => setShowMsgMenu(null)} />
                                                                                <div className={`absolute bottom-full mb-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20 min-w-[150px] ${isOwn ? 'right-0' : 'left-0'}`}>
                                                                                    {canDeleteEveryone && (
                                                                                        <button
                                                                                            onClick={() => { setDeleteConfirmTarget({ msgId: msg.id, type: 'for_everyone' }); setShowMsgMenu(null); }}
                                                                                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                                                                                        >
                                                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                            </svg>
                                                                                            Hapus untuk Semua Orang
                                                                                        </button>
                                                                                    )}
                                                                                    <button
                                                                                        onClick={() => { setDeleteConfirmTarget({ msgId: msg.id, type: 'for_me' }); setShowMsgMenu(null); }}
                                                                                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                                    >
                                                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                                        </svg>
                                                                                        Hapus untuk Saya
                                                                                    </button>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <div className={`px-3 py-2 lg:px-4 lg:py-2.5 rounded-2xl ${isDeleted
                                                                    ? 'bg-gray-100 text-gray-400 italic border border-gray-200'
                                                                    : isOwn
                                                                        ? 'bg-orange-500 text-white rounded-br-md'
                                                                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                                                                    }`}>
                                                                    {isDeleted ? (
                                                                        <p className="text-xs italic">🚫 {isOwn ? 'Anda telah menghapus pesan ini' : 'Pesan ini telah dihapus'}</p>
                                                                    ) : (
                                                                        <>
                                                                            {msg.body && <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.body}</p>}
                                                                            {msg.attachment_url && (() => {
                                                                                const url = msg.attachment_url;
                                                                                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                                                                                const fileName = url.split('/').pop() || 'Lampiran';
                                                                                const ext = fileName.split('.').pop()?.toUpperCase();
                                                                                return (
                                                                                    <div className={`mt-1.5 ${isImage ? '' : ''}`}>
                                                                                        {isImage ? (
                                                                                            <div className="relative group/attachment">
                                                                                                <a href={url} target="_blank" rel="noopener noreferrer"
                                                                                                    className="block rounded-lg overflow-hidden border border-gray-200/50">
                                                                                                    <img src={url} alt={fileName}
                                                                                                        className="max-w-full h-auto max-h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
                                                                                                        loading="lazy"
                                                                                                    />
                                                                                                </a>
                                                                                                <a href={url} download={fileName}
                                                                                                    className="absolute bottom-1.5 right-1.5 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors opacity-100 lg:opacity-0 group-hover/attachment:opacity-100"
                                                                                                    title="Download">
                                                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                                                    </svg>
                                                                                                </a>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <a href={url} target="_blank" rel="noopener noreferrer"
                                                                                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isOwn
                                                                                                    ? 'bg-orange-400/20 text-orange-100 hover:bg-orange-400/30'
                                                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                                                    }`}>
                                                                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                                                </svg>
                                                                                                <span className="truncate max-w-[180px]">{fileName}</span>
                                                                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isOwn ? 'bg-orange-400/30' : 'bg-gray-200'}`}>{ext}</span>
                                                                                            </a>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            })()}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className={`text-[10px] text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                                                                {formatTime(msg.created_at)}
                                                                {isOwn && !isDeleted && <span className="ml-1">{msg.is_read ? '✓✓' : '✓'}</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Send Form (floating at bottom) */}
                                    {(selectedConv.status === 'closed' || selectedConv.is_blocked_by) ? (
                                        <div className="px-4 lg:px-5 py-3 lg:py-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm text-center">
                                            <p className="text-xs lg:text-sm text-gray-500">
                                                {selectedConv.status === 'closed'
                                                    ? 'Ruang obrolan telah ditutup. Tidak dapat mengirim pesan.'
                                                    : 'Anda telah diblokir oleh pengguna ini.'}
                                            </p>
                                        </div>
                                    ) : selectedConv.is_blocked ? (
                                        <div className="px-4 lg:px-5 py-3 lg:py-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm text-center">
                                            <p className="text-xs lg:text-sm text-gray-500">
                                                Anda telah memblokir pengguna ini.{' '}
                                                <button onClick={() => {
                                                    axios.post(route('messages.unblock'), { user_id: selectedConv.other_user.id })
                                                        .then(() => {
                                                            setConversations(prev => prev.map(c =>
                                                                c.id === selectedConv.id ? { ...c, is_blocked: false } : c
                                                            ));
                                                            setSelectedConv(prev => ({ ...prev, is_blocked: false }));
                                                        })
                                                        .catch(() => {});
                                                }} className="text-orange-500 font-semibold hover:underline">Buka blokir</button> untuk melanjutkan percakapan.
                                            </p>
                                        </div>
                                    ) : selectedConv.can_reply === false ? (
                                        <div className="px-4 lg:px-5 py-3 lg:py-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm text-center">
                                            <p className="text-xs lg:text-sm text-gray-500">
                                                Percakapan telah ditutup. Alumni telah menggunakan batas balasan.
                                            </p>
                                        </div>
                                    ) : (
                                    <div className="px-3 lg:px-5 py-3 lg:py-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                                        {attachment && (
                                            <div className="mb-2">
                                                {attachment.type?.startsWith('image/') ? (
                                                    <div className="relative inline-block">
                                                        <img src={URL.createObjectURL(attachment)} alt="Preview"
                                                            className="max-h-24 lg:max-h-32 rounded-xl border border-gray-200 object-cover" />
                                                        <button type="button" onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors shadow-sm">
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                        </svg>
                                                        <span className="text-sm text-gray-600 truncate flex-1">{attachment.name}</span>
                                                        <button type="button" onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                            className="text-gray-400 hover:text-red-500 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <form onSubmit={handleSend} className="flex items-end gap-1.5 lg:gap-2">
                                            <div className="flex-1 min-w-0">
                                                <textarea ref={textareaRef} value={body} onChange={e => setBody(e.target.value)}
                                                    placeholder="Tulis pesan..."
                                                    rows={2}
                                                    className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm resize-none overflow-y-auto focus:border-orange-400 focus:ring-orange-400 transition-colors"
                                                    style={{ minHeight: '44px', maxHeight: '150px' }}
                                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                                                />
                                                {draftCvName && (
                                                    <div className="flex items-center gap-1.5 mt-1.5 px-1">
                                                        <span className="text-orange-500 text-xs">📄</span>
                                                        <span className="text-xs font-medium text-gray-600">{draftCvName}</span>
                                                        <button type="button" onClick={() => setDraftCvName(null)}
                                                            className="text-gray-400 hover:text-gray-600 ml-0.5">
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-0.5 lg:gap-1 flex-shrink-0">
                                                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif,image/*" className="hidden" onChange={e => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        if (file.size > 10 * 1024 * 1024) {
                                                            alert('Ukuran file maksimal 10MB.');
                                                            e.target.value = '';
                                                            return;
                                                        }
                                                        setAttachment(file);
                                                    }
                                                }} />
                                                <input type="file" accept="image/*" capture="environment" className="hidden" id="camera-input" onChange={e => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        if (file.size > 10 * 1024 * 1024) {
                                                            alert('Ukuran file maksimal 10MB.');
                                                            e.target.value = '';
                                                            return;
                                                        }
                                                        setAttachment(file);
                                                    }
                                                }} />
                                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                                    className="p-2.5 lg:p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Lampirkan file">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </button>
                                                <button type="button" onClick={() => document.getElementById('camera-input').click()}
                                                    className="p-2.5 lg:p-3 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                                    title="Ambil foto">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </button>
                                                <button type="submit" disabled={(!body.trim() && !attachment && !draftCvPath) || sending}
                                                    className="p-2.5 lg:p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                                    {sending ? (
                                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center p-8">
                                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                                            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-gray-900">Pesan Terpusat</h3>
                                        <p className="mt-2 text-sm text-gray-500 max-w-sm">
                                            Pilih percakapan dari daftar, atau mulai percakapan baru dengan tombol di atas.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
            </div>

            {/* Modal: Mulai Percakapan Baru */}
            {showNewChatModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)' }}
                    onClick={() => { setShowNewChatModal(false); }}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        onClick={e => e.stopPropagation()}
                        style={{ animation: 'modalIn 0.2s cubic-bezier(0.22,1,0.36,1) both' }}>
                        <div className="px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-gray-900">Mulai Percakapan Baru</h3>
                                <button onClick={() => { setShowNewChatModal(false); }}
                                    className="w-7 h-7 rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 flex items-center justify-center transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Hubungi Admin Kampus (hidden for Admin Kampus & Super Admin) */}
                            {userRole !== 'Admin Kampus' && userRole !== 'Super Admin' && (
                            <button onClick={handleStartAdmin}
                                className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-gray-900">Hubungi Admin Kampus</p>
                                    <p className="text-xs text-gray-500">Konsultasi atau tanyakan informasi ke kampus</p>
                                </div>
                            </button>
                            )}

                            {/* Cari Alumni (hidden for Admin PT) */}
                            {userRole !== 'Admin PT' && (
                                <div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="Cari alumni berdasarkan nama atau jurusan..."
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-orange-400 focus:ring-orange-400 transition-colors"
                                        />
                                        {searching && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <svg className="w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    {searchResults.length > 0 && (
                                        <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                                            {searchResults.map(alumni => {
                                                const isSelf = alumni.id === auth.user.id;
                                                return (
                                                <button
                                                    key={alumni.id}
                                                    disabled={isSelf}
                                                    onClick={() => !isSelf && handleStartAlumniChat(alumni.id)}
                                                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border border-transparent transition-colors ${isSelf ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 hover:border-gray-200 cursor-pointer'}`}
                                                >
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${isSelf ? 'bg-gray-400' : 'bg-green-600'}`}>
                                                        {alumni.name.charAt(0)?.toUpperCase() || 'A'}
                                                    </div>
                                                    <div className="text-left min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {alumni.name}
                                                            {isSelf && <span className="text-gray-400 font-normal"> (Anda)</span>}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {alumni.nim && <span>{alumni.nim} · </span>}
                                                            {alumni.major || 'Alumni'}
                                                        </p>
                                                    </div>
                                                    {!isSelf && (
                                                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                    )}
                                                </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {searchQuery.trim().length >= 2 && !searching && searchResults.length === 0 && (
                                        <p className="mt-2 text-xs text-gray-400 text-center">Tidak ada alumni ditemukan</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Undang Melamar (Job Picker) */}
            {showJobPicker && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)' }}
                    onClick={() => { setShowJobPicker(false); setInviteAlumniId(null); }}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900">Undang Melamar</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Pilih lowongan untuk dikirimkan ke alumni</p>
                        </div>
                        <div className="p-5 space-y-4">
                            <select value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:border-orange-400 focus:ring-orange-400">
                                <option value="">Pilih lowongan aktif...</option>
                                {jobList.map(j => (
                                    <option key={j.id} value={j.id}>{j.title}</option>
                                ))}
                            </select>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => { setShowJobPicker(false); setInviteAlumniId(null); }}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                    Batal
                                </button>
                                <button onClick={() => handleInviteToApply(inviteAlumniId)} disabled={!selectedJobId}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    Kirim Undangan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Konfirmasi Bersihkan Chat */}
            {showClearConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)' }}
                    onClick={() => setShowClearConfirm(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900">Bersihkan Chat</h3>
                        </div>
                        <div className="p-5">
                            <p className="text-sm text-gray-600">
                                Apakah Anda yakin ingin membersihkan seluruh riwayat chat ini? Pesan hanya akan terhapus dari perangkat Anda.
                            </p>
                        </div>
                        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
                            <button onClick={() => setShowClearConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                Batal
                            </button>
                            <button onClick={handleClearChat}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                                Bersihkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Konfirmasi Hapus Chat */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)' }}
                    onClick={() => setShowDeleteConfirm(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900">Hapus Chat</h3>
                        </div>
                        <div className="p-5">
                            <p className="text-sm text-gray-600">
                                Apakah Anda yakin ingin menghapus seluruh percakapan ini? Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
                            <button onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                Batal
                            </button>
                            <button onClick={handleDeleteConv}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={deleteConfirmTarget !== null}
                onClose={() => { setDeleteConfirmTarget(null); }}
                onConfirm={handleDeleteConfirm}
                loading={deleteLoading}
                title={deleteConfirmTarget?.type === 'for_everyone' ? 'Hapus untuk Semua Orang' : 'Hapus untuk Saya'}
                message={deleteConfirmTarget?.type === 'for_everyone'
                    ? 'Apakah Anda yakin ingin menghapus pesan ini untuk semua orang di obrolan ini?'
                    : 'Hapus pesan ini? Pesan hanya akan dihapus untuk Anda.'}
                confirmText={deleteConfirmTarget?.type === 'for_everyone' ? 'Hapus untuk Semua' : 'Hapus untuk Saya'}
                confirmVariant={deleteConfirmTarget?.type === 'for_everyone' ? 'danger' : 'default'}
            />

            <style>{`
                @keyframes modalIn { from{opacity:0;transform:translateY(10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
            `}</style>
        </AuthenticatedLayout>
    );
}
