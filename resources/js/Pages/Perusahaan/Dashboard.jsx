import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

/* ─── Tokens (seragam dengan Admin Kampus) ───────────────────────────────── */
const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626', redLight: '#fff1f2',
    purple: '#7c3aed', purpleLight: '#f5f3ff',
};

/* ─── Stat Card ──────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, accent = false, icon, delay = 0 }) => (
    <div style={{
        background: accent ? `linear-gradient(135deg, ${T.navyMid} 0%, ${T.navy} 100%)` : '#fff',
        border: `1px solid ${accent ? 'transparent' : T.borderSoft}`,
        borderRadius: 14,
        padding: '20px 22px',
        boxShadow: accent ? '0 8px 32px rgba(15,31,61,0.22)' : '0 1px 4px rgba(15,31,61,0.06)',
        animation: `cardIn 0.42s ${delay}s cubic-bezier(0.22,1,0.36,1) both`,
        position: 'relative',
        overflow: 'hidden',
    }}>
        {accent && (
            <div style={{
                position: 'absolute', top: -20, right: -20,
                width: 100, height: 100, borderRadius: '50%',
                background: 'rgba(249,115,22,0.12)',
            }} />
        )}
        <div style={{ fontSize: 26, marginBottom: 12 }}>{icon}</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: accent ? '#fff' : T.navy, lineHeight: 1, marginBottom: 6 }}>
            {value}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: accent ? 'rgba(255,255,255,0.65)' : '#374151', marginBottom: 3 }}>
            {label}
        </div>
        {sub && <div style={{ fontSize: 11.5, color: accent ? 'rgba(255,255,255,0.4)' : T.muted }}>{sub}</div>}
    </div>
);

/* ─── Quick Link ─────────────────────────────────────────────────────────── */
const QuickLink = ({ label, desc, href, icon }) => (
    <Link href={href}>
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
            border: `1px solid ${T.borderSoft}`, background: T.bg,
            transition: 'all 0.18s ease',
        }}
            onMouseEnter={e => { e.currentTarget.style.background = T.orangeLight; e.currentTarget.style.borderColor = T.orange; e.currentTarget.style.transform = 'translateX(3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.bg; e.currentTarget.style.borderColor = T.borderSoft; e.currentTarget.style.transform = 'none'; }}
        >
            <div style={{ width: 34, height: 34, borderRadius: 8, background: T.orangeLight, color: T.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{label}</div>
                <div style={{ fontSize: 11.5, color: T.muted, marginTop: 1 }}>{desc}</div>
            </div>
            <svg style={{ color: T.orange, flexShrink: 0 }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
        </div>
    </Link>
);

/* ─── Status Badge ───────────────────────────────────────────────────────── */
const statusStyle = {
    pending: { bg: T.borderSoft, color: T.mutedDark, label: 'Menunggu' },
    direview: { bg: T.navyLight, color: T.navyMid, label: 'Direview' },
    wawancara: { bg: T.purpleLight, color: T.purple, label: 'Wawancara' },
    diterima: { bg: T.greenLight, color: T.green, label: 'Diterima' },
    ditolak: { bg: T.redLight, color: T.red, label: 'Ditolak' },
};

// Beri fallback array kosong atau object kosong agar tidak crash jika data dari controller null
export default function Dashboard({ stats = null, company = null, recentApplicants = [] }) {
    const { auth } = usePage().props;
    const metrics = stats ?? { activeJobs: 0, totalApplicants: 0, pendingApplicants: 0, acceptedApplicants: 0 };
    const companyName = company?.name ?? auth.user.name;
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Dashboard Perusahaan</h2>
                        <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>{today}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: T.orangeLight, color: T.orange, border: `1px solid #fed7aa` }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.orange, display: 'inline-block' }} />
                        Portal Mitra SITAMI
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Perusahaan — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .ak-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                @keyframes slideIn { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
            `}</style>

            <div className="ak-root">

                {/* Greeting Banner */}
                <div style={{
                    background: `linear-gradient(135deg, ${T.navyMid} 0%, ${T.navy} 100%)`,
                    borderRadius: 14, padding: '22px 26px', marginBottom: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 8px 32px rgba(15,31,61,0.18)',
                    animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both',
                    position: 'relative', overflow: 'hidden',
                }}>
                    {/* Decorative circle */}
                    <div style={{ position: 'absolute', right: 80, top: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(249,115,22,0.1)' }} />
                    <div style={{ position: 'absolute', right: 20, bottom: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

                    <div style={{ position: 'relative' }}>
                        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                            Selamat Datang, Mitra SITAMI
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4, letterSpacing: '-0.01em' }}>{companyName}</div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                            {company?.industry ?? 'Admin Perusahaan'} · STMIK Mardira Indonesia
                        </div>
                    </div>
                    <div style={{
                        width: 52, height: 52, borderRadius: 14, background: T.orange,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0,
                        boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
                    }}>
                        {companyName.charAt(0).toUpperCase()}
                    </div>
                </div>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
                    <StatCard label="Lowongan Aktif" value={metrics.activeJobs} sub="Sedang dipublikasikan" icon="💼" accent delay={0} />
                    <StatCard label="Total Pelamar" value={metrics.totalApplicants} sub="Semua posisi" icon="👥" delay={0.05} />
                    <StatCard label="Menunggu Review" value={metrics.pendingApplicants} sub="Belum diproses" icon="⏳" delay={0.1} />
                    <StatCard label="Pelamar Diterima" value={metrics.acceptedApplicants} sub="Keputusan final" icon="✅" delay={0.15} />
                </div>

                {/* Profil warning */}
                {!company?.name && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                        padding: '14px 18px', borderRadius: 12, marginBottom: 20,
                        background: T.orangeLight, border: `1px solid #fed7aa`,
                        animation: 'cardIn 0.4s 0.2s both',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>⚠️</div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Profil perusahaan belum dilengkapi</div>
                                <div style={{ fontSize: 11.5, color: '#b45309', marginTop: 2 }}>Lengkapi profil agar alumni dapat mengenal perusahaan Anda sebelum melamar.</div>
                            </div>
                        </div>
                        <Link href={route('perusahaan.profile.edit')}>
                            <button style={{ height: 34, padding: '0 14px', borderRadius: 8, border: 'none', background: T.orange, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                                Lengkapi Sekarang
                            </button>
                        </Link>
                    </div>
                )}

                {/* Bottom Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>

                    {/* Quick Actions */}
                    <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20, animation: 'cardIn 0.42s 0.2s both' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: T.navy }}>Aksi Cepat</span>
                            <div style={{ width: 24, height: 3, background: T.orange, borderRadius: 2 }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <QuickLink label="Posting Lowongan Baru" desc="Tambah posisi pekerjaan" href={route('perusahaan.lowongan')} icon="📋" />
                            <QuickLink label="Lihat Daftar Pelamar" desc="Proses lamaran masuk" href={route('perusahaan.pelamar')} icon="👤" />
                            <QuickLink label="Edit Profil Perusahaan" desc="Perbarui info perusahaan" href={route('perusahaan.profile.edit')} icon="🏢" />
                        </div>
                    </div>

                    {/* Recent Applicants */}
                    <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20, animation: 'cardIn 0.42s 0.25s both' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: T.navy }}>Pelamar Terbaru</span>
                            <Link href={route('perusahaan.pelamar')} style={{ fontSize: 12, fontWeight: 700, color: T.orange, textDecoration: 'none' }}>
                                Lihat Semua →
                            </Link>
                        </div>

                        {recentApplicants && recentApplicants.length > 0 ? (
                            <div>
                                {recentApplicants.map((app, i) => {
                                    const st = statusStyle[app.status] ?? statusStyle.pending;
                                    return (
                                        <div key={app.id} style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '11px 0',
                                            borderBottom: `1px solid ${T.borderSoft}`,
                                            animation: `slideIn 0.28s ${i * 0.05}s both`,
                                        }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: 10,
                                                background: T.orangeLight, color: T.orange,
                                                fontSize: 13, fontWeight: 800,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            }}>
                                                {app.alumni?.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {app.alumni?.user?.name ?? 'Alumni'}
                                                </div>
                                                <div style={{ fontSize: 11.5, color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {app.job_posting?.title}
                                                </div>
                                            </div>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, flexShrink: 0 }}>
                                                {st.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: 10 }}>
                                <div style={{ fontSize: 36 }}>📭</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>Belum ada pelamar</div>
                                <div style={{ fontSize: 12, color: T.muted, textAlign: 'center' }}>Posting lowongan kerja untuk mulai menerima lamaran dari alumni.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
