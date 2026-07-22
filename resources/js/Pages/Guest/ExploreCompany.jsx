import { useState, useEffect, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Search, ArrowLeft, Building2, Briefcase, MapPin, ArrowRight } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';

function SkeletonCard() {
    return (
        <div className="flex flex-col rounded-xl border bg-white p-6 shadow-sm animate-pulse" style={{ borderColor: '#e8edf5' }}>
            <div className="flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-200" />
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-1/3 rounded bg-slate-200" />
                </div>
            </div>
            <div className="mt-3 space-y-2">
                <div className="h-3 w-full rounded bg-slate-200" />
                <div className="h-3 w-5/6 rounded bg-slate-200" />
                <div className="h-3 w-4/6 rounded bg-slate-200" />
            </div>
            <div className="mt-3 h-3 w-1/2 rounded bg-slate-200" />
            <div className="mt-4 border-t pt-3" style={{ borderColor: '#f0f2f5' }}>
                <div className="h-3 w-1/3 rounded bg-slate-200" />
            </div>
            <div className="mt-4 h-3 w-1/4 rounded bg-slate-200" />
        </div>
    );
}

export default function ExploreCompany({ companies, search: initialSearch }) {
    const [search, setSearch] = useState(initialSearch || '');
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
                        route('guest.explore.company'),
                        { search: value || undefined },
                        { preserveState: true, replace: true }
                    );
                }, 400);
            };
        })(),
        []
    );

    const { data, links, meta } = companies;

    return (
        <GuestLayout variant="landing">
            <Head title="Eksplor Perusahaan — STMIK Mardira Indonesia" />

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
                        <Building2 className="mr-2 inline h-7 w-7" style={{ color: '#f97316' }} />
                        Eksplor Perusahaan Mitra
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: '#64748b' }}>
                        Perusahaan yang telah menjalin kerjasama resmi dengan STMIK Mardira Indonesia
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
                        placeholder="Cari perusahaan berdasarkan nama atau industri..."
                        className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2"
                        style={{ borderColor: '#e2e8f0', backgroundColor: '#f8fafc', color: '#1e293b' }}
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.map((company) => (
                            <Link
                                key={company.id}
                                href={route('guest.company.show', company.id)}
                                className="group flex flex-col rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                style={{ borderColor: '#e8edf5' }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white" style={{ background: 'linear-gradient(135deg, #1a3560, #0f1f3d)' }}>
                                        {company.name.replace(/^(PT|CV)\s+/i, '').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-bold leading-tight line-clamp-2" style={{ color: '#0f1f3d' }}>
                                            {company.name}
                                        </h3>
                                        {company.industry && (
                                            <span className="mt-0.5 inline-block text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#f97316' }}>
                                                {company.industry}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {company.description && (
                                    <p className="mt-3 flex-1 text-xs leading-relaxed line-clamp-3" style={{ color: '#64748b' }}>
                                        {company.description}
                                    </p>
                                )}

                                {company.address && (
                                    <div className="mt-3 flex items-start gap-1.5 text-xs" style={{ color: '#94a3b8' }}>
                                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                        <span className="line-clamp-1">{company.address}</span>
                                    </div>
                                )}

                                {company.jobPostings && company.jobPostings.length > 0 && (
                                    <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t pt-3" style={{ borderColor: '#f0f2f5' }}>
                                        <Briefcase className="h-3 w-3" style={{ color: '#94a3b8' }} />
                                        <span className="text-xs font-medium" style={{ color: '#475569' }}>
                                            {company.jobPostings.length} lowongan tersedia
                                        </span>
                                    </div>
                                )}

                                <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold transition group-hover:gap-1.5" style={{ color: '#1a3560' }}>
                                    Lihat Detail
                                    <ArrowRight className="h-3 w-3" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed px-6 py-16 text-center" style={{ borderColor: '#e2e8f0', backgroundColor: '#f8fafc' }}>
                        <Building2 className="mx-auto h-10 w-10" style={{ color: '#94a3b8' }} />
                        <p className="mt-3 text-sm" style={{ color: '#94a3b8' }}>
                            {search ? `Tidak ditemukan perusahaan dengan kata kunci "${search}"` : 'Belum ada perusahaan mitra'}
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
        </GuestLayout>
    );
}
