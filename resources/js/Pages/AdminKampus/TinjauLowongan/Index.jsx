import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function TinjauLowonganIndex({ jobs }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleForceClose = (id) => {
        if (confirm('Anda yakin ingin menutup paksa lowongan ini?')) {
            router.patch(route('adminkampus.tinjau-lowongan.force-close', id), {}, { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-lg font-bold" style={{ color: '#1a3560' }}>Tinjau Lowongan Aktif</h2>
                    <p className="text-xs mt-0.5" style={{ color: '#a0aec0' }}>
                        Pantau semua lowongan aktif — tutup paksa jika melanggar aturan
                    </p>
                </div>
            }
        >
            <Head title="Tinjau Lowongan — SITAMI" />

            <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #e8edf5' }}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
                    <div className="text-sm" style={{ color: '#a0aec0' }}>
                        <span className="font-semibold" style={{ color: '#1a3560' }}>{filtered.length}</span> lowongan aktif
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
                            placeholder="Cari posisi atau perusahaan..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onFocus={e => { e.target.style.borderColor = '#1a3560'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.08)'; }}
                            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                </div>

                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e8edf5' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f4f6fa', borderBottom: '1px solid #e8edf5' }}>
                                {['Posisi Pekerjaan', 'Perusahaan', 'Lokasi', 'Aksi'].map((h, i) => (
                                    <th key={i} className="text-xs font-bold uppercase"
                                        style={{ padding: '10px 16px', color: '#1a3560', letterSpacing: '0.1em', textAlign: i === 3 ? 'right' : 'left' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(job => (
                                <tr key={job.id} style={{ borderBottom: '1px solid #f4f6fa' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '13px 16px' }}>
                                        <div className="font-semibold text-sm" style={{ color: '#1a3560' }}>{job.title}</div>
                                        {job.salary_range && (
                                            <div className="text-xs mt-0.5" style={{ color: '#a0aec0' }}>{job.salary_range}</div>
                                        )}
                                    </td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                style={{ background: '#e8f0fb', color: '#1a3560' }}>
                                                {job.company?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                            </div>
                                            <span className="text-sm" style={{ color: '#4a5568' }}>{job.company?.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#718096' }}>
                                        {job.location || '—'}
                                    </td>
                                    <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleForceClose(job.id)}
                                            className="text-xs font-semibold px-3 rounded-lg"
                                            style={{ height: '32px', border: '1px solid #fecaca', background: '#fff5f5', color: '#e53e3e', cursor: 'pointer' }}
                                            onMouseEnter={e => e.target.style.background = '#fee2e2'}
                                            onMouseLeave={e => e.target.style.background = '#fff5f5'}
                                        >
                                            Tutup Paksa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-sm" style={{ color: '#a0aec0' }}>
                                        Tidak ada lowongan aktif ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
