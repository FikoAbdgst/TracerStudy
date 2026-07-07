import React, { useState, Suspense } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    Briefcase,
    MapPin,
    Globe,
    ArrowLeft,
    ArrowRight,
    ChevronRight,
} from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Badge } from '@/Components/ui/badge';
import JobDetailModal from '@/Components/JobDetailModal';

const MapWidget = React.lazy(() => import('@/Components/MapWidget'));

export default function CompanyDetail({ company }) {
    const [selectedJob, setSelectedJob] = useState(null);
    const jobs = company?.job_postings ?? company?.jobPostings ?? [];

    return (
        <GuestLayout variant="landing">
            <Head title={`${company.name} — Mitra STMIK Mardira Indonesia`} />

            {/* Simple Nav */}
            <nav className="sticky top-0 z-50 border-b border-[#e8edf5] bg-white/80 backdrop-blur-lg">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm"
                            style={{
                                background:
                                    'linear-gradient(135deg, #1a3560, #0f1f3d)',
                            }}
                        >
                            MI
                        </div>
                        <span
                            className="text-lg font-bold"
                            style={{ color: '#1a3560' }}
                        >
                            STMIK Mardira
                        </span>
                    </Link>
                    <Link
                        href={route('login')}
                        className="rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
                        style={{ color: '#64748b' }}
                    >
                        Masuk
                    </Link>
                </div>
            </nav>

            {/* Back link */}
            <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm font-medium transition hover:opacity-70"
                    style={{ color: '#64748b' }}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </Link>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">

                {/* Hero Card */}
                <div
                    className="rounded-xl p-6 sm:p-8 text-white"
                    style={{
                        background:
                            'linear-gradient(135deg, #1a3560 0%, #0f1f3d 100%)',
                    }}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20 text-xl font-bold backdrop-blur-sm"
                        >
                            {company.name
                                .replace(/^(PT|CV)\s+/i, '')
                                .charAt(0)
                                .toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl font-bold sm:text-2xl">
                                {company.name}
                            </h1>
                            {company.industry && (
                                <span
                                    className="mt-1 inline-block text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: '#fb923c' }}
                                >
                                    {company.industry}
                                </span>
                            )}
                            <p className="mt-3 text-sm leading-relaxed line-clamp-3 sm:line-clamp-none" style={{ color: 'rgba(255,255,255,0.75)' }}>
                                {company.description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Left column — Info */}
                    <div className="lg:col-span-1 space-y-4">
                        <div
                            className="rounded-xl border p-5"
                            style={{ borderColor: '#e8edf5', backgroundColor: '#fafcff' }}
                        >
                            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                                Informasi Perusahaan
                            </h3>
                            <div className="space-y-3 text-sm" style={{ color: '#475569' }}>
                                {company.address && (
                                    <div className="flex items-start gap-2.5">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#94a3b8' }} />
                                        <span className="leading-relaxed break-words">{company.address}</span>
                                    </div>
                                )}
                                {company.website && (
                                    <div className="flex items-center gap-2.5">
                                        <Globe className="h-4 w-4 shrink-0" style={{ color: '#94a3b8' }} />
                                        <a
                                            href={company.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline break-all"
                                        >
                                            {company.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Map */}
                        {company.latitude && company.longitude && (
                            <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#e8edf5' }}>
                                <Suspense
                                    fallback={
                                        <div className="min-h-[180px] sm:h-[220px]" style={{ borderRadius: 9, background: '#f0f4f9' }} />
                                    }
                                >
                                    <div className="min-h-[180px] sm:h-[220px]">
                                        <MapWidget
                                            latitude={parseFloat(company.latitude)}
                                            longitude={parseFloat(company.longitude)}
                                            label={company.name}
                                            height={220}
                                        />
                                    </div>
                                </Suspense>
                            </div>
                        )}
                    </div>

                    {/* Right column — Job Listings */}
                    <div className="lg:col-span-2">
                        <h2 className="mb-4 text-base font-bold" style={{ color: '#0f1f3d' }}>
                            Lowongan Kerja Tersedia
                            {jobs.length > 0 && (
                                <span className="ml-1.5 text-sm font-normal" style={{ color: '#94a3b8' }}>
                                    ({jobs.length})
                                </span>
                            )}
                        </h2>

                        {jobs.length > 0 ? (
                            <div className="space-y-3">
                                {jobs.map((job) => (
                                    <button
                                        key={job.id}
                                        type="button"
                                        onClick={() => setSelectedJob(job)}
                                        className="group rounded-xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                                        style={{ borderColor: '#e8edf5' }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                                        style={{
                                                            backgroundColor: '#e8f0fb',
                                                            color: '#1a3560',
                                                        }}
                                                    >
                                                        <Briefcase className="h-4 w-4" />
                                                    </div>
                                                    <h3 className="text-sm font-semibold line-clamp-2" style={{ color: '#0f1f3d' }}>
                                                        {job.title}
                                                    </h3>
                                                </div>
                                                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs" style={{ color: '#64748b' }}>
                                                    {job.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            {job.location}
                                                        </span>
                                                    )}
                                                    {job.work_model && (
                                                        <Badge variant="secondary" className="text-[10px]">
                                                            {job.work_model}
                                                        </Badge>
                                                    )}
                                                    {job.salary_range && (
                                                        <span className="font-medium" style={{ color: '#059669' }}>
                                                            {job.salary_range}
                                                        </span>
                                                    )}
                                                </div>
                                                {job.description && (
                                                    <p className="mt-2 text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
                                                        {job.description}
                                                    </p>
                                                )}
                                            </div>
                                            <ChevronRight className="mt-2 h-4 w-4 shrink-0 transition group-hover:translate-x-0.5" style={{ color: '#cbd5e1' }} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div
                                className="rounded-xl border border-dashed px-6 py-12 text-center"
                                style={{
                                    borderColor: '#e2e8f0',
                                    backgroundColor: '#f8fafc',
                                }}
                            >
                                <Briefcase className="mx-auto h-8 w-8" style={{ color: '#cbd5e1' }} />
                                <p className="mt-2 text-sm" style={{ color: '#94a3b8' }}>
                                    Belum ada lowongan aktif dari perusahaan ini
                                </p>
                            </div>
                        )}


                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-12 border-t bg-white" style={{ borderColor: '#e8edf5' }}>
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <p className="text-center text-sm" style={{ color: '#94a3b8' }}>
                        &copy; {new Date().getFullYear()} SITAMI — STMIK Mardira Indonesia
                    </p>
                </div>
            </footer>

            <JobDetailModal
                job={selectedJob}
                open={!!selectedJob}
                onOpenChange={(open) => { if (!open) setSelectedJob(null); }}
            />
        </GuestLayout>
    );
}
