import React, { useEffect, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import InputError from '@/Components/InputError';

const roleBadge = (roleName) => {
    const map = {
        'Super Admin': { bg: '#fff0e8', color: '#c05a0a', label: 'Super Admin' },
        'Admin Kampus': { bg: '#e8f0fb', color: '#1a3560', label: 'Admin Kampus' },
        'Admin PT': { bg: '#f0f4ff', color: '#3730a3', label: 'Admin PT' },
        'Alumni': { bg: '#f0fdf4', color: '#166534', label: 'Alumni' },
    };
    const s = map[roleName] ?? { bg: '#f4f6fa', color: '#718096', label: roleName };
    return (
        <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: s.bg, color: s.color }}
        >
            {s.label}
        </span>
    );
};

const fieldStyle = (extra = {}) => ({
    height: '40px',
    padding: '0 12px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    background: '#f8fafc',
    color: '#1a3560',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    transition: 'all 0.15s',
    ...extra,
});

const handleFocus = (e) => {
    e.target.style.borderColor = '#1a3560';
    e.target.style.background = '#fff';
    e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.08)';
};
const handleBlur = (e) => {
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.background = '#f8fafc';
    e.target.style.boxShadow = 'none';
};

export default function UserIndex({ users, roles, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash.message) console.log(flash.message);
    }, [flash]);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '', email: '', password: '', password_confirmation: '', role: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('superadmin.users.index'), { search }, { preserveState: true, replace: true });
    };

    const openCreateModal = () => { reset(); clearErrors(); setIsCreateOpen(true); };
    const openEditModal = (user) => {
        reset(); clearErrors(); setSelectedUser(user);
        setData({ name: user.name, email: user.email, role: user.roles[0]?.name || '' });
        setIsEditOpen(true);
    };
    const openDeleteModal = (user) => { setSelectedUser(user); setIsDeleteOpen(true); };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('superadmin.users.store'), { onSuccess: () => setIsCreateOpen(false) });
    };
    const handleEdit = (e) => {
        e.preventDefault();
        put(route('superadmin.users.update', selectedUser.id), { onSuccess: () => setIsEditOpen(false) });
    };
    const handleDelete = () => {
        destroy(route('superadmin.users.destroy', selectedUser.id), { onSuccess: () => setIsDeleteOpen(false) });
    };

    const FieldLabel = ({ children }) => (
        <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: '#4a5568', letterSpacing: '0.08em' }}>
            {children}
        </label>
    );

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-lg font-bold" style={{ color: '#1a3560' }}>Manajemen Hak Akses</h2>
                    <p className="text-xs mt-0.5" style={{ color: '#a0aec0' }}>Kelola akun pengguna dan role sistem</p>
                </div>
            }
        >
            <Head title="Manajemen Pengguna — SITAMI" />

            <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #e8edf5' }}>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-5">
                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                        <div className="relative">
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                                style={{ color: '#a0aec0' }}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input
                                style={{ ...fieldStyle(), paddingLeft: '36px', width: '260px' }}
                                placeholder="Cari nama atau email..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 text-sm font-semibold rounded-lg transition-all"
                            style={{
                                height: '40px',
                                background: '#f4f6fa',
                                color: '#1a3560',
                                border: '1px solid #e2e8f0',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={e => e.target.style.background = '#e8edf5'}
                            onMouseLeave={e => e.target.style.background = '#f4f6fa'}
                        >
                            Cari
                        </button>
                    </form>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 text-sm font-semibold rounded-lg transition-all"
                        style={{ height: '40px', background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={e => e.target.style.background = '#ea6c0a'}
                        onMouseLeave={e => e.target.style.background = '#f97316'}
                    >
                        <span>+</span> Tambah Pengguna
                    </button>
                </div>

                {/* Table */}
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e8edf5' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f4f6fa', borderBottom: '1px solid #e8edf5' }}>
                                {['Nama', 'Email', 'Role', 'Aksi'].map((h, i) => (
                                    <th
                                        key={i}
                                        className="text-left text-xs font-bold uppercase"
                                        style={{
                                            padding: '10px 16px',
                                            color: '#1a3560',
                                            letterSpacing: '0.1em',
                                            textAlign: i === 3 ? 'right' : 'left',
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((user) => (
                                <tr
                                    key={user.id}
                                    style={{ borderBottom: '1px solid #f4f6fa' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '13px 16px' }}>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                style={{ background: '#fff3eb', color: '#f97316' }}
                                            >
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-sm" style={{ color: '#1a3560' }}>
                                                {user.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#718096' }}>
                                        {user.email}
                                    </td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.map(r => (
                                                <span key={r.id}>{roleBadge(r.name)}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="text-xs font-semibold px-3 rounded-lg transition-all"
                                                style={{
                                                    height: '32px',
                                                    border: '1px solid #e2e8f0',
                                                    background: '#f8fafc',
                                                    color: '#1a3560',
                                                    cursor: 'pointer',
                                                }}
                                                onMouseEnter={e => { e.target.style.borderColor = '#1a3560'; e.target.style.background = '#e8f0fb'; }}
                                                onMouseLeave={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(user)}
                                                className="text-xs font-semibold px-3 rounded-lg transition-all"
                                                style={{
                                                    height: '32px',
                                                    border: '1px solid #fecaca',
                                                    background: '#fff5f5',
                                                    color: '#e53e3e',
                                                    cursor: 'pointer',
                                                }}
                                                onMouseEnter={e => { e.target.style.background = '#fee2e2'; }}
                                                onMouseLeave={e => { e.target.style.background = '#fff5f5'; }}
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-sm" style={{ color: '#a0aec0' }}>
                                        Tidak ada data pengguna ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ===== MODAL TAMBAH ===== */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle style={{ color: '#1a3560' }}>Tambah Pengguna Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4 pt-1">
                        <div>
                            <FieldLabel>Nama Lengkap</FieldLabel>
                            <input style={fieldStyle()} placeholder="Nama Lengkap" value={data.name}
                                onChange={e => setData('name', e.target.value)} onFocus={handleFocus} onBlur={handleBlur} />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <FieldLabel>Email</FieldLabel>
                            <input type="email" style={fieldStyle()} placeholder="Email" value={data.email}
                                onChange={e => setData('email', e.target.value)} onFocus={handleFocus} onBlur={handleBlur} />
                            <InputError message={errors.email} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <FieldLabel>Password</FieldLabel>
                                <input type="password" style={fieldStyle()} placeholder="Password" value={data.password}
                                    onChange={e => setData('password', e.target.value)} onFocus={handleFocus} onBlur={handleBlur} />
                                <InputError message={errors.password} className="mt-1" />
                            </div>
                            <div>
                                <FieldLabel>Konfirmasi</FieldLabel>
                                <input type="password" style={fieldStyle()} placeholder="Konfirmasi Password"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    onFocus={handleFocus} onBlur={handleBlur} />
                            </div>
                        </div>
                        <div>
                            <FieldLabel>Role / Hak Akses</FieldLabel>
                            <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                                <SelectTrigger style={{ height: '40px', borderRadius: '8px' }}>
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.role} className="mt-1" />
                        </div>
                        <DialogFooter>
                            <button type="button" onClick={() => setIsCreateOpen(false)}
                                className="px-4 text-sm rounded-lg" style={{ height: '38px', color: '#718096', cursor: 'pointer', background: 'transparent', border: '1px solid #e2e8f0' }}>
                                Batal
                            </button>
                            <button type="submit" disabled={processing}
                                className="px-5 text-sm font-semibold rounded-lg"
                                style={{ height: '38px', background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', opacity: processing ? 0.6 : 1 }}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ===== MODAL EDIT ===== */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle style={{ color: '#1a3560' }}>Edit Pengguna</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4 pt-1">
                        <div>
                            <FieldLabel>Nama Lengkap</FieldLabel>
                            <input style={fieldStyle()} placeholder="Nama Lengkap" value={data.name}
                                onChange={e => setData('name', e.target.value)} onFocus={handleFocus} onBlur={handleBlur} />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <FieldLabel>Email</FieldLabel>
                            <input type="email" style={fieldStyle()} placeholder="Email" value={data.email}
                                onChange={e => setData('email', e.target.value)} onFocus={handleFocus} onBlur={handleBlur} />
                            <InputError message={errors.email} className="mt-1" />
                        </div>
                        <div>
                            <FieldLabel>Role / Hak Akses</FieldLabel>
                            <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                                <SelectTrigger style={{ height: '40px', borderRadius: '8px' }}>
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.role} className="mt-1" />
                        </div>
                        <DialogFooter>
                            <button type="button" onClick={() => setIsEditOpen(false)}
                                className="px-4 text-sm rounded-lg" style={{ height: '38px', color: '#718096', cursor: 'pointer', background: 'transparent', border: '1px solid #e2e8f0' }}>
                                Batal
                            </button>
                            <button type="submit" disabled={processing}
                                className="px-5 text-sm font-semibold rounded-lg"
                                style={{ height: '38px', background: '#1a3560', color: '#fff', border: 'none', cursor: 'pointer', opacity: processing ? 0.6 : 1 }}>
                                {processing ? 'Memperbarui...' : 'Perbarui'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ===== MODAL HAPUS ===== */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle style={{ color: '#1a3560' }}>Konfirmasi Hapus</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <div
                            className="flex items-start gap-3 p-4 rounded-lg"
                            style={{ background: '#fff5f5', border: '1px solid #fecaca' }}
                        >
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#e53e3e' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            <p className="text-sm" style={{ color: '#c53030' }}>
                                Apakah Anda yakin ingin menghapus pengguna{' '}
                                <strong>{selectedUser?.name}</strong>?
                                Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <button type="button" onClick={() => setIsDeleteOpen(false)}
                            className="px-4 text-sm rounded-lg" style={{ height: '38px', color: '#718096', cursor: 'pointer', background: 'transparent', border: '1px solid #e2e8f0' }}>
                            Batal
                        </button>
                        <button onClick={handleDelete} disabled={processing}
                            className="px-5 text-sm font-semibold rounded-lg"
                            style={{ height: '38px', background: '#e53e3e', color: '#fff', border: 'none', cursor: 'pointer', opacity: processing ? 0.6 : 1 }}>
                            {processing ? 'Menghapus...' : 'Ya, Hapus'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AuthenticatedLayout>
    );
}
