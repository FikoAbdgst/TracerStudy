import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import useIsMobile from '@/hooks/useIsMobile';

const StatCard = ({ label, value, sub, iconBg, iconColor, icon, accent = false, compact = false }) => (
    <div
        className="rounded-xl transition-all"
        style={{
            background: accent ? '#1a3560' : '#ffffff',
            border: `1px solid ${accent ? '#1a3560' : '#e8edf5'}`,
            boxShadow: accent ? '0 4px 16px rgba(26,53,96,0.18)' : '0 1px 4px rgba(26,53,96,0.05)',
            padding: compact ? '14px 16px' : '20px 22px',
        }}
    >
        <div className="flex items-center justify-between mb-3">
            <div
                className="rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                    background: iconBg,
                    color: iconColor,
                    width: compact ? 32 : 40,
                    height: compact ? 32 : 40,
                    fontSize: compact ? 14 : 16,
                }}
            >
                {icon}
            </div>
            {sub && (
                <div
                    className="rounded-full font-semibold"
                    style={{
                        fontSize: compact ? 9 : 10,
                        padding: compact ? '2px 8px' : '3px 10px',
                        background: accent ? 'rgba(255,255,255,0.1)' : iconBg,
                        color: accent ? 'rgba(255,255,255,0.7)' : iconColor,
                    }}
                >
                    {sub}
                </div>
            )}
        </div>
        <div
            className="font-bold mb-0.5"
            style={{
                fontSize: compact ? 24 : 32,
                color: accent ? '#ffffff' : '#1a3560',
                lineHeight: 1.1,
            }}
        >
            {value}
        </div>
        <div
            className="font-semibold uppercase"
            style={{
                fontSize: compact ? 9 : 10,
                color: accent ? '#7fa3cc' : '#64748b',
                letterSpacing: '0.1em',
            }}
        >
            {label}
        </div>
    </div>
);

