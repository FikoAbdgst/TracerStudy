import React, { useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

const fieldStyle = {
    height: '40px', padding: '0 12px', border: '1.5px solid #e2e8f0',
    borderRadius: '8px', background: '#f8fafc', color: '#1a3560',
    fontSize: '14px', outline: 'none', width: '100%', transition: 'all 0.15s',
};
const onFocus = (e) => { e.target.style.borderColor = '#1a3560'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.08)'; };
const onBlurF = (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; };

const statusMap = {
    pending: { bg: '#f4f6fa', color: '#718096', label: 'Menunggu' },
    direview: { bg: '#e8f0fb', color: '#1a3560', label: 'Direview' },
    wawancara: { bg: '#f0e8fb', color: '#6b21a8', label: 'Wawancara' },
    diterima: { bg: '#f0fdf4', color: '#166534', label: 'Diterima' },
    ditolak: { bg: '#fff5f5', color: '#c53030', label: 'Ditolak' },
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

export default function PelamarIndex({ applications }) {
    const [searchName, setSearchName] = useState('');
    const [filterJob, setFilterJob] = useState('all');
    const [isProcessOpen, setIsProcessOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);

    const { data, setData, patch, processing } = useForm({ status: '', notes: '' });

    const uniqueJobs = useMemo(() => [...new Set(applications.map(a => a.job_posting.title))], [applications]);

    const filtered = applications.filter(app => {
        const matchName = app.alumni?.user?.name.toLowerCase().includes(searchName.toLowerCase());
        const matchJob = filterJob === 'all' || app.job_posting.title === filterJob;
        return matchName && matchJob;
    });

    const openProcessModal = (app) => {
        setSelectedApp(app);
        setData({ status: app.status || 'pending', notes: app.notes || '' });
        setIsProcessOpen(true);
    };

    const submitStatus = (e) => {
        e.preventDefault();
        patch(route('perusahaan.pelamar.status', selectedApp.id), { onSuccess: () => setIsProcessOpen(false) });
    };

    const formatDate = (d) => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-lg font-bold" style={{ color: '#1a3560' }}>Daftar Pelamar</h2>
                    <p className="text-xs mt-0.5" style={{ color: '#a0aec0' }}>Kelola dan proses lamaran masuk dari alumni</p>
                </div>
            }
        >
            <Head title="Daftar Pelamar — SITAMI" />

            <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #e8edf5' }}>
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
                    <div className="text-sm" style={{ color: '#a0aec0' }}>
                        Total <span className="font-semibold" style={{ color: '#1a3560' }}>{filtered.length}</span> pelamar
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a0aec0' }}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input
                                style={{ ...fieldStyle, paddingLeft: '36px', width: '220px' }}
                                placeholder="Cari nama pelamar..."
                                value={searchName}
                                onChange={e => setSearchName(e.target.value)}
                                onFocus={onFocus} onBlur={onBlurF}
                            />
                        </div>
                        <Select value={filterJob} onValueChange={setFilterJob}>
                            <SelectTrigger style={{ height: '40px', width: '180px', borderRadius: '8px' }}>
                                <SelectValue placeholder="Semua Posisi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Posisi</SelectItem>
                                {uniqueJobs.map((j, i) => <SelectItem key={i} value={j}>{j}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e8edf5' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f4f6fa', borderBottom: '1px solid #e8edf5' }}>
                                {['Pelamar', 'Posisi Dilamar', 'Tanggal', 'Status', 'Aksi'].map((h, i) => (
                                    <th key={i} className="text-xs font-bold uppercase"
                                        style={{ padding: '10px 16px', color: '#1a3560', letterSpacing: '0.1em', textAlign: i === 4 ? 'right' : 'left' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(app => (
                                <tr key={app.id} style={{ borderBottom: '1px solid #f4f6fa' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '13px 16px' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                style={{ background: '#fff3eb', color: '#f97316' }}>
                                                {app.alumni?.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm" style={{ color: '#1a3560' }}>
                                                    {app.alumni?.user?.name ?? '—'}
                                                </div>
                                                <div className="text-xs" style={{ color: '#a0aec0' }}>
                                                    {app.alumni?.user?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#4a5568' }}>
                                        {app.job_posting?.title}
                                    </td>
                                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#a0aec0' }}>
                                        {formatDate(app.created_at)}
                                    </td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <StatusBadge status={app.status} />
                                    </td>
                                    <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => openProcessModal(app)}
                                            className="text-xs font-semibold px-3 rounded-lg"
                                            style={{ height: '32px', border: '1px solid #f97316', background: '#fff3eb', color: '#f97316', cursor: 'pointer' }}
                                            onMouseEnter={e => e.target.style.background = '#ffedd5'}
                                            onMouseLeave={e => e.target.style.background = '#fff3eb'}
                                        >
                                            Proses
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-sm" style={{ color: '#a0aec0' }}>
                                        Tidak ada pelamar yang cocok dengan filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Proses Lamaran */}
            <Dialog open={isProcessOpen} onOpenChange={setIsProcessOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle style={{ color: '#1a3560' }}>Detail & Proses Lamaran</DialogTitle>
                    </DialogHeader>

                    {selectedApp && (
                        <div className="space-y-5 pt-1">
                            {/* Info pelamar */}
                            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl"
                                style={{ background: '#f4f6fa', border: '1px solid #e8edf5' }}>
                                {[
                                    { label: 'Nama Pelamar', val: selectedApp.alumni?.user?.name },
                                    { label: 'Email', val: selectedApp.alumni?.user?.email },
                                    { label: 'Posisi Dilamar', val: selectedApp.job_posting?.title },
                                    {
                                        label: 'Lampiran CV', val: selectedApp.cv_path
                                            ? <a href={`/storage/${selectedApp.cv_path}`} target="_blank"
                                                style={{ color: '#f97316', textDecoration: 'underline' }}>
                                                Lihat Dokumen CV
                                            </a>
                                            : <span style={{ color: '#a0aec0', fontStyle: 'italic' }}>Tidak ada CV</span>
                                    },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="text-xs font-bold uppercase mb-1" style={{ color: '#a0aec0', letterSpacing: '0.08em' }}>{item.label}</div>
                                        <div className="text-sm font-semibold" style={{ color: '#1a3560' }}>{item.val}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Form status */}
                            <form onSubmit={submitStatus} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: '#4a5568', letterSpacing: '0.08em' }}>
                                        Status Lamaran
                                    </label>
                                    <Select value={data.status} onValueChange={v => setData('status', v)}>
                                        <SelectTrigger style={{ height: '40px', borderRadius: '8px' }}>
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
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: '#4a5568', letterSpacing: '0.08em' }}>
                                        Catatan Internal
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Jadwal wawancara atau catatan lainnya..."
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        style={{
                                            padding: '10px 12px', border: '1.5px solid #e2e8f0',
                                            borderRadius: '8px', background: '#f8fafc', color: '#1a3560',
                                            fontSize: '14px', outline: 'none', width: '100%', resize: 'vertical',
                                        }}
                                        onFocus={onFocus} onBlur={onBlurF}
                                    />
                                </div>
                                <DialogFooter>
                                    <button type="button" onClick={() => setIsProcessOpen(false)}
                                        className="px-4 text-sm rounded-lg"
                                        style={{ height: '38px', color: '#718096', cursor: 'pointer', background: 'transparent', border: '1px solid #e2e8f0' }}>
                                        Batal
                                    </button>
                                    <button type="submit" disabled={processing}
                                        className="px-5 text-sm font-semibold rounded-lg"
                                        style={{ height: '38px', background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', opacity: processing ? 0.6 : 1 }}>
                                        {processing ? 'Menyimpan...' : 'Simpan Keputusan'}
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
