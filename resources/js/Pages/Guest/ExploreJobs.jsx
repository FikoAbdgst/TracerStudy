import { useState, useEffect, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Search, ArrowLeft, Briefcase, Building2, MapPin, BadgeCheck } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Badge } from '@/Components/ui/badge';
import JobDetailModal from '@/Components/JobDetailModal';

function SkeletonCard() {
    return (
        <div className="flex flex-col rounded-xl border bg-white p-6 shadow-sm animate-pulse" style={{ borderColor: '#e8edf5' }}>
            <div className="h-10 w-10 rounded-lg bg-slate-200" />
            <div className="mt-4 space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-200" />
            </div>
            <div className="mt-4 space-y-2">
                <div className="h-3 w-2/3 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-200" />
            </div>
            <div className="mt-3 h-3 w-1/3 rounded bg-slate-200" />
            <div className="mt-3 h-5 w-16 rounded-full bg-slate-200" />
            <div className="mt-3 space-y-2">
                <div className="h-3 w-full rounded bg-slate-200" />
                <div className="h-3 w-5/6 rounded bg-slate-200" />
            </div>
        </div>
    );
}

export default function ExploreJobs({ jobs, search: initialSearch }) {
    const [search, setSearch] = useState(initialSearch || '');
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const onStart = () => setLoading(true);
        const onFinish = () => setLoading(false);

        const unsubStart = router.on('start', onStart);
        const unsubFinish = router.on('finish', onFinish);

        return () => {
            unsubStart();
            unsubFinish();
        };
    }, []);

    const debouncedSearch = useCallback(
        (() => {
            let timer;
            return (value) => {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    router.get(
                        route('guest.explore.jobs'),
                        { search: value || undefined },
                        { preserveState: true, replace: true }
                    );
                }, 400);
            };
        })(),
        []
    );

    const { data, links, meta } = jobs;

    return (
        <GuestLayout variant="landing">
            <Head title="Eksplor Lowongan Kerja — STMIK Mardira Indonesia" />

            <nav className="sticky top-0 z-50 border-b border-[#e8edf5] bg-white/80 backdrop-blur-lg">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.jpg" alt="SITAMI" className="h-9 w-9 rounded-lg object-contain shadow-sm" />
                        <span className="text-lg font-bold" style={{ color: '#1a3560' }}>STMIK Mardira</span>
                    </Link>
                    <Link href={route('login')} className="rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-gray-100" style={{ color: '#64748b' }}>
                        Masuk
                    </Link>
                </div>
            </nav>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <button type="button" onClick={() => window.location.href = '/'} className="inline-flex items-center gap-1.5 text-sm font-medium transition hover:opacity-70" style={{ color: '#64748b' }}>
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </button>

                <div className="mt-4 mb-8">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: '#0f1f3d' }}>
                        <Briefcase className="mr-2 inline h-7 w-7" style={{ color: '#f97316' }} />
                        Eksplor Lowongan Kerja
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: '#64748b' }}>
                        Temukan lowongan kerja terbaru dari perusahaan mitra STMIK Mardira Indonesia
                    </p>
                </div>

                <div className="relative mb-8 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#94a3b8' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            debouncedSearch(e.target.value);
                        }}
                        placeholder="Cari lowongan berdasarkan judul, perusahaan, atau lokasi..."
                        className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2"
                        style={{ borderColor: '#e2e8f0', backgroundColor: '#f8fafc', color: '#1e293b' }}
                    />
                </div>

                {loading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : data.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {data.map((job, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedJob(job)}
                                className="group rounded-xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                                style={{ borderColor: '#e8edf5', boxShadow: '0 1px 4px rgba(15,31,61,0.06)' }}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#e8f0fb', color: '#1a3560' }}>
                                    <Briefcase className="h-5 w-5" />
                                </div>
                                <h3 className="mt-4 font-semibold line-clamp-2" style={{ color: '#0f1f3d' }}>
                                    {job.title}
                                </h3>
                                <div className="mt-3 space-y-2 text-sm" style={{ color: '#64748b' }}>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 shrink-0" />
                                        <span>{job.company}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 shrink-0" />
                                        <span>{job.location}</span>
                                    </div>
                                </div>
                                {job.salary_range && (
                                    <p className="mt-3 text-sm font-medium" style={{ color: '#059669' }}>
                                        {job.salary_range}
                                    </p>
                                )}
                                {job.work_model && (
                                    <div className="mt-2">
                                        <Badge variant="secondary" className="text-[10px]">
                                            {job.work_model}
                                        </Badge>
                                    </div>
                                )}
                                {job.description && (
                                    <p className="mt-3 text-xs leading-relaxed line-clamp-2" style={{ color: '#94a3b8' }}>
                                        {job.description}
                                    </p>
                                )}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed px-6 py-16 text-center" style={{ borderColor: '#e2e8f0', backgroundColor: '#f8fafc' }}>
                        <Briefcase className="mx-auto h-10 w-10" style={{ color: '#94a3b8' }} />
                        <p className="mt-3 text-sm" style={{ color: '#94a3b8' }}>
                            {search ? `Tidak ditemukan lowongan dengan kata kunci "${search}"` : 'Belum ada lowongan kerja tersedia'}
                        </p>
                    </div>
                )}

                {meta && meta.last_page > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-2">
                        {links.map((link, i) => {
                            if (link.url === null) {
                                return (
                                    <span
                                        key={i}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium"
                                        style={{ color: '#94a3b8' }}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }
                            const isActive = link.active;
                            return (
                                <Link
                                    key={i}
                                    href={link.url}
                                    preserveState
                                    replace
                                    className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-lg px-2 text-xs font-medium transition"
                                    style={{
                                        backgroundColor: isActive ? '#1a3560' : 'transparent',
                                        color: isActive ? '#fff' : '#475569',
                                        border: isActive ? 'none' : '1px solid #e2e8f0',
                                    }}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            <footer className="border-t bg-white" style={{ borderColor: '#e8edf5' }}>
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
