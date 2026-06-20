import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/Components/ui/table';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/Components/ui/dialog';
import { Card, CardContent } from '@/Components/ui/card';
import { Loader2, Plus, FileText, Upload, Pencil, Trash2 } from 'lucide-react';

const statusVariant = {
    active: 'default',
    expired: 'destructive',
    terminated: 'secondary',
};

const statusLabel = {
    active: 'Aktif',
    expired: 'Kadaluwarsa',
    terminated: 'Diakhiri',
};

const formatDate = (d) =>
    d
        ? new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(new Date(d))
        : '—';

export default function MitraIndex({ companies }) {
    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [terminateTarget, setTerminateTarget] = useState(null);
    const [terminating, setTerminating] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        company_name: '',
        hr_email: '',
        mou_document: null,
    });

    const openAdd = () => {
        setEditTarget(null);
        reset();
        clearErrors();
        setAddOpen(true);
    };

    const openEdit = (company) => {
        setEditTarget(company);
        setData({
            company_name: company.name,
            hr_email: company.user?.email || '',
            mou_document: null,
        });
        clearErrors();
        setAddOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editTarget) {
            put(route('adminkampus.mitra.update', editTarget.id), {
                onSuccess: () => {
                    setAddOpen(false);
                    setEditTarget(null);
                },
            });
        } else {
            post(route('adminkampus.mitra.store'), {
                onSuccess: () => setAddOpen(false),
            });
        }
    };

    const handleTerminate = () => {
        setTerminating(true);
        router.patch(route('adminkampus.mitra.terminate', terminateTarget.id), {}, {
            onFinish: () => {
                setTerminating(false);
                setTerminateTarget(null);
            },
        });
    };

    const handleDelete = () => {
        setDeleting(true);
        router.delete(route('adminkampus.mitra.destroy', deleteTarget.id), {
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    const handleDialogClose = (open) => {
        if (!open) {
            setAddOpen(false);
            setEditTarget(null);
            reset();
        }
    };

    const activeMouCount = companies.reduce(
        (sum, c) =>
            sum +
            c.mou_documents.filter(
                (m) => m.status === 'active' && new Date(m.expires_at) >= new Date(),
            ).length,
        0,
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <h2 className="text-lg font-bold text-[#0f1f3d] m-0 tracking-tight">
                            Manajemen Mitra
                        </h2>
                        <p className="text-xs text-[#94a3b8] mt-0.5">
                            Daftar perusahaan mitra dan dokumen kerja sama (MoU)
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="default" className="text-xs">
                            {companies.length} Mitra
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                            {activeMouCount} MoU Aktif
                        </Badge>
                    </div>
                </div>
            }
        >
            <Head title="Manajemen Mitra — SITAMI" />

            <Card>
                <CardContent className="p-0">
                    <div className="flex items-center justify-between px-4 pt-4 pb-3">
                        <p className="text-xs text-[#94a3b8]">
                            Total{' '}
                            <span className="font-bold text-[#0f1f3d]">
                                {companies.length}
                            </span>{' '}
                            perusahaan mitra terdaftar
                        </p>
                        <Dialog open={addOpen} onOpenChange={handleDialogClose}>
                            <DialogTrigger asChild>
                                <Button size="sm" onClick={openAdd}>
                                    <Plus className="size-3.5" />
                                    Tambah Mitra Baru
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md bg-white">
                                <DialogHeader>
                                    <DialogTitle>{editTarget ? 'Edit Mitra' : 'Tambah Mitra Baru'}</DialogTitle>
                                </DialogHeader>

                                <form id="mitra-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="company_name">Nama Perusahaan</Label>
                                        <Input
                                            id="company_name"
                                            value={data.company_name}
                                            onChange={(e) => setData('company_name', e.target.value)}
                                            placeholder="PT. Contoh Sejahtera"
                                        />
                                        <InputError message={errors.company_name} />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="hr_email">Email HRD Perusahaan</Label>
                                        <Input
                                            id="hr_email"
                                            type="email"
                                            value={data.hr_email}
                                            onChange={(e) => setData('hr_email', e.target.value)}
                                            placeholder="hr@perusahaan.com"
                                        />
                                        <InputError message={errors.hr_email} />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label>Dokumen MoU (PDF, maks 5MB)</Label>
                                        <label
                                            htmlFor="mou_document"
                                            className="flex items-center gap-3 rounded-lg border-2 border-dashed p-3 cursor-pointer transition-colors"
                                            style={{
                                                borderColor: data.mou_document ? '#1a3560' : '#e2e8f0',
                                                background: data.mou_document ? '#e8f0fb' : '#f8fafc',
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1a3560')}
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.borderColor = data.mou_document ? '#1a3560' : '#e2e8f0')
                                            }
                                        >
                                            <div
                                                className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                                                style={{
                                                    background: data.mou_document ? '#1a3560' : '#e2e8f0',
                                                    color: data.mou_document ? '#fff' : '#94a3b8',
                                                }}
                                            >
                                                <Upload className="size-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold truncate"
                                                    style={{ color: data.mou_document ? '#1a3560' : '#64748b' }}
                                                >
                                                    {data.mou_document ? data.mou_document.name : 'Klik untuk memilih file PDF'}
                                                </p>
                                                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                                                    {editTarget ? 'Kosongkan jika tidak ingin mengganti MoU' : 'Maksimal ukuran 5MB'}
                                                </p>
                                            </div>
                                            <input
                                                id="mou_document"
                                                type="file"
                                                accept=".pdf"
                                                hidden
                                                onChange={(e) => setData('mou_document', e.target.files[0])}
                                            />
                                        </label>
                                        <InputError message={errors.mou_document} />
                                    </div>
                                </form>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => { setAddOpen(false); setEditTarget(null); reset(); }}>
                                        Batal
                                    </Button>
                                    <Button type="submit" form="mitra-form" disabled={processing}>
                                        {processing && <Loader2 className="size-3.5 animate-spin" />}
                                        {processing ? 'Menyimpan...' : (editTarget ? 'Simpan Perubahan' : 'Tambah & Kirim Email')}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Perusahaan Mitra</TableHead>
                                    <TableHead>Email HRD</TableHead>
                                    <TableHead>Tanggal Bergabung</TableHead>
                                    <TableHead>Status MoU</TableHead>
                                    <TableHead className="text-right">Dokumen MoU</TableHead>
                                    <TableHead className="text-center">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {companies.map((c) => {
                                    const latestMou = c.mou_documents?.[0] ?? null;
                                    const isExpired =
                                        latestMou?.status === 'active' &&
                                        new Date(latestMou.expires_at) < new Date();
                                    const status = isExpired ? 'expired' : (latestMou?.status ?? null);
                                    return (
                                        <TableRow key={c.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className="flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-bold"
                                                        style={{
                                                            background: '#e8f0fb',
                                                            color: '#1a3560',
                                                        }}
                                                    >
                                                        {c.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-sm" style={{ color: '#0f1f3d' }}>
                                                        {c.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm" style={{ color: '#64748b' }}>
                                                {c.user?.email ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-sm" style={{ color: '#64748b' }}>
                                                {formatDate(c.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                {status ? (
                                                    <Badge variant={statusVariant[status] ?? 'secondary'}>
                                                        {statusLabel[status] ?? status}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs" style={{ color: '#94a3b8' }}>Belum ada MoU</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {latestMou ? (
                                                    <a
                                                        href={`/storage/${latestMou.file_url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Button variant="outline" size="xs">
                                                            <FileText className="size-3" />
                                                            Lihat PDF
                                                        </Button>
                                                    </a>
                                                ) : (
                                                    <span className="text-xs" style={{ color: '#94a3b8' }}>—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button variant="ghost" size="xs" onClick={() => openEdit(c)} title="Edit">
                                                        <Pencil className="size-3.5" />
                                                    </Button>
                                                    {status === 'terminated' || !status ? (
                                                        <Button variant="ghost" size="xs" onClick={() => setDeleteTarget(c)} title="Hapus">
                                                            <Trash2 className="size-3.5 text-red-500" />
                                                        </Button>
                                                    ) : (
                                                        <Button variant="ghost" size="xs" onClick={() => setTerminateTarget(c.mou_documents?.[0] ?? c)} title="Akhiri MoU">
                                                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-orange-500">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                            </svg>
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {companies.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-sm text-muted-foreground">
                                            Belum ada mitra terdaftar.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Terminate MoU Dialog */}
            <Dialog open={!!terminateTarget} onOpenChange={(open) => { if (!open) setTerminateTarget(null); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Akhiri MoU</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-3 items-start">
                        <div
                            className="flex size-10 shrink-0 items-center justify-center rounded-full"
                            style={{ background: '#fff1f2', color: '#dc2626' }}
                        >
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-[#0f1f3d] mb-1">
                                Akhiri MoU perusahaan mitra ini?
                            </p>
                            <p className="text-xs text-[#64748b] leading-relaxed">
                                Status MoU akan berubah menjadi <strong>Diakhiri</strong> dan tidak dapat
                                diaktifkan kembali secara otomatis.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTerminateTarget(null)}>
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleTerminate}
                            disabled={terminating}
                        >
                            {terminating && <Loader2 className="size-3.5 animate-spin" />}
                            {terminating ? 'Mengakhiri...' : 'Ya, Akhiri MoU'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Company Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus Mitra</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-3 items-start">
                        <div
                            className="flex size-10 shrink-0 items-center justify-center rounded-full"
                            style={{ background: '#fef2f2', color: '#dc2626' }}
                        >
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-[#0f1f3d] mb-1">
                                Hapus mitra ini secara permanen?
                            </p>
                            <p className="text-xs text-[#64748b] leading-relaxed">
                                Akun <strong>{deleteTarget?.name}</strong> dan semua datanya
                                (termasuk MoU) akan dihapus secara permanen. Tindakan ini tidak
                                dapat dibatalkan.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting && <Loader2 className="size-3.5 animate-spin" />}
                            {deleting ? 'Menghapus...' : 'Ya, Hapus Mitra'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