const QuickActionItem = ({ label, desc, href, compact = false }) => (
    <Link href={href}>
        <div
            className="flex items-center justify-between rounded-lg transition-all"
            style={{
                border: '1px solid #e8edf5',
                background: '#f8fafc',
                padding: compact ? '10px 12px' : '14px 16px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff3eb'; e.currentTarget.style.borderColor = '#f97316'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e8edf5'; }}
        >
            <div>
                <div className="font-semibold" style={{ fontSize: compact ? 12 : 14, color: '#1a3560' }}>{label}</div>
                {!compact && <div className="text-xs mt-0.5" style={{ color: '#a0aec0' }}>{desc}</div>}
            </div>
            <svg className="flex-shrink-0" style={{ width: compact ? 12 : 14, height: compact ? 12 : 14, color: '#f97316' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
        </div>
    </Link>
);

const ActivityRow = ({ actor, action, time, type, compact = false }) => {
    const dotColor = { create: '#f97316', edit: '#1a3560', delete: '#e53e3e', login: '#a0aec0' };
    return (
        <div className="flex items-center gap-2.5" style={{ padding: compact ? '8px 0' : '12px 0', borderBottom: '1px solid #f4f6fa' }}>
            <div className="flex-shrink-0 rounded-full" style={{ width: 7, height: 7, background: dotColor[type] ?? '#a0aec0' }} />
            <div className="flex-1 min-w-0" style={{ fontSize: compact ? 12 : 13 }}>
                <span className="font-semibold" style={{ color: '#1a3560' }}>{actor}</span>
                <span style={{ color: '#a0aec0' }}> {action}</span>
            </div>
            <div className="flex-shrink-0" style={{ fontSize: compact ? 10 : 11, color: '#cbd5e0' }}>{time}</div>
        </div>
    );
};

export default function Dashboard({ stats, recentUsers }) {
    const { auth } = usePage().props;
    const isMobile = useIsMobile();
    const metrics = stats ?? { totalUsers: 0, totalAlumni: 0, totalPerusahaan: 0, responsRate: 0 };
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const statsArr = [
        { label: 'Total Pengguna', value: metrics.totalUsers, sub: 'Semua role', icon: '👥', iconBg: '#fff3eb', iconColor: '#f97316', accent: true },
        { label: 'Total Alumni', value: metrics.totalAlumni, sub: 'Terdaftar aktif', icon: '🎓', iconBg: '#e8f0fb', iconColor: '#1a3560' },
        { label: 'Mitra Perusahaan', value: metrics.totalPerusahaan, sub: 'Terverifikasi', icon: '🏢', iconBg: '#fff3eb', iconColor: '#f97316' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold" style={{ color: '#1a3560' }}>Dashboard Global</h2>
                        <p className="text-xs mt-0.5" style={{ color: '#a0aec0' }}>{today}</p>
                    </div>
                    {!isMobile && (
                        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
                            style={{ background: '#fff3eb', color: '#f97316', border: '1px solid #fed7aa' }}>
                            <span className="rounded-full" style={{ width: 6, height: 6, background: '#f97316', display: 'inline-block' }} />
                            Tahun Akademik 2025/2026
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Dashboard — SITAMI" />

            {/* ═══ MOBILE ═══ */}
            {isMobile ? (
                <div style={{ padding: '0 4px' }}>
                    {/* Greeting compact */}
                    <div className="rounded-xl mb-4" style={{ background: '#1a3560', padding: '16px 18px', boxShadow: '0 4px 20px rgba(26,53,96,0.2)' }}>
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                                style={{ width: 42, height: 42, background: '#f97316', color: '#fff' }}>
                                {auth.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-bold uppercase" style={{ color: '#4a7ab0', letterSpacing: '0.1em' }}>Selamat Datang</div>
                                <div className="text-base font-bold truncate" style={{ color: '#fff' }}>{auth.user.name}</div>
                            </div>
                        </div>
                    </div>

                    {/* Stat cards 3-col compact */}
                    <div className="grid grid-cols-3 gap-2.5 mb-4">
                        {statsArr.map((s, i) => <StatCard key={i} {...s} compact />)}
                    </div>

                    {/* Quick actions compact */}
                    <div className="rounded-xl mb-4" style={{ background: '#fff', border: '1px solid #e8edf5', padding: 14 }}>
                        <div className="font-bold uppercase mb-3" style={{ fontSize: 10, color: '#1a3560', letterSpacing: '0.1em' }}>Aksi Cepat</div>
                        <div className="flex flex-col gap-1.5">
                            <QuickActionItem label="Tambah Pengguna" href={route('superadmin.users.index')} compact />
                            <QuickActionItem label="Master Data" href={route('superadmin.master-data')} compact />
                            <QuickActionItem label="Laporan Tracer" href="#" compact />
                        </div>
                    </div>

                    {/* Activity compact */}
                    <div className="rounded-xl" style={{ background: '#fff', border: '1px solid #e8edf5', padding: 14 }}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="font-bold uppercase" style={{ fontSize: 10, color: '#1a3560', letterSpacing: '0.1em' }}>Aktivitas</div>
                            <span className="rounded-full" style={{ fontSize: 9, padding: '2px 8px', background: '#fff3eb', color: '#f97316' }}>Hari ini</span>
                        </div>
                        {(recentUsers ?? []).map(u => {
                            const diff = Date.now() - new Date(u.created_at).getTime();
                            const mins = Math.floor(diff / 60000);
                            const timeStr = mins < 1 ? 'Baru saja' : mins < 60 ? `${mins}m lalu` : `${Math.floor(mins / 60)}j lalu`;
                            return <ActivityRow key={u.id} actor={u.name} action={`bergabung sebagai ${u.role}`} time={timeStr} type="create" compact />;
                        })}
                        {(!recentUsers || recentUsers.length === 0) && (
                            <div className="text-xs py-6 text-center" style={{ color: '#cbd5e0' }}>Belum ada aktivitas.</div>
                        )}
                    </div>
                </div>
            ) : (
            /* ═══ WEB ═══ */
            <>
                {/* Greeting banner full */}
                <div className="rounded-xl px-6 py-5 mb-6 flex items-center justify-between"
                    style={{ background: '#1a3560', boxShadow: '0 4px 20px rgba(26,53,96,0.2)' }}>
                    <div>
                        <div className="text-xs font-bold uppercase mb-2" style={{ color: '#4a7ab0', letterSpacing: '0.12em' }}>Selamat Datang Kembali</div>
                        <div className="text-xl font-bold mb-1" style={{ color: '#fff' }}>{auth.user.name}</div>
                        <div className="text-sm" style={{ color: '#7fa3cc' }}>Super Admin · STMIK Mardira Indonesia</div>
                    </div>
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                        style={{ background: '#f97316', color: '#fff' }}>
                        {auth.user.name.charAt(0).toUpperCase()}
                    </div>
                </div>

                {/* Stat cards 3-col */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {statsArr.map((s, i) => <StatCard key={i} {...s} />)}
                </div>

                {/* Bottom: side by side */}
                <div className="grid gap-5 grid-cols-3">
                    <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #e8edf5' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1a3560', letterSpacing: '0.12em' }}>Aksi Cepat</div>
                            <div style={{ width: 24, height: 3, background: '#f97316', borderRadius: 2 }} />
                        </div>
                        <div className="space-y-2">
                            <QuickActionItem label="Tambah Pengguna" desc="Daftarkan akun baru ke sistem" href={route('superadmin.users.index')} />
                            <QuickActionItem label="Master Data" desc="Kelola prodi & sektor industri" href={route('superadmin.master-data')} />
                            <QuickActionItem label="Laporan Tracer" desc="Unduh rekap data kuesioner" href="#" />
                        </div>
                    </div>

                    <div className="col-span-2 rounded-xl p-5" style={{ background: '#fff', border: '1px solid #e8edf5' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1a3560', letterSpacing: '0.12em' }}>Aktivitas Terbaru</div>
                            <div className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: '#fff3eb', color: '#f97316' }}>Hari ini</div>
                        </div>
                        {(recentUsers ?? []).map(u => {
                            const diff = Date.now() - new Date(u.created_at).getTime();
                            const mins = Math.floor(diff / 60000);
                            const timeStr = mins < 1 ? 'Baru saja' : mins < 60 ? `${mins}m lalu` : `${Math.floor(mins / 60)}j lalu`;
                            return <ActivityRow key={u.id} actor={u.name} action={`bergabung sebagai ${u.role}`} time={timeStr} type="create" />;
                        })}
                        {(!recentUsers || recentUsers.length === 0) && (
                            <div className="text-sm py-8 text-center" style={{ color: '#cbd5e0' }}>Belum ada aktivitas terbaru.</div>
                        )}
                    </div>
                </div>
            </>
            )}
        </AuthenticatedLayout>
    );
}
