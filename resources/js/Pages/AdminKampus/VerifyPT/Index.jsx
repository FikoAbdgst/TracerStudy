import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

const statusMap = {
    verified: { bg: '#f0fdf4', color: '#166534', label: 'Terverifikasi' },
    rejected: { bg: '#fff5f5', color: '#c53030', label: 'Ditolak' },
    pending: { bg: '#fff3eb', color: '#92400e', label: 'Menunggu' },
};

const StatusBadge = ({ status }) => {
    const s = statusMap[status] ?? statusMap.pending;
    return (
        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: s.bg, color: s.color }}>
            {s.label}
        </span>
    );
};

export default function VerifyPTIndex({ companies }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);

    const { data, setData, patch, processing } = useForm({ verification_status: '' });

    const filtered = companies.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.industry && c.industry.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const openVerifyModal = (company) => {
        setSelectedCompany(company);
        setData('verification_status', company.verification_status);
        setIsModalOpen(true);
    };

    const submitStatus = (e) => {
        e.preventDefault();
        patch(route('adminkampus.verify-pt.status', selectedCompany.id), {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-lg font-bold" style={{ color: '#1a3560' }}>Verifikasi Perusahaan Mitra</h2>
                    <p className="text-xs mt-0.5" style={{ color: '#a0aec0' }}>
                        Tinjau legalitas perusahaan sebelum dapat memposting lowongan
                    </p>
                </div>
            }
        >
            <Head title="Verifikasi PT — SITAMI" />

            <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #e8edf5' }}>
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
                    <div className="text-sm" style={{ color: '#a0aec0' }}>
                        <span className="font-semibold" style={{ color: '#1a3560' }}>{filtered.length}</span> perusahaan ditemukan
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a0aec0' }}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            style={{
                                height: '40px', padding: '0 12px 0 36px', border: '1.5px solid #e2e8f0',
                                borderRadius: '8px', background: '#f8fafc', color: '#1a3560', fontSize: '14px',
                                outline: 'none', width: '260px', transition: 'all 0.15s',
                            }}
                            placeholder="Cari nama atau industri..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onFocus={e => { e.target.style.borderColor = '#1a3560'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.08)'; }}
                            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e8edf5' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f4f6fa', borderBottom: '1px solid #e8edf5' }}>
                                {['Perusahaan', 'Sektor Industri', 'Website', 'Status', 'Aksi'].map((h, i) => (
                                    <th key={i} className="text-xs font-bold uppercase"
                                        style={{ padding: '10px 16px', color: '#1a3560', letterSpacing: '0.1em', textAlign: i === 4 ? 'right' : 'left' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(company => (
                                <tr key={company.id} style={{ borderBottom: '1px solid #f4f6fa' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '13px 16px' }}>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                style={{ background: '#e8f0fb', color: '#1a3560' }}
                                            >
                                                {company.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm" style={{ color: '#1a3560' }}>
                                                    {company.name}
                                                </div>
                                                <div className="text-xs" style={{ color: '#a0aec0' }}>
                                                    {company.user?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#4a5568' }}>
                                        {company.industry || '—'}
                                    </td>
                                    <td style={{ padding: '13px 16px', fontSize: '13px' }}>
                                        {company.website ? (
                                            <a href={company.website} target="_blank"
                                                style={{ color: '#f97316', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                                                Kunjungi
                                            </a>
                                        ) : '—'}
                                    </td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <StatusBadge status={company.verification_status} />
                                    </td>
                                    <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => openVerifyModal(company)}
                                            className="text-xs font-semibold px-3 rounded-lg"
                                            style={{
                                                height: '32px',
                                                border: `1px solid ${company.verification_status === 'pending' ? '#f97316' : '#e2e8f0'}`,
                                                background: company.verification_status === 'pending' ? '#fff3eb' : '#f8fafc',
                                                color: company.verification_status === 'pending' ? '#f97316' : '#1a3560',
                                                cursor: 'pointer',
                                            }}
                                            onMouseEnter={e => { e.target.style.background = company.verification_status === 'pending' ? '#ffedd5' : '#e8f0fb'; }}
                                            onMouseLeave={e => { e.target.style.background = company.verification_status === 'pending' ? '#fff3eb' : '#f8fafc'; }}
                                        >
                                            Tinjau
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-sm" style={{ color: '#a0aec0' }}>
                                        Tidak ada perusahaan yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Verifikasi */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle style={{ color: '#1a3560' }}>Tinjau Perusahaan</DialogTitle>
                    </DialogHeader>
                    {selectedCompany && (
                        <div className="space-y-4 pt-1">
                            <div className="rounded-xl p-4" style={{ background: '#f4f6fa', border: '1px solid #e8edf5' }}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                                        style={{ background: '#e8f0fb', color: '#1a3560' }}>
                                        {selectedCompany.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm" style={{ color: '#1a3560' }}>{selectedCompany.name}</div>
                                        <div className="text-xs" style={{ color: '#a0aec0' }}>{selectedCompany.industry}</div>
                                    </div>
                                </div>
                                {[
                                    { label: 'Alamat', val: selectedCompany.address || '—' },
                                    { label: 'Deskripsi', val: selectedCompany.description || '—' },
                                ].map((item, i) => (
                                    <div key={i} className="mt-2">
                                        <div className="text-xs font-bold uppercase mb-0.5"
                                            style={{ color: '#a0aec0', letterSpacing: '0.08em' }}>{item.label}</div>
                                        <div className="text-sm" style={{ color: '#4a5568' }}>{item.val}</div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={submitStatus} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1.5"
                                        style={{ color: '#4a5568', letterSpacing: '0.08em' }}>
                                        Status Verifikasi
                                    </label>
                                    <Select value={data.verification_status} onValueChange={v => setData('verification_status', v)}>
                                        <SelectTrigger style={{ height: '40px', borderRadius: '8px' }}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Menunggu Peninjauan</SelectItem>
                                            <SelectItem value="verified">Terverifikasi — Izinkan Posting</SelectItem>
                                            <SelectItem value="rejected">Tolak Perusahaan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <button type="button" onClick={() => setIsModalOpen(false)}
                                        className="px-4 text-sm rounded-lg"
                                        style={{ height: '38px', color: '#718096', cursor: 'pointer', background: 'transparent', border: '1px solid #e2e8f0' }}>
                                        Batal
                                    </button>
                                    <button type="submit" disabled={processing}
                                        className="px-5 text-sm font-semibold rounded-lg"
                                        style={{ height: '38px', background: '#1a3560', color: '#fff', border: 'none', cursor: 'pointer', opacity: processing ? 0.6 : 1 }}>
                                        {processing ? 'Menyimpan...' : 'Simpan Status'}
                                    </button>
                                </DialogFooter>
                            </form>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
