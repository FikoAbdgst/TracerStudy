import React, { Suspense, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Dialog, DialogContent } from '@/Components/ui/dialog';

const LocationPicker = React.lazy(() => import('@/Components/LocationPicker'));

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
    menunggu: { bg: T.borderSoft, color: T.mutedDark, label: 'Menunggu', icon: '⏳', step: 1 },
    wawancara: { bg: T.purpleLight, color: T.purple, label: 'Panggil Wawancara', icon: '🎙️', step: 2 },
    diterima: { bg: T.greenLight, color: T.green, label: 'Diterima 🎉', icon: '✅', step: 3 },
    ditolak: { bg: T.redLight, color: T.red, label: 'Tidak Lolos', icon: '❌', step: 0 },
};

const formatDate = d => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));

const formatDateTime = d => {
    if (!d) return '—';
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(new Date(d));
};

const fieldBase = { height: 42, padding: '0 13px', border: `1.5px solid ${T.border}`, borderRadius: 9, background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none', width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box' };
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; e.target.style.boxShadow = 'none'; };

export default function LamaranIndex({ applications }) {
    const [q, setQ] = useState('');
    const [filter, setFilter] = useState('all');
    const [detailApp, setDetailApp] = useState(null);

    const filtered = applications.filter(app => {
        const matchQ = app.job_posting?.title?.toLowerCase().includes(q.toLowerCase()) ||
            app.job_posting?.company?.name?.toLowerCase().includes(q.toLowerCase());
        const matchF = filter === 'all' || app.status === filter;
        return matchQ && matchF;
    });

    // Summary counts
    const counts = Object.fromEntries(
        Object.keys(statusMap).map(k => [k, applications.filter(a => a.status === k).length])
    );

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Status Lamaran</h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Pantau riwayat dan respons dari HRD perusahaan</p>
                </div>
            }
        >
            <Head title="Status Lamaran — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .al-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes rowIn  { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
                .tbl-row:hover td { background:#fafbfc; }
            `}</style>

            <div className="al-root">
                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 20 }}>
                    {Object.entries(statusMap).map(([key, s], i) => (
                        <button key={key} onClick={() => setFilter(filter === key ? 'all' : key)} style={{
                            padding: '12px 10px', borderRadius: 12,
                            border: `1.5px solid ${filter === key ? s.color : T.borderSoft}`,
                            background: filter === key ? s.bg : '#fff',
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
                            animation: `cardIn 0.38s ${i * 0.06}s cubic-bezier(0.22,1,0.36,1) both`,
                            boxShadow: filter === key ? `0 2px 12px ${s.color}22` : '0 1px 3px rgba(15,31,61,0.05)',
                        }}
                            onMouseEnter={e => { if (filter !== key) { e.currentTarget.style.background = s.bg; e.currentTarget.style.borderColor = s.color; } }}
                            onMouseLeave={e => { if (filter !== key) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = T.borderSoft; } }}
                        >
                            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: filter === key ? s.color : T.navy, lineHeight: 1, marginBottom: 4 }}>{counts[key] || 0}</div>
                            <div style={{ fontSize: 10.5, fontWeight: 700, color: filter === key ? s.color : T.mutedDark, lineHeight: 1.3 }}>{s.label}</div>
                        </button>
                    ))}
                </div>

                {/* Table card */}
                <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20, animation: 'cardIn 0.38s 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
                    {/* Toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                        <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
                            Menampilkan <span style={{ fontWeight: 700, color: T.navy }}>{filtered.length}</span> lamaran
                            {filter !== 'all' && <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: statusMap[filter]?.bg, color: statusMap[filter]?.color }}>{statusMap[filter]?.label}</span>}
                        </p>
                        <div style={{ position: 'relative' }}>
                            <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#b0bec5' }} width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input style={{ ...fieldBase, paddingLeft: 32, width: 240 }} placeholder="Cari posisi atau perusahaan..."
                                value={q} onChange={e => setQ(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                        </div>
                    </div>

                    <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.borderSoft}` }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                                    {['Tanggal', 'Posisi', 'Perusahaan', 'Status'].map((h, i) => (
                                        <th key={i} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((app, i) => {
                                    const st = statusMap[app.status] ?? statusMap.menunggu;
                                    return (
                                        <tr key={app.id} className="tbl-row" style={{ borderBottom: `1px solid ${T.borderSoft}`, animation: `rowIn 0.26s ${i * 0.04}s both` }}>
                                            <td style={{ padding: '13px 14px', fontSize: 12.5, color: T.muted, whiteSpace: 'nowrap' }}>{formatDate(app.created_at)}</td>
                                            <td style={{ padding: '13px 14px' }}>
                                                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.navy }}>{app.job_posting?.title || 'Lowongan Dihapus'}</div>
                                            </td>
                                            <td style={{ padding: '13px 14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 26, height: 26, borderRadius: 6, background: T.navyLight, color: T.navyMid, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        {app.job_posting?.company?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                                    </div>
                                                    <span style={{ fontSize: 13, color: T.mutedDark }}>{app.job_posting?.company?.name || '—'}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                                                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20, background: st.bg, color: st.color, whiteSpace: 'nowrap' }}>
                                                        {st.icon} {st.label}
                                                    </span>
                                                    {app.interview_details && (
                                                        <button onClick={() => setDetailApp(app)}
                                                            style={{ fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 6, border: `1px solid ${T.purpleBorder}`, background: T.purpleLight, color: T.purple, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = T.purple; e.currentTarget.style.color = '#fff'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = T.purpleLight; e.currentTarget.style.color = T.purple; }}
                                                        >
                                                            Detail
                                                        </button>
                                                    )}
                                                    {app.job_posting?.company?.user_id && app.can_chat ? (
                                                        <button onClick={() => router.get(route('messages.index', { conversation: app.conversation_id }))}
                                                            style={{ fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 6, border: `1px solid ${T.orange}33`, background: T.orangeLight, color: T.orange, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = T.orange; e.currentTarget.style.color = '#fff'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = T.orangeLight; e.currentTarget.style.color = T.orange; }}
                                                        >
                                                            💬 Chat
                                                        </button>
                                                    ) : app.job_posting?.company?.user_id ? (
                                                        <span title="Menunggu respon HRD"
                                                            style={{ fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 6, border: `1px solid ${T.border}`, background: T.bg, color: T.muted, cursor: 'not-allowed', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: 0.6 }}
                                                        >
                                                            💬 Chat
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={4} style={{ padding: '52px 16px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 4 }}>
                                            {q || filter !== 'all' ? 'Tidak ada lamaran yang cocok' : 'Anda belum melamar ke pekerjaan apapun'}
                                        </div>
                                        <div style={{ fontSize: 12, color: T.muted }}>
                                            {q || filter !== 'all' ? 'Coba ubah filter atau kata kunci pencarian.' : 'Temukan lowongan menarik di halaman Bursa Kerja.'}
                                        </div>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Detail modal */}
            <Dialog open={!!detailApp} onOpenChange={() => setDetailApp(null)}>
                <DialogContent className="sm:max-w-md" style={{ background: '#fff', padding: 0, overflow: 'hidden', borderRadius: 16, border: `1px solid ${T.border}` }}>
                    {detailApp && (() => {
                        const iv = detailApp.interview_details || {};
                        return (
                            <div>
                                {/* Header */}
                                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.borderSoft}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: T.purpleLight, color: T.purple, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🎙️</div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 800, color: T.navy }}>Detail Panggilan Wawancara</div>
                                        <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{detailApp.job_posting?.title || 'Lowongan'}</div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {/* Jadwal */}
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>📅</div>
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: T.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Jadwal</div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: T.navy }}>{formatDateTime(iv.scheduled_at)}</div>
                                        </div>
                                    </div>

                                    {/* Durasi */}
                                    {iv.duration && (
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>⏱️</div>
                                            <div>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: T.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Durasi</div>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: T.navy }}>{iv.duration} menit</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Lokasi/Link */}
                                    {iv.location && (
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>
                                                {iv.interview_mode === 'online' ? '🔗' : '📍'}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: T.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                                                    {iv.interview_mode === 'online' ? 'Link Meeting' : 'Lokasi'}
                                                </div>
                                                {iv.interview_mode === 'online' ? (
                                                    <a href={iv.location.startsWith('http') ? iv.location : `https://${iv.location}`}
                                                        target="_blank" rel="noopener noreferrer"
                                                        style={{ fontSize: 14, fontWeight: 600, color: T.navyMid, wordBreak: 'break-all', textDecoration: 'underline' }}>
                                                        {iv.location}
                                                    </a>
                                                ) : (
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: T.navy, wordBreak: 'break-all' }}>{iv.location}</div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Map */}
                                    {iv.interview_mode !== 'online' && (
                                        <>
                                        <Suspense fallback={<div style={{ height: 180, borderRadius: 9, background: '#f0f4f9' }} />}>
                                            <LocationPicker
                                                latitude={iv.latitude ? parseFloat(iv.latitude) : null}
                                                longitude={iv.longitude ? parseFloat(iv.longitude) : null}
                                                label={iv.location || 'Lokasi Wawancara'}
                                                height={180}
                                                readOnly={true}
                                            />
                                        </Suspense>
                                        {iv.latitude && iv.longitude && (
                                            <a href={`https://www.google.com/maps?q=${iv.latitude},${iv.longitude}`}
                                                target="_blank" rel="noopener noreferrer"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, fontWeight: 700, color: T.navyMid, textDecoration: 'none', padding: '7px 14px', borderRadius: 8, background: T.navyLight, border: `1px solid ${T.border}`, transition: 'all 0.15s' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = T.navyMid; e.currentTarget.style.color = '#fff'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = T.navyLight; e.currentTarget.style.color = T.navyMid; }}
                                            >
                                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                                Buka di Google Maps
                                            </a>
                                        )}
                                        </>
                                    )}

                                    {/* Catatan HRD */}
                                    {detailApp.notes && (
                                        <div style={{ background: T.orangeLight, border: `1px solid #fed7aa`, borderRadius: 10, padding: '14px 16px' }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Pesan dari HRD</div>
                                            <div style={{ fontSize: 13, color: T.navy, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{detailApp.notes}</div>
                                        </div>
                                    )}

                                    {/* Catatan wawancara */}
                                    {iv.notes && (
                                        <div style={{ background: T.purpleLight, border: `1px solid ${T.purpleBorder}`, borderRadius: 10, padding: '14px 16px' }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Catatan Wawancara</div>
                                            <div style={{ fontSize: 13, color: T.navy, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{iv.notes}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div style={{ padding: '14px 24px', borderTop: `1px solid ${T.borderSoft}`, textAlign: 'right', background: T.bg }}>
                                    <button onClick={() => setDetailApp(null)}
                                        style={{ height: 36, padding: '0 16px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: '#fff', color: T.mutedDark, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>

        </AuthenticatedLayout>
    );
}
