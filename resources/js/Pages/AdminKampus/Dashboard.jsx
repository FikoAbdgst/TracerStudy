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
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{ background: iconBg, color: iconColor }}
            >
                {icon}
            </div>
        </div>
        <div className="text-3xl font-bold mb-1" style={{ color: accent ? '#fff' : '#1a3560' }}>
            {value}
        </div>
        <div
            className="text-xs font-bold uppercase tracking-wider mb-0.5"
            style={{ color: accent ? '#7fa3cc' : '#4a5568', letterSpacing: '0.1em' }}
        >
            {label}
        </div>
        {sub && (
            <div className="text-xs" style={{ color: accent ? '#4a6a8a' : '#a0aec0' }}>{sub}</div>
        )}
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

const ActivityRow = ({ actor, action, time, type }) => {
    const dotColor = { create: '#f97316', edit: '#1a3560', verify: '#16a34a', reject: '#e53e3e', default: '#a0aec0' };
    return (
        <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid #f4f6fa' }}>
            <div
                className="flex-shrink-0 rounded-full"
                style={{ width: '8px', height: '8px', background: dotColor[type] ?? dotColor.default }}
            />
            <div className="flex-1 text-sm min-w-0">
                <span className="font-semibold" style={{ color: '#1a3560' }}>{actor}</span>
                <span style={{ color: '#a0aec0' }}> {action}</span>
            </div>
            <div className="text-xs flex-shrink-0" style={{ color: '#cbd5e0' }}>{time}</div>
        </div>
    );
};

export default function Dashboard({ stats }) {
    const { auth } = usePage().props;

    const metrics = stats ?? {
        totalAlumni: 0,
        pendingCompanies: 0,
        responseRate: 0,
        activeMoU: 0,
    };

    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold" style={{ color: '#1a3560' }}>Dashboard Admin Kampus</h2>
                        <p className="text-xs mt-0.5" style={{ color: '#a0aec0' }}>{today}</p>
                    </div>
                    <div
                        className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: '#fff3eb', color: '#f97316', border: '1px solid #fed7aa' }}
                    >
                        <span className="rounded-full" style={{ width: '6px', height: '6px', background: '#f97316', display: 'inline-block' }} />
                        STMIK Mardira Indonesia
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Admin Kampus — SITAMI" />

            {/* Greeting */}
            <div
                className="rounded-xl px-6 py-5 mb-6 flex items-center justify-between"
                style={{ background: '#1a3560', boxShadow: '0 4px 20px rgba(26,53,96,0.2)' }}
            >
                <div>
                    <div className="text-xs font-bold uppercase mb-2" style={{ color: '#4a7ab0', letterSpacing: '0.12em' }}>
                        Selamat Datang Kembali
                    </div>
                    <div className="text-xl font-bold mb-1" style={{ color: '#fff' }}>
                        {auth.user.name}
                    </div>
                    <div className="text-sm" style={{ color: '#7fa3cc' }}>
                        Admin Kampus · STMIK Mardira Indonesia
                    </div>
                </div>
                <div
                    className="w-14 h-14 rounded-xl hidden sm:flex items-center justify-center text-xl font-bold flex-shrink-0"
                    style={{ background: '#f97316', color: '#fff' }}
                >
                    {auth.user.name.charAt(0).toUpperCase()}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Alumni" value={metrics.totalAlumni} sub="Terdaftar aktif"
                    icon="🎓" iconBg="#fff3eb" iconColor="#f97316" accent />
                <StatCard label="PT Menunggu Verifikasi" value={metrics.pendingCompanies} sub="Perlu ditinjau"
                    icon="🏢" iconBg="#e8f0fb" iconColor="#1a3560" />
                <StatCard label="Respons Kuesioner" value={`${metrics.responseRate}%`} sub="Dari total alumni"
                    icon="📋" iconBg="#fff3eb" iconColor="#f97316" />
                <StatCard label="MoU Aktif" value={metrics.activeMoU} sub="Kerja sama berjalan"
                    icon="📄" iconBg="#e8f0fb" iconColor="#1a3560" />
            </div>

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
                        <QuickLink label="Verifikasi Perusahaan" desc="Tinjau PT yang menunggu persetujuan" href={route('adminkampus.verify-pt')} />

                        {/* TAMBAHKAN .index DI SINI */}
                        <QuickLink label="Data Alumni" desc="Lihat dan kelola data alumni" href={route('adminkampus.alumni.index')} />

                        <QuickLink label="Kelola Kuesioner" desc="Buat & aktifkan form tracer study" href={route('adminkampus.tracer')} />

                        {/* TAMBAHKAN .index DI SINI JUGA */}
                        <QuickLink label="Dokumen MoU" desc="Arsip kerja sama perusahaan" href={route('adminkampus.mou.index')} />
                    </div>
                </div>

                {/* Activity */}
                <div className="lg:col-span-2 rounded-xl p-5" style={{ background: '#fff', border: '1px solid #e8edf5' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1a3560', letterSpacing: '0.12em' }}>
                            Aktivitas Terbaru
                        </div>
                        <div className="text-xs px-2.5 py-1 rounded-full font-semibold"
                            style={{ background: '#fff3eb', color: '#f97316' }}>
                            Hari ini
                        </div>
                    </div>
                    <ActivityRow actor="PT Teknologi Nusantara" action="mengajukan verifikasi perusahaan" time="1 jam lalu" type="create" />
                    <ActivityRow actor="Admin Kampus" action="memverifikasi PT Solusi Digital" time="3 jam lalu" type="verify" />
                    <ActivityRow actor="Alumni Baru" action="mendaftar ke sistem" time="4 jam lalu" type="create" />
                    <ActivityRow actor="Admin Kampus" action="mengupload dokumen MoU baru" time="kemarin" type="edit" />
                    <ActivityRow actor="Admin Kampus" action="menolak PT yang tidak valid" time="kemarin" type="reject" />
                    <div className="mt-5 pt-4 text-center text-xs" style={{ borderTop: '1px solid #f4f6fa', color: '#cbd5e0' }}>
                        Log aktivitas real tersedia setelah sistem aktif digunakan.
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
