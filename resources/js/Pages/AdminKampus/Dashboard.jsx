import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useIsMobile from '@/hooks/useIsMobile';

export const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626', redLight: '#fff1f2',
};

export const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.ak-root * { font-family: 'Plus Jakarta Sans', sans-serif; }
@keyframes cardIn  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes rowIn   { from{opacity:0;transform:translateX(-5px)} to{opacity:1;transform:translateX(0)} }
@keyframes slideUp { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
`;

export const fieldBase = {
    height: 42, padding: '0 13px', border: `1.5px solid #e2e8f0`, borderRadius: 9,
    background: '#f8fafc', color: '#0f1f3d', fontSize: 13.5, outline: 'none',
    width: '100%', transition: 'border-color 0.18s, background 0.18s, box-shadow 0.18s',
    fontFamily: 'inherit', boxSizing: 'border-box',
};
export const onFocus = e => { e.target.style.borderColor = '#1a3560'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
export const onBlur = e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; };

export function Modal({ open, onClose, title, children, footer, wide = false }) {
    const [visible, setVisible] = useState(false);
    const [render, setRender] = useState(false);
    useEffect(() => {
        if (open) { setRender(true); requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); }
        else { setVisible(false); const t = setTimeout(() => setRender(false), 260); return () => clearTimeout(t); }
    }, [open]);
    if (!render) return null;
    return (
        <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease',
        }}>
            <div style={{
                background: '#fff', borderRadius: 16,
                width: '100%', maxWidth: wide ? 640 : 460,
                boxShadow: '0 24px 60px rgba(10,20,40,0.2)',
                overflow: 'hidden',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
                transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1)',
                maxHeight: '90vh', overflowY: 'auto',
            }}>
                <div style={{ padding: '20px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 1, borderBottom: `1px solid #f1f5f9`, paddingBottom: 14 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#0f1f3d', letterSpacing: '-0.01em' }}>{title}</span>
                    <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: '#f8fafc', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div style={{ padding: '18px 22px' }}>{children}</div>
                {footer && <>
                    <div style={{ height: 1, background: '#f1f5f9', margin: '0 22px' }} />
                    <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div>
                </>}
            </div>
        </div>
    );
}

