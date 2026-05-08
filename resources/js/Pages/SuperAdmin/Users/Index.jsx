import React, { useEffect, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import InputError from '@/Components/InputError';

/* ─── Styled Modal Component ─────────────────────────────────────────────── */
function Modal({ open, onClose, title, children, footer }) {
    const [visible, setVisible] = useState(false);
    const [render, setRender] = useState(false);

    useEffect(() => {
        if (open) {
            setRender(true);
            requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
        } else {
            setVisible(false);
            const t = setTimeout(() => setRender(false), 260);
            return () => clearTimeout(t);
        }
    }, [open]);

    if (!render) return null;

    return (
        <>
            <style>{`
                /* Radix portal must always be above everything */
                [data-radix-popper-content-wrapper] { z-index: 99999 !important; }

                .modal-backdrop {
                    position: fixed; inset: 0;
                    z-index: 9000;
                    display: flex; align-items: center; justify-content: center;
                    padding: 20px;
                    transition: opacity 0.25s ease;
                }
                .modal-backdrop.in  { opacity: 1; }
                .modal-backdrop.out { opacity: 0; }

                /* Blur lives in a SEPARATE absolute div */
                .modal-backdrop::before {
                    content: '';
                    position: absolute; inset: 0;
                    background: rgba(10, 20, 40, 0.45);
                    backdrop-filter: blur(3px);
                    pointer-events: none;
                }

                .modal-box {
                    position: relative;
                    background: #ffffff;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 480px;
                    box-shadow: 0 24px 60px rgba(10,20,40,0.2), 0 4px 12px rgba(10,20,40,0.08);
                    transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1);
                }
                .modal-box.in  { opacity: 1; transform: translateY(0) scale(1); }
                .modal-box.out { opacity: 0; transform: translateY(10px) scale(0.97); }

                .modal-header {
                    padding: 22px 24px 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .modal-title {
                    font-size: 16px;
                    font-weight: 800;
                    color: #0f1f3d;
                    letter-spacing: -0.01em;
                }
                .modal-close {
                    width: 30px; height: 30px;
                    border-radius: 7px;
                    border: none;
                    background: #f0f4f9;
                    color: #64748b;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                    transition: background 0.15s, color 0.15s;
                }
                .modal-close:hover { background: #e2e8f0; color: #1a3560; }

                .modal-body {
                    padding: 20px 24px;
                }

                .modal-footer {
                    padding: 0 24px 20px;
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                }

                .modal-divider {
                    height: 1px;
                    background: #f1f5f9;
                    margin: 0 24px 16px;
                }
            `}</style>

            <div
                className={`modal-backdrop ${visible ? 'in' : 'out'}`}
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div className={`modal-box ${visible ? 'in' : 'out'}`}>
                    <div className="modal-header">
                        <span className="modal-title">{title}</span>
                        <button className="modal-close" onClick={onClose}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="modal-body">{children}</div>
                    {footer && (
                        <>
                            <div className="modal-divider" />
                            <div className="modal-footer">{footer}</div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

/* ─── Role badge ─────────────────────────────────────────────────────────── */
const roleBadge = (roleName) => {
    const map = {
        'Super Admin': { bg: '#fff3eb', color: '#c05a0a' },
        'Admin Kampus': { bg: '#e8f0fb', color: '#1a3560' },
        'Admin PT': { bg: '#f0f4ff', color: '#3730a3' },
        'Alumni': { bg: '#f0fdf4', color: '#166534' },
    };
    const s = map[roleName] ?? { bg: '#f4f6fa', color: '#718096' };
    return (
        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
            {roleName}
        </span>
    );
};

/* ─── Shared field helpers ────────────────────────────────────────────────── */
const fieldBase = {
    height: '42px', padding: '0 13px',
    border: '1.5px solid #e2e8f0', borderRadius: '9px',
    background: '#f8fafc', color: '#0f1f3d',
    fontSize: '13.5px', outline: 'none',
    width: '100%', transition: 'border-color 0.18s, background 0.18s, box-shadow 0.18s',
    fontFamily: 'inherit',
};

const onFocus = (e) => {
    e.target.style.borderColor = '#1a3560';
    e.target.style.background = '#fff';
    e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)';
};
const onBlur = (e) => {
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.background = '#f8fafc';
    e.target.style.boxShadow = 'none';
};

const FieldLabel = ({ children }) => (
    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#374151', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '5px' }}>
        {children}
    </label>
);

// PERBAIKAN: Menambahkan ...props agar atribut seperti form="create-form" bisa masuk ke tag <button>
const BtnPrimary = ({ children, disabled, style = {}, ...props }) => (
    <button
        type="submit"
        disabled={disabled}
        style={{
            height: '38px', padding: '0 20px',
            background: disabled ? '#94a3b8' : '#1a3560',
            color: '#fff', border: 'none', borderRadius: '9px',
            fontSize: '13px', fontWeight: 700, fontFamily: 'inherit',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s, box-shadow 0.15s',
            ...style,
        }}
        onMouseEnter={e => { if (!disabled) e.target.style.background = '#0f2444'; }}
        onMouseLeave={e => { if (!disabled) e.target.style.background = style.background || '#1a3560'; }}
        {...props}
    >
        {children}
    </button>
);

const BtnGhost = ({ children, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        style={{
            height: '38px', padding: '0 16px',
            background: 'transparent', color: '#64748b',
            border: '1.5px solid #e2e8f0', borderRadius: '9px',
            fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
            cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f0f4f9'; e.currentTarget.style.borderColor = '#d1d9e3'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
    >
        {children}
    </button>
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
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

    const openCreate = () => { reset(); clearErrors(); setIsCreateOpen(true); };
    const openEdit = (user) => {
        reset(); clearErrors(); setSelectedUser(user);
        setData({ name: user.name, email: user.email, role: user.roles[0]?.name || '' });
        setIsEditOpen(true);
    };
    const openDelete = (user) => { setSelectedUser(user); setIsDeleteOpen(true); };

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

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f1f3d', margin: 0 }}>Manajemen Hak Akses</h2>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0' }}>Kelola akun pengguna dan role sistem</p>
                </div>
            }
        >
            <Head title="Manajemen Pengguna — SITAMI" />

            <style>{`
                .ui-card { background: #fff; border: 1px solid #e8edf5; border-radius: 14px; padding: 20px; }
                .tbl-head { background: #f8fafc; border-bottom: 1px solid #e8edf5; }
                .tbl-th { padding: 10px 16px; font-size: 11px; font-weight: 700; color: #374151; letter-spacing: 0.08em; text-transform: uppercase; }
                .tbl-row { border-bottom: 1px solid #f1f5f9; transition: background 0.12s; }
                .tbl-row:hover { background: #fafbfc; }
                .tbl-td { padding: 14px 16px; font-size: 13.5px; color: #334155; }
                .act-btn { height: 30px; padding: 0 14px; border-radius: 7px; font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.15s; }
            `}</style>

            <div className="ui-card">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-5">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div style={{ position: 'relative' }}>
                            <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input
                                style={{ ...fieldBase, paddingLeft: '34px', width: '240px' }}
                                placeholder="Cari nama atau email..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onFocus={onFocus} onBlur={onBlur}
                            />
                        </div>
                        <button
                            type="submit"
                            style={{ height: '42px', padding: '0 16px', borderRadius: '9px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f0f4f9'}
                            onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                        >
                            Cari
                        </button>
                    </form>

                    <button
                        onClick={openCreate}
                        style={{ height: '42px', padding: '0 18px', borderRadius: '9px', background: '#f97316', color: '#fff', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.15s, box-shadow 0.15s', boxShadow: '0 2px 8px rgba(249,115,22,0.25)', fontFamily: 'inherit' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(249,115,22,0.35)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(249,115,22,0.25)'; }}
                    >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Tambah Pengguna
                    </button>
                </div>

                {/* Table */}
                <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e8edf5' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr className="tbl-head">
                                {['Nama', 'Email', 'Role', 'Aksi'].map((h, i) => (
                                    <th key={i} className="tbl-th" style={{ textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((user) => (
                                <tr key={user.id} className="tbl-row">
                                    <td className="tbl-td">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff3eb', color: '#f97316', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600, fontSize: 13.5, color: '#0f1f3d' }}>{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="tbl-td" style={{ color: '#64748b', fontSize: 13 }}>{user.email}</td>
                                    <td className="tbl-td">
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                            {user.roles.map(r => <span key={r.id}>{roleBadge(r.name)}</span>)}
                                        </div>
                                    </td>
                                    <td className="tbl-td" style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                            <button
                                                className="act-btn"
                                                onClick={() => openEdit(user)}
                                                style={{ border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1a3560' }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#1a3560'; e.currentTarget.style.background = '#e8f0fb'; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="act-btn"
                                                onClick={() => openDelete(user)}
                                                style={{ border: '1.5px solid #fecaca', background: '#fff5f5', color: '#dc2626' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#fff5f5'}
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: '48px 16px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
                                        Tidak ada data pengguna ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Modal Tambah ── */}
            <Modal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Tambah Pengguna Baru"
                footer={
                    <>
                        <BtnGhost onClick={() => setIsCreateOpen(false)}>Batal</BtnGhost>
                        {/* PERBAIKAN: Tambahkan atribut form="create-form" untuk mengikat tombol dengan form */}
                        <BtnPrimary form="create-form" disabled={processing} style={{ background: '#f97316' }}
                            onMouseEnter={e => { if (!processing) e.target.style.background = '#ea6c0a'; }}
                            onMouseLeave={e => { if (!processing) e.target.style.background = '#f97316'; }}
                        >
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </BtnPrimary>
                    </>
                }
            >
                <form id="create-form" onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <FieldLabel>Nama Lengkap</FieldLabel>
                        <input style={fieldBase} placeholder="Nama Lengkap" value={data.name}
                            onChange={e => setData('name', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                        <InputError message={errors.name} className="mt-1" />
                    </div>
                    <div>
                        <FieldLabel>Email</FieldLabel>
                        <input type="email" style={fieldBase} placeholder="Email" value={data.email}
                            onChange={e => setData('email', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                        <InputError message={errors.email} className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel>Password</FieldLabel>
                            <input type="password" style={fieldBase} placeholder="Password" value={data.password}
                                onChange={e => setData('password', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                            <InputError message={errors.password} className="mt-1" />
                        </div>
                        <div>
                            <FieldLabel>Konfirmasi</FieldLabel>
                            <input type="password" style={fieldBase} placeholder="Ulangi Password"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                onFocus={onFocus} onBlur={onBlur} />
                        </div>
                    </div>
                    <div>
                        <FieldLabel>Role / Hak Akses</FieldLabel>
                        <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                            <SelectTrigger className="focus:ring-0 focus:ring-offset-0" style={{ height: '42px', borderRadius: '9px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '13.5px' }}>
                                <SelectValue placeholder="Pilih Role" />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={4} className="z-[500] rounded-xl overflow-hidden border border-gray-200 shadow-xl" style={{ background: "#ffffff", minWidth: "var(--radix-select-trigger-width)" }}>
                                {roles.map(r => <SelectItem className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50" style={{ color: "#1e293b", background: "transparent" }} key={r.id} value={r.name}>{r.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role} className="mt-1" />
                    </div>
                    {/* Invisible submit button (bisa tetap ada agar user bisa menekan Enter) */}
                    <button type="submit" style={{ display: 'none' }} />
                </form>
            </Modal>

            {/* ── Modal Edit ── */}
            <Modal
                open={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title="Edit Pengguna"
                footer={
                    <>
                        <BtnGhost onClick={() => setIsEditOpen(false)}>Batal</BtnGhost>
                        {/* PERBAIKAN: Menambahkan atribut form="edit-form" */}
                        <BtnPrimary form="edit-form" disabled={processing}>
                            {processing ? 'Memperbarui...' : 'Perbarui'}
                        </BtnPrimary>
                    </>
                }
            >
                {/* PERBAIKAN: Menambahkan id="edit-form" */}
                <form id="edit-form" onSubmit={handleEdit} className="space-y-4">
                    <div>
                        <FieldLabel>Nama Lengkap</FieldLabel>
                        <input style={fieldBase} placeholder="Nama Lengkap" value={data.name}
                            onChange={e => setData('name', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                        <InputError message={errors.name} className="mt-1" />
                    </div>
                    <div>
                        <FieldLabel>Email</FieldLabel>
                        <input type="email" style={fieldBase} placeholder="Email" value={data.email}
                            onChange={e => setData('email', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                        <InputError message={errors.email} className="mt-1" />
                    </div>
                    <div>
                        <FieldLabel>Role / Hak Akses</FieldLabel>
                        <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                            <SelectTrigger className="focus:ring-0 focus:ring-offset-0" style={{ height: '42px', borderRadius: '9px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '13.5px' }}>
                                <SelectValue placeholder="Pilih Role" />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={4} className="z-[500] rounded-xl overflow-hidden border border-gray-200 shadow-xl" style={{ background: "#ffffff", minWidth: "var(--radix-select-trigger-width)" }}>
                                {roles.map(r => <SelectItem className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50" style={{ color: "#1e293b", background: "transparent" }} key={r.id} value={r.name}>{r.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role} className="mt-1" />
                    </div>
                    <button type="submit" style={{ display: 'none' }} />
                </form>
            </Modal>

            {/* ── Modal Hapus ── */}
            <Modal
                open={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                title="Konfirmasi Hapus"
                footer={
                    <>
                        <BtnGhost onClick={() => setIsDeleteOpen(false)}>Batal</BtnGhost>
                        <button
                            onClick={handleDelete}
                            disabled={processing}
                            style={{
                                height: '38px', padding: '0 20px',
                                background: processing ? '#fca5a5' : '#dc2626',
                                color: '#fff', border: 'none', borderRadius: '9px',
                                fontSize: '13px', fontWeight: 700, fontFamily: 'inherit',
                                cursor: processing ? 'not-allowed' : 'pointer',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { if (!processing) e.currentTarget.style.background = '#b91c1c'; }}
                            onMouseLeave={e => { if (!processing) e.currentTarget.style.background = '#dc2626'; }}
                        >
                            {processing ? 'Menghapus...' : 'Ya, Hapus'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '4px 0' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff1f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#0f1f3d', margin: '0 0 4px' }}>
                            Hapus pengguna <em style={{ fontStyle: 'normal', color: '#dc2626' }}>{selectedUser?.name}</em>?
                        </p>
                        <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                            Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                        </p>
                    </div>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}
