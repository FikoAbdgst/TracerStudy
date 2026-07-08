import React from 'react';
import { Eye } from 'lucide-react';

export default function AlumniCard({ alumni, onDetail }) {
    const isOpenToWork = alumni.employment_status === 'Mencari Kerja';
    const initial = alumni.name
        ? alumni.name.charAt(0).toUpperCase()
        : '?';

    return (
        <div
            className="group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{ borderColor: '#e8edf5' }}
        >
            {/* Top accent bar */}
            <div
                className="absolute inset-x-0 top-0 h-1"
                style={{
                    background: isOpenToWork
                        ? 'linear-gradient(90deg, #f97316, #fb923c)'
                        : 'linear-gradient(90deg, #1a3560, #2d4a7a)',
                }}
            />

            <div className="flex flex-col p-5">
                {/* Photo + Name row */}
                <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0">
                        {alumni.photo ? (
                            <img
                                src={alumni.photo}
                                alt=""
                                className="h-full w-full rounded-xl object-cover ring-2 ring-gray-100"
                            />
                        ) : (
                            <div
                                className="flex h-full w-full items-center justify-center rounded-xl text-xl font-bold text-white ring-2 ring-white/20"
                                style={{
                                    background:
                                        'linear-gradient(135deg, #1a3560, #0f1f3d)',
                                }}
                            >
                                {initial}
                            </div>
                        )}
                        {isOpenToWork && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-5 w-5 rounded-full bg-emerald-500 ring-2 ring-white" />
                            </span>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3
                            className="text-base font-bold leading-tight truncate"
                            style={{ color: '#0f1f3d' }}
                        >
                            {alumni.name}
                        </h3>
                        <p className="mt-0.5 text-xs truncate" style={{ color: '#64748b' }}>
                            {alumni.major || '—'}
                        </p>
                        {alumni.graduation_year && (
                            <p className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>
                                Lulus {alumni.graduation_year}
                            </p>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div className="my-4 border-t" style={{ borderColor: '#f0f2f5' }} />

                {/* Employment status — only what's relevant */}
                <div className="flex items-center gap-2">
                    {isOpenToWork ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Open to Work
                        </span>
                    ) : alumni.employment_status === 'Bekerja' && alumni.position ? (
                        <div className="min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: '#0f1f3d' }}>
                                <span className="mr-1 inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: '#1a3560' }} />
                                {alumni.position}
                            </p>
                            {alumni.company_name && (
                                <p className="text-[11px] truncate" style={{ color: '#64748b' }}>
                                    {alumni.company_name}
                                </p>
                            )}
                        </div>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                            <span className="h-2 w-2 rounded-full bg-slate-400" />
                            {alumni.employment_status || '—'}
                        </span>
                    )}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Detail button */}
                <button
                    type="button"
                    onClick={() => onDetail(alumni)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all duration-200"
                    style={{
                        backgroundColor: '#f0f4f9',
                        color: '#1a3560',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1a3560';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f4f9';
                        e.currentTarget.style.color = '#1a3560';
                    }}
                >
                    <Eye className="h-4 w-4" />
                    Lihat Detail Profil
                </button>
            </div>
        </div>
    );
}
