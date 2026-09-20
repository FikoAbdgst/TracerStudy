import { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    Handshake,
    Eye,
    ShieldCheck,
    Database,
    MessagesSquare,
    Building2,
    Briefcase,
    Sparkles,
    UserCheck,
    UserRound,
    ListChecks,
    BriefcaseBusiness,
    ClipboardCheck,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import NotificationDropdown from '@/Components/NotificationDropdown';
import ChatDropdown from '@/Components/ChatDropdown';
import MobileNavDropdown from '@/Components/MobileNavDropdown';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

const menuConfig = {
    'Admin Kampus': [
        {
            section: 'Utama',
            items: [
                { name: 'Dashboard', href: route('adminkampus.dashboard') },
            ],
        },
        {
            section: 'Alumni & Tracer',
            items: [
                { name: 'Data Alumni', href: route('adminkampus.alumni.index') },
                { name: 'Tracer Study', href: route('adminkampus.tracer') },
            ],
        },
        {
            section: 'Mitra & Lowongan',
            items: [
                { name: 'Manajemen Mitra', href: route('adminkampus.mitra.index') },
                { name: 'Tinjau Lowongan', href: route('adminkampus.tinjau-lowongan') },
            ],
        },
        {
            section: 'Komunitas',
            items: [
                { name: 'Ruang Diskusi', href: route('alumni.forum.index') },
            ],
        },
        {
            section: 'Sistem',
            items: [
                { name: 'Hak Akses', href: route('adminkampus.users.index') },
                { name: 'Master Data', href: route('adminkampus.master-data') },
            ],
        },
    ],
    'Admin PT': [
        {
            section: 'Utama',
            items: [
                { name: 'Dashboard', href: route('perusahaan.dashboard') },
            ],
        },
        {
            section: 'Profil',
            items: [
                { name: 'Profil Perusahaan', href: route('perusahaan.profile.edit') },
            ],
        },
        {
            section: 'Rekrutmen',
            items: [
                { name: 'Kelola Lowongan', href: route('perusahaan.lowongan') },
                { name: 'Bakat Potensial', href: route('perusahaan.talent-pool') },
                { name: 'Daftar Pelamar', href: route('perusahaan.pelamar') },
            ],
        },
    ],
    'Alumni': [
        {
            section: 'Utama',
            items: [
                { name: 'Dashboard', href: route('alumni.dashboard') },
            ],
        },
        {
            section: 'Profil',
            items: [
                { name: 'Profil Alumni', href: route('alumni.profile.edit') },
            ],
        },
        {
            section: 'Tracer Study',
            items: [
                { name: 'Kuesioner', href: route('alumni.kuesioner') },
            ],
        },
        {
            section: 'Rekrutmen',
            items: [
                { name: 'Bursa Kerja', href: route('alumni.loker') },
                { name: 'Status Lamaran', href: route('alumni.lamaran') },
            ],
        },
        {
            section: 'Komunitas',
            items: [
                { name: 'Ruang Diskusi', href: route('alumni.forum.index') },
            ],
        },
    ],
};

const menuIcons = {
    'Dashboard': LayoutDashboard,
    'Data Alumni': Users,
    'Tracer Study': ClipboardList,
    'Manajemen Mitra': Handshake,
    'Tinjau Lowongan': Eye,
    'Hak Akses': ShieldCheck,
    'Master Data': Database,
    'Ruang Diskusi': MessagesSquare,
    'Profil Perusahaan': Building2,
    'Kelola Lowongan': Briefcase,
    'Bakat Potensial': Sparkles,
    'Daftar Pelamar': UserCheck,
    'Profil Alumni': UserRound,
    'Kuesioner': ListChecks,
    'Bursa Kerja': BriefcaseBusiness,
    'Status Lamaran': ClipboardCheck,
};

export default function AuthenticatedLayout({ header, children }) {
    const page = usePage();
    const { auth } = page.props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const navbarRef = useRef(null);

    const userRole = auth.user.roles?.[0] ?? 'Alumni';
    // Admin Kampus & Admin PT → sidebar; Alumni → top navbar
    const useSidebar = ['Admin Kampus', 'Admin PT'].includes(userRole);
    let navigationMenu = menuConfig[userRole] ?? [];
    // Pastikan "Ruang Diskusi" tidak muncul untuk role perusahaan/Admin PT
    const forumRoles = ['Alumni', 'Admin Kampus'];
    const canAccessForum = auth.user.roles?.some(r => forumRoles.includes(r));
    if (!canAccessForum) {
        navigationMenu = navigationMenu
            .map(section => ({ ...section, items: section.items.filter(item => item.name !== 'Ruang Diskusi') }))
            .filter(section => section.items.length > 0);
    }
    const flatItems = navigationMenu.flatMap(section => section.items);
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const isActive = (href) => {
        try {
            return currentPath.startsWith(new URL(href, window.location.origin).pathname);
        } catch {
            return false;
        }
    };

    // Tutup drawer mobile saat navigasi
    useEffect(() => {
        setMobileOpen(false);
    }, [page.url]);

    // ESC menutup dropdown/drawer pada kedua mode
    useEffect(() => {
        if (!mobileOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') setMobileOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [mobileOpen]);

    // Lock body scroll hanya saat drawer sidebar (role console) terbuka
    useEffect(() => {
        if (!mobileOpen || !useSidebar) return;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen, useSidebar]);

    // Klik di luar menutup dropdown mobile (mode navbar Alumni)
    useEffect(() => {
        if (!mobileOpen || useSidebar) return;
        const handler = (e) => {
            if (navbarRef.current && !navbarRef.current.contains(e.target)) {
                setMobileOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [mobileOpen, useSidebar]);

    const desktopIcons = (
        <div className="al-desktop-icons">
            <NotificationDropdown />
            <ChatDropdown />
        </div>
    );

    const mobileIcons = (
        <div className="al-mobile-icons">
            <MobileNavDropdown />
        </div>
    );

    const userMenu = (
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
    );

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

                .al-root {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    min-height: 100vh;
                    background: #f0f4f9;
                }

                .al-root-nav {
                    display: flex;
                    flex-direction: column;
                }

                /* ======= SIDEBAR ======= */
                .al-sidebar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    width: 264px;
                    z-index: 60;
                    background: #ffffff;
                    border-right: 1px solid #e8edf5;
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
                }

                .al-sb-brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 20px 20px 18px;
                    border-bottom: 1px solid #e8edf5;
                }

                .al-brand-mark {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    overflow: hidden;
                    flex-shrink: 0;
                    background: #fff;
                }

                .al-brand-mark img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .al-sb-brand-name {
                    font-size: 15px;
                    font-weight: 800;
                    color: #1a3560;
                    letter-spacing: 0.06em;
                    line-height: 1.15;
                }

                .al-brand-role {
                    font-size: 10px;
                    font-weight: 700;
                    color: #f97316;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    margin-top: 2px;
                }

                .al-sb-close {
                    display: none;
                    margin-left: auto;
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: #f0f4f9;
                    color: #64748b;
                    border-radius: 8px;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: background 0.15s;
                }

                .al-sb-close:hover { background: #e8edf5; color: #1a3560; }

                .al-sb-nav {
                    flex: 1;
                    min-height: 0;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 14px 12px 8px;
                    scrollbar-width: thin;
                    scrollbar-color: #c9d3e0 #f7f9fc;
                }

                .al-sb-nav::-webkit-scrollbar { width: 6px; }
                .al-sb-nav::-webkit-scrollbar-track { background: transparent; }
                .al-sb-nav::-webkit-scrollbar-thumb { background: #c9d3e0; border-radius: 999px; }
                .al-sb-nav::-webkit-scrollbar-thumb:hover { background: #a9b6c8; }

                .al-sb-label {
                    font-size: 10px;
                    font-weight: 700;
                    color: #9aa7ba;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    padding: 6px 14px;
                    margin-bottom: 6px;
                }

                .al-sb-group-mt {
                    margin-top: 10px;
                    padding-top: 8px;
                    border-top: 1px solid #eef2f7;
                }

                .al-sidebar-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    border-radius: 9px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #64748b;
                    text-decoration: none;
                    margin-bottom: 3px;
                    position: relative;
                    transition: background 0.15s, color 0.15s;
                }

                .al-sidebar-link:hover {
                    background: #f0f4f9;
                    color: #1a3560;
                }

                .al-sidebar-link.active {
                    background: #e8f0fb;
                    color: #1a3560;
                    font-weight: 700;
                }

                .al-sb-icon {
                    flex-shrink: 0;
                    color: #94a3b8;
                    transition: color 0.15s;
                }

                .al-sidebar-link.active .al-sb-icon {
                    color: #f97316;
                }

                .al-sb-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #f97316;
                    margin-left: auto;
                    flex-shrink: 0;
                }

                .al-sb-footer {
                    padding: 14px 16px;
                    border-top: 1px solid #e8edf5;
                }

                .al-sb-user {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .al-sb-user-meta {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                }

                .al-sb-user-name {
                    font-size: 13px;
                    font-weight: 700;
                    color: #1a3560;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .al-sb-user-role {
                    font-size: 10px;
                    font-weight: 600;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .al-sb-logout {
                    flex-shrink: 0;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: 1px solid #e8edf5;
                    background: #f8fafc;
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .al-sb-logout:hover {
                    background: #fef2f2;
                    border-color: #fecaca;
                    color: #dc2626;
                }

                /* ======= BACKDROP (mobile drawer) ======= */
                .al-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 55;
                    background: rgba(15, 28, 55, 0.42);
                    backdrop-filter: blur(2px);
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.25s ease, visibility 0.25s;
                }

                .al-backdrop.open {
                    opacity: 1;
                    visibility: visible;
                }

                /* ======= MAIN WRAP ======= */
                .al-main-wrap {
                    margin-left: 264px;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                }

                /* ======= TOPBAR ======= */
                .al-topbar {
                    position: sticky;
                    top: 0;
                    z-index: 40;
                    height: 60px;
                    background: #ffffff;
                    border-bottom: 1px solid #e8edf5;
                    box-shadow: 0 1px 3px rgba(26, 53, 96, 0.06);
                    display: flex;
                    align-items: center;
                    padding: 0 24px;
                    gap: 8px;
                }

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
                    margin-right: 4px;
                    transition: background 0.15s;
                }

                .al-hamburger:hover { background: #f0f4f9; }

                .al-mobile-brand {
                    display: none;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                }

                .al-mobile-brand img {
                    width: 26px;
                    height: 26px;
                    object-fit: contain;
                }

                .al-mobile-brand span {
                    font-size: 14px;
                    font-weight: 800;
                    color: #1a3560;
                    letter-spacing: 0.06em;
                }

                .al-topbar-spacer { flex: 1; }

                /* ======= NAVBAR MODE (Alumni) ======= */
                .al-navbar {
                    position: sticky;
                    top: 0;
                    z-index: 40;
                    height: 60px;
                    background: #ffffff;
                    border-bottom: 1px solid #e8edf5;
                    box-shadow: 0 1px 3px rgba(26, 53, 96, 0.06);
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
                    margin-right: 24px;
                }

                .al-brand-mark.al-brand-mark-sm {
                    width: 30px;
                    height: 30px;
                }

                .al-brand-divider {
                    width: 1px;
                    height: 20px;
                    background: #e2e8f0;
                    margin: 0 2px;
                }

                .al-brand-text {
                    font-size: 14px;
                    font-weight: 800;
                    color: #1a3560;
                    letter-spacing: 0.06em;
                }

                .al-nav-links {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    flex: 1;
                    min-width: 0;
                }

                .al-nav-link {
                    position: relative;
                    padding: 6px 12px;
                    border-radius: 7px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #64748b;
                    text-decoration: none;
                    white-space: nowrap;
                    transition: color 0.15s, background 0.15s;
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

                /* Dropdown mobile (Alumni) */
                .al-mobile-menu {
                    position: absolute;
                    top: 60px;
                    left: 0;
                    right: 0;
                    background: #ffffff;
                    border-bottom: 1px solid #e8edf5;
                    box-shadow: 0 8px 24px rgba(26, 53, 96, 0.1);
                    z-index: 49;
                    padding: 12px 16px 16px;
                    transform-origin: top;
                    opacity: 0;
                    visibility: hidden;
                    transform: scaleY(0.92);
                    pointer-events: none;
                    transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
                }

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
                    margin-bottom: 2px;
                    transition: background 0.12s, color 0.12s;
                }

                .al-mobile-link:hover { background: #f0f4f9; color: #1a3560; }
                .al-mobile-link.active {
                    background: #e8f0fb;
                    color: #1a3560;
                    font-weight: 700;
                }

                /* Icon button (dipakai Notification/Chat/MobileNav dropdown) */
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

                .al-desktop-icons { display: flex; align-items: center; gap: 2px; }
                .al-mobile-icons { display: none; }

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

                @media (max-width: 1024px) {
                    .al-sidebar {
                        transform: translateX(-110%);
                        box-shadow: 12px 0 32px rgba(15, 28, 55, 0.18);
                        z-index: 65;
                    }

                    .al-sidebar.open {
                        transform: translateX(0);
                    }

                    .al-sb-close { display: flex; }

                    .al-main-wrap { margin-left: 0; }

                    .al-nav-links { display: none; }
                    .al-navbar { padding: 0 14px; }

                    .al-hamburger { display: flex; }
                    .al-mobile-brand { display: flex; }
                    .al-topbar { padding: 0 14px; }
                    .al-main { padding: 18px 16px; }
                    .al-page-header { padding: 14px 16px; }
                    .al-user-name { display: none; }
                }
            `}</style>

            <div className={`al-root${useSidebar ? '' : ' al-root-nav'}`}>
                {useSidebar ? (
                    <>
                        {/* Backdrop (mobile drawer) */}
                        <div
                            className={`al-backdrop ${mobileOpen ? 'open' : ''}`}
                            onClick={() => setMobileOpen(false)}
                        />

                        {/* ===== SIDEBAR ===== */}
                        <aside className={`al-sidebar ${mobileOpen ? 'open' : ''}`}>
                            <div className="al-sb-brand">
                                <div className="al-brand-mark"><img src="/logo.jpg" alt="SITAMI" /></div>
                                <div>
                                    <div className="al-sb-brand-name">SITAMI</div>
                                    <div className="al-brand-role">{userRole}</div>
                                </div>
                                <button className="al-sb-close" onClick={() => setMobileOpen(false)} aria-label="Tutup menu">
                                    <X size={16} />
                                </button>
                            </div>

                            <nav className="al-sb-nav">
                                {navigationMenu.map((section, si) => (
                                    <div key={section.section} className={`al-sb-group${si > 0 ? ' al-sb-group-mt' : ''}`}>
                                        <div className="al-sb-label">{section.section}</div>
                                        {section.items.map((item) => {
                                            const Icon = menuIcons[item.name] ?? LayoutDashboard;
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className={`al-sidebar-link${isActive(item.href) ? ' active' : ''}`}
                                                >
                                                    <Icon size={17} className="al-sb-icon" />
                                                    <span>{item.name}</span>
                                                    {isActive(item.href) && <span className="al-sb-dot" />}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ))}
                            </nav>

                            <div className="al-sb-footer">
                                <div className="al-sb-user">
                                    <div className="al-avatar" style={{ width: 32, height: 32 }}>
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="al-sb-user-meta">
                                        <span className="al-sb-user-name">{auth.user.name}</span>
                                        <span className="al-sb-user-role">{userRole}</span>
                                    </div>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="al-sb-logout"
                                        title="Keluar"
                                    >
                                        <LogOut size={16} />
                                    </Link>
                                </div>
                            </div>
                        </aside>

                        {/* ===== MAIN WRAP ===== */}
                        <div className="al-main-wrap">
                            {/* Topbar */}
                            <nav className="al-topbar">
                                <button className="al-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
                                    {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                                </button>

                                <Link href="#" className="al-mobile-brand">
                                    <img src="/logo.jpg" alt="SITAMI" />
                                    <span>SITAMI</span>
                                </Link>

                                <div className="al-topbar-spacer" />

                                {desktopIcons}
                                {mobileIcons}
                                {userMenu}
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
                ) : (
                    <>
                        {/* ===== NAVBAR (Alumni) ===== */}
                        <nav className="al-navbar" ref={navbarRef}>
                            <button className="al-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
                                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                            </button>

                            <Link href="#" className="al-brand">
                                <div className="al-brand-mark al-brand-mark-sm"><img src="/logo.jpg" alt="SITAMI" /></div>
                                <div className="al-brand-divider" />
                                <span className="al-brand-text">SITAMI</span>
                                <span className="al-brand-role">{userRole}</span>
                            </Link>

                            <div className="al-nav-links">
                                {flatItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`al-nav-link${isActive(item.href) ? ' active' : ''}`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>

                            {desktopIcons}
                            {mobileIcons}
                            {userMenu}

                            {/* Dropdown mobile (Alumni) */}
                            <div className={`al-mobile-menu ${mobileOpen ? 'open' : ''}`}>
                                {flatItems.map((item) => (
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
                    </>
                )}
            </div>
        </>
    );
}