import { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import NotificationDropdown from '@/Components/NotificationDropdown';
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
        { name: 'Ruang Diskusi', href: route('alumni.forum.index') },
    ],
    'Admin Kampus': [
        { name: 'Dashboard', href: route('adminkampus.dashboard') },
        { name: 'Data Alumni', href: route('adminkampus.alumni.index') },
        { name: 'Tracer Study', href: route('adminkampus.tracer') },
        { name: 'Manajemen Mitra', href: route('adminkampus.mitra.index') },
        { name: 'Tinjau Lowongan', href: route('adminkampus.tinjau-lowongan') },
        { name: 'Ruang Diskusi', href: route('alumni.forum.index') },
    ],
    'Admin PT': [
        { name: 'Dashboard', href: route('perusahaan.dashboard') },
        { name: 'Profil Perusahaan', href: route('perusahaan.profile.edit') },
        { name: 'Kelola Lowongan', href: route('perusahaan.lowongan') },
        { name: 'Daftar Pelamar', href: route('perusahaan.pelamar') },
        { name: 'Bakat Potensial', href: route('perusahaan.talent-pool') },
    ],
    'Alumni': [
        { name: 'Dashboard', href: route('alumni.dashboard') },
        { name: 'Profil Alumni', href: route('alumni.profile.edit') },
        { name: 'Kuesioner', href: route('alumni.kuesioner') },
        { name: 'Bursa Kerja', href: route('alumni.loker') },
        { name: 'Status Lamaran', href: route('alumni.lamaran') },
        { name: 'Ruang Diskusi', href: route('alumni.forum.index') },
    ],
};

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const navRef = useRef(null);

    const userRole = auth.user.roles?.[0] ?? 'Alumni';
    let navigationMenu = menuConfig[userRole] ?? [];
    // Pastikan "Ruang Diskusi" tidak muncul untuk role perusahaan/Admin PT
    const forumRoles = ['Alumni', 'Super Admin', 'Admin Kampus'];
    const canAccessForum = auth.user.roles?.some(r => forumRoles.includes(r));
    if (!canAccessForum) {
        navigationMenu = navigationMenu.filter(item => item.name !== 'Ruang Diskusi');
    }
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const isActive = (href) => {
        try {
            return currentPath.startsWith(new URL(href, window.location.origin).pathname);
        } catch {
            return false;
        }
    };

    // Close mobile menu on outside click
    useEffect(() => {
        const handler = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) {
                setMobileOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

                .al-root {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    min-height: 100vh;
                    background: #f0f4f9;
                    display: flex;
                    flex-direction: column;
                }

                /* ======= NAVBAR ======= */
                .al-navbar {
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    height: 60px;
                    background: #ffffff;
                    border-bottom: 1px solid #e8edf5;
                    box-shadow: 0 1px 3px rgba(26,53,96,0.06);
                    display: flex;
                    align-items: center;
                    padding: 0 24px;
                    gap: 0;
                }

                .al-brand {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                    flex-shrink: 0;
                    margin-right: 32px;
                }

                .al-brand-mark {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: #1a3560;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 800;
                    color: #fff;
                }

                .al-brand-text {
                    font-size: 14px;
                    font-weight: 800;
                    color: #1a3560;
                    letter-spacing: 0.06em;
                }

                .al-brand-divider {
                    width: 1px;
                    height: 20px;
                    background: #e2e8f0;
                    margin: 0 2px;
                }

                .al-brand-role {
                    font-size: 10px;
                    font-weight: 600;
                    color: #f97316;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }

                /* Desktop nav links */
                .al-nav-links {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    flex: 1;
                }

                .al-nav-link {
                    position: relative;
                    padding: 6px 13px;
                    border-radius: 7px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #64748b;
                    text-decoration: none;
                    transition: color 0.15s, background 0.15s;
                    white-space: nowrap;
                }

                .al-nav-link:hover {
                    color: #1a3560;
                    background: #f0f4f9;
                }

                .al-nav-link.active {
                    color: #1a3560;
                    font-weight: 700;
                    background: #e8f0fb;
                }

                .al-nav-link.active::after {
                    content: '';
                    position: absolute;
                    bottom: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 20px;
                    height: 2px;
                    border-radius: 2px;
                    background: #f97316;
                }

                /* Right side */
                .al-nav-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-left: auto;
                    flex-shrink: 0;
                }

                /* Icon button */
                .al-icon-btn {
                    position: relative;
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: 1px solid #e8edf5;
                    background: #f8fafc;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.15s, border-color 0.15s;
                }

                .al-icon-btn:hover {
                    background: #f0f4f9;
                    border-color: #d1d9e3;
                    color: #1a3560;
                }

                /* User button */
                .al-user-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 5px 12px 5px 6px;
                    border-radius: 8px;
                    border: 1px solid #e8edf5;
                    background: #f8fafc;
                    cursor: pointer;
                    transition: background 0.15s, border-color 0.15s;
                }

                .al-user-btn:hover {
                    background: #f0f4f9;
                    border-color: #d1d9e3;
                }

                .al-avatar {
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    background: #1a3560;
                    color: #fff;
                    font-size: 11px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .al-user-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: #1a3560;
                    max-width: 96px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                /* Mobile hamburger */
                .al-hamburger {
                    display: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: 1px solid #e8edf5;
                    background: #f8fafc;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #1a3560;
                    margin-right: 12px;
                    transition: background 0.15s;
                }

                .al-hamburger:hover { background: #f0f4f9; }

                /* PERBAIKAN: Mobile menu drawer menggunakan opacity/visibility bukan unmount */
                .al-mobile-menu {
                    position: absolute;
                    top: 60px;
                    left: 0;
                    right: 0;
                    background: #ffffff;
                    border-bottom: 1px solid #e8edf5;
                    box-shadow: 0 8px 24px rgba(26,53,96,0.1);
                    z-index: 49;
                    padding: 12px 16px 16px;
                    transform-origin: top;

                    /* Hidden by default */
                    opacity: 0;
                    visibility: hidden;
                    transform: scaleY(0.92);
                    pointer-events: none;
                    transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
                }

                /* Class ketika terbuka */
                .al-mobile-menu.open {
                    opacity: 1;
                    visibility: visible;
                    transform: scaleY(1);
                    pointer-events: auto;
                }

                .al-mobile-link {
                    display: block;
                    padding: 10px 14px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                    text-decoration: none;
                    transition: background 0.12s, color 0.12s;
                    margin-bottom: 2px;
                }

                .al-mobile-link:hover { background: #f0f4f9; color: #1a3560; }
                .al-mobile-link.active {
                    background: #e8f0fb;
                    color: #1a3560;
                    font-weight: 700;
                }

                /* Notification badge */
                .notif-dot {
                    position: absolute;
                    top: 7px;
                    right: 7px;
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #ef4444;
                    border: 1.5px solid #fff;
                }

                /* Page header */
                .al-page-header {
                    background: #fff;
                    border-bottom: 1px solid #e8edf5;
                    padding: 16px 28px;
                }

                /* Main content */
                .al-main {
                    flex: 1;
                    padding: 28px;
                }

                @media (max-width: 768px) {
                    .al-nav-links { display: none; }
                    .al-hamburger { display: flex; }
                    .al-brand { margin-right: 0; }
                    .al-main { padding: 18px 16px; }
                    .al-page-header { padding: 14px 16px; }
                    .al-navbar { padding: 0 16px; }
                    .al-user-name { display: none; }
                }
            `}</style>

            <div className="al-root">
                {/* ===== NAVBAR ===== */}
                <nav className="al-navbar" ref={navRef}>
                    {/* Mobile hamburger */}
                    <button className="al-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            {mobileOpen
                                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
                        </svg>
                    </button>

                    {/* Brand */}
                    <Link href="#" className="al-brand">
                        <div className="al-brand-mark">M</div>
                        <div className="al-brand-divider" />
                        <span className="al-brand-text">SITAMI</span>
                        <span className="al-brand-role">{userRole}</span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="al-nav-links">
                        {navigationMenu.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`al-nav-link${isActive(item.href) ? ' active' : ''}`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="al-nav-right">
                        <NotificationDropdown />

                        {/* User dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="al-user-btn">
                                    <div className="al-avatar">
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="al-user-name">{auth.user.name}</span>
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 bg-white border border-gray-100 shadow-2xl rounded-xl z-[999]">
                                <DropdownMenuLabel>
                                    <p className="text-sm font-bold text-slate-800">{auth.user.name}</p>
                                    <p className="text-xs font-normal text-slate-400 mt-0.5">{auth.user.email}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={route('profile.edit')} className="cursor-pointer w-full text-sm text-slate-700">
                                        Pengaturan Akun
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="cursor-pointer w-full text-sm text-red-500"
                                    >
                                        Keluar dari Sistem
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* PERBAIKAN: Mobile Menu Drawer kini selalu dirender tapi dikontrol oleh class CSS open/closed */}
                    <div className={`al-mobile-menu ${mobileOpen ? 'open' : ''}`}>
                        {navigationMenu.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`al-mobile-link${isActive(item.href) ? ' active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* Page Header */}
                {header && (
                    <div className="al-page-header">
                        {header}
                    </div>
                )}

                {/* Main Content */}
                <main className="al-main">
                    {children}
                </main>
            </div>
        </>
    );
}
