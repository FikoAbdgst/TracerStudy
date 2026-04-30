import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

const StatCard = ({ label, value, sub, accent = false }) => (
    <div
        className="rounded p-5"
        style={{
            background: accent ? '#1c1c1c' : '#fff',
            border: '1px solid',
            borderColor: accent ? '#1c1c1c' : '#e4e0d8',
        }}
    >
        <div
            className="text-xs uppercase tracking-widest mb-3 font-medium"
            style={{ color: accent ? '#888' : '#aaa', letterSpacing: '0.12em' }}
        >
            {label}
        </div>
        <div
            className="text-3xl font-bold mb-1"
            style={{
                color: accent ? '#e8e0d0' : '#1c1c1c',
                fontFamily: 'Georgia, serif',
            }}
        >
            {value}
        </div>
        {sub && (
            <div className="text-xs" style={{ color: accent ? '#666' : '#bbb' }}>
                {sub}
            </div>
        )}
    </div>
);

const QuickAction = ({ label, href, desc }) => (
    <Link href={href}>
        <div
            className="flex items-center justify-between px-4 py-3.5 rounded text-sm transition-all group"
            style={{ background: '#fff', border: '1px solid #e4e0d8' }}
        >
            <div>
                <div className="font-medium text-sm" style={{ color: '#1c1c1c' }}>{label}</div>
                <div className="text-xs mt-0.5" style={{ color: '#bbb' }}>{desc}</div>
            </div>
            <svg
                className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5"
                style={{ color: '#ccc' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
        </div>
    </Link>
);

const ActivityRow = ({ actor, action, time, type }) => {
    const dot = { create: '#4caf82', edit: '#d4a84b', delete: '#c0392b', login: '#999' };
    return (
        <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid #f0ede8' }}>
            <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: dot[type] ?? '#999' }}
            />
            <div className="flex-1 text-sm min-w-0">
                <span className="font-medium" style={{ color: '#1c1c1c' }}>{actor}</span>
                <span style={{ color: '#aaa' }}> {action}</span>
            </div>
            <div className="text-xs flex-shrink-0" style={{ color: '#ccc' }}>{time}</div>
        </div>
    );
};

export default function Dashboard({ stats }) {
    const { auth } = usePage().props;

    const metrics = stats ?? {
        totalUsers: 0,
        totalAlumni: 0,
        totalPerusahaan: 0,
        responsRate: '0%',
    };

    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2
                            className="text-lg font-bold"
                            style={{ color: '#1c1c1c', fontFamily: 'Georgia, serif' }}
                        >
                            Dashboard Global
                        </h2>
                        <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>
                            {today}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard — SITAMI" />

            {/* Greeting */}
            <div
                className="rounded px-6 py-5 mb-6 flex items-center justify-between"
                style={{ background: '#1c1c1c' }}
            >
                <div>
                    <div className="text-xs uppercase tracking-widest mb-2" style={{ color: '#555', letterSpacing: '0.15em' }}>
                        Selamat datang kembali
                    </div>
                    <div
                        className="text-xl font-bold"
                        style={{ color: '#e8e0d0', fontFamily: 'Georgia, serif' }}
                    >
                        {auth.user.name}
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#666' }}>
                        Super Admin · SITAMI
                    </div>
                </div>
                <div
                    className="w-12 h-12 rounded flex items-center justify-center text-lg font-bold hidden sm:flex"
                    style={{ background: '#2e2e2e', color: '#e8e0d0' }}
                >
                    {auth.user.name.charAt(0).toUpperCase()}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <StatCard label="Total Pengguna" value={metrics.totalUsers} sub="Semua role" accent />
                <StatCard label="Total Alumni" value={metrics.totalAlumni} sub="Terdaftar" />
                <StatCard label="Mitra Perusahaan" value={metrics.totalPerusahaan} sub="Terverifikasi" />
                <StatCard label="Respons Kuesioner" value={metrics.responsRate} sub="Dari total alumni" />
            </div>

            {/* Bottom Grid */}
            <div className="grid gap-4 lg:grid-cols-3">

                {/* Quick Actions */}
                <div
                    className="rounded p-5"
                    style={{ background: '#fff', border: '1px solid #e4e0d8' }}
                >
                    <div
                        className="text-xs uppercase tracking-widest mb-4 font-medium"
                        style={{ color: '#aaa', letterSpacing: '0.12em' }}
                    >
                        Aksi Cepat
                    </div>
                    <div className="space-y-2">
                        <QuickAction
                            label="Tambah Pengguna"
                            href={route('superadmin.users.index')}
                            desc="Daftarkan pengguna baru ke sistem"
                        />
                        <QuickAction
                            label="Master Data"
                            href={route('superadmin.master-data')}
                            desc="Kelola prodi & sektor industri"
                        />
                        <QuickAction
                            label="Laporan Tracer"
                            href="#"
                            desc="Unduh laporan respons alumni"
                        />
                    </div>
                </div>

                {/* Recent Activity */}
                <div
                    className="lg:col-span-2 rounded p-5"
                    style={{ background: '#fff', border: '1px solid #e4e0d8' }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div
                            className="text-xs uppercase tracking-widest font-medium"
                            style={{ color: '#aaa', letterSpacing: '0.12em' }}
                        >
                            Aktivitas Terbaru
                        </div>
                        <div className="text-xs" style={{ color: '#ccc' }}>Hari ini</div>
                    </div>

                    <ActivityRow actor="Admin Kampus" action="memperbarui data prodi" time="2 jam lalu" type="edit" />
                    <ActivityRow actor="Super Admin" action="menambah pengguna baru" time="4 jam lalu" type="create" />
                    <ActivityRow actor="Alumni Baru" action="login pertama kali" time="5 jam lalu" type="login" />
                    <ActivityRow actor="Admin PT" action="mendaftarkan lowongan" time="kemarin" type="create" />
                    <ActivityRow actor="Admin Kampus" action="menghapus data duplikat" time="kemarin" type="delete" />

                    <div className="mt-4 pt-2 text-center">
                        <span className="text-xs" style={{ color: '#ddd' }}>
                            Data aktivitas real akan tersedia setelah sistem aktif digunakan.
                        </span>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
