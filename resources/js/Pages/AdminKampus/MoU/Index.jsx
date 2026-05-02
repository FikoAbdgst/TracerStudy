import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import InputError from '@/Components/InputError';

export default function MoUIndex({ mous, companies }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // useForm Inertia sudah mendukung upload file secara otomatis
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        company_id: '',
        file: null,
        signed_at: '',
        expires_at: '',
    });

    const openCreateModal = () => {
        reset(); clearErrors(); setIsModalOpen(true);
    };

    const handleUpload = (e) => {
        e.preventDefault();
        post(route('adminkampus.mou.store'), {
            onSuccess: () => setIsModalOpen(false)
        });
    };

    const handleTerminate = (id) => {
        if (confirm('Yakin ingin mengakhiri kerja sama ini secara paksa?')) {
            router.patch(route('adminkampus.mou.terminate', id));
        }
    };

    const getStatusBadge = (status, expiresAt) => {
        // Cek jika statusnya active, tapi tanggal sudah lewat
        if (status === 'active' && new Date(expiresAt) < new Date()) {
            return <Badge variant="destructive">Kadaluwarsa</Badge>;
        }

        switch (status) {
            case 'active': return <Badge className="bg-green-500">Aktif</Badge>;
            case 'expired': return <Badge variant="destructive">Kadaluwarsa</Badge>;
            case 'terminated': return <Badge variant="secondary">Diakhiri</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Manajemen Kerja Sama (MoU)</h2>}>
            <Head title="Dokumen MoU" />

            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-500 text-sm">Arsip dan pelacakan masa berlaku dokumen MoU dengan perusahaan mitra.</p>
                    <Button onClick={openCreateModal}>+ Unggah MoU Baru</Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Perusahaan Mitra</TableHead>
                                <TableHead>Tanggal TTD</TableHead>
                                <TableHead>Berlaku Sampai</TableHead>
                                <TableHead>Dokumen</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mous.map(mou => (
                                <TableRow key={mou.id}>
                                    <TableCell className="font-medium">{mou.company?.name || 'Perusahaan Dihapus'}</TableCell>
                                    <TableCell>{mou.signed_at}</TableCell>
                                    <TableCell>{mou.expires_at}</TableCell>
                                    <TableCell>
                                        <a href={`/storage/${mou.file_url}`} target="_blank" className="text-blue-600 hover:underline">
                                            Unduh PDF
                                        </a>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(mou.status, mou.expires_at)}</TableCell>
                                    <TableCell className="text-right">
                                        {mou.status === 'active' && (
                                            <Button variant="destructive" size="sm" onClick={() => handleTerminate(mou.id)}>Akhiri</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {mous.length === 0 && (
                                <TableRow><TableCell colSpan={6} className="text-center py-6 text-gray-500">Belum ada dokumen MoU yang diunggah.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* MODAL UPLOAD MoU */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unggah Dokumen MoU</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpload} className="space-y-4">

                        <div className="space-y-2">
                            <Label>Perusahaan Mitra</Label>
                            <Select value={data.company_id} onValueChange={(val) => setData('company_id', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih perusahaan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.company_id} />
                        </div>

                        <div className="space-y-2">
                            <Label>Tanggal Penandatanganan</Label>
                            <Input type="date" value={data.signed_at} onChange={e => setData('signed_at', e.target.value)} />
                            <InputError message={errors.signed_at} />
                        </div>

                        <div className="space-y-2">
                            <Label>Berlaku Sampai (Kedaluwarsa)</Label>
                            <Input type="date" value={data.expires_at} onChange={e => setData('expires_at', e.target.value)} />
                            <InputError message={errors.expires_at} />
                        </div>

                        <div className="space-y-2">
                            <Label>File Dokumen (PDF, Maks 5MB)</Label>
                            <Input
                                type="file"
                                accept=".pdf"
                                onChange={e => setData('file', e.target.files[0])}
                            />
                            <InputError message={errors.file} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>Unggah & Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AuthenticatedLayout>
    );
}
