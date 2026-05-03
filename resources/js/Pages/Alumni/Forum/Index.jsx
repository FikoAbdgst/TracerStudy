import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';

export default function ForumIndex({ topics }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        title: '',
        content: '',
    });

    const filteredTopics = topics.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openCreateModal = () => {
        reset(); clearErrors(); setIsModalOpen(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('alumni.forum.store'), {
            onSuccess: () => setIsModalOpen(false)
        });
    };

    const formatDate = (dateString) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }).format(new Date(dateString));
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Ruang Diskusi Alumni</h2>}>
            <Head title="Forum Diskusi" />

            <div className="max-w-5xl mx-auto mt-6">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                    <p className="text-gray-600">Tempat berbagi informasi, tips karir, dan menjalin relasi antar alumni.</p>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Input
                            placeholder="Cari topik diskusi..."
                            className="w-full md:w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button onClick={openCreateModal}>+ Buat Topik</Button>
                    </div>
                </div>

                <div className="grid gap-4">
                    {filteredTopics.map(topic => (
                        <Link key={topic.id} href={route('alumni.forum.show', topic.id)}>
                            <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                                <CardContent className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{topic.title}</h3>
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <span className="font-medium text-gray-700">{topic.user?.name}</span>
                                            <span>•</span>
                                            <span>{formatDate(topic.created_at)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md border text-sm text-gray-600 shrink-0">
                                        <span>💬</span>
                                        <span className="font-medium">{topic.replies_count} Balasan</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}

                    {filteredTopics.length === 0 && (
                        <div className="p-12 text-center text-gray-500 bg-white border border-dashed rounded-lg">
                            Belum ada topik diskusi yang dibuat. Jadilah yang pertama memulai obrolan!
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Buat Topik Diskusi Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Judul Topik <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="Misal: Info Loker IT Bandung 2026"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                            />
                            <InputError message={errors.title} />
                        </div>
                        <div className="space-y-2">
                            <Label>Isi Pesan <span className="text-red-500">*</span></Label>
                            <Textarea
                                rows={6}
                                placeholder="Tuliskan pesan atau pertanyaan Anda di sini..."
                                value={data.content}
                                onChange={e => setData('content', e.target.value)}
                            />
                            <InputError message={errors.content} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>Posting Topik</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
