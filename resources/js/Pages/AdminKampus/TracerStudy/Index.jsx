import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Switch } from '@/Components/ui/switch';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';

export default function TracerStudyIndex({ forms }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        title: '',
        description: '',
        questions: [],
    });

    const openCreate = () => {
        reset(); setIsEditing(false); setIsModalOpen(true);
    };

    const openEdit = (form) => {
        setSelectedId(form.id);
        setData({
            title: form.title,
            description: form.description || '',
            questions: form.questions || [],
        });
        setIsEditing(true); setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('adminkampus.tracer.update', selectedId), { onSuccess: () => setIsModalOpen(false) });
        } else {
            post(route('adminkampus.tracer.store'), { onSuccess: () => setIsModalOpen(false) });
        }
    };

    const toggleStatus = (id) => {
        router.patch(route('adminkampus.tracer.toggle', id), {}, { preserveScroll: true });
    };

    // --- LOGIKA FORM BUILDER JSON ---
    const addQuestion = () => {
        setData('questions', [...data.questions, { id: Date.now(), type: 'text', question: '', options: [] }]);
    };

    const updateQuestion = (id, field, value) => {
        const newQuestions = data.questions.map(q => q.id === id ? { ...q, [field]: value } : q);
        setData('questions', newQuestions);
    };

    const removeQuestion = (id) => {
        setData('questions', data.questions.filter(q => q.id !== id));
    };

    const addOption = (questionId) => {
        const newQuestions = data.questions.map(q => {
            if (q.id === questionId) return { ...q, options: [...q.options, 'Opsi Baru'] };
            return q;
        });
        setData('questions', newQuestions);
    };

    const updateOption = (questionId, optionIndex, value) => {
        const newQuestions = data.questions.map(q => {
            if (q.id === questionId) {
                const newOptions = [...q.options];
                newOptions[optionIndex] = value;
                return { ...q, options: newOptions };
            }
            return q;
        });
        setData('questions', newQuestions);
    };
    // ---------------------------------

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Kelola Kuesioner Tracer Study</h2>}>
            <Head title="Tracer Study" />

            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-500 text-sm">Buat dan kelola pertanyaan kuesioner untuk dilacak dari alumni.</p>
                    <Button onClick={openCreate}>+ Buat Kuesioner Baru</Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Judul Kuesioner</TableHead>
                                <TableHead>Jml Pertanyaan</TableHead>
                                <TableHead>Status Aktif</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {forms.map(form => (
                                <TableRow key={form.id}>
                                    <TableCell className="font-medium">{form.title}</TableCell>
                                    <TableCell>{form.questions?.length || 0} Pertanyaan</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch checked={form.is_active} onCheckedChange={() => toggleStatus(form.id)} />
                                            {form.is_active ? <Badge className="bg-green-500">Aktif</Badge> : <Badge variant="secondary">Draft</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => openEdit(form)}>Edit Form</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {forms.length === 0 && (
                                <TableRow><TableCell colSpan={4} className="text-center py-6 text-gray-500">Belum ada form kuesioner.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* MODAL FORM BUILDER */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Kuesioner' : 'Rancang Kuesioner Baru'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                            <div>
                                <Label>Judul Kuesioner</Label>
                                <Input value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Misal: Tracer Study Lulusan 2025" required />
                            </div>
                            <div>
                                <Label>Deskripsi (Opsional)</Label>
                                <Textarea value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Penjelasan singkat..." />
                            </div>
                        </div>

                        {/* RENDER PERTANYAAN (JSON BUILDER) */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold">Daftar Pertanyaan</h3>
                                <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>+ Tambah Pertanyaan</Button>
                            </div>

                            {data.questions.map((q, index) => (
                                <div key={q.id} className="p-4 border rounded-md relative group bg-white shadow-sm">
                                    <button type="button" onClick={() => removeQuestion(q.id)} className="absolute top-2 right-2 text-red-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity">Hapus</button>

                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="col-span-2">
                                            <Label>Pertanyaan {index + 1}</Label>
                                            <Input value={q.question} onChange={e => updateQuestion(q.id, 'question', e.target.value)} placeholder="Tulis pertanyaan Anda..." required />
                                        </div>
                                        <div>
                                            <Label>Tipe Jawaban</Label>
                                            <Select value={q.type} onValueChange={v => updateQuestion(q.id, 'type', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text">Teks Singkat</SelectItem>
                                                    <SelectItem value="textarea">Paragraf (Teks Panjang)</SelectItem>
                                                    <SelectItem value="radio">Pilihan Ganda (Satu Jawaban)</SelectItem>
                                                    <SelectItem value="master_industry">Dropdown (Master Data Industri)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Jika tipe adalah radio (Pilihan Ganda), tampilkan builder opsi */}
                                    {q.type === 'radio' && (
                                        <div className="pl-4 border-l-2 space-y-2 mt-2">
                                            <Label className="text-xs text-gray-500">Pilihan Jawaban:</Label>
                                            {q.options.map((opt, optIdx) => (
                                                <Input key={optIdx} value={opt} onChange={e => updateOption(q.id, optIdx, e.target.value)} className="w-2/3 h-8 text-sm mb-1" />
                                            ))}
                                            <Button type="button" variant="link" size="sm" onClick={() => addOption(q.id)} className="text-blue-600 p-0 h-auto">+ Tambah Opsi</Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>Simpan Kuesioner</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AuthenticatedLayout>
    );
}
