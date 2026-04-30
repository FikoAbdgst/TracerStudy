import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Switch } from '@/Components/ui/switch';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import InputError from '@/Components/InputError';

export default function LowonganIndex({ jobs }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        title: '',
        location: '',
        salary_range: '',
        description: '',
        requirements: '',
    });

    const openCreateModal = () => {
        reset(); clearErrors(); setIsCreateOpen(true);
    };

    const openEditModal = (job) => {
        reset(); clearErrors();
        setSelectedJob(job);
        setData({
            title: job.title,
            location: job.location || '',
            salary_range: job.salary_range || '',
            description: job.description,
            requirements: job.requirements || '',
        });
        setIsEditOpen(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('perusahaan.lowongan.store'), { onSuccess: () => setIsCreateOpen(false) });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        put(route('perusahaan.lowongan.update', selectedJob.id), { onSuccess: () => setIsEditOpen(false) });
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus lowongan ini?')) {
            destroy(route('perusahaan.lowongan.destroy', id));
        }
    };

    // Fungsi canggih untuk mengubah toggle tanpa memuat ulang form
    const toggleActiveStatus = (id) => {
        router.patch(route('perusahaan.lowongan.toggle', id), {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Kelola Lowongan Kerja</h2>}>
            <Head title="Manajemen Lowongan" />

            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-500 text-sm">Daftar semua posisi pekerjaan yang ditawarkan oleh perusahaan Anda.</p>
                    <Button onClick={openCreateModal}>+ Posting Lowongan</Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Posisi (Title)</TableHead>
                                <TableHead>Lokasi</TableHead>
                                <TableHead>Status Publikasi</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobs.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium">
                                        {job.title}
                                        <div className="text-xs text-gray-400 mt-1">{job.salary_range}</div>
                                    </TableCell>
                                    <TableCell>{job.location || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={job.is_active}
                                                onCheckedChange={() => toggleActiveStatus(job.id)}
                                            />
                                            {job.is_active ?
                                                <Badge variant="default" className="bg-green-500">Dibuka</Badge> :
                                                <Badge variant="secondary">Ditutup</Badge>
                                            }
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => openEditModal(job)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(job.id)}>Hapus</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {jobs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500 py-6">Belum ada lowongan yang diposting.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Modal Tambah/Edit (Digabung agar ringkas) */}
            <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
                if (!open) { setIsCreateOpen(false); setIsEditOpen(false); }
            }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{isEditOpen ? 'Edit Lowongan' : 'Posting Lowongan Baru'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={isEditOpen ? handleEdit : handleCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Posisi Pekerjaan <span className="text-red-500">*</span></Label>
                                <Input value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Contoh: Frontend Developer" />
                                <InputError message={errors.title} />
                            </div>
                            <div className="space-y-2">
                                <Label>Rentang Gaji (Opsional)</Label>
                                <Input value={data.salary_range} onChange={e => setData('salary_range', e.target.value)} placeholder="Contoh: Rp 5.000.000 - Rp 7.000.000" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Lokasi Penempatan</Label>
                            <Input value={data.location} onChange={e => setData('location', e.target.value)} placeholder="Contoh: Bandung, Jawa Barat (Remote/WFO)" />
                        </div>

                        <div className="space-y-2">
                            <Label>Deskripsi Pekerjaan <span className="text-red-500">*</span></Label>
                            <Textarea rows={4} value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Tanggung jawab utama posisi ini..." />
                            <InputError message={errors.description} />
                        </div>

                        <div className="space-y-2">
                            <Label>Persyaratan (Requirements)</Label>
                            <Textarea rows={4} value={data.requirements} onChange={e => setData('requirements', e.target.value)} placeholder="Kualifikasi yang dibutuhkan..." />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }}>Batal</Button>
                            <Button type="submit" disabled={processing}>Simpan Lowongan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AuthenticatedLayout>
    );
}
