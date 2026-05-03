import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import InputError from '@/Components/InputError';

export default function ForumShow({ topic }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        content: '',
    });

    const handleReply = (e) => {
        e.preventDefault();
        post(route('alumni.forum.reply', topic.id), {
            onSuccess: () => reset('content'),
        });
    };

    const formatDate = (dateString) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }).format(new Date(dateString));
    };

    // Helper untuk membuat avatar dengan inisial
    const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Ruang Diskusi</h2>}>
            <Head title={topic.title} />

            <div className="max-w-4xl mx-auto mt-6 mb-12">
                <Link href={route('alumni.forum.index')} className="text-blue-600 hover:underline text-sm mb-4 inline-block">
                    &larr; Kembali ke daftar diskusi
                </Link>

                {/* POSTINGAN UTAMA */}
                <Card className="mb-6 border-t-4 border-t-blue-600 shadow-sm">
                    <CardHeader className="pb-4 border-b bg-gray-50/50">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">{topic.title}</h1>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg border border-blue-200 shrink-0">
                                {getInitials(topic.user?.name)}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">{topic.user?.name}</div>
                                <div className="text-xs text-gray-500">{formatDate(topic.created_at)}</div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{topic.content}</p>
                    </CardContent>
                </Card>

                {/* DAFTAR BALASAN */}
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>Balasan</span>
                    <span className="bg-gray-200 text-gray-700 text-xs py-0.5 px-2 rounded-full">{topic.replies?.length || 0}</span>
                </h3>

                <div className="space-y-4 mb-8">
                    {topic.replies?.map(reply => (
                        <Card key={reply.id} className="shadow-sm bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm border shrink-0 mt-1">
                                        {getInitials(reply.user?.name)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="font-medium text-sm text-gray-900">{reply.user?.name}</span>
                                            <span className="text-xs text-gray-400">{formatDate(reply.created_at)}</span>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {(!topic.replies || topic.replies.length === 0) && (
                        <div className="text-center py-6 text-gray-500 italic bg-gray-50 rounded-lg border border-dashed">
                            Belum ada balasan.
                        </div>
                    )}
                </div>

                {/* FORM BALASAN */}
                <Card className="shadow-sm">
                    <CardContent className="p-6">
                        <form onSubmit={handleReply} className="space-y-4">
                            <div>
                                <Textarea
                                    placeholder="Tulis balasan Anda di sini..."
                                    rows={4}
                                    value={data.content}
                                    onChange={e => setData('content', e.target.value)}
                                />
                                <InputError message={errors.content} className="mt-2" />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing || !data.content.trim()}>
                                    {processing ? 'Mengirim...' : 'Kirim Balasan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
