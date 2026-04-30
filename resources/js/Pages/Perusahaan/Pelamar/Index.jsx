import React, { useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';

export default function PelamarIndex({ applications }) {
    const [searchName, setSearchName] = useState('');
    const [filterJob, setFilterJob] = useState('all');

    // State untuk Modal Proses Lamaran
    const [isProcessOpen, setIsProcessOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);

    const { data, setData, patch, processing } = useForm({
        status: '',
        notes: '',
    });

    const uniqueJobs = useMemo(() => {
        const jobs = applications.map(app => app.job_posting.title);
        return [...new Set(jobs)];
    }, [applications]);

    const filteredApplications = applications.filter((app) => {
        const matchName = app.alumni?.user?.name.toLowerCase().includes(searchName.toLowerCase());
        const matchJob = filterJob === 'all' || app.job_posting.title === filterJob;
        return matchName && matchJob;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <Badge variant="secondary">Menunggu</Badge>;
            case 'direview': return <Badge variant="default" className="bg-blue-500">Direview</Badge>;
            case 'wawancara': return <Badge variant="default" className="bg-purple-500">Wawancara</Badge>;
            case 'diterima': return <Badge variant="default" className="bg-green-600">Diterima</Badge>;
            case 'ditolak': return <Badge variant="destructive">Ditolak</Badge>;
            default: return <Badge variant="outline">{status || 'Pending'}</Badge>;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
    };

    // Fungsi untuk membuka modal dan menyiapkan form
    const openProcessModal = (app) => {
        setSelectedApp(app);
        setData({
            status: app.status || 'pending',
            notes: app.notes || '',
        });
        setIsProcessOpen(true);
    };

    const submitStatus = (e) => {
        e.preventDefault();
        patch(route('perusahaan.pelamar.status', selectedApp.id), {
            onSuccess: () => setIsProcessOpen(false)
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Daftar Pelamar</h2>}>
            <Head title="Daftar Pelamar" />

            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                    <div className="w-full md:w-auto">
                        <h3 className="text-lg font-medium text-gray-900">Total Pelamar: {filteredApplications.length}</h3>
                    </div>
                    {/* ... (Bagian Filter Input & Select tetap sama seperti sebelumnya) ... */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <Input
                            placeholder="Cari nama pelamar..."
                            className="w-full sm:w-64"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                        <Select value={filterJob} onValueChange={setFilterJob}>
                            <SelectTrigger className="w-full sm:w-56">
                                <SelectValue placeholder="Semua Posisi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Posisi</SelectItem>
                                {uniqueJobs.map((job, idx) => (
                                    <SelectItem key={idx} value={job}>{job}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Pelamar</TableHead>
                                <TableHead>Posisi Dilamar</TableHead>
                                <TableHead>Tanggal Melamar</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredApplications.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium">
                                        {app.alumni?.user?.name || 'User Tidak Diketahui'}
                                        <div className="text-xs text-gray-400 mt-1">{app.alumni?.user?.email}</div>
                                    </TableCell>
                                    <TableCell>{app.job_posting?.title}</TableCell>
                                    <TableCell>{formatDate(app.created_at)}</TableCell>
                                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => openProcessModal(app)}>
                                            Proses
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredApplications.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                        Tidak ada pelamar yang cocok.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* MODAL PROSES LAMARAN */}
            <Dialog open={isProcessOpen} onOpenChange={setIsProcessOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Detail & Proses Lamaran</DialogTitle>
                    </DialogHeader>

                    {selectedApp && (
                        <div className="space-y-6">
                            {/* Informasi Pelamar & Lowongan */}
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md text-sm border">
                                <div>
                                    <p className="text-gray-500">Nama Pelamar</p>
                                    <p className="font-semibold">{selectedApp.alumni?.user?.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Email</p>
                                    <p className="font-semibold">{selectedApp.alumni?.user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Posisi Dilamar</p>
                                    <p className="font-semibold">{selectedApp.job_posting?.title}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Lampiran CV</p>
                                    {selectedApp.cv_path ? (
                                        <a href={`/storage/${selectedApp.cv_path}`} target="_blank" className="text-blue-600 hover:underline font-medium">
                                            Lihat Dokumen CV
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 italic">Tidak ada CV</span>
                                    )}
                                </div>
                            </div>

                            {/* Form Pengubahan Status */}
                            <form onSubmit={submitStatus} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Status Lamaran saat ini</Label>
                                    <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih keputusan..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending (Menunggu)</SelectItem>
                                            <SelectItem value="direview">Sedang Direview</SelectItem>
                                            <SelectItem value="wawancara">Panggil Wawancara</SelectItem>
                                            <SelectItem value="diterima">Diterima (Hired)</SelectItem>
                                            <SelectItem value="ditolak">Ditolak (Rejected)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Catatan Internal / Untuk Pelamar (Opsional)</Label>
                                    <Textarea
                                        rows={3}
                                        placeholder="Tambahkan jadwal wawancara atau alasan penolakan..."
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => setIsProcessOpen(false)}>Batal</Button>
                                    <Button type="submit" disabled={processing}>Simpan Keputusan</Button>
                                </DialogFooter>
                            </form>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </AuthenticatedLayout>
    );
}
