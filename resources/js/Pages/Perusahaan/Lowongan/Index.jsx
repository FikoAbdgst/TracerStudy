import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Switch } from '@/Components/ui/switch';
import InputError from '@/Components/InputError';

const fieldStyle = {
    height: '40px', padding: '0 12px', border: '1.5px solid #e2e8f0',
    borderRadius: '8px', background: '#f8fafc', color: '#1a3560',
    fontSize: '14px', outline: 'none', width: '100%', transition: 'all 0.15s',
};
const textareaStyle = {
    padding: '10px 12px', border: '1.5px solid #e2e8f0',
    borderRadius: '8px', background: '#f8fafc', color: '#1a3560',
    fontSize: '14px', outline: 'none', width: '100%', transition: 'all 0.15s',
    resize: 'vertical', minHeight: '90px',
};
const onFocus = (e) => { e.target.style.borderColor = '#1a3560'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.08)'; };
const onBlur = (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; };

const FieldLabel = ({ children, required }) => (
    <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: '#4a5568', letterSpacing: '0.08em' }}>
        {children} {required && <span style={{ color: '#e53e3e' }}>*</span>}
    </label>
);

export default function LowonganIndex({ jobs }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        title: '', location: '', salary_range: '', description: '', requirements: '',
    });

    const openCreateModal = () => { reset(); clearErrors(); setIsCreateOpen(true); };
    const openEditModal = (job) => {
        reset(); clearErrors(); setSelectedJob(job);
        setData({ title: job.title, location: job.location || '', salary_range: job.salary_range || '', description: job.description, requirements: job.requirements || '' });
        setIsEditOpen(true);
    };
    const handleCreate = (e) => { e.preventDefault(); post(route('perusahaan.lowongan.store'), { onSuccess: () => setIsCreateOpen(false) }); };
    const handleEdit = (e) => { e.preventDefault(); put(route('perusahaan.lowongan.update', selectedJob.id), { onSuccess: () => setIsEditOpen(false) }); };
    const handleDelete = (id) => { if (confirm('Yakin ingin menghapus lowongan ini?')) destroy(route('perusahaan.lowongan.destroy', id)); };
    const toggleActive = (id) => router.patch(route('perusahaan.lowongan.toggle', id), {}, { preserveScroll: true });

    const modalOpen = isCreateOpen || isEditOpen;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-lg font-bold" style={{ color: '#1a3560' }}>Kelola Lowongan Kerja</h2>
                    <p className="text-xs mt-0.5" style={{ color: '#a0aec0' }}>Posting dan kelola posisi pekerjaan perusahaan Anda</p>
                </div>
            }
        >
            <Head title="Manajemen Lowongan — SITAMI" />

            <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #e8edf5' }}>
                <div className="flex items-center justify-between mb-5">
                    <p className="text-sm" style={{ color: '#a0aec0' }}>
                        Total <span className="font-semibold" style={{ color: '#1a3560' }}>{jobs.length}</span> lowongan terdaftar
                    </p>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 text-sm font-semibold rounded-lg"
                        style={{ height: '40px', background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={e => e.target.style.background = '#ea6c0a'}
                        onMouseLeave={e => e.target.style.background = '#f97316'}
                    >
                        + Posting Lowongan
                    </button>
                </div>

                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e8edf5' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f4f6fa', borderBottom: '1px solid #e8edf5' }}>
                                {['Posisi & Gaji', 'Lokasi', 'Status', 'Aksi'].map((h, i) => (
                                    <th key={i} className="text-xs font-bold uppercase"
                                        style={{ padding: '10px 16px', color: '#1a3560', letterSpacing: '0.1em', textAlign: i === 3 ? 'right' : 'left' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(job => (
                                <tr key={job.id} style={{ borderBottom: '1px solid #f4f6fa' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '13px 16px' }}>
                                        <div className="font-semibold text-sm" style={{ color: '#1a3560' }}>{job.title}</div>
                                        {job.salary_range && (
                                            <div className="text-xs mt-0.5" style={{ color: '#a0aec0' }}>{job.salary_range}</div>
                                        )}
                                    </td>
                                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#718096' }}>
                                        {job.location || '—'}
                                    </td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <div className="flex items-center gap-2">
                                            <Switch checked={job.is_active} onCheckedChange={() => toggleActive(job.id)} />
                                            <span
                                                className="text-xs font-bold px-2.5 py-1 rounded-full"
                                                style={{
                                                    background: job.is_active ? '#f0fdf4' : '#f4f6fa',
                                                    color: job.is_active ? '#166534' : '#718096',
                                                }}
                                            >
                                                {job.is_active ? 'Dibuka' : 'Ditutup'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEditModal(job)}
                                                className="text-xs font-semibold px-3 rounded-lg"
                                                style={{ height: '32px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1a3560', cursor: 'pointer' }}
                                                onMouseEnter={e => { e.target.style.borderColor = '#1a3560'; e.target.style.background = '#e8f0fb'; }}
                                                onMouseLeave={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}>
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(job.id)}
                                                className="text-xs font-semibold px-3 rounded-lg"
                                                style={{ height: '32px', border: '1px solid #fecaca', background: '#fff5f5', color: '#e53e3e', cursor: 'pointer' }}
                                                onMouseEnter={e => e.target.style.background = '#fee2e2'}
                                                onMouseLeave={e => e.target.style.background = '#fff5f5'}>
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {jobs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-sm" style={{ color: '#a0aec0' }}>
                                        Belum ada lowongan yang diposting.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah / Edit */}
            <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) { setIsCreateOpen(false); setIsEditOpen(false); } }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle style={{ color: '#1a3560' }}>
                            {isEditOpen ? 'Edit Lowongan' : 'Posting Lowongan Baru'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={isEditOpen ? handleEdit : handleCreate} className="space-y-4 pt-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <FieldLabel required>Posisi Pekerjaan</FieldLabel>
                                <input style={fieldStyle} value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder="Contoh: Frontend Developer"
                                    onFocus={onFocus} onBlur={onBlur} />
                                <InputError message={errors.title} className="mt-1" />
                            </div>
                            <div>
                                <FieldLabel>Rentang Gaji</FieldLabel>
                                <input style={fieldStyle} value={data.salary_range}
                                    onChange={e => setData('salary_range', e.target.value)}
                                    placeholder="Rp 5.000.000 – Rp 7.000.000"
                                    onFocus={onFocus} onBlur={onBlur} />
                            </div>
                        </div>
                        <div>
                            <FieldLabel>Lokasi Penempatan</FieldLabel>
                            <input style={fieldStyle} value={data.location}
                                onChange={e => setData('location', e.target.value)}
                                placeholder="Contoh: Bandung, Jawa Barat (WFO/Remote)"
                                onFocus={onFocus} onBlur={onBlur} />
                        </div>
                        <div>
                            <FieldLabel required>Deskripsi Pekerjaan</FieldLabel>
                            <textarea style={textareaStyle} rows={4} value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                placeholder="Tanggung jawab utama posisi ini..."
                                onFocus={onFocus} onBlur={onBlur} />
                            <InputError message={errors.description} className="mt-1" />
                        </div>
                        <div>
                            <FieldLabel>Persyaratan</FieldLabel>
                            <textarea style={textareaStyle} rows={4} value={data.requirements}
                                onChange={e => setData('requirements', e.target.value)}
                                placeholder="Kualifikasi yang dibutuhkan..."
                                onFocus={onFocus} onBlur={onBlur} />
                        </div>
                        <DialogFooter>
                            <button type="button" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }}
                                className="px-4 text-sm rounded-lg"
                                style={{ height: '38px', color: '#718096', cursor: 'pointer', background: 'transparent', border: '1px solid #e2e8f0' }}>
                                Batal
                            </button>
                            <button type="submit" disabled={processing}
                                className="px-5 text-sm font-semibold rounded-lg"
                                style={{ height: '38px', background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', opacity: processing ? 0.6 : 1 }}>
                                {processing ? 'Menyimpan...' : 'Simpan Lowongan'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
