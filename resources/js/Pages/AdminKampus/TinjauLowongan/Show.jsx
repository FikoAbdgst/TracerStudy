import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626', redLight: '#fff1f2',
    purple: '#7c3aed', purpleLight: '#f5f3ff',
};

const statusMap = {
    pending: { bg: T.borderSoft, color: T.mutedDark, label: 'Terkirim' },
    menunggu: { bg: T.borderSoft, color: T.mutedDark, label: 'Menunggu' },
    direview: { bg: T.navyLight, color: T.navyMid, label: 'Direview' },
    wawancara: { bg: T.purpleLight, color: T.purple, label: 'Wawancara' },
    diterima: { bg: T.greenLight, color: T.green, label: 'Diterima' },
    ditolak: { bg: T.redLight, color: T.red, label: 'Ditolak' },
};

const fieldBase = { height: 42, padding: '0 13px', border: `1.5px solid ${T.border}`, borderRadius: 9, background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none', width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box' };
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; e.target.style.boxShadow = 'none'; };

export default function TinjauLowonganShow({ job }) {
    const [q, setQ] = useState('');
    const applicants = job.applications ?? [];

    const filtered = applicants.filter(app => {
        const name = app.alumniProfile?.user?.name?.toLowerCase() ?? '';
        const major = app.alumniProfile?.major?.toLowerCase() ?? '';
        const needle = q.toLowerCase();
        return name.includes(needle) || major.includes(needle);
    });

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Link href={route('adminkampus.tinjau-lowongan')} style={{ color: T.mutedDark, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </Link>
                    <div>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Detail Pelamar</h2>
                        <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>{job.title} — {job.company?.name}</p>
                    </div>
                </div>
            }
        >
            <Head title={`Pelamar: ${job.title} — SITAMI`} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .ak-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes rowIn  { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
                .tbl-row:hover td { background:#fafbfc; }
            `}</style>

            <div className="ak-root">
                {/* Job Summary Card */}
                <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20, marginBottom: 16, animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: T.navy, marginBottom: 4 }}>{job.title}</div>
                            <div style={{ fontSize: 13, color: T.mutedDark, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span>{job.company?.name}</span>
                                <span style={{ color: T.border }}>·</span>
                                <span>{job.location || 'Lokasi tidak ditentukan'}</span>
                                {job.salary_range && <>
                                    <span style={{ color: T.border }}>·</span>
                                    <span>{job.salary_range}</span>
                                </>}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                                fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                                background: job.is_active ? T.greenLight : T.redLight,
                                color: job.is_active ? T.green : T.red,
                            }}>
                                {job.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                            <div style={{ fontSize: 22, fontWeight: 800, color: T.navy, textAlign: 'center', minWidth: 40 }}>
                                {applicants.length}
                                <div style={{ fontSize: 10, fontWeight: 600, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pelamar</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Applicants Table */}
                <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20, animation: 'cardIn 0.38s 0.08s cubic-bezier(0.22,1,0.36,1) both' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                        <span style={{ fontSize: 13, color: T.mutedDark }}>
                            <span style={{ fontWeight: 700, color: T.navy }}>{filtered.length}</span> pelamar
                        </span>
                        <div style={{ position: 'relative' }}>
                            <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#b0bec5' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input style={{ ...fieldBase, paddingLeft: 33, width: 220 }} placeholder="Cari nama atau jurusan..."
                                value={q} onChange={e => setQ(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                        </div>
                    </div>

                    <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.borderSoft}` }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                                    {['Nama', 'NIM', 'Jurusan', 'Tanggal Lamar', 'Status'].map((h, i) => (
                                        <th key={i} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', textAlign: i >= 3 ? 'center' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((app, i) => {
                                    const profile = app.alumni;
                                    const user = profile?.user;
                                    const st = statusMap[app.status] ?? statusMap.pending;
                                    return (
                                        <tr key={app.id} className="tbl-row" style={{ borderBottom: `1px solid ${T.borderSoft}`, animation: `rowIn 0.26s ${i * 0.04}s both` }}>
                                            <td style={{ padding: '13px 14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: T.navyLight, color: T.navyMid, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.navy }}>{user?.name ?? '—'}</div>
                                                        <div style={{ fontSize: 11.5, color: T.muted }}>{user?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '13px 14px', fontSize: 13, color: T.mutedDark }}>{profile?.nim || '—'}</td>
                                            <td style={{ padding: '13px 14px', fontSize: 13, color: T.mutedDark }}>{profile?.major || '—'}</td>
                                            <td style={{ padding: '13px 14px', fontSize: 13, color: T.muted, textAlign: 'center' }}>
                                                {app.created_at ? new Date(app.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                            </td>
                                            <td style={{ padding: '13px 14px', textAlign: 'center' }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color }}>
                                                    {st.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', fontSize: 13, color: T.muted }}>
                                        {applicants.length === 0 ? 'Belum ada alumni yang melamar ke lowongan ini.' : 'Tidak ada pelamar yang cocok dengan pencarian.'}
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
