import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Button } from '@/Components/ui/button';

// 1. Konfigurasi Menu Berdasarkan Role
const menuConfig = {
    'Super Admin': [
        { name: 'Dashboard Global', href: route('superadmin.dashboard'), icon: '📊' },
        { name: 'Master Data', href: route('superadmin.master-data'), icon: '⚙️' },
    ],
    'Admin Kampus': [
        { name: 'Dashboard', href: route('adminkampus.dashboard'), icon: '🏠' },
        { name: 'Tracer Study', href: route('adminkampus.tracer'), icon: '📝' },
        { name: 'Verifikasi PT', href: route('adminkampus.verify-pt'), icon: '🏢' },
    ],
    'Admin PT': [
        { name: 'Dashboard Perusahaan', href: route('perusahaan.dashboard'), icon: '🏢' },
        { name: 'Kelola Lowongan', href: route('perusahaan.lowongan'), icon: '💼' },
        { name: 'Daftar Pelamar', href: route('perusahaan.pelamar'), icon: '👥' },
    ],
    'Alumni': [
        { name: 'Dashboard', href: route('alumni.dashboard'), icon: '🏠' },
        { name: 'Kuesioner', href: route('alumni.kuesioner'), icon: '📋' },
        { name: 'Bursa Kerja (Loker)', href: route('alumni.loker'), icon: '💼' },
    ],
};

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    // Ambil role pertama dari user (asumsi 1 user = 1 role di sistem ini)
    const userRole = auth.user.roles && auth.user.roles.length > 0 ? auth.user.roles[0] : 'Alumni';
    const navigationMenu = menuConfig[userRole] || [];

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            {/* 2. SIDEBAR KIRI */}
            <aside className="w-64 border-r bg-white hidden md:block">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/">
                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                    </Link>
                    <span className="ml-3 font-semibold text-lg">SITAMI</span>
                </div>

                <nav className="flex flex-col gap-1 p-4">
                    <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                        Menu {userRole}
                    </div>
                    {navigationMenu.map((item) => (
                        <Link key={item.name} href={item.href}>
                            <Button
                                variant={route().current(item.href.split('/').pop() + '*') ? 'secondary' : 'ghost'}
                                className="w-full justify-start gap-3"
                            >
                                <span>{item.icon}</span>
                                {item.name}
                            </Button>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* 3. KONTEN KANAN */}
            <div className="flex-1 flex flex-col">
                {/* Top Navbar */}
                <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
                    {/* Hamburger untuk Mobile (Bisa dikembangkan dengan shadcn Sheet nanti) */}
                    <div className="md:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}>
                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </Button>
                    </div>

                    <div className="ml-auto flex items-center space-x-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 flex items-center gap-2 rounded-full border px-4">
                                    <span className="text-sm font-medium">{auth.user.name}</span>
                                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{auth.user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{auth.user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={route('profile.edit')} className="w-full cursor-pointer">Profile Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={route('logout')} method="post" as="button" className="w-full cursor-pointer text-red-600 focus:text-red-600">
                                        Log out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Header Optional */}
                {header && (
                    <div className="bg-white border-b px-6 py-4 shadow-sm">
                        {header}
                    </div>
                )}

                {/* Main Content Area */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
