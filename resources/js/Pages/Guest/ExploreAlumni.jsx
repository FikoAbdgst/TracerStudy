import { useState, useEffect, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Search, ArrowLeft, Users } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import AlumniCard from '@/Components/AlumniCard';
import AlumniDetailModal from '@/Components/AlumniDetailModal';

function SkeletonCard() {
    return (
        <div className="flex flex-col rounded-2xl border bg-white p-5 shadow-sm animate-pulse" style={{ borderColor: '#e8edf5' }}>
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-200" />
                    <div className="h-3 w-1/3 rounded bg-slate-200" />
                </div>
            </div>
            <div className="my-4 border-t" style={{ borderColor: '#f0f2f5' }} />
            <div className="h-3 w-2/3 rounded bg-slate-200" />
            <div className="flex-1" />
            <div className="mt-4 h-10 w-full rounded-lg bg-slate-200" />
        </div>
    );
}

export default function ExploreAlumni({ alumni, search: initialSearch }) {
    const [search, setSearch] = useState(initialSearch || '');
    const [selectedAlumni, setSelectedAlumni] = useState(null);
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
                        route('guest.explore.alumni'),
                        { search: value || undefined },
                        { preserveState: true, replace: true }
                    );
                }, 400);
            };
        })(),
        []
    );

    const { data, links, meta } = alumni;

    return (
        <GuestLayout variant="landing">
            <Head title="Eksplor Alumni — STMIK Mardira Indonesia" />

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
                        <Users className="mr-2 inline h-7 w-7" style={{ color: '#f97316' }} />
                        Eksplor Alumni
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: '#64748b' }}>
                        Temukan talenta terbaik lulusan STMIK Mardira Indonesia
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
                        placeholder="Cari alumni berdasarkan nama, jurusan, atau posisi..."
                        className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2"
                        style={{ borderColor: '#e2e8f0', backgroundColor: '#f8fafc', color: '#1e293b' }}
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.map((alumnus, idx) => (
                            <AlumniCard
                                key={alumnus.nim || idx}
                                alumni={alumnus}
                                onDetail={(a) => setSelectedAlumni(a)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed px-6 py-16 text-center" style={{ borderColor: '#e2e8f0', backgroundColor: '#f8fafc' }}>
                        <Users className="mx-auto h-10 w-10" style={{ color: '#94a3b8' }} />
                        <p className="mt-3 text-sm" style={{ color: '#94a3b8' }}>
                            {search ? `Tidak ditemukan alumni dengan kata kunci "${search}"` : 'Belum ada data alumni'}
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

            <AlumniDetailModal
                alumni={selectedAlumni}
                open={!!selectedAlumni}
                onOpenChange={(open) => { if (!open) setSelectedAlumni(null); }}
            />
        </GuestLayout>
    );
}
