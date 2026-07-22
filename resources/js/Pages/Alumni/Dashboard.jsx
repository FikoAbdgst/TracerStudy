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

const StatCard = ({ label, value, sub, icon, accent = false, compact = false }) => (
    <div style={{
        background: accent ? `linear-gradient(135deg, ${T.navyMid} 0%, ${T.navy} 100%)` : '#fff',
        border: `1px solid ${accent ? 'transparent' : T.borderSoft}`,
        borderRadius: compact ? 12 : 14,
        padding: compact ? '14px 16px' : '20px 22px',
        boxShadow: accent ? '0 8px 32px rgba(15,31,61,0.22)' : '0 1px 4px rgba(15,31,61,0.06)',
        position: 'relative', overflow: 'hidden',
    }}>
        {accent && <div style={{ position: 'absolute', top: -20, right: -20, width: compact ? 60 : 100, height: compact ? 60 : 100, borderRadius: '50%', background: 'rgba(249,115,22,0.12)' }} />}
        <div className="flex items-center justify-between" style={{ marginBottom: compact ? 6 : 12 }}>
            <div style={{ fontSize: compact ? 20 : 26 }}>{icon}</div>
            {sub && (
                <span style={{ fontSize: compact ? 9 : 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: accent ? 'rgba(255,255,255,0.1)' : T.orangeLight, color: accent ? 'rgba(255,255,255,0.6)' : T.orange }}>
                    {sub}
                </span>
            )}
        </div>
        <div style={{ fontSize: compact ? 22 : 30, fontWeight: 800, color: accent ? '#fff' : T.navy, lineHeight: 1, marginBottom: 4 }}>{value}</div>
        <div style={{ fontSize: compact ? 9 : 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: accent ? 'rgba(255,255,255,0.65)' : '#374151' }}>{label}</div>
    </div>
);

