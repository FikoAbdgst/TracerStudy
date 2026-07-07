import React from 'react';
import {
    Briefcase,
    Building2,
    MapPin,
    Clock,
    CalendarDays,
    GraduationCap,
    DollarSign,
    BadgeCheck,
    Users,
    ArrowRight,
    CheckCircle2,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';

export default function JobDetailModal({ job, open, onOpenChange }) {
    if (!job) return null;

    const requirements = Array.isArray(job.requirements)
        ? job.requirements
        : job.requirements
            ? job.requirements.split('\n').filter(Boolean)
            : [];

    const formatDeadline = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const deadline = formatDeadline(job.deadline);
    const isExpired = job.deadline && new Date(job.deadline) < new Date();

    const infoItems = [
        { label: 'Lokasi', value: job.location, icon: MapPin },
        { label: 'Work Model', value: job.work_model, icon: Briefcase },
        { label: 'Jenjang Minimal', value: job.min_education, icon: GraduationCap },
        { label: 'Pengalaman Min.', value: job.min_experience ? `${job.min_experience} tahun` : null, icon: Clock },
        { label: 'Usia Maks.', value: job.max_age ? `${job.max_age} tahun` : null, icon: Users },
    ].filter((i) => i.value);

    const WA_NUMBER = '62882001330851';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-lg max-h-[85vh] overflow-y-auto !bg-white"
                style={{ backgroundColor: 'white' }}
            >
                {/* Header */}
                <DialogHeader>
                    <div className="flex items-start gap-3 pr-4 sm:pr-6">
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base font-bold text-white"
                            style={{
                                background:
                                    'linear-gradient(135deg, #1a3560, #0f1f3d)',
                            }}
                        >
                            {job.company
                                ? job.company.charAt(0).toUpperCase()
                                : 'J'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="text-base font-semibold leading-snug">
                                {job.title}
                            </DialogTitle>
                            {job.company && (
                                <p className="mt-0.5 text-xs" style={{ color: '#64748b' }}>
                                    <Building2 className="mr-1 inline h-3 w-3" />
                                    {job.company}
                                </p>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* Quick badges */}
                <div className="flex flex-wrap gap-2">
                    {job.work_model && (
                        <Badge variant="secondary" className="text-[11px]">
                            {job.work_model}
                        </Badge>
                    )}
                    {job.job_type && (
                        <Badge variant="secondary" className="text-[11px]">
                            {job.job_type.replace('_', ' ')}
                        </Badge>
                    )}
                    {job.salary_range && (
                        <Badge
                            variant="secondary"
                            className="text-[11px]"
                            style={{
                                backgroundColor: '#ecfdf5',
                                color: '#059669',
                            }}
                        >
                            {job.salary_range}
                        </Badge>
                    )}
                    {isExpired ? (
                        <Badge variant="secondary" className="text-[11px]" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                            Kedaluwarsa
                        </Badge>
                    ) : deadline ? (
                        <Badge variant="secondary" className="text-[11px]" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                            <CalendarDays className="mr-0.5 inline h-3 w-3" />
                            {deadline}
                        </Badge>
                    ) : null}
                </div>

                {/* Info grid */}
                {infoItems.length > 0 && (
                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border p-3 sm:p-4"
                        style={{ borderColor: '#e8edf5', backgroundColor: '#fafcff' }}
                    >
                        {infoItems.map((item) => (
                            <div key={item.label} className="flex items-start gap-2">
                                <item.icon
                                    className="mt-0.5 h-4 w-4 shrink-0"
                                    style={{ color: '#94a3b8' }}
                                />
                                <div>
                                    <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                                        {item.label}
                                    </p>
                                    <p className="text-sm font-medium" style={{ color: '#1e293b' }}>
                                        {item.value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Description */}
                {job.description && (
                    <div>
                        <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>
                            Deskripsi Pekerjaan
                        </h4>
                        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#475569' }}>
                            {job.description}
                        </p>
                    </div>
                )}

                {/* Requirements */}
                {requirements.length > 0 && (
                    <div>
                        <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>
                            <BadgeCheck className="mr-1 inline h-3.5 w-3.5" />
                            Kualifikasi
                        </h4>
                        <ul className="space-y-1">
                            {requirements.map((req, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-2 text-sm"
                                    style={{ color: '#475569' }}
                                >
                                    <CheckCircle2
                                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                                        style={{ color: '#22c55e' }}
                                    />
                                    <span>{req}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Apply CTA */}
                <div className="pt-2">
                    <a
                        href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Halo, saya tertarik dengan lowongan ${job.title} di ${job.company || 'perusahaan Anda'}. Mohon informasinya lebih lanjut.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                        style={{
                            background:
                                'linear-gradient(135deg, #1a3560, #0f1f3d)',
                        }}
                    >
                        Lamar Melalui WhatsApp
                        <ArrowRight className="h-4 w-4" />
                    </a>
                </div>
            </DialogContent>
        </Dialog>
    );
}
