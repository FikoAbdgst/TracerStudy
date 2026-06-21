import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function Show({ conversation, messages: initialMessages, otherUser, userRole, alumniCvPath, prefilledMessage, appliedJobId }) {
    const { auth, errors } = usePage().props;
    const [messages, setMessages] = useState(initialMessages);
    const [sending, setSending] = useState(false);
    const [attachment, setAttachment] = useState(null);
    const [polling, setPolling] = useState(true);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const intervalRef = useRef(null);

    const { data, setData, post, processing, reset } = useForm({
        message: prefilledMessage || '',
        attachment: null,
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    useEffect(() => {
        if (polling && conversation.id) {
            intervalRef.current = setInterval(() => {
                const since = messages.length > 0 ? messages[messages.length - 1].created_at : null;
                axios.get(route('chat.poll', conversation.id), {
                    params: { since }
                }).then((res) => {
                    if (res.data.messages && res.data.messages.length > 0) {
                        setMessages(prev => {
                            const existingIds = new Set(prev.map(m => m.id));
                            const newMsgs = res.data.messages.filter(m => !existingIds.has(m.id));
                            if (newMsgs.length > 0) return [...prev, ...newMsgs];
                            return prev;
                        });
                    }
                }).catch(() => {});
            }, 5000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [polling, conversation.id]);

    useEffect(() => {
        if (conversation.id) {
            axios.post(route('chat.read', conversation.id)).catch(() => {});
        }
    }, [conversation.id]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!data.message.trim() && !attachment) return;

        setSending(true);
        const formData = new FormData();
        formData.append('message', data.message);
        if (attachment) {
            formData.append('attachment', attachment);
        }

        axios.post(route('chat.send', conversation.id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(() => {
            reset();
            setAttachment(null);
            setSending(false);
        }).catch(() => {
            setSending(false);
        });
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) setAttachment(file);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        if (diff < 60000) return 'Baru saja';
        if (diff < 3600000) return Math.floor(diff / 60000) + ' menit lalu';
        if (diff < 86400000) return Math.floor(diff / 3600000) + ' jam lalu';
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <AuthenticatedLayout header={otherUser?.name || 'Pesan'}>
            <Head title={otherUser?.name || 'Pesan'} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col h-[calc(100vh-16rem)]">
                        {/* Header */}
                        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Link href={route('chat.index')} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold text-sm">
                                    {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{otherUser?.name || 'Pengguna'}</p>
                                    <p className="text-xs text-gray-500">
                                        {otherUser?.role === 'Admin PT' ? otherUser?.company_name || 'Perusahaan'
                                            : otherUser?.role === 'Alumni' ? otherUser?.major || 'Alumni'
                                            : otherUser?.role === 'Admin Kampus' ? 'Admin Kampus'
                                            : ''}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-gray-50/50">
                            {messages.length === 0 && (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-sm text-gray-400">Belum ada pesan. Mulai percakapan!</p>
                                </div>
                            )}
                            {messages.map((msg) => {
                                const isOwn = msg.sender_id === auth.user.id;
                                return (
                                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] ${isOwn ? 'order-1' : 'order-1'}`}>
                                            <div className={`px-4 py-2.5 rounded-2xl ${
                                                isOwn
                                                    ? 'bg-orange-500 text-white rounded-br-md'
                                                    : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                                            }`}>
                                                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                                {msg.attachment_url && (
                                                    <a
                                                        href={msg.attachment_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium ${
                                                            isOwn ? 'text-orange-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'
                                                        }`}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                        </svg>
                                                        Lihat Lampiran
                                                    </a>
                                                )}
                                            </div>
                                            <p className={`text-[10px] text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                                                {formatDate(msg.created_at)}
                                                {isOwn && (
                                                    <span className="ml-1">{msg.is_read ? '✓✓' : '✓'}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="px-6 py-4 border-t bg-white">
                            {appliedJobId && prefilledMessage && (
                                <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-orange-800">Melamar Pekerjaan</p>
                                            <p className="text-xs text-orange-600 mt-0.5">
                                                Kirim pesan ini untuk melamar pekerjaan. CV Anda akan otomatis dilampirkan.
                                                {alumniCvPath && ' CV dari profil Anda sudah siap.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {attachment && (
                                <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    <span className="text-sm text-gray-600 truncate flex-1">{attachment.name}</span>
                                    <button onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                            <form onSubmit={handleSend} className="flex items-end gap-2">
                                <div className="flex-1">
                                    <textarea
                                        rows={2}
                                        value={data.message}
                                        onChange={e => setData('message', e.target.value)}
                                        placeholder="Tulis pesan..."
                                        className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-2.5 text-sm resize-none focus:border-orange-400 focus:ring-orange-400 transition-colors"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend(e);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-1">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Lampirkan file"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={(!data.message.trim() && !attachment) || sending}
                                        className="p-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {sending ? (
                                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
