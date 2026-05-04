import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AlumniIndex({ alumni }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = alumni.filter(item =>
        item.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nim?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const fieldStyle = {
        height: '40px', padding: '0 12px 0 36px',
        border: '1.5px solid #e2e8f0', borderRadius: '8px',
        background: '#f8fafc', color: '#1a3560', fontSize: '14px',
        outline: 'none', width: '100%', transition: 'all 0.15s',
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-lg font-bold" style={{ color: '#1a3560' }}>Manajemen Data Alumni</h2>
                    <p className="text-xs mt-0.5" style={{ color: '#a0aec0' }}>Kelola dan tinjau data alumni STMIK Mardira Indonesia</p>
                </div>
            }
        >
            <Head title="Data Alumni — SITAMI" />

            <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #e8edf5' }}>
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
                    <div className="text-sm" style={{ color: '#a0aec0' }}>
                        Total{' '}
                        <span className="font-semibold" style={{ color: '#1a3560' }}>{filtered.length}</span>{' '}
                        alumni terdaftar
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a0aec0' }}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            style={{ ...fieldStyle, width: '260px' }}
                            placeholder="Cari nama atau NIM..."
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
                                {['Nama Alumni', 'NIM', 'Program Studi', 'Tahun Lulus', 'Aksi'].map((h, i) => (
                                    <th key={i} className="text-xs font-bold uppercase"
                                        style={{ padding: '10px 16px', color: '#1a3560', letterSpacing: '0.1em', textAlign: i === 4 ? 'right' : 'left' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f4f6fa' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '13px 16px' }}>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                style={{ background: '#fff3eb', color: '#f97316' }}
                                            >
                                                {item.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm" style={{ color: '#1a3560' }}>
                                                    {item.user?.name ?? '—'}
                                                </div>
                                                <div className="text-xs" style={{ color: '#a0aec0' }}>
                                                    {item.user?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#4a5568' }}>
                                        {item.nim || '—'}
                                    </td>
                                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#4a5568' }}>
                                        {item.major || '—'}
                                    </td>
                                    <td style={{ padding: '13px 16px' }}>
                                        {item.graduation_year ? (
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                                                style={{ background: '#e8f0fb', color: '#1a3560' }}>
                                                {item.graduation_year}
                                            </span>
                                        ) : '—'}
                                    </td>
                                    <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                                        <button
                                            className="text-xs font-semibold px-3 rounded-lg"
                                            style={{ height: '32px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1a3560', cursor: 'pointer' }}
                                            onMouseEnter={e => { e.target.style.borderColor = '#1a3560'; e.target.style.background = '#e8f0fb'; }}
                                            onMouseLeave={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                                        >
                                            Detail Profil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-sm" style={{ color: '#a0aec0' }}>
                                        Tidak ada data alumni yang cocok.
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
