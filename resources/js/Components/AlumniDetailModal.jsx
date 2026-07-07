import React from 'react';
import {
    GraduationCap,
    Calendar,
    BookOpen,
    FolderKanban,
    ExternalLink,
    Building2,
    Award,
    Quote,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';

const abbreviateName = (name) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return parts[0] + ' ' + parts[1].charAt(0) + '.';
};

const statusConfig = {
    'Bekerja': { label: 'Bekerja', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: Briefcase },
    'Mencari Kerja': { label: 'Mencari Kerja', dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', icon: Briefcase },
    'Tidak Bekerja': { label: 'Tidak Bekerja', dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600', icon: Briefcase },
};

export default function AlumniDetailModal({ alumni, open, onOpenChange }) {
    if (!alumni) return null;

    const status = statusConfig[alumni.employment_status] || statusConfig['Mencari Kerja'];
    const initial = abbreviateName(alumni.name).charAt(0).toUpperCase();
    const projects = alumni.portofolio_proyek || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-xl max-h-[85vh] overflow-y-auto !bg-white"
                style={{ backgroundColor: 'white' }}
            >
                {/* ===== HERO SECTION ===== */}
                <div
                    className="relative -mx-4 -mt-4 rounded-t-xl px-4 pb-6 pt-8 sm:-mx-6 sm:-mt-6 sm:px-6"
                    style={{
                        background: 'linear-gradient(135deg, #1a3560 0%, #0f1f3d 100%)',
                    }}
                >
                    {/* Decorative dot pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.06] rounded-t-xl"
                        style={{
                            backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M20 10c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z'/%3E%3C/g%3E%3C/svg%3E\")",
                        }}
                    />

                    <DialogHeader>
                        <DialogTitle className="sr-only">Detail Alumni</DialogTitle>
                    </DialogHeader>

                    <div className="relative flex items-center gap-4">
                        <div
                            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg ring-2 ring-white/30"
                            style={{
                                background: alumni.photo
                                    ? undefined
                                    : 'linear-gradient(135deg, #f97316, #fb923c)',
                            }}
                        >
                            {alumni.photo ? (
                                <img
                                    src={alumni.photo}
                                    alt=""
                                    className="h-full w-full rounded-2xl object-cover"
                                />
                            ) : (
                                initial
                            )}
                        </div>
                        <div className="min-w-0 text-white">
                            <h3 className="text-xl font-bold leading-tight">
                                {alumni.name}
                            </h3>
                            <p className="mt-0.5 text-sm text-white/70">
                                {alumni.major || '—'}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-white/60">
                                {alumni.jenjang_pendidikan && (
                                    <span className="inline-flex items-center gap-1">
                                        <GraduationCap className="h-3 w-3" />
                                        {alumni.jenjang_pendidikan}
                                    </span>
                                )}
                                {alumni.graduation_year && (
                                    <span className="inline-flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Lulus {alumni.graduation_year}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    {/* ===== STATUS + COMPANY ===== */}
                    <div className="flex flex-wrap items-center gap-3">
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.bg} ${status.text}`}
                        >
                            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                        </span>
                        {alumni.employment_status === 'Bekerja' && alumni.company_name && (
                            <span
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                                style={{
                                    backgroundColor: '#e8f0fb',
                                    color: '#1a3560',
                                }}
                            >
                                <Building2 className="h-3 w-3" />
                                {alumni.company_name}
                            </span>
                        )}
                    </div>

                    {/* ===== SKILLS ===== */}
                    {alumni.skills.length > 0 && (
                        <div>
                            <h4
                                className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                                style={{ color: '#64748b' }}
                            >
                                <Award className="h-3.5 w-3.5" />
                                Keahlian
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {alumni.skills.map((skill, i) => (
                                    <Badge
                                        key={i}
                                        variant="secondary"
                                        className="text-[11px] font-medium px-2.5 py-1"
                                    >
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== JUDUL SKRIPSI ===== */}
                    {alumni.judul_skripsi && (
                        <div>
                            <h4
                                className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                                style={{ color: '#64748b' }}
                            >
                                <BookOpen className="h-3.5 w-3.5" />
                                Judul Skripsi
                            </h4>
                            <div
                                className="rounded-lg border p-3.5"
                                style={{
                                    borderColor: '#e8edf5',
                                    backgroundColor: '#fafcff',
                                }}
                            >
                                <div className="flex items-start gap-2.5">
                                    <Quote
                                        className="mt-0.5 h-4 w-4 shrink-0"
                                        style={{ color: '#1a3560' }}
                                    />
                                    <p
                                        className="text-sm leading-relaxed font-medium italic"
                                        style={{ color: '#1e293b' }}
                                    >
                                        "{alumni.judul_skripsi}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== PROYEK TERBAIK ===== */}
                    {projects.length > 0 && (
                        <div>
                            <h4
                                className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                                style={{ color: '#64748b' }}
                            >
                                <FolderKanban className="h-3.5 w-3.5" />
                                Proyek Terbaik
                            </h4>
                            <div className="space-y-2.5">
                                {projects.map((project, i) => (
                                    <div
                                        key={i}
                                        className="rounded-lg border p-3.5 transition hover:shadow-sm"
                                        style={{
                                            borderColor: '#e8edf5',
                                            backgroundColor: '#fafcff',
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <h5
                                                    className="text-sm font-semibold"
                                                    style={{ color: '#0f1f3d' }}
                                                >
                                                    {project.nama_proyek}
                                                </h5>
                                                {project.deskripsi_singkat && (
                                                    <p
                                                        className="mt-1 text-xs leading-relaxed"
                                                        style={{ color: '#64748b' }}
                                                    >
                                                        {project.deskripsi_singkat}
                                                    </p>
                                                )}
                                            </div>
                                            {project.tautan && (
                                                <a
                                                    href={project.tautan}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="shrink-0 rounded-lg p-1.5 transition hover:bg-gray-100"
                                                    style={{ color: '#1a3560' }}
                                                    title="Lihat proyek"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
