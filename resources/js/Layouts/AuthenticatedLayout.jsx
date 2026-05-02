import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

const menuConfig = {
    'Super Admin': [
        { name: 'Dashboard', href: route('superadmin.dashboard') },
        { name: 'Hak Akses', href: route('superadmin.users.index') },
        { name: 'Master Data', href: route('superadmin.master-data') },
    ],
    'Admin Kampus': [
        { name: 'Dashboard', href: route('adminkampus.dashboard'), icon: '🏠' },
        { name: 'Data Alumni', href: route('adminkampus.alumni.index'), icon: '🎓' },
        { name: 'Kuesioner Tracer Study', href: route('adminkampus.tracer'), icon: '📝' },
        { name: 'Verifikasi PT', href: route('adminkampus.verify-pt'), icon: '🏢' },
        { name: 'Tinjau Lowongan', href: route('adminkampus.tinjau-lowongan'), icon: '🔍' },
        { name: 'Dokumen MoU', href: route('adminkampus.mou.index'), icon: '📄' }, // <-- Tambahkan ini
    ],
    'Admin PT': [
        { name: 'Dashboard', href: route('perusahaan.dashboard') },
        { name: 'Profil Perusahaan', href: route('perusahaan.profile.edit') },  // ← tambah ini
        { name: 'Kelola Lowongan', href: route('perusahaan.lowongan') },
        { name: 'Daftar Pelamar', href: route('perusahaan.pelamar') },
    ],
    'Alumni': [
        { name: 'Dashboard', href: route('alumni.dashboard') },
        { name: 'Kuesioner', href: route('alumni.kuesioner') },
        { name: 'Bursa Kerja', href: route('alumni.loker') },
    ],
};

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    const userRole = auth.user.roles?.[0] ?? 'Alumni';
    const navigationMenu = menuConfig[userRole] ?? [];
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const isActive = (href) => {
        try {
            return currentPath.startsWith(new URL(href, window.location.origin).pathname);
        } catch {
            return false;
        }
    };

    const NavItem = ({ item }) => {
        const active = isActive(item.href);
        return (
            <Link href={item.href}>
                <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                    style={{
                        background: active ? '#f97316' : 'transparent',
                        color: active ? '#ffffff' : '#7fa3cc',
                        fontWeight: active ? '600' : '400',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                    <span
                        className="flex-shrink-0 rounded-full"
                        style={{
                            width: '6px',
                            height: '6px',
                            background: active ? '#fff' : '#3a6090',
                        }}
                    />
                    {item.name}
                </div>
            </Link>
        );
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div
                className="flex items-center gap-3 px-5 flex-shrink-0"
                style={{ height: '64px', borderBottom: '1px solid #1e3d6e' }}
            >
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: '#f97316', color: '#fff' }}
                >
                    M
                </div>
                <div>
                    <div className="text-xs font-bold tracking-wider" style={{ color: '#fff', letterSpacing: '0.12em' }}>
                        SITAMI
                    </div>
                    <div className="text-xs" style={{ color: '#7fa3cc', fontSize: '10px' }}>
                        STMIK Mardira
                    </div>
                </div>
            </div>

            {/* Role badge */}
            <div className="px-5 pt-5 pb-2">
                <div
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded"
                    style={{
                        background: 'rgba(249,115,22,0.15)',
                        color: '#f97316',
                        letterSpacing: '0.1em',
                        fontSize: '10px',
                    }}
                >
                    <span
                        style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f97316', display: 'inline-block' }}
                    />
                    {userRole.toUpperCase()}
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5 mt-1">
                {navigationMenu.map((item) => (
                    <NavItem key={item.name} item={item} />
                ))}
            </nav>

            {/* User bottom */}
            <div
                className="px-4 py-4 flex-shrink-0"
                style={{ borderTop: '1px solid #1e3d6e' }}
            >
                <div className="flex items-center gap-3 px-1">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: '#f97316', color: '#fff' }}
                    >
                        {auth.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs font-semibold truncate" style={{ color: '#e2eaf5' }}>
                            {auth.user.name}
                        </div>
                        <div className="text-xs truncate" style={{ color: '#4a6a8a', fontSize: '10px' }}>
                            {auth.user.email}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen" style={{ background: '#f4f6fa' }}>

            {/* Desktop Sidebar */}
            <aside
                className="hidden md:flex flex-col w-60 fixed inset-y-0 left-0 z-30"
                style={{ background: '#1a3560' }}
            >
                <SidebarContent />
            </aside>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-40 flex">
                    <div
                        className="fixed inset-0"
                        style={{ background: 'rgba(0,0,0,0.45)' }}
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative w-60 flex flex-col z-50" style={{ background: '#1a3560' }}>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col md:pl-60">

                {/* Topbar */}
                <header
                    className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-6"
                    style={{
                        height: '64px',
                        background: '#ffffff',
                        borderBottom: '1px solid #e8edf5',
                        boxShadow: '0 1px 4px rgba(26,53,96,0.06)',
                    }}
                >
                    {/* Hamburger */}
                    <button
                        className="md:hidden p-2 rounded-lg transition-colors"
                        style={{ color: '#1a3560' }}
                        onClick={() => setMobileOpen(true)}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Mobile brand */}
                    <div className="md:hidden font-bold text-sm" style={{ color: '#1a3560' }}>
                        SITAMI
                    </div>

                    {/* Right */}
                    <div className="ml-auto flex items-center gap-3">

                        {/* Bell */}
                        <button
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                            style={{ border: '1px solid #e8edf5', background: '#f8fafc', color: '#9aa5b4' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f0f4f8'}
                            onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>

                        {/* Divider */}
                        <div style={{ width: '1px', height: '20px', background: '#e8edf5' }} />

                        {/* User Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
                                    style={{
                                        border: '1px solid #e8edf5',
                                        background: '#f8fafc',
                                        color: '#1a3560',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f0f4f8'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                                >
                                    <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                        style={{ background: '#f97316', color: '#fff' }}
                                    >
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-xs max-w-[100px] truncate">
                                        {auth.user.name}
                                    </span>
                                    <svg className="h-3 w-3" style={{ color: '#9aa5b4' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuLabel>
                                    <p className="text-sm font-semibold" style={{ color: '#1a3560' }}>{auth.user.name}</p>
                                    <p className="text-xs font-normal" style={{ color: '#9aa5b4' }}>{auth.user.email}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={route('profile.edit')} className="cursor-pointer w-full text-sm">
                                        Pengaturan Profil
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="cursor-pointer w-full text-sm"
                                        style={{ color: '#e53e3e' }}
                                    >
                                        Keluar dari Sistem
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Header */}
                {header && (
                    <div
                        className="px-6 py-4"
                        style={{ background: '#fff', borderBottom: '1px solid #e8edf5' }}
                    >
                        {header}
                    </div>
                )}

                {/* Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