/* ─── StatCard ───────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, accent, iconBg, iconColor, icon, compact = false, delay = 0 }) => (
    <div style={{
        background: accent ? T.navyMid : '#fff',
        border: `1px solid ${accent ? T.navyMid : T.borderSoft}`,
        borderRadius: compact ? 12 : 14,
        padding: compact ? '14px 16px' : '20px',
        boxShadow: accent ? '0 4px 20px rgba(26,53,96,0.18)' : '0 1px 4px rgba(26,53,96,0.05)',
    }}>
        <div className="flex items-center justify-between mb-2" style={{ marginBottom: compact ? 10 : 14 }}>
            <div style={{
                width: compact ? 30 : 38, height: compact ? 30 : 38, borderRadius: compact ? 8 : 10,
                background: iconBg, color: iconColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: compact ? 15 : 18,
            }}>{icon}</div>
            {sub && (
                <span style={{ fontSize: compact ? 9 : 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: accent ? 'rgba(255,255,255,0.1)' : iconBg, color: accent ? 'rgba(255,255,255,0.6)' : iconColor }}>
                    {sub}
                </span>
            )}
        </div>
        <div style={{ fontSize: compact ? 22 : 28, fontWeight: 800, color: accent ? '#fff' : T.navy, letterSpacing: '-0.02em', marginBottom: 2 }}>
            {value}
        </div>
        <div style={{ fontSize: compact ? 9 : 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: accent ? '#7fa3cc' : '#374151' }}>
            {label}
        </div>
    </div>
);

/* ─── QuickLink ──────────────────────────────────────────────────────────── */
const QuickLink = ({ label, desc, href, compact = false }) => (
    <Link href={href}>
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: compact ? '10px 12px' : '12px 14px', borderRadius: 10,
            border: `1px solid ${T.borderSoft}`, background: T.bg,
            transition: 'all 0.18s', cursor: 'pointer',
        }}
            onMouseEnter={e => { e.currentTarget.style.background = T.orangeLight; e.currentTarget.style.borderColor = T.orange; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.bg; e.currentTarget.style.borderColor = T.borderSoft; }}
        >
            <div>
                <div style={{ fontSize: compact ? 12 : 13.5, fontWeight: 600, color: T.navy }}>{label}</div>
                {!compact && <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>{desc}</div>}
            </div>
            <svg style={{ width: compact ? 12 : 14, height: compact ? 12 : 14, color: T.orange, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
        </div>
    </Link>
);

/* ─── ActivityRow ────────────────────────────────────────────────────────── */
const ActivityRow = ({ actor, action, time, type, compact = false }) => {
    const dot = { create: T.orange, verify: T.green, reject: T.red, edit: T.navyMid, default: T.muted };
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: compact ? '7px 0' : '11px 0', borderBottom: `1px solid ${T.borderSoft}` }}>
            <div style={{ width: compact ? 6 : 8, height: compact ? 6 : 8, borderRadius: '50%', background: dot[type] ?? dot.default, flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: compact ? 12 : 13, color: T.mutedDark, minWidth: 0 }}>
                <span style={{ fontWeight: 700, color: T.navy }}>{actor}</span> {action}
            </div>
            <div style={{ fontSize: compact ? 10 : 11, color: '#c8d5e3', flexShrink: 0 }}>{time}</div>
        </div>
    );
};

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function Dashboard({ stats }) {
    const { auth } = usePage().props;
    const isMobile = useIsMobile();
    const metrics = stats ?? { totalAlumni: 0, totalCompanies: 0, responseRate: 0, activeMoU: 0 };
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const statsArr = [
        { label: 'Total Alumni', value: metrics.totalAlumni, sub: 'Terdaftar', icon: '🎓', iconBg: T.orangeLight, iconColor: T.orange, accent: true },
        { label: 'Total Mitra', value: metrics.totalCompanies, sub: 'Perusahaan', icon: '🏢', iconBg: T.navyLight, iconColor: T.navyMid },
        { label: 'MoU Aktif', value: metrics.activeMoU, sub: 'Berjalan', icon: '📄', iconBg: T.navyLight, iconColor: T.navyMid },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Dashboard Admin Kampus</h2>
                        <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>{today}</p>
                    </div>
                    {!isMobile && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: T.orangeLight, border: '1px solid #fdd8b5', fontSize: 12, fontWeight: 700, color: T.orange }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.orange, display: 'inline-block' }} />
                            STMIK Mardira Indonesia
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Dashboard Admin Kampus — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .ak-root * { font-family: 'Plus Jakarta Sans', sans-serif; }
                @keyframes cardIn  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                @keyframes slideUp { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
            `}</style>

            <div className="ak-root">
                {isMobile ? (
                /* ═══ MOBILE ═══ */
                <div style={{ padding: '0 2px' }}>
                    {/* Compact greeting */}
                    <div style={{
                        background: T.navyMid, borderRadius: 12,
                        padding: '14px 16px', marginBottom: 16,
                        display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: T.orange, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                            {auth.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4a7ab0' }}>Selamat Datang</div>
                            <div className="truncate" style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{auth.user.name}</div>
                        </div>
                    </div>

                    {/* Stat cards 2x2 compact */}
                    <div className="grid grid-cols-3 gap-2.5" style={{ marginBottom: 16 }}>
                        {statsArr.map((s, i) => <StatCard key={i} {...s} compact />)}
                    </div>

                    {/* Quick actions compact */}
                    <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${T.borderSoft}`, padding: 14, marginBottom: 16 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.navy, marginBottom: 10 }}>Aksi Cepat</div>
                        <div className="flex flex-col gap-1.5">
                            <QuickLink label="Manajemen Mitra" href={route('adminkampus.mitra.index')} compact />
                            <QuickLink label="Data Alumni" href={route('adminkampus.alumni.index')} compact />
                            <QuickLink label="Kelola Kuesioner" href={route('adminkampus.tracer')} compact />
                            <QuickLink label="Tinjau Lowongan" href={route('adminkampus.tinjau-lowongan')} compact />
                        </div>
                    </div>

                    {/* Activity compact */}
                    <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${T.borderSoft}`, padding: 14 }}>
                        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.navy }}>Aktivitas</div>
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: T.orangeLight, color: T.orange }}>Hari ini</span>
                        </div>
                        <ActivityRow actor="Mitra Baru" action="terdaftar" time="1j lalu" type="create" compact />
                        <ActivityRow actor="Admin Kampus" action="menambahkan mitra" time="3j lalu" type="create" compact />
                        <ActivityRow actor="Alumni Baru" action="mendaftar" time="4j lalu" type="create" compact />
                        <ActivityRow actor="Admin Kampus" action="upload MoU" time="kemarin" type="edit" compact />
                    </div>
                </div>
                ) : (
                /* ═══ WEB ═══ */
                <>
                    {/* Greeting banner full */}
                    <div style={{
                        background: T.navyMid, borderRadius: 14,
                        padding: '22px 24px', marginBottom: 22,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        boxShadow: '0 4px 20px rgba(26,53,96,0.18)',
                    }}>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.13em', color: '#4a7ab0', marginBottom: 8 }}>Selamat Datang Kembali</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4, letterSpacing: '-0.01em' }}>{auth.user.name}</div>
                            <div style={{ fontSize: 13, color: '#7fa3cc' }}>Admin Kampus · STMIK Mardira Indonesia</div>
                        </div>
                        <div style={{ width: 52, height: 52, borderRadius: 12, background: T.orange, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, flexShrink: 0 }}>
                            {auth.user.name.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Stat cards 4-col */}
                    <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 22 }}>
                        {statsArr.map((s, i) => <StatCard key={i} {...s} delay={i * 0.05} />)}
                    </div>

                    {/* Bottom: side by side */}
                    <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 2fr' }}>
                        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20 }}>
                            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.navy }}>Aksi Cepat</span>
                                <div style={{ width: 22, height: 2.5, background: T.orange, borderRadius: 2 }} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <QuickLink label="Manajemen Mitra" desc="Tambah & kelola perusahaan mitra" href={route('adminkampus.mitra.index')} />
                                <QuickLink label="Data Alumni" desc="Lihat dan kelola data alumni" href={route('adminkampus.alumni.index')} />
                                <QuickLink label="Kelola Kuesioner" desc="Buat & aktifkan tracer study" href={route('adminkampus.tracer')} />
                                <QuickLink label="Tinjau Lowongan" desc="Review lowongan perusahaan" href={route('adminkampus.tinjau-lowongan')} />
                            </div>
                        </div>

                        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20 }}>
                            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.navy }}>Aktivitas Terbaru</span>
                                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: T.orangeLight, color: T.orange }}>Hari ini</span>
                            </div>
                            <ActivityRow actor="Mitra Baru" action="terdaftar melalui jalur kemitraan" time="1 jam lalu" type="create" />
                            <ActivityRow actor="Admin Kampus" action="menambahkan perusahaan mitra baru" time="3 jam lalu" type="create" />
                            <ActivityRow actor="Alumni Baru" action="mendaftar ke sistem" time="4 jam lalu" type="create" />
                            <ActivityRow actor="Admin Kampus" action="mengupload dokumen MoU baru" time="kemarin" type="edit" />
                            <ActivityRow actor="Admin Kampus" action="memperbarui data master" time="kemarin" type="edit" />
                            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.borderSoft}`, textAlign: 'center', fontSize: 11, color: '#c8d5e3' }}>
                                Log aktivitas real tersedia setelah sistem aktif digunakan.
                            </div>
                        </div>
                    </div>
                </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
