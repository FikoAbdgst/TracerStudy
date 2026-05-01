import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const StatCard = ({ label, value, sub, accent = false, iconBg, iconColor, icon }) => (
    <div
        className="rounded-xl p-5"
        style={{
            background: accent ? '#1a3560' : '#fff',
            border: `1px solid ${accent ? '#1a3560' : '#e8edf5'}`,
            boxShadow: accent ? '0 4px 16px rgba(26,53,96,0.18)' : '0 1px 4px rgba(26,53,96,0.05)',
        }}
    >
        <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{ background: iconBg, color: iconColor }}>
                {icon}
            </div>
        </div>
        <div className="text-3xl font-bold mb-1" style={{ color: accent ? '#fff' : '#1a3560' }}>
            {value}
        </div>
        <div className="text-xs font-bold uppercase tracking-wider mb-0.5"
            style={{ color: accent ? '#7fa3cc' : '#4a5568', letterSpacing: '0.1em' }}>
            {label}
        </div>
        {sub && <div className="text-xs" style={{ color: accent ? '#4a6a8a' : '#a0aec0' }}>{sub}</div>}
    </div>
);

const QuickLink = ({ label, desc, href }) => (
    <Link href={href}>
        <div
            className="flex items-center justify-between px-4 py-3.5 rounded-lg transition-all"
            style={{ border: '1px solid #e8edf5', background: '#f8fafc' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff3eb'; e.currentTarget.style.borderColor = '#f97316'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e8edf5'; }}
        >
            <div>
                <div className="text-sm font-semibold" style={{ color: '#1a3560' }}>{label}</div>
                <div className="text-xs mt-0.5" style={{ color: '#a0aec0' }}>{desc}</div>
            </div>
            <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#f97316' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
        </div>
    </Link>
);

export default function Dashboard({ stats, company, recentApplicants }) {
    const { auth } = usePage().props;

    const metrics = stats ?? { activeJobs: 0, totalApplicants: 0, pendingApplicants: 0, acceptedApplicants: 0 };
    const companyName = company?.name ?? auth.user.name;

    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    const statusStyle = {
        pending: { bg: '#f4f6fa', color: '#718096', label: 'Menunggu' },
        direview: { bg: '#e8f0fb', color: '#1a3560', label: 'Direview' },
        wawancara: { bg: '#f0e8fb', color: '#6b21a8', label: 'Wawancara' },
        diterima: { bg: '#f0fdf4', color: '#166534', label: 'Diterima' },
        ditolak: { bg: '#fff5f5', color: '#c53030', label: 'Ditolak' },
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold" style={{ color: '#1a3560' }}>Dashboard Perusahaan</h2>
                        <p className="text-xs mt-0.5" style={{ color: '#a0aec0' }}>{today}</p>
                    </div>
                    <div
                        className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: '#fff3eb', color: '#f97316', border: '1px solid #fed7aa' }}
                    >
                        <span className="rounded-full" style={{ width: '6px', height: '6px', background: '#f97316', display: 'inline-block' }} />
                        Portal Mitra SITAMI
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Perusahaan — SITAMI" />

            {/* Greeting */}
            <div className="rounded-xl px-6 py-5 mb-6 flex items-center justify-between"
                style={{ background: '#1a3560', boxShadow: '0 4px 20px rgba(26,53,96,0.2)' }}>
                <div>
                    <div className="text-xs font-bold uppercase mb-2" style={{ color: '#4a7ab0', letterSpacing: '0.12em' }}>
                        Selamat Datang, Mitra SITAMI
                    </div>
                    <div className="text-xl font-bold mb-1" style={{ color: '#ffffff' }}>{companyName}</div>
                    <div className="text-sm" style={{ color: '#7fa3cc' }}>
                        {company?.industry ?? 'Admin Perusahaan'} · STMIK Mardira Indonesia
                    </div>
                </div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold hidden sm:flex flex-shrink-0"
                    style={{ background: '#f97316', color: '#fff' }}>
                    {companyName.charAt(0).toUpperCase()}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Lowongan Aktif" value={metrics.activeJobs} sub="Sedang dipublikasikan"
                    icon="💼" iconBg="#fff3eb" iconColor="#f97316" accent />
                <StatCard label="Total Pelamar" value={metrics.totalApplicants} sub="Semua posisi"
                    icon="👥" iconBg="#e8f0fb" iconColor="#1a3560" />
                <StatCard label="Menunggu Review" value={metrics.pendingApplicants} sub="Belum diproses"
                    icon="⏳" iconBg="#fff3eb" iconColor="#f97316" />
                <StatCard label="Pelamar Diterima" value={metrics.acceptedApplicants} sub="Keputusan final"
                    icon="✅" iconBg="#e8f0fb" iconColor="#1a3560" />
            </div>

            {/* Profil peringatan jika belum lengkap */}
            {!company?.name && (
                <div
                    className="rounded-xl px-5 py-4 mb-6 flex items-center justify-between gap-4"
                    style={{ background: '#fffbeb', border: '1px solid #fed7aa' }}
                >
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#f97316' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        <div>
                            <div className="text-sm font-semibold" style={{ color: '#92400e' }}>
                                Profil perusahaan belum dilengkapi
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: '#b45309' }}>
                                Lengkapi profil agar alumni dapat mengenal perusahaan Anda sebelum melamar.
                            </div>
                        </div>
                    </div>
                    <Link href={route('perusahaan.profile.edit')}>
                        <button
                            className="text-xs font-semibold px-4 rounded-lg flex-shrink-0"
                            style={{ height: '34px', background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer' }}
                        >
                            Lengkapi Sekarang
                        </button>
                    </Link>
                </div>
            )}

            {/* Bottom Grid */}
            <div className="grid gap-5 lg:grid-cols-3">

                {/* Quick Actions */}
                <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #e8edf5' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1a3560', letterSpacing: '0.12em' }}>
                            Aksi Cepat
                        </div>
                        <div style={{ width: '24px', height: '3px', background: '#f97316', borderRadius: '2px' }} />
                    </div>
                    <div className="space-y-2">
                        <QuickLink label="Posting Lowongan Baru" desc="Tambah posisi pekerjaan baru" href={route('perusahaan.lowongan')} />
                        <QuickLink label="Lihat Daftar Pelamar" desc="Proses lamaran masuk" href={route('perusahaan.pelamar')} />
                        <QuickLink label="Edit Profil Perusahaan" desc="Perbarui info perusahaan" href={route('perusahaan.profile.edit')} />
                    </div>
                </div>

                {/* Recent Applicants */}
                <div className="lg:col-span-2 rounded-xl p-5" style={{ background: '#fff', border: '1px solid #e8edf5' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1a3560', letterSpacing: '0.12em' }}>
                            Pelamar Terbaru
                        </div>
                        <Link
                            href={route('perusahaan.pelamar')}
                            className="text-xs font-semibold transition-colors"
                            style={{ color: '#f97316' }}
                        >
                            Lihat Semua →
                        </Link>
                    </div>

                    {recentApplicants && recentApplicants.length > 0 ? (
                        <div>
                            {recentApplicants.map((app) => {
                                const st = statusStyle[app.status] ?? statusStyle.pending;
                                return (
                                    <div
                                        key={app.id}
                                        className="flex items-center gap-3 py-3"
                                        style={{ borderBottom: '1px solid #f4f6fa' }}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                            style={{ background: '#fff3eb', color: '#f97316' }}
                                        >
                                            {app.alumni?.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold truncate" style={{ color: '#1a3560' }}>
                                                {app.alumni?.user?.name ?? 'Alumni'}
                                            </div>
                                            <div className="text-xs truncate" style={{ color: '#a0aec0' }}>
                                                {app.job_posting?.title}
                                            </div>
                                        </div>
                                        <span
                                            className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                                            style={{ background: st.bg, color: st.color }}
                                        >
                                            {st.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="text-3xl mb-2">📭</div>
                            <div className="text-sm font-medium" style={{ color: '#4a5568' }}>Belum ada pelamar</div>
                            <div className="text-xs mt-1" style={{ color: '#a0aec0' }}>
                                Posting lowongan kerja untuk mulai menerima lamaran dari alumni.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
