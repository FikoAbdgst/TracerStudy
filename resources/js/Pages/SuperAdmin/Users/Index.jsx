import React, { useEffect, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import InputError from '@/Components/InputError';

export default function UserIndex({ users, roles, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    // State untuk kontrol Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const { flash } = usePage().props;

    useEffect(() => {
        if (flash.message) {
            // Kamu bisa menggunakan library toast seperti sonner atau react-hot-toast
            console.log(flash.message);
        }
    }, [flash]);

    // Form Handle menggunakan Inertia
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
    });

    // Fungsi Pencarian (Debounce manual sederhana)
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('superadmin.users.index'), { search }, { preserveState: true, replace: true });
    };

    // --- HANDLER MODAL ---
    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateOpen(true);
    };

    const openEditModal = (user) => {
        reset();
        clearErrors();
        setSelectedUser(user);
        setData({
            name: user.name,
            email: user.email,
            role: user.roles[0]?.name || '', // Ambil role pertama
        });
        setIsEditOpen(true);
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setIsDeleteOpen(true);
    };

    // --- HANDLER SUBMIT ---
    const handleCreate = (e) => {
        e.preventDefault();
        post(route('superadmin.users.store'), {
            onSuccess: () => setIsCreateOpen(false),
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        put(route('superadmin.users.update', selectedUser.id), {
            onSuccess: () => setIsEditOpen(false),
        });
    };

    const handleDelete = () => {
        destroy(route('superadmin.users.destroy', selectedUser.id), {
            onSuccess: () => setIsDeleteOpen(false),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manajemen Hak Akses</h2>}>
            <Head title="Manajemen Pengguna" />

            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    {/* Form Pencarian */}
                    <form onSubmit={handleSearch} className="flex w-full md:w-1/3 gap-2">
                        <Input
                            placeholder="Cari nama atau email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button type="submit" variant="secondary">Cari</Button>
                    </form>

                    {/* Tombol Tambah */}
                    <Button onClick={openCreateModal}>+ Tambah Pengguna</Button>
                </div>

                {/* Tabel Data */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        {user.roles.map((r) => (
                                            <Badge key={r.id} variant={r.name === 'Super Admin' ? 'destructive' : 'default'}>
                                                {r.name}
                                            </Badge>
                                        ))}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => openEditModal(user)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => openDeleteModal(user)}>Hapus</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500 py-6">Tidak ada data ditemukan.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* --- MODAL TAMBAH USER --- */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <Input placeholder="Nama Lengkap" value={data.name} onChange={e => setData('name', e.target.value)} />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <Input type="email" placeholder="Email" value={data.email} onChange={e => setData('email', e.target.value)} />
                            <InputError message={errors.email} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input type="password" placeholder="Password" value={data.password} onChange={e => setData('password', e.target.value)} />
                                <InputError message={errors.password} className="mt-1" />
                            </div>
                            <div>
                                <Input type="password" placeholder="Konfirmasi Password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Role / Hak Akses" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.role} className="mt-1" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- MODAL EDIT USER --- */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Pengguna</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div>
                            <Input placeholder="Nama Lengkap" value={data.name} onChange={e => setData('name', e.target.value)} />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <Input type="email" placeholder="Email" value={data.email} onChange={e => setData('email', e.target.value)} />
                            <InputError message={errors.email} className="mt-1" />
                        </div>
                        <div>
                            <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Role / Hak Akses" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.role} className="mt-1" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>Perbarui</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- MODAL HAPUS USER --- */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        Apakah Anda yakin ingin menghapus pengguna <strong>{selectedUser?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={processing}>Ya, Hapus</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AuthenticatedLayout>
    );
}
