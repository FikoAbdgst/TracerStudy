import React from 'react';
import { Eye } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';

const abbreviateName = (name) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return parts[0] + ' ' + parts[1].charAt(0) + '.';
};

const statusConfig = {
    'Bekerja': { label: 'Bekerja', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    'Mencari Kerja': { label: 'Mencari Kerja', dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
    'Tidak Bekerja': { label: 'Tidak Bekerja', dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600' },
};

export default function AlumniCard({ alumni, onDetail }) {
    const status = statusConfig[alumni.employment_status] || statusConfig['Mencari Kerja'];
    const initial = abbreviateName(alumni.name).charAt(0).toUpperCase();

    return (
        <div
            className="group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{ borderColor: '#e8edf5' }}
        >
            {/* Top gradient accent */}
            <div
                className="absolute inset-x-0 top-0 h-1.5"
                style={{
                    background: 'linear-gradient(90deg, #1a3560, #f97316)',
                }}
            />

            <div className="flex flex-1 flex-col p-5 pt-5">
                {/* Avatar + Name row */}
                <div className="flex items-start gap-3.5">
                    {/*
                        FIX: "h-13 w-13" bukan class Tailwind yang valid (tidak ada di skala
                        default), sehingga kontainer ini sebelumnya tidak punya ukuran tetap.
                        Akibatnya <img className="h-full w-full"> merender foto di ukuran
                        aslinya dan meluber keluar kartu. Diganti ke ukuran tetap yang valid
                        (h-14 w-14) + overflow-hidden sebagai pengaman tambahan.
                    */}
                    <div
                        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl shadow-sm"
                        style={{
                            background: alumni.photo
                                ? '#e8edf5'
                                : 'linear-gradient(135deg, #1a3560, #0f1f3d)',
                        }}
                    >
                        {alumni.photo ? (
                            <img
                                src={alumni.photo}
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                                {initial}
                            </span>
                        )}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                        <h3
                            className="text-base font-semibold leading-tight truncate"
                            style={{ color: '#0f1f3d' }}
                        >
                            {abbreviateName(alumni.name)}
                        </h3>
                        <p className="mt-0.5 text-xs truncate" style={{ color: '#64748b' }}>
                            {alumni.major || '—'}
                        </p>
                        {alumni.graduation_year && (
                            <p className="text-[11px]" style={{ color: '#94a3b8' }}>
                                Lulus {alumni.graduation_year}
                            </p>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div className="my-3 border-t" style={{ borderColor: '#f0f2f5' }} />

                {/* Skills */}
                {alumni.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {alumni.skills.slice(0, 4).map((skill, i) => (
                            <Badge
                                key={i}
                                variant="secondary"
                                className="text-[10px] font-medium px-2 py-0.5"
                            >
                                {skill}
                            </Badge>
                        ))}
                        {alumni.skills.length > 4 && (
                            <span className="text-[10px] self-center font-medium" style={{ color: '#94a3b8' }}>
                                +{alumni.skills.length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Status + Detail button */}
                <div className="mt-3 flex items-center justify-between">
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${status.bg} ${status.text}`}
                    >
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                    </span>
                    <button
                        type="button"
                        onClick={() => onDetail(alumni)}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-200 hover:shadow-sm"
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
                        <Eye className="h-3.5 w-3.5" />
                        Lihat Detail
                    </button>
                </div>
            </div>
        </div>
    );
}