const QuickLink = ({ label, desc, href, icon, compact = false }) => (
    <Link href={href}>
        <div style={{
            display: 'flex', alignItems: 'center', gap: compact ? 8 : 12,
            padding: compact ? '10px 12px' : '12px 14px', borderRadius: 10,
            border: `1px solid ${T.borderSoft}`, background: T.bg, cursor: 'pointer', transition: 'all 0.18s ease',
        }}
            onMouseEnter={e => { e.currentTarget.style.background = T.orangeLight; e.currentTarget.style.borderColor = T.orange; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.bg; e.currentTarget.style.borderColor = T.borderSoft; }}
        >
            <div style={{ width: compact ? 28 : 34, height: compact ? 28 : 34, borderRadius: compact ? 6 : 8, background: T.orangeLight, color: T.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: compact ? 13 : 16, flexShrink: 0 }}>{icon}</div>
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

const statusMap = {
    pending: { bg: T.borderSoft, color: T.mutedDark, label: 'Terkirim' },
    direview: { bg: T.navyLight, color: T.navyMid, label: 'Direview' },
    wawancara: { bg: T.purpleLight, color: T.purple, label: 'Wawancara' },
    diterima: { bg: T.greenLight, color: T.green, label: 'Diterima' },
    ditolak: { bg: T.redLight, color: T.red, label: 'Ditolak' },
    menunggu: { bg: T.borderSoft, color: T.mutedDark, label: 'Menunggu' },
};

export default function Dashboard({ hasProfile, hasFilledTracer, applicationStatus, employmentStatus }) {
    const { auth } = usePage().props;
    const isMobile = useIsMobile();
    const name = auth?.user?.name ?? 'Alumni';
    const activeApplications = applicationStatus?.filter(a => ['menunggu', 'direview', 'wawancara'].includes(a.status)).length ?? 0;
    const metrics = { activeApplications, hasFilledTracer: hasFilledTracer ? 1 : 0, totalApplications: applicationStatus?.length ?? 0 };
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const showNudge = employmentStatus === 'Tidak Terdeteksi';

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Dashboard Alumni</h2>
                        <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>{today}</p>
                    </div>
                    {!isMobile && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: T.navyLight, color: T.navyMid, border: `1px solid ${T.navyMid}22` }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, display: 'inline-block' }} />
                            Alumni SITAMI
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Dashboard Alumni — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .ak-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
            `}</style>

            <div className="ak-root">
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
                            {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0" style={{ position: 'relative' }}>
                            <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>Alumni SITAMI</div>
                            <div className="truncate" style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Halo, {name}!</div>
                        </div>
                    </div>

                    {/* Nudge compact */}
                    {showNudge && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, marginBottom: 16, background: '#fffbeb', border: '1px solid #fde68a' }}>
                            <div style={{ fontSize: 20, flexShrink: 0 }}>⚠️</div>
                            <div className="min-w-0" style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>Status kerja belum terdeteksi</div>
                                <div style={{ fontSize: 11, color: '#a16207', marginTop: 2 }}>Perbarui profil agar menerima notifikasi lowongan eksklusif.</div>
                            </div>
                            <Link href={route('alumni.profile.edit')}>
                                <button style={{ height: 28, padding: '0 10px', borderRadius: 6, border: 'none', background: '#f59e0b', color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Isi</button>
                            </Link>
                        </div>
                    )}

                    {/* Stat cards 2x2 compact */}
                    <div className="grid grid-cols-3 gap-2.5" style={{ marginBottom: 16 }}>
                        <StatCard label="Aktif" value={metrics.activeApplications} sub="Diproses" icon="📨" accent compact />
                        <StatCard label="Kuesioner" value={metrics.hasFilledTracer ? '✓' : '0'} sub={metrics.hasFilledTracer ? 'Selesai' : 'Belum'} icon="📝" compact />
                        <StatCard label="Total" value={metrics.totalApplications} sub="Lamaran" icon="📊" compact />
                    </div>

                    {/* Quick actions compact */}
                    <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${T.borderSoft}`, padding: 14, marginBottom: 16 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.navy, marginBottom: 10 }}>Menu Utama</div>
                        <div className="flex flex-col gap-1.5">
                            <QuickLink label="Bursa Kerja" href={route('alumni.loker')} icon="💼" compact />
                            <QuickLink label="Status Lamaran" href={route('alumni.lamaran')} icon="📊" compact />
                            <QuickLink label="Tracer Study" href={route('alumni.kuesioner')} icon="📋" compact />
                            <QuickLink label="Forum Diskusi" href={route('alumni.forum.index')} icon="🗣️" compact />
                            <QuickLink label="Edit Profil" href={route('alumni.profile.edit')} icon="👤" compact />
                        </div>
                    </div>

                    {/* Recent applications compact */}
                    <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${T.borderSoft}`, padding: 14 }}>
                        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.navy }}>Lamaran Terkini</div>
                            <Link href={route('alumni.lamaran')} style={{ fontSize: 11, fontWeight: 700, color: T.orange, textDecoration: 'none' }}>Semua →</Link>
                        </div>
                        {applicationStatus && applicationStatus.length > 0 ? (
                            applicationStatus.slice(0, 3).map((app, i) => {
                                const st = statusMap[app.status] ?? statusMap.pending;
                                return (
                                    <div key={app.id} className="flex items-center gap-2.5" style={{ padding: '8px 0', borderBottom: i < Math.min(applicationStatus.length, 3) - 1 ? `1px solid ${T.borderSoft}` : 'none' }}>
                                        <div style={{ width: 30, height: 30, borderRadius: 8, background: T.navyLight, color: T.navyMid, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {app.job_posting?.company?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                        </div>
                                        <div className="min-w-0" style={{ flex: 1 }}>
                                            <div className="truncate" style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>{app.job_posting?.title}</div>
                                            <div className="truncate" style={{ fontSize: 11, color: T.muted }}>{app.job_posting?.company?.name}</div>
                                        </div>
                                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: st.bg, color: st.color, flexShrink: 0 }}>{st.label}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center py-6 gap-2">
                                <div style={{ fontSize: 28 }}>📭</div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>Belum ada lamaran</div>
                                <Link href={route('alumni.loker')}>
                                    <button style={{ height: 28, padding: '0 12px', borderRadius: 6, border: 'none', background: T.orange, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>Lihat Lowongan</button>
                                </Link>
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
                            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Portal Alumni</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4, letterSpacing: '-0.01em' }}>Selamat Datang, {name}! 👋</div>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>STMIK Mardira Indonesia · SITAMI Alumni</div>
                        </div>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: T.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}>
                            {name.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Nudge full */}
                    {showNudge && (
                        <div style={{
                            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                            borderRadius: 14, padding: '16px 22px', marginBottom: 20,
                            display: 'flex', alignItems: 'center', gap: 14,
                            border: '1px solid #fde68a', boxShadow: '0 4px 16px rgba(245,158,11,0.1)',
                        }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fbbf24', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#92400e', marginBottom: 2 }}>Status kerja belum terdeteksi</div>
                                <div style={{ fontSize: 12, color: '#a16207', lineHeight: 1.5 }}>Perbarui profil atau isi Tracer Study agar kamu menerima notifikasi eksklusif lowongan kerja dari perusahaan mitra!</div>
                            </div>
                            <Link href={route('alumni.profile.edit')}>
                                <button style={{ height: 34, padding: '0 16px', borderRadius: 8, border: 'none', background: '#f59e0b', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#d97706'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#f59e0b'; }}
                                >Perbarui Profil</button>
                            </Link>
                        </div>
                    )}

                    {/* Stat cards 3-col */}
                    <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 20 }}>
                        <StatCard label="Lamaran Aktif" value={metrics.activeApplications} sub="Sedang diproses" icon="📨" accent />
                        <StatCard label="Kuesioner" value={metrics.hasFilledTracer ? '✓' : '0'} sub={metrics.hasFilledTracer ? 'Sudah diisi' : 'Belum diisi'} icon="📝" />
                        <StatCard label="Total Lamaran" value={metrics.totalApplications} sub="Sepanjang masa" icon="📊" />
                    </div>

                    {/* Bottom: side by side */}
                    <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 2fr' }}>
                        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20 }}>
                            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: T.navy }}>Menu Utama</span>
                                <div style={{ width: 24, height: 3, background: T.orange, borderRadius: 2 }} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <QuickLink label="Bursa Kerja" desc="Temukan lowongan terbaru" href={route('alumni.loker')} icon="💼" />
                                <QuickLink label="Status Lamaran" desc="Pantau lamaran Anda" href={route('alumni.lamaran')} icon="📊" />
                                <QuickLink label="Tracer Study" desc="Isi kuesioner alumni" href={route('alumni.kuesioner')} icon="📋" />
                                <QuickLink label="Forum Diskusi" desc="Berbagi & berdiskusi" href={route('alumni.forum.index')} icon="🗣️" />
                                <QuickLink label="Edit Profil" desc="Perbarui data diri" href={route('alumni.profile.edit')} icon="👤" />
                            </div>
                        </div>

                        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20 }}>
                            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: T.navy }}>Lamaran Terkini</span>
                                <Link href={route('alumni.lamaran')} style={{ fontSize: 12, fontWeight: 700, color: T.orange, textDecoration: 'none' }}>Lihat Semua →</Link>
                            </div>
                            {applicationStatus && applicationStatus.length > 0 ? (
                                applicationStatus.map((app, i) => {
                                    const st = statusMap[app.status] ?? statusMap.pending;
                                    return (
                                        <div key={app.id} className="flex items-center gap-3" style={{ padding: '11px 0', borderBottom: `1px solid ${T.borderSoft}` }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.navyLight, color: T.navyMid, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {app.job_posting?.company?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                            </div>
                                            <div className="min-w-0" style={{ flex: 1 }}>
                                                <div className="truncate" style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{app.job_posting?.title}</div>
                                                <div style={{ fontSize: 11.5, color: T.muted }}>{app.job_posting?.company?.name}</div>
                                            </div>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, flexShrink: 0 }}>{st.label}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center py-10 gap-3">
                                    <div style={{ fontSize: 36 }}>📭</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>Belum ada lamaran</div>
                                    <div style={{ fontSize: 12, color: T.muted, textAlign: 'center' }}>Temukan lowongan menarik di bursa kerja SITAMI.</div>
                                    <Link href={route('alumni.loker')}>
                                        <button style={{ height: 34, padding: '0 16px', borderRadius: 8, border: 'none', background: T.orange, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>Lihat Lowongan</button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
