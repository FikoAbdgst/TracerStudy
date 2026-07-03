import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    FileCheck,
    Megaphone,
    ArrowRight,
    Briefcase,
    Sparkles,
    MessageCircle,
} from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';

const WA_NUMBER = '62882001330851';
const waLink = (msg) =>
    `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

const abbreviateName = (name) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return parts[0] + ' ' + parts[1].charAt(0) + '.';
};

export default function Welcome({ latestJobs, totalAlumni, partnerCompanies, featuredAlumni }) {
    return (
        <GuestLayout variant="landing">
            <Head title="STMIK Mardira Indonesia — Tracer Study & Alumni" />

            {/* Nav */}
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
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('login')}
                            className="rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
                            style={{ color: '#64748b' }}
                        >
                            Masuk
                        </Link>
                        <a
                            href={waLink(
                                'Halo, saya tertarik untuk mendaftar sebagai perusahaan mitra STMIK Mardira Indonesia.'
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                            style={{
                                background:
                                    'linear-gradient(135deg, #1a3560, #0f1f3d)',
                            }}
                        >
                            <MessageCircle className="h-4 w-4" />
                            Hubungi Kami
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section
                className="relative overflow-hidden"
                style={{
                    background:
                        'linear-gradient(135deg, #1a3560 0%, #0f1f3d 100%)',
                }}
            >
                <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 18c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm-24 0c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                    }}
                />
                <div
                    className="absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl"
                    style={{ backgroundColor: 'rgba(249,115,22,0.15)' }}
                />
                <div
                    className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-3xl"
                    style={{ backgroundColor: 'rgba(249,115,22,0.1)' }}
                />
                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
                    <div className="relative mx-auto max-w-3xl text-center">
                        <div
                            className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm backdrop-blur-sm"
                            style={{
                                border: '1px solid rgba(255,255,255,0.15)',
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                color: 'rgba(255,255,255,0.85)',
                            }}
                        >
                            <Sparkles className="h-4 w-4" />
                            Platform Resmi Tracer Study STMIK Mardira Indonesia
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Temukan Talenta IT Terbaik dari{' '}
                            <span
                                className="bg-clip-text text-transparent"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(to right, #f97316, #fb923c)',
                                }}
                            >
                                STMIK Mardira Indonesia
                            </span>
                        </h1>
                        <p
                            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed"
                            style={{ color: 'rgba(255,255,255,0.75)' }}
                        >
                            Akses langsung ke lulusan berkualitas dengan keahlian
                            terkini. Bangun kemitraan strategis dengan kampus
                            kami melalui program kerjasama MoU dan publikasikan
                            lowongan kerja untuk menjaring talenta terbaik.
                        </p>
                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <a
                                href={waLink(
                                    'Halo, saya ingin mendaftar sebagai perusahaan mitra. Mohon informasinya lebih lanjut.'
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold shadow-lg transition hover:shadow-xl"
                                style={{ color: '#1a3560' }}
                            >
                                <MessageCircle className="h-5 w-5" />
                                Daftar Sebagai Perusahaan
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                            </a>
                            <a
                                href="#how-it-works"
                                className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-white transition"
                                style={{
                                    border: '1px solid rgba(255,255,255,0.3)',
                                }}
                            >
                                Pelajari Dulu
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="border-b border-[#e8edf5] bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="text-center">
                            <div
                                className="text-3xl font-bold"
                                style={{ color: '#1a3560' }}
                            >
                                {totalAlumni}
                            </div>
                            <div className="mt-1 text-sm" style={{ color: '#64748b' }}>
                                Alumni Tersedia
                            </div>
                        </div>
                        <div className="text-center">
                            <div
                                className="text-3xl font-bold"
                                style={{ color: '#1a3560' }}
                            >
                                {latestJobs.length}
                            </div>
                            <div className="mt-1 text-sm" style={{ color: '#64748b' }}>
                                Lowongan Terbaru
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partner Companies */}
            {partnerCompanies.length > 0 && (
                <section className="border-b border-[#e8edf5] bg-white py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2
                                className="text-2xl font-bold tracking-tight sm:text-3xl"
                                style={{ color: '#0f1f3d' }}
                            >
                                Perusahaan Mitra Aktif
                            </h2>
                            <p className="mt-2 text-sm" style={{ color: '#64748b' }}>
                                Perusahaan yang telah menjalin kerjasama resmi
                                dengan STMIK Mardira Indonesia
                            </p>
                        </div>
                        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {partnerCompanies.map((company) => (
                                <div
                                    key={company.id}
                                    className="flex flex-col items-center gap-2 rounded-xl border bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                    style={{ borderColor: '#e8edf5' }}
                                >
                                    <div
                                        className="flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold text-white"
                                        style={{
                                            background:
                                                'linear-gradient(135deg, #1a3560, #0f1f3d)',
                                        }}
                                    >
                                        {company.name
                                            .replace(/^(PT|CV)\s+/i, '')
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                    <span
                                        className="text-xs font-semibold leading-tight"
                                        style={{ color: '#374151' }}
                                    >
                                        {company.name}
                                    </span>
                                    {company.industry && (
                                        <span
                                            className="text-[10px] font-medium uppercase tracking-wider"
                                            style={{ color: '#f97316' }}
                                        >
                                            {company.industry}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Talenta Unggulan Section */}
            {featuredAlumni.length > 0 && (
                <section className="py-16 sm:py-20" style={{ backgroundColor: '#f0f4f9' }}>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center mb-12">
                            <h2
                                className="text-3xl font-bold tracking-tight sm:text-4xl"
                                style={{ color: '#0f1f3d' }}
                            >
                                Talenta Unggulan STMIK
                            </h2>
                            <p className="mt-4 text-base sm:text-lg" style={{ color: '#64748b' }}>
                                Temukan talenta terbaik kami yang siap berkontribusi untuk perusahaan Anda
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredAlumni.map((alumni, idx) => (
                                <Card key={idx} size="sm" className="overflow-hidden">
                                    <CardContent className="pt-4 pb-3">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                                {alumni.photo ? (
                                                    <img src={alumni.photo} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    abbreviateName(alumni.name).charAt(0)
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate" style={{ color: '#0f1f3d' }}>
                                                    {abbreviateName(alumni.name)}
                                                </p>
                                                <p className="text-xs truncate" style={{ color: '#64748b' }}>
                                                    {alumni.major || '-'}
                                                </p>
                                            </div>
                                        </div>

                                        {alumni.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-2">
                                                {alumni.skills.map((skill, i) => (
                                                    <Badge key={i} variant="secondary" className="text-[11px]">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
                                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                                            <span className="text-xs font-medium text-green-600">Open to Work</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="text-center mt-10">
                            <Button
                                variant="default"
                                size="lg"
                                className="rounded-full px-8"
                                asChild
                            >
                                <a href={route('login')}>
                                    Eksplorasi Ratusan Talenta Lainnya
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* Recent Jobs Section */}
            <section className="py-16 sm:py-20 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2
                            className="text-3xl font-bold tracking-tight sm:text-4xl"
                            style={{ color: '#0f1f3d' }}
                        >
                            Lowongan Kerja Terbaru
                        </h2>
                        <p className="mt-4 text-lg" style={{ color: '#64748b' }}>
                            Perusahaan mitra yang telah mempercayai talenta
                            lulusan kami
                        </p>
                    </div>

                    {latestJobs.length > 0 ? (
                        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {latestJobs.map((job, idx) => (
                                <div
                                    key={idx}
                                    className="group rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                    style={{
                                        borderColor: '#e8edf5',
                                        boxShadow:
                                            '0 1px 4px rgba(15,31,61,0.06)',
                                    }}
                                >
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                                        style={{
                                            backgroundColor: '#e8f0fb',
                                            color: '#1a3560',
                                        }}
                                    >
                                        <Briefcase className="h-5 w-5" />
                                    </div>
                                    <h3
                                        className="mt-4 font-semibold"
                                        style={{ color: '#0f1f3d' }}
                                    >
                                        {job.title}
                                    </h3>
                                    <div className="mt-3 space-y-2 text-sm" style={{ color: '#64748b' }}>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 shrink-0" />
                                            <span>{job.company}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg
                                                className="h-4 w-4 shrink-0"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                                />
                                            </svg>
                                            <span>{job.location}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div
                            className="mt-12 rounded-xl border border-dashed px-6 py-12 text-center"
                            style={{
                                borderColor: '#e2e8f0',
                                backgroundColor: '#f8fafc',
                            }}
                        >
                            <Briefcase
                                className="mx-auto h-10 w-10"
                                style={{ color: '#94a3b8' }}
                            />
                            <p className="mt-3 text-sm" style={{ color: '#94a3b8' }}>
                                Belum ada lowongan kerja tersedia
                            </p>
                        </div>
                    )}

                    {latestJobs.length > 0 && (
                        <div className="mt-8 text-center">
                            <a
                                href={waLink(
                                    'Halo, saya ingin melihat informasi lowongan kerja yang tersedia untuk alumni.'
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-semibold transition"
                                style={{ color: '#f97316' }}
                            >
                                Lihat Semua Lowongan
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>
                    )}
                </div>
            </section>

            {/* How to Partner / MoU Steps */}
            <section
                id="how-it-works"
                className="py-16 sm:py-20"
                style={{ backgroundColor: '#f0f4f9' }}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2
                            className="text-3xl font-bold tracking-tight sm:text-4xl"
                            style={{ color: '#0f1f3d' }}
                        >
                            Alur Kerjasama Perusahaan
                        </h2>
                        <p className="mt-4 text-lg" style={{ color: '#64748b' }}>
                            Tiga langkah mudah untuk bermitra dan mendapatkan
                            talenta terbaik
                        </p>
                    </div>

                    <div className="mt-16 grid gap-8 md:grid-cols-3">
                        <div
                            className="group relative rounded-2xl border bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            style={{ borderColor: '#e8edf5' }}
                        >
                            <div
                                className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                                style={{
                                    background:
                                        'linear-gradient(135deg, #1a3560, #0f1f3d)',
                                }}
                            >
                                1
                            </div>
                            <div
                                className="flex h-14 w-14 items-center justify-center rounded-xl"
                                style={{
                                    backgroundColor: '#e8f0fb',
                                    color: '#1a3560',
                                }}
                            >
                                <Building2 className="h-7 w-7" />
                            </div>
                            <h3
                                className="mt-6 text-lg font-semibold"
                                style={{ color: '#0f1f3d' }}
                            >
                                Daftar & Isi Profil Perusahaan
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed" style={{ color: '#64748b' }}>
                                Buat akun perusahaan Anda dengan mengisi data
                                diri dan informasi perusahaan secara lengkap.
                            </p>
                        </div>

                        <div
                            className="group relative rounded-2xl border bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            style={{ borderColor: '#e8edf5' }}
                        >
                            <div
                                className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                                style={{
                                    background:
                                        'linear-gradient(135deg, #1a3560, #0f1f3d)',
                                }}
                            >
                                2
                            </div>
                            <div
                                className="flex h-14 w-14 items-center justify-center rounded-xl"
                                style={{
                                    backgroundColor: '#e8f0fb',
                                    color: '#1a3560',
                                }}
                            >
                                <FileCheck className="h-7 w-7" />
                            </div>
                            <h3
                                className="mt-6 text-lg font-semibold"
                                style={{ color: '#0f1f3d' }}
                            >
                                Upload Dokumen MoU
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed" style={{ color: '#64748b' }}>
                                Unggah dokumen kerjasama (MoU) untuk diverifikasi
                                oleh tim admin kampus kami.
                            </p>
                        </div>

                        <div
                            className="group relative rounded-2xl border bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            style={{ borderColor: '#e8edf5' }}
                        >
                            <div
                                className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                                style={{
                                    background:
                                        'linear-gradient(135deg, #1a3560, #0f1f3d)',
                                }}
                            >
                                3
                            </div>
                            <div
                                className="flex h-14 w-14 items-center justify-center rounded-xl"
                                style={{
                                    backgroundColor: '#e8f0fb',
                                    color: '#1a3560',
                                }}
                            >
                                <Megaphone className="h-7 w-7" />
                            </div>
                            <h3
                                className="mt-6 text-lg font-semibold"
                                style={{ color: '#0f1f3d' }}
                            >
                                Publikasi Lowongan
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed" style={{ color: '#64748b' }}>
                                Setelah terverifikasi, publikasikan lowongan
                                kerja dan temukan kandidat alumni terbaik.
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <a
                            href={waLink(
                                'Halo, saya ingin mendaftar sebagai perusahaan mitra. Mohon informasinya lebih lanjut.'
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-white shadow-lg transition hover:shadow-xl"
                            style={{
                                background:
                                    'linear-gradient(135deg, #1a3560, #0f1f3d)',
                            }}
                        >
                            <MessageCircle className="h-5 w-5" />
                            Mulai Kerjasama
                            <ArrowRight className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-white" style={{ borderColor: '#e8edf5' }}>
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <div
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                                style={{
                                    background:
                                        'linear-gradient(135deg, #1a3560, #0f1f3d)',
                                }}
                            >
                                MI
                            </div>
                            <span
                                className="text-sm font-semibold"
                                style={{ color: '#374151' }}
                            >
                                STMIK Mardira Indonesia
                            </span>
                        </div>
                        <p className="text-sm" style={{ color: '#94a3b8' }}>
                            &copy; {new Date().getFullYear()} SITAMI. All rights
                            reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </GuestLayout>
    );
}
