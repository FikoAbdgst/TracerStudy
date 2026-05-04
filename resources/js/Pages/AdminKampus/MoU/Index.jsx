import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import InputError from '@/Components/InputError';

const fieldStyle = {
    height: '40px', padding: '0 12px', border: '1.5px solid #e2e8f0',
    borderRadius: '8px', background: '#f8fafc', color: '#1a3560',
    fontSize: '14px', outline: 'none', width: '100%', transition: 'all 0.15s',
};
const onFocus = (e) => { e.target.style.borderColor = '#1a3560'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.08)'; };
const onBlur = (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; };

const FieldLabel = ({ children }) => (
    <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: '#4a5568', letterSpacing: '0.08em' }}>
        {children}
    </label>
);

const mouStatusMap = {
    active: { bg: '#f0fdf4', color: '#166534', label: 'Aktif' },
    expired: { bg: '#fff5f5', color: '#c53030', label: 'Kadaluwarsa' },
    terminated: { bg: '#f4f6fa', color: '#718096', label: 'Diakhiri' },
};

const MouStatusBadge = ({ status, expiresAt }) => {
    const isExpired = status === 'active' && new Date(expiresAt) < new Date();
    const key = isExpired ? 'expired' : status;
    const s = mouStatusMap[key] ?? mouStatusMap.active;
    return (
        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: s.bg, color: s.color }}>
            {s.label}
        </span>
    );
};

export default function MoUIndex({ mous, companies }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        company_id: '', file: null, signed_at: '', expires_at: '',
    });

    const openCreateModal = () => { reset(); clearErrors(); setIsModalOpen(true); };

    const handleUpload = (e) => {
        e.preventDefault();
        post(route('adminkampus.mou.store'), { onSuccess: () => setIsModalOpen(false) });
    };

    const handleTerminate = (id) => {
        if (confirm('Yakin ingin mengakhiri kerja sama ini?')) {
            router.patch(route('adminkampus.mou.terminate', id));
        }
    };

    const formatDate = (d) => d ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d)) : '—';

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-lg font-bold" style={{ color: '#1a3560' }}>Manajemen Kerja Sama (MoU)</h2>
                    <p className="text-xs mt-0.5" style={{ color: '#a0aec0' }}>
                        Arsip dan pelacakan masa berlaku dokumen MoU perusahaan mitra
                    </p>
                </div>
            }
        >
            <Head title="Dokumen MoU — SITAMI" />

            <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #e8edf5' }}>
                <div className="flex items-center justify-between mb-5">
                    <p className="text-sm" style={{ color: '#a0aec0' }}>
                        Total <span className="font-semibold" style={{ color: '#1a3560' }}>{mous.length}</span> dokumen MoU
                    </p>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 text-sm font-semibold rounded-lg"
                        style={{ height: '40px', background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={e => e.target.style.background = '#ea6c0a'}
                        onMouseLeave={e => e.target.style.background = '#f97316'}
                    >
                        + Unggah MoU Baru
                    </button>
                </div>

                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e8edf5' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f4f6fa', borderBottom: '1px solid #e8edf5' }}>
                                {['Perusahaan Mitra', 'Tgl. Penandatanganan', 'Berlaku Sampai', 'Dokumen', 'Status', 'Aksi'].map((h, i) => (
                                    <th key={i} className="text-xs font-bold uppercase"
                                        style={{ padding: '10px 16px', color: '#1a3560', letterSpacing: '0.1em', textAlign: i === 5 ? 'right' : 'left' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {mous.map(mou => (
                                <tr key={mou.id} style={{ borderBottom: '1px solid #f4f6fa' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '13px 16px' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                style={{ background: '#e8f0fb', color: '#1a3560' }}>
                                                {(mou.company?.name ?? 'P').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="font-semibold text-sm" style={{ color: '#1a3560' }}>
                                                {mou.company?.name ?? 'Perusahaan Dihapus'}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#4a5568' }}>
                                        {formatDate(mou.signed_at)}
                                    </td>
                                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#4a5568' }}>
                                        {formatDate(mou.expires_at)}
                                    </td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <a href={`/storage/${mou.file_url}`} target="_blank"
                                            className="text-xs font-semibold flex items-center gap-1.5"
                                            style={{ color: '#f97316', textDecoration: 'none' }}>
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                            </svg>
                                            Unduh PDF
                                        </a>
                                    </td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <MouStatusBadge status={mou.status} expiresAt={mou.expires_at} />
                                    </td>
                                    <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                                        {mou.status === 'active' && (
                                            <button
                                                onClick={() => handleTerminate(mou.id)}
                                                className="text-xs font-semibold px-3 rounded-lg"
                                                style={{ height: '32px', border: '1px solid #fecaca', background: '#fff5f5', color: '#e53e3e', cursor: 'pointer' }}
                                                onMouseEnter={e => e.target.style.background = '#fee2e2'}
                                                onMouseLeave={e => e.target.style.background = '#fff5f5'}
                                            >
                                                Akhiri
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {mous.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-sm" style={{ color: '#a0aec0' }}>
                                        Belum ada dokumen MoU yang diunggah.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Upload MoU */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle style={{ color: '#1a3560' }}>Unggah Dokumen MoU</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpload} className="space-y-4 pt-1">
                        <div>
                            <FieldLabel>Perusahaan Mitra</FieldLabel>
                            <Select value={data.company_id} onValueChange={v => setData('company_id', v)}>
                                <SelectTrigger style={{ height: '40px', borderRadius: '8px' }}>
                                    <SelectValue placeholder="Pilih perusahaan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.company_id} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <FieldLabel>Tanggal Penandatanganan</FieldLabel>
                                <input type="date" style={fieldStyle} value={data.signed_at}
                                    onChange={e => setData('signed_at', e.target.value)}
                                    onFocus={onFocus} onBlur={onBlur} />
                                <InputError message={errors.signed_at} className="mt-1" />
                            </div>
                            <div>
                                <FieldLabel>Berlaku Sampai</FieldLabel>
                                <input type="date" style={fieldStyle} value={data.expires_at}
                                    onChange={e => setData('expires_at', e.target.value)}
                                    onFocus={onFocus} onBlur={onBlur} />
                                <InputError message={errors.expires_at} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <FieldLabel>File Dokumen (PDF, Maks 5MB)</FieldLabel>
                            <div
                                className="rounded-lg px-4 py-3 flex items-center gap-3"
                                style={{ border: '1.5px dashed #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}
                            >
                                <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#a0aec0' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                <div className="flex-1">
                                    <div className="text-xs font-semibold" style={{ color: '#4a5568' }}>
                                        {data.file ? data.file.name : 'Klik untuk memilih file PDF'}
                                    </div>
                                    <div className="text-xs" style={{ color: '#a0aec0' }}>Maksimal ukuran 5MB</div>
                                </div>
                                <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                    style={{ position: 'absolute', opacity: 0 }}
                                    onChange={e => setData('file', e.target.files[0])} />
                            </div>
                            <InputError message={errors.file} className="mt-1" />
                        </div>
                        <DialogFooter>
                            <button type="button" onClick={() => setIsModalOpen(false)}
                                className="px-4 text-sm rounded-lg"
                                style={{ height: '38px', color: '#718096', cursor: 'pointer', background: 'transparent', border: '1px solid #e2e8f0' }}>
                                Batal
                            </button>
                            <button type="submit" disabled={processing}
                                className="px-5 text-sm font-semibold rounded-lg"
                                style={{ height: '38px', background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', opacity: processing ? 0.6 : 1 }}>
                                {processing ? 'Mengunggah...' : 'Unggah & Simpan'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
