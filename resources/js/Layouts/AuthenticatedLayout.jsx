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
        { name: 'Dashboard', href: route('superadmin.dashboard'), icon: '▪' },
        { name: 'Hak Akses', href: route('superadmin.users.index'), icon: '▪' },
        { name: 'Master Data', href: route('superadmin.master-data'), icon: '▪' },
    ],
    'Admin Kampus': [
        { name: 'Dashboard', href: route('adminkampus.dashboard'), icon: '▪' },
        { name: 'Tracer Study', href: route('adminkampus.tracer'), icon: '▪' },
        { name: 'Verifikasi PT', href: route('adminkampus.verify-pt'), icon: '▪' },
    ],
    'Admin PT': [
        { name: 'Dashboard', href: route('perusahaan.dashboard'), icon: '▪' },
        { name: 'Kelola Lowongan', href: route('perusahaan.lowongan'), icon: '▪' },
        { name: 'Daftar Pelamar', href: route('perusahaan.pelamar'), icon: '▪' },
    ],
    'Alumni': [
        { name: 'Dashboard', href: route('alumni.dashboard'), icon: '▪' },
        { name: 'Kuesioner', href: route('alumni.kuesioner'), icon: '▪' },
        { name: 'Bursa Kerja', href: route('alumni.loker'), icon: '▪' },
    ],
};

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    const userRole = auth.user.roles?.[0] ?? 'Alumni';
    const navigationMenu = menuConfig[userRole] ?? [];
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 h-16 flex-shrink-0" style={{ borderBottom: '1px solid #2e2e2e' }}>
                <div
                    className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: '#e8e0d0', color: '#1c1c1c' }}
                >
                    S
                </div>
                <span
                    className="font-semibold text-xs tracking-widest uppercase"
                    style={{ color: '#e8e0d0', letterSpacing: '0.18em' }}
                >
                    SITAMI
                </span>
            </div>

            {/* Role label */}
            <div className="px-6 pt-6 pb-2">
                <div className="text-xs uppercase tracking-widest" style={{ color: '#555', letterSpacing: '0.15em' }}>
                    {userRole}
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 pb-4 space-y-0.5">
                {navigationMenu.map((item) => {
                    const isActive = currentPath.startsWith(new URL(item.href, window.location.origin).pathname);
                    return (
                        <Link key={item.name} href={item.href}>
                            <div
                                className="flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all"
                                style={{
                                    background: isActive ? '#2e2e2e' : 'transparent',
                                    color: isActive ? '#e8e0d0' : '#6b6b6b',
                                    borderLeft: isActive ? '2px solid #e8e0d0' : '2px solid transparent',
                                }}
                            >
                                <span style={{ fontSize: '6px', opacity: isActive ? 1 : 0.5 }}>■</span>
                                <span className={isActive ? 'font-medium' : ''}>{item.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* User bottom */}
            <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: '1px solid #2e2e2e' }}>
                <div className="flex items-center gap-3 px-2">
                    <div
                        className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: '#2e2e2e', color: '#888' }}
                    >
                        {auth.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs font-medium truncate" style={{ color: '#bbb' }}>
                            {auth.user.name}
                        </div>
                        <div className="text-xs truncate" style={{ color: '#555' }}>
                            {auth.user.email}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen" style={{ background: '#f5f4f1' }}>

            {/* Desktop Sidebar */}
            <aside
                className="hidden md:flex flex-col w-60 fixed inset-y-0 left-0 z-30"
                style={{ background: '#1c1c1c' }}
            >
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-40 flex">
                    <div
                        className="fixed inset-0"
                        style={{ background: 'rgba(0,0,0,0.5)' }}
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative w-60 flex flex-col z-50" style={{ background: '#1c1c1c' }}>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col md:pl-60">

                {/* Topbar */}
                <header
                    className="sticky top-0 z-20 flex h-16 items-center justify-between px-4 md:px-6"
                    style={{
                        background: '#f5f4f1',
                        borderBottom: '1px solid #e4e0d8',
                    }}
                >
                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 rounded"
                        style={{ color: '#555' }}
                        onClick={() => setMobileOpen(true)}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Page title (mobile) */}
                    <div className="md:hidden text-sm font-semibold" style={{ color: '#1c1c1c' }}>SITAMI</div>

                    {/* Right */}
                    <div className="ml-auto flex items-center gap-2">
                        {/* Bell */}
                        <button
                            className="w-9 h-9 rounded flex items-center justify-center transition-colors"
                            style={{ color: '#999' }}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>

                        {/* Divider */}
                        <div className="w-px h-5 mx-1" style={{ background: '#ddd8d0' }} />

                        {/* User menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors"
                                    style={{
                                        border: '1px solid #ddd8d0',
                                        background: '#fff',
                                        color: '#1c1c1c',
                                    }}
                                >
                                    <div
                                        className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
                                        style={{ background: '#1c1c1c', color: '#e8e0d0' }}
                                    >
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium max-w-[100px] truncate text-xs">
                                        {auth.user.name}
                                    </span>
                                    <svg className="h-3 w-3" style={{ color: '#aaa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuLabel>
                                    <p className="text-sm font-medium">{auth.user.name}</p>
                                    <p className="text-xs font-normal" style={{ color: '#999' }}>{auth.user.email}</p>
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
                                        style={{ color: '#c0392b' }}
                                    >
                                        Keluar
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page header */}
                {header && (
                    <div
                        className="px-6 py-4"
                        style={{ background: '#f5f4f1', borderBottom: '1px solid #e4e0d8' }}
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
