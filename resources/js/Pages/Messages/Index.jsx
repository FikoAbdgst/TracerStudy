import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
};

const roleLabel = (role) => {
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
    const [alumniSearchQ, setAlumniSearchQ] = useState('');
    const [alumniResults, setAlumniResults] = useState([]);
    const [searching, setSearching] = useState(false);
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

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const chatContainerRef = useRef(null);
    const searchTimeoutRef = useRef(null);
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
                            const ids = new Set(prev.map(m => m.id));
                            return [...prev, ...res.data.messages.filter(m => !ids.has(m.id))];
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
        router.get(route('messages.index', { conversation: convId }), {}, {
            preserveScroll: true,
            preserveState: false,
        });
    }, []);

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

        axios.post(route('messages.send', selectedConv.id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(() => {
            setBody('');
            setAttachment(null);
            setDraftCvName(null);
            setDraftCvPath(null);
            setSending(false);
        }).catch(() => setSending(false));
    };

    const searchAlumni = useCallback((q) => {
        setAlumniSearchQ(q);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (!q || q.length < 2) { setAlumniResults([]); return; }
        searchTimeoutRef.current = setTimeout(() => {
            setSearching(true);
            axios.get(route('messages.search-alumni'), { params: { q } })
                .then(res => { setAlumniResults(res.data.alumni); })
                .catch(() => { })
                .finally(() => setSearching(false));
        }, 300);
    }, []);

    const handleStartAlumni = (targetUserId) => {
        axios.post(route('messages.start-alumni'), { user_id: targetUserId })
            .then(res => {
                setShowNewChatModal(false);
                setAlumniSearchQ('');
                setAlumniResults([]);
                window.location.href = res.request?.responseURL || route('messages.index');
            })
            .catch(err => { alert('Gagal memulai percakapan.'); });
    };

    const handleStartAdmin = () => {
        axios.post(route('messages.start-admin'))
            .then(res => {
                setShowNewChatModal(false);
                window.location.href = res.request?.responseURL || route('messages.index');
            })
            .catch(() => alert('Gagal menghubungi admin.'));
    };

    const handleInviteToApply = (alumniUserId) => {
        if (!selectedJobId) return;
        axios.post(route('messages.invite-candidate'), {
            alumni_id: alumniUserId,
            job_id: selectedJobId,
        }).then(res => {
            setShowJobPicker(false);
            setInviteAlumniId(null);
            window.location.href = res.data?.redirect || route('messages.index');
        }).catch(err => alert(err.response?.data?.error || 'Gagal mengundang.'));
    };

    const handleDeleteMessage = (msgId, type) => {
        axios.delete(route('messages.delete', msgId), { data: { type } })
            .then(() => {
                if (type === 'for_everyone') {
                    setMessages(prev => prev.map(m =>
                        m.id === msgId ? { ...m, body: 'Pesan ini telah dihapus.', is_deleted_for_everyone: true, attachment_url: null } : m
                    ));
                } else {
                    setMessages(prev => prev.filter(m => m.id !== msgId));
                }
                setShowMsgMenu(null);
            })
            .catch(() => {});
    };

    const handleClearChat = () => {
        axios.delete(route('messages.clear', selectedConv.id))
            .then(() => {
                setMessages([]);
                setShowClearConfirm(false);
            })
            .catch(() => {});
    };

    const activeConvId = selectedConv?.id;

    return (
        <AuthenticatedLayout header="Pesan">
            <Head title="Pesan" />

            <div className="py-6">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex h-[calc(100vh-12rem)]">
                        {/* Left Column: Inbox */}
                        <div className="w-80 xl:w-96 border-r border-gray-200 flex flex-col bg-gray-50/50 flex-shrink-0">
                            {/* Header + New Chat Button */}
                            <div className="p-4 border-b border-gray-200 bg-white">
                                <button
                                    onClick={() => setShowNewChatModal(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-semibold transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Mulai Percakapan Baru
                                </button>
                            </div>

                            {/* Conversation List */}
                            <div className="flex-1 overflow-y-auto">
                                {conversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <p className="text-sm text-gray-400">Belum ada percakapan</p>
                                    </div>
                                ) : (
                                    conversations.map((conv) => {
                                        const other = conv.other_user;
                                        const rl = roleLabel(other?.role);
                                        const isActive = conv.id === activeConvId;
                                        return (
                                            <button
                                                key={conv.id}
                                                onClick={() => handleSelectConv(conv.id)}
                                                className={`w-full text-left px-4 py-3.5 border-b border-gray-100 transition-colors hover:bg-gray-100/80 ${isActive ? 'bg-orange-50 border-l-2 border-l-orange-500' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="relative flex-shrink-0">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${other?.role === 'Admin PT' ? 'bg-blue-600' :
                                                                other?.role === 'Admin Kampus' ? 'bg-purple-600' :
                                                                    'bg-green-600'
                                                            }`}>
                                                            {other?.name?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                        {conv.unread_count > 0 && (
                                                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                                                                {conv.unread_count > 9 ? '9+' : conv.unread_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-sm font-semibold text-gray-900 truncate">{other?.name || 'Pengguna'}</span>
                                                            <span className="text-[10px] text-gray-400 flex-shrink-0">{formatDate(conv.updated_at)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: rl.bg, color: rl.color }}>{rl.text}</span>
                                                            {other?.major && <span className="text-[11px] text-gray-400 truncate">{other.major}</span>}
                                                            {conv.status === 'closed' && (
                                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Ditutup</span>
                                                            )}
                                                        </div>
                                                        {conv.last_message && (
                                                            <p className="text-xs text-gray-500 truncate mt-1">
                                                                <span className={conv.last_message.sender_id === auth.user.id ? 'text-gray-400' : ''}>
                                                                    {conv.last_message.sender_id === auth.user.id ? 'Anda: ' : ''}
                                                                    {conv.last_message.body}
                                                                </span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Right Column: Chat Room */}
                        <div className="flex-1 flex flex-col bg-white">
                            {selectedConv ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="px-5 py-3.5 border-b border-gray-200 bg-white flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm ${selectedConv.other_user?.role === 'Admin PT' ? 'bg-blue-600' :
                                                    selectedConv.other_user?.role === 'Admin Kampus' ? 'bg-purple-600' :
                                                        'bg-green-600'
                                                }`}>
                                                {selectedConv.other_user?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{selectedConv.other_user?.name || 'Pengguna'}</p>
                                                <p className="text-xs text-gray-500">
                                                    {selectedConv.type === 'admin' ? 'Admin Kampus' :
                                                        selectedConv.type === 'company' ? (selectedConv.other_user?.company_name || 'Perusahaan') :
                                                            selectedConv.other_user?.major || 'Alumni'}
                                                </p>
                                            </div>
                                        </div>

                                                        <div className="flex items-center gap-2">
                                            {selectedConv.status === 'closed' && (
                                                <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-100 text-gray-500 border border-gray-200">
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
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/30">
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
                                                        <div className={`max-w-[70%] ${isOwn ? 'order-1' : 'order-1'}`}>
                                                            <div className={`flex items-end gap-1 ${isOwn ? 'flex-row' : 'flex-row-reverse'}`}>
                                                                {!isDeleted && (
                                                                    <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
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
                                                                                    {isOwn && (
                                                                                        <button
                                                                                            onClick={() => handleDeleteMessage(msg.id, 'for_everyone')}
                                                                                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                                                                                        >
                                                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                            </svg>
                                                                                            Hapus untuk Semua Orang
                                                                                        </button>
                                                                                    )}
                                                                                    <button
                                                                                        onClick={() => handleDeleteMessage(msg.id, 'for_me')}
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
                                                                <div className={`px-4 py-2.5 rounded-2xl ${isDeleted
                                                                    ? 'bg-gray-100 text-gray-400 italic border border-gray-200'
                                                                    : isOwn
                                                                        ? 'bg-orange-500 text-white rounded-br-md'
                                                                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                                                                    }`}>
                                                                    {isDeleted ? (
                                                                        <p className="text-xs italic">Pesan ini telah dihapus.</p>
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
                                                                                            <a href={url} target="_blank" rel="noopener noreferrer"
                                                                                                className="block rounded-lg overflow-hidden border border-gray-200/50">
                                                                                                <img src={url} alt={fileName}
                                                                                                    className="max-w-full h-auto max-h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
                                                                                                    loading="lazy"
                                                                                                />
                                                                                            </a>
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

                                    {/* Send Form (disabled when closed or blocked) */}
                                    {(selectedConv.status === 'closed' || selectedConv.is_blocked_by) ? (
                                        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 text-center">
                                            <p className="text-sm text-gray-500">
                                                {selectedConv.status === 'closed'
                                                    ? 'Ruang obrolan telah ditutup. Tidak dapat mengirim pesan.'
                                                    : 'Anda telah diblokir oleh pengguna ini.'}
                                            </p>
                                        </div>
                                    ) : selectedConv.is_blocked ? (
                                        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 text-center">
                                            <p className="text-sm text-gray-500">
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
                                    ) : (
                                    <div className="px-5 py-3 border-t border-gray-200 bg-white">
                                        {attachment && (
                                            <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                                <span className="text-sm text-gray-600 truncate flex-1">{attachment.name}</span>
                                                <button onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                    className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                        <form onSubmit={handleSend} className="flex items-end gap-2">
                                            <div className="flex-1">
                                                <textarea ref={textareaRef} value={body} onChange={e => setBody(e.target.value)}
                                                    placeholder="Tulis pesan..."
                                                    className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-2.5 text-sm resize-none overflow-y-auto focus:border-orange-400 focus:ring-orange-400 transition-colors"
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
                                            <div className="flex items-center gap-1">
                                                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={e => setAttachment(e.target.files[0])} />
                                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                                    className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Lampirkan file">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </button>
                                                <button type="submit" disabled={(!body.trim() && !attachment) || sending}
                                                    className="p-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
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
                                        <svg className="mx-auto w-20 h-20 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <h3 className="mt-4 text-lg font-semibold text-gray-900">Pesan Terpusat</h3>
                                        <p className="mt-2 text-sm text-gray-500 max-w-sm">
                                            Pilih percakapan dari daftar di samping, atau mulai percakapan baru dengan tombol di atas.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Mulai Percakapan Baru */}
            {showNewChatModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)' }}
                    onClick={() => { setShowNewChatModal(false); setAlumniSearchQ(''); setAlumniResults([]); }}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        onClick={e => e.stopPropagation()}
                        style={{ animation: 'modalIn 0.2s cubic-bezier(0.22,1,0.36,1) both' }}>
                        <div className="px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-gray-900">Mulai Percakapan Baru</h3>
                                <button onClick={() => { setShowNewChatModal(false); setAlumniSearchQ(''); setAlumniResults([]); }}
                                    className="w-7 h-7 rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 flex items-center justify-center transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Hubungi Admin Kampus */}
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

                            {/* Divider */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-xs font-medium text-gray-400">ATAU</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            {/* Cari Alumni */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Cari Alumni</label>
                                <input type="text" value={alumniSearchQ}
                                    onChange={e => searchAlumni(e.target.value)}
                                    placeholder="Cari berdasarkan nama atau program studi..."
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:border-orange-400 focus:ring-orange-400 transition-colors"
                                />
                            </div>

                            {/* Results */}
                            <div className="max-h-52 overflow-y-auto space-y-1">
                                {searching && (
                                    <div className="text-center py-3">
                                        <svg className="w-5 h-5 animate-spin mx-auto text-gray-400" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    </div>
                                )}
                                {!searching && alumniSearchQ.length >= 2 && alumniResults.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-3">Tidak ada alumni ditemukan.</p>
                                )}
                                {alumniResults.map(a => {
                                    const isSelf = a.id === auth.user.id;
                                    return (
                                        <button key={a.id} onClick={() => !isSelf && handleStartAlumni(a.id)}
                                            disabled={isSelf}
                                            className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors ${isSelf ? 'opacity-60 cursor-default' : 'hover:bg-gray-50'}`}>
                                            <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-sm">
                                                {a.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {a.name}
                                                    {isSelf && <span className="text-orange-500 font-semibold ml-1.5">(Anda)</span>}
                                                </p>
                                                <p className="text-xs text-gray-500">{a.major || '—'} {a.nim ? `• ${a.nim}` : ''}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
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
                                Apakah Anda yakin ingin membersihkan seluruh pesan dalam percakapan ini? Tindakan ini hanya berlaku untuk Anda.
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

            <style>{`
                @keyframes modalIn { from{opacity:0;transform:translateY(10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
            `}</style>
        </AuthenticatedLayout>
    );
}
