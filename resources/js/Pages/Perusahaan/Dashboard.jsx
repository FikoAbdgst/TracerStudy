import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useIsMobile from '@/hooks/useIsMobile';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626', redLight: '#fff1f2',
    purple: '#7c3aed', purpleLight: '#f5f3ff',
};

const StatCard = ({ label, value, sub, accent = false, icon, compact = false }) => (
    <div style={{
        background: accent ? `linear-gradient(135deg, ${T.navyMid} 0%, ${T.navy} 100%)` : '#fff',
        border: `1px solid ${accent ? 'transparent' : T.borderSoft}`,
        borderRadius: compact ? 12 : 14,
        padding: compact ? '14px 16px' : '20px 22px',
        boxShadow: accent ? '0 8px 32px rgba(15,31,61,0.22)' : '0 1px 4px rgba(15,31,61,0.06)',
        position: 'relative', overflow: 'hidden',
    }}>
        {accent && <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(249,115,22,0.12)' }} />}
        <div className="flex items-center justify-between" style={{ marginBottom: compact ? 8 : 12 }}>
            <div style={{ fontSize: compact ? 20 : 26 }}>{icon}</div>
            {sub && (
                <span style={{ fontSize: compact ? 9 : 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: accent ? 'rgba(255,255,255,0.1)' : T.orangeLight, color: accent ? 'rgba(255,255,255,0.6)' : T.orange }}>
                    {sub}
                </span>
            )}
        </div>
        <div style={{ fontSize: compact ? 22 : 30, fontWeight: 800, color: accent ? '#fff' : T.navy, lineHeight: 1, marginBottom: 4 }}>
            {value}
        </div>
        <div style={{ fontSize: compact ? 9 : 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: accent ? 'rgba(255,255,255,0.65)' : '#374151' }}>
            {label}
        </div>
    </div>
);

const QuickLink = ({ label, desc, href, icon, compact = false }) => (
    <Link href={href}>
        <div style={{
            display: 'flex', alignItems: 'center', gap: compact ? 8 : 12,
            padding: compact ? '10px 12px' : '12px 14px', borderRadius: 10, cursor: 'pointer',
            border: `1px solid ${T.borderSoft}`, background: T.bg, transition: 'all 0.18s ease',
        }}
            onMouseEnter={e => { e.currentTarget.style.background = T.orangeLight; e.currentTarget.style.borderColor = T.orange; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.bg; e.currentTarget.style.borderColor = T.borderSoft; }}
        >
            <div style={{ width: compact ? 28 : 34, height: compact ? 28 : 34, borderRadius: compact ? 6 : 8, background: T.orangeLight, color: T.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: compact ? 13 : 16, flexShrink: 0 }}>
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: compact ? 12 : 13, fontWeight: 700, color: T.navy }}>{label}</div>
                {!compact && <div style={{ fontSize: 11.5, color: T.muted, marginTop: 1 }}>{desc}</div>}
            </div>
            <svg style={{ color: T.orange, flexShrink: 0, width: compact ? 12 : 14, height: compact ? 12 : 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
        </div>
    </Link>
);

const statusStyle = {
    pending: { bg: T.borderSoft, color: T.mutedDark, label: 'Menunggu' },
    direview: { bg: T.navyLight, color: T.navyMid, label: 'Direview' },
    wawancara: { bg: T.purpleLight, color: T.purple, label: 'Wawancara' },
    diterima: { bg: T.greenLight, color: T.green, label: 'Diterima' },
    ditolak: { bg: T.redLight, color: T.red, label: 'Ditolak' },
    menunggu: { bg: T.borderSoft, color: T.mutedDark, label: 'Menunggu' },
};

export default function Dashboard({ stats = null, company = null, recentApplicants = [] }) {
    const { auth } = usePage().props;
    const isMobile = useIsMobile();
    const metrics = stats ?? { activeJobs: 0, totalApplicants: 0, pendingApplicants: 0, acceptedApplicants: 0 };
    const companyName = company?.name ?? auth.user.name;
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const statsArr = [
        { label: 'Lowongan Aktif', value: metrics.activeJobs, sub: 'Dipublikasikan', icon: '💼', accent: true },
        { label: 'Total Pelamar', value: metrics.totalApplicants, sub: 'Semua posisi', icon: '👥' },
        { label: 'Menunggu', value: metrics.pendingApplicants, sub: 'Review', icon: '⏳' },
        { label: 'Diterima', value: metrics.acceptedApplicants, sub: 'Final', icon: '✅' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Dashboard Perusahaan</h2>
                        <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>{today}</p>
                    </div>
                    {!isMobile && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: T.orangeLight, color: T.orange, border: `1px solid #fed7aa` }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.orange, display: 'inline-block' }} />
                            Portal Mitra SITAMI
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Dashboard Perusahaan — SITAMI" />

            {isMobile ? (
            /* ═══ MOBILE ═══ */
            <div style={{ padding: '0 2px' }}>
                {/* Compact greeting */}
                <div style={{
                    background: `linear-gradient(135deg, ${T.navyMid} 0%, ${T.navy} 100%)`,
                    borderRadius: 12, padding: '14px 16px', marginBottom: 16,
                    display: 'flex', alignItems: 'center', gap: 12,
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', right: -20, top: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(249,115,22,0.1)' }} />
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: T.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                        {companyName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0" style={{ position: 'relative' }}>
                        <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>Mitra SITAMI</div>
                        <div className="truncate" style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{companyName}</div>
                    </div>
                </div>

                {/* Stat cards 2x2 compact */}
                <div className="grid grid-cols-2 gap-2.5" style={{ marginBottom: 16 }}>
                    {statsArr.map((s, i) => <StatCard key={i} {...s} compact />)}
                </div>

                {/* Profile warning compact */}
                {!company?.name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, marginBottom: 16, background: T.orangeLight, border: `1px solid #fed7aa` }}>
                        <div style={{ fontSize: 20, flexShrink: 0 }}>⚠️</div>
                        <div className="min-w-0" style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>Profil belum dilengkapi</div>
                            <div style={{ fontSize: 11, color: '#b45309', marginTop: 2 }}>Lengkapi profil agar alumni bisa melamar.</div>
                        </div>
                        <Link href={route('perusahaan.profile.edit')}>
                            <button style={{ height: 30, padding: '0 10px', borderRadius: 6, border: 'none', background: T.orange, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Isi</button>
                        </Link>
                    </div>
                )}

                {/* Quick actions compact */}
                <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${T.borderSoft}`, padding: 14, marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.navy, marginBottom: 10 }}>Aksi Cepat</div>
                    <div className="flex flex-col gap-1.5">
                        <QuickLink label="Posting Lowongan" href={route('perusahaan.lowongan')} icon="📋" compact />
                        <QuickLink label="Daftar Pelamar" href={route('perusahaan.pelamar')} icon="👤" compact />
                        <QuickLink label="Edit Profil" href={route('perusahaan.profile.edit')} icon="🏢" compact />
                    </div>
                </div>

                {/* Recent applicants compact */}
                <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${T.borderSoft}`, padding: 14 }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.navy }}>Pelamar Terbaru</div>
                        <Link href={route('perusahaan.pelamar')} style={{ fontSize: 11, fontWeight: 700, color: T.orange, textDecoration: 'none' }}>Semua →</Link>
                    </div>
                    {recentApplicants.length > 0 ? (
                        recentApplicants.slice(0, 3).map((app, i) => {
                            const st = statusStyle[app.status] ?? statusStyle.pending;
                            return (
                                <div key={app.id} className="flex items-center gap-2.5" style={{ padding: '8px 0', borderBottom: i < recentApplicants.length - 1 ? `1px solid ${T.borderSoft}` : 'none' }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 8, background: T.orangeLight, color: T.orange, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {app.alumni?.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                    </div>
                                    <div className="min-w-0" style={{ flex: 1 }}>
                                        <div className="truncate" style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>{app.alumni?.user?.name ?? 'Alumni'}</div>
                                        <div className="truncate" style={{ fontSize: 11, color: T.muted }}>{app.job_posting?.title}</div>
                                    </div>
                                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: st.bg, color: st.color, flexShrink: 0 }}>{st.label}</span>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center py-6 gap-2">
                            <div style={{ fontSize: 28 }}>📭</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>Belum ada pelamar</div>
                            <div style={{ fontSize: 11, color: T.muted, textAlign: 'center' }}>Posting lowongan untuk mulai menerima lamaran.</div>
                        </div>
                    )}
                </div>
            </div>
            ) : (
            /* ═══ WEB ═══ */
            <>
                {/* Greeting banner full */}
                <div style={{
                    background: `linear-gradient(135deg, ${T.navyMid} 0%, ${T.navy} 100%)`,
                    borderRadius: 14, padding: '22px 26px', marginBottom: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 8px 32px rgba(15,31,61,0.18)',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', right: 80, top: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(249,115,22,0.1)' }} />
                    <div style={{ position: 'absolute', right: 20, bottom: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                    <div style={{ position: 'relative' }}>
                        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Selamat Datang, Mitra SITAMI</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4, letterSpacing: '-0.01em' }}>{companyName}</div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{company?.industry ?? 'Admin Perusahaan'} · STMIK Mardira Indonesia</div>
                    </div>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: T.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}>
                        {companyName.charAt(0).toUpperCase()}
                    </div>
                </div>

                {/* Stat cards 4-col */}
                <div className="grid grid-cols-4 gap-4" style={{ marginBottom: 20 }}>
                    {statsArr.map((s, i) => <StatCard key={i} {...s} />)}
                </div>

                {/* Profile warning */}
                {!company?.name && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 18px', borderRadius: 12, marginBottom: 20, background: T.orangeLight, border: `1px solid #fed7aa` }}>
                        <div className="flex items-center gap-3">
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>⚠️</div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Profil perusahaan belum dilengkapi</div>
                                <div style={{ fontSize: 11.5, color: '#b45309', marginTop: 2 }}>Lengkapi profil agar alumni dapat mengenal perusahaan Anda sebelum melamar.</div>
                            </div>
                        </div>
                        <Link href={route('perusahaan.profile.edit')}>
                            <button style={{ height: 34, padding: '0 14px', borderRadius: 8, border: 'none', background: T.orange, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Lengkapi Sekarang</button>
                        </Link>
                    </div>
                )}

                {/* Bottom: side by side */}
                <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 2fr' }}>
                    <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20 }}>
                        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: T.navy }}>Aksi Cepat</span>
                            <div style={{ width: 24, height: 3, background: T.orange, borderRadius: 2 }} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <QuickLink label="Posting Lowongan Baru" desc="Tambah posisi pekerjaan" href={route('perusahaan.lowongan')} icon="📋" />
                            <QuickLink label="Lihat Daftar Pelamar" desc="Proses lamaran masuk" href={route('perusahaan.pelamar')} icon="👤" />
                            <QuickLink label="Edit Profil Perusahaan" desc="Perbarui info perusahaan" href={route('perusahaan.profile.edit')} icon="🏢" />
                        </div>
                    </div>

                    <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20 }}>
                        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: T.navy }}>Pelamar Terbaru</span>
                            <Link href={route('perusahaan.pelamar')} style={{ fontSize: 12, fontWeight: 700, color: T.orange, textDecoration: 'none' }}>Lihat Semua →</Link>
                        </div>
                        {recentApplicants.length > 0 ? (
                            recentApplicants.map((app, i) => {
                                const st = statusStyle[app.status] ?? statusStyle.pending;
                                return (
                                    <div key={app.id} className="flex items-center gap-3" style={{ padding: '11px 0', borderBottom: `1px solid ${T.borderSoft}` }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.orangeLight, color: T.orange, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {app.alumni?.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                        </div>
                                        <div className="min-w-0" style={{ flex: 1 }}>
                                            <div className="truncate" style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{app.alumni?.user?.name ?? 'Alumni'}</div>
                                            <div className="truncate" style={{ fontSize: 11.5, color: T.muted }}>{app.job_posting?.title}</div>
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, flexShrink: 0 }}>{st.label}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center py-10 gap-3">
                                <div style={{ fontSize: 36 }}>📭</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>Belum ada pelamar</div>
                                <div style={{ fontSize: 12, color: T.muted, textAlign: 'center' }}>Posting lowongan kerja untuk mulai menerima lamaran dari alumni.</div>
                            </div>
                        )}
                    </div>
                </div>
            </>
            )}
        </AuthenticatedLayout>
    );
}
