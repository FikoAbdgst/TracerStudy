import React, { useState, useMemo, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

/* ─── Tokens ──────────────────────────────────────────────────────────────── */
const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff7ed', orangeBorder: '#fed7aa',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc', bgAlt: '#f0f4f8',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4', greenBorder: '#bbf7d0',
    red: '#dc2626', redLight: '#fff1f2', redBorder: '#fecaca',
    purple: '#7c3aed', purpleLight: '#f5f3ff', purpleBorder: '#ddd6fe',
    yellow: '#d97706', yellowLight: '#fffbeb', yellowBorder: '#fde68a',
};

/* ─── Status config ───────────────────────────────────────────────────────── */
const STATUS = {
    pending: { bg: T.borderSoft, color: T.mutedDark, border: T.border, label: 'Menunggu', dot: '#94a3b8' },
    direview: { bg: T.navyLight, color: T.navyMid, border: '#bfdbfe', label: 'Direview', dot: '#3b82f6' },
    wawancara: { bg: T.purpleLight, color: T.purple, border: T.purpleBorder, label: 'Wawancara', dot: T.purple },
    diterima: { bg: T.greenLight, color: T.green, border: T.greenBorder, label: 'Diterima ✓', dot: T.green },
    ditolak: { bg: T.redLight, color: T.red, border: T.redBorder, label: 'Ditolak', dot: T.red },
};

const StatusBadge = ({ status, size = 'sm' }) => {
    const s = STATUS[status] ?? STATUS.pending;
    const pad = size === 'lg' ? '5px 14px' : '3px 10px';
    const fs = size === 'lg' ? 12 : 11;
    return (
        <span style={{
            fontSize: fs, fontWeight: 700, padding: pad, borderRadius: 20,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block', flexShrink: 0 }} />
            {s.label}
        </span>
    );
};

/* ─── Score ring ──────────────────────────────────────────────────────────── */
const ScoreRing = ({ score, size = 48 }) => {
    const color = score >= 70 ? T.green : score >= 40 ? T.orange : T.red;
    const bg = score >= 70 ? T.greenLight : score >= 40 ? T.orangeLight : T.redLight;
    const r = (size / 2) - 5;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.borderSoft} strokeWidth="4" />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
                    strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: size > 40 ? 11 : 9, fontWeight: 800, color, lineHeight: 1 }}>{score}%</span>
            </div>
        </div>
    );
};

/* ─── Score bar breakdown ─────────────────────────────────────────────────── */
const ScoreBar = ({ label, scoreStr, weight }) => {
    const num = parseInt(scoreStr || '0');
    const color = num >= 70 ? T.green : num >= 40 ? T.orange : T.red;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: '0 0 130px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.mutedDark }}>{label}</div>
                <div style={{ fontSize: 10, color: T.muted }}>{weight}</div>
            </div>
            <div style={{ flex: 1, height: 8, background: T.borderSoft, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${num}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)' }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color, width: 38, textAlign: 'right' }}>{scoreStr || '0%'}</div>
        </div>
    );
};

/* ─── Avatar ──────────────────────────────────────────────────────────────── */
const AVATAR_COLORS = [
    ['#e8f0fb', '#1a3560'], ['#fff7ed', '#c2410c'], ['#f0fdf4', '#15803d'],
    ['#f5f3ff', '#6d28d9'], ['#fff1f2', '#be123c'], ['#fefce8', '#92400e'],
];
const Avatar = ({ name = '?', size = 36, index = 0 }) => {
    const [bg, fg] = AVATAR_COLORS[index % AVATAR_COLORS.length];
    return (
        <div style={{ width: size, height: size, borderRadius: size * 0.28, background: bg, color: fg, fontSize: size * 0.38, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
};

const calculateAge = (dob) => {
    if (!dob) return '—';
    const age = Math.abs(new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970);
    return `${age} Tahun`;
};

const formatDate = d => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));

const fieldBase = {
    height: 42, padding: '0 13px', border: `1.5px solid ${T.border}`, borderRadius: 9,
    background: '#fff', color: T.navy, fontSize: 13.5, outline: 'none',
    width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box',
};
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; };

/* ════════════════════════════════════════════════════════════════════════════
   HALAMAN UTAMA
════════════════════════════════════════════════════════════════════════════ */
export default function PelamarIndex({ applications }) {
    const [activeJobId, setActiveJobId] = useState(null);
    const [activeAppId, setActiveAppId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSkillFilter, setSelectedSkillFilter] = useState('');
    const [sortBy, setSortBy] = useState('match_score');
    const [mobilePanel, setMobilePanel] = useState('list'); // 'list' | 'detail'

    const { data, setData, patch, processing } = useForm({ status: '', notes: '' });

    /* grup per job */
    const groupedJobs = useMemo(() => {
        const groups = {};
        applications.forEach(app => {
            const jid = app.job_posting.id;
            if (!groups[jid]) groups[jid] = {
                id: jid, title: app.job_posting.title,
                location: app.job_posting.location,
                salary_range: app.job_posting.salary_range,
                requirements: app.job_posting.requirements || [],
                applications: [],
            };
            groups[jid].applications.push(app);
        });
        return Object.values(groups);
    }, [applications]);

    const activeJob = groupedJobs.find(j => j.id === activeJobId);

    /* filter + sort */
    const filteredApps = useMemo(() => {
        if (!activeJob) return [];
        let r = [...activeJob.applications];
        if (selectedSkillFilter && selectedSkillFilter !== 'all') {
            r = r.filter(a => (a.alumni?.skills || []).includes(selectedSkillFilter));
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            r = r.filter(a => {
                const skills = Array.isArray(a.alumni?.skills) ? a.alumni.skills : [];
                return a.alumni?.user?.name?.toLowerCase().includes(q) || skills.some(s => s.toLowerCase().includes(q));
            });
        }
        if (sortBy === 'match_score') r.sort((a, b) => b.match_score - a.match_score);
        else if (sortBy === 'newest') r.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        else if (sortBy === 'oldest') r.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        return r;
    }, [activeJob, searchQuery, selectedSkillFilter, sortBy]);

    const activeApp = filteredApps.find(a => a.id === activeAppId);

    useEffect(() => {
        if (activeApp) setData({ status: activeApp.status || 'pending', notes: activeApp.notes || '' });
    }, [activeAppId, applications]);

    const submitStatus = e => {
        e.preventDefault();
        if (!activeApp) return;
        patch(route('perusahaan.pelamar.status', activeApp.id), { preserveScroll: true });
    };

    const handleJobChange = jid => {
        setActiveJobId(jid);
        setActiveAppId(null);
        setSearchQuery('');
        setSelectedSkillFilter('');
        setSortBy('match_score');
        setMobilePanel('list');
    };

    const handleSelectApp = id => {
        setActiveAppId(id);
        setMobilePanel('detail');
    };

    /* ─── stats helper ─── */
    const jobStats = job => {
        const total = job.applications.length;
        const diterima = job.applications.filter(a => a.status === 'diterima').length;
        const proses = job.applications.filter(a => ['direview', 'wawancara'].includes(a.status)).length;
        const avgScore = total ? Math.round(job.applications.reduce((s, a) => s + (a.match_score || 0), 0) / total) : 0;
        return { total, diterima, proses, avgScore };
    };

    /* ════ RENDER ════ */
    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0 }}>
                            {activeJob ? activeJob.title : 'Pelacak Pelamar (ATS)'}
                        </h2>
                        <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>
                            {activeJob
                                ? `${filteredApps.length} pelamar · urutkan berdasarkan skor kecocokan`
                                : 'Algoritma ATS otomatis memilah kandidat terbaik untuk posisi Anda'}
                        </p>
                    </div>
                    {activeJob && (
                        <button onClick={() => handleJobChange(null)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: '#fff', color: T.mutedDark, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = T.navyMid; e.currentTarget.style.color = T.navy; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.mutedDark; }}
                        >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Semua Lowongan
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Pelacak Pelamar ATS — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                [data-radix-popper-content-wrapper] { z-index: 99999 !important; }
                .ats-root * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
                @keyframes fadeUp   { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
                @keyframes slideIn  { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
                @keyframes spin     { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }

                .ats-card { background:#fff; border-radius:14px; border:1px solid ${T.borderSoft}; box-shadow:0 1px 4px rgba(15,31,61,0.05); transition:box-shadow 0.2s,transform 0.2s; }
                .ats-card:hover { box-shadow:0 4px 16px rgba(15,31,61,0.10); transform:translateY(-2px); }

                .app-row { border-bottom:1px solid ${T.borderSoft}; cursor:pointer; transition:background 0.12s; padding:14px 18px; }
                .app-row:hover { background:${T.bgAlt}; }
                .app-row.active { background:#fff; border-left:3px solid ${T.orange}; padding-left:15px; }

                .panel-scroll::-webkit-scrollbar { width:5px; }
                .panel-scroll::-webkit-scrollbar-track { background:transparent; }
                .panel-scroll::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:4px; }

                /* ── Responsive ── */
                .ats-two-panel { display:flex; gap:0; background:#fff; border:1px solid ${T.borderSoft}; border-radius:14px; min-height:80vh; overflow:hidden; }
                .ats-left  { width:340px; flex-shrink:0; border-right:1px solid ${T.borderSoft}; display:flex; flex-direction:column; background:${T.bg}; }
                .ats-right { flex:1; overflow-y:auto; }

                .mob-tabs  { display:none; }

                @media (max-width: 768px) {
                    .ats-left  { width:100%; border-right:none; }
                    .ats-right { width:100%; }
                    .ats-two-panel { flex-direction:column; }
                    .panel-list.hidden-mobile  { display:none; }
                    .panel-detail.hidden-mobile { display:none; }
                    .mob-tabs { display:flex; border-bottom:1px solid ${T.borderSoft}; background:#fff; }
                    .mob-tab  { flex:1; padding:12px; font-size:13px; font-weight:700; border:none; background:transparent; cursor:pointer; color:${T.muted}; transition:all 0.15s; }
                    .mob-tab.active { color:${T.orange}; border-bottom:2px solid ${T.orange}; }
                }

                @media (max-width: 480px) {
                    .ats-detail-inner { padding:20px 16px !important; }
                    .info-grid-3 { grid-template-columns:1fr 1fr !important; }
                    .score-grid  { grid-template-columns:1fr !important; }
                    .ats-card-grid { grid-template-columns:1fr !important; }
                }
            `}</style>

            <div className="ats-root">

                {/* ══════════════════════════════════════════════════════════
                    VIEW 1 — Grid kartu lowongan
                ══════════════════════════════════════════════════════════ */}
                {!activeJob && (
                    <div>
                        {groupedJobs.length === 0 ? (
                            <div style={{ background: '#fff', padding: '60px 40px', textAlign: 'center', borderRadius: 14, border: `1px solid ${T.borderSoft}` }}>
                                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                                <p style={{ fontSize: 15, fontWeight: 700, color: T.mutedDark }}>Belum ada pelamar yang masuk.</p>
                                <p style={{ fontSize: 13, color: T.muted, marginTop: 6 }}>Pelamar akan muncul di sini setelah ada yang mengirim lamaran ke lowongan Anda.</p>
                            </div>
                        ) : (
                            <div className="ats-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: 16 }}>
                                {groupedJobs.map((job, idx) => {
                                    const stats = jobStats(job);
                                    return (
                                        <div key={job.id} className="ats-card"
                                            style={{ padding: 0, overflow: 'hidden', animation: `fadeUp 0.3s ${idx * 0.06}s both`, cursor: 'pointer' }}
                                            onClick={() => handleJobChange(job.id)}
                                        >
                                            {/* Header kartu */}
                                            <div style={{ padding: '18px 20px', borderBottom: `1px solid ${T.borderSoft}` }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <h3 style={{ fontSize: 15, fontWeight: 800, color: T.navy, margin: '0 0 4px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {job.title}
                                                        </h3>
                                                        <div style={{ fontSize: 12, color: T.mutedDark, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                                            {job.location || 'Lokasi tidak spesifik'}
                                                        </div>
                                                    </div>
                                                    <div style={{ background: T.orangeLight, color: T.orange, padding: '4px 12px', borderRadius: 8, fontSize: 13, fontWeight: 800, border: `1px solid ${T.orangeBorder}`, flexShrink: 0 }}>
                                                        {stats.total} Pelamar
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats row */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '14px 20px', gap: 8 }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: 18, fontWeight: 800, color: T.green }}>{stats.diterima}</div>
                                                    <div style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>Diterima</div>
                                                </div>
                                                <div style={{ textAlign: 'center', borderLeft: `1px solid ${T.borderSoft}`, borderRight: `1px solid ${T.borderSoft}` }}>
                                                    <div style={{ fontSize: 18, fontWeight: 800, color: T.purple }}>{stats.proses}</div>
                                                    <div style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>Diproses</div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: 18, fontWeight: 800, color: T.orange }}>{stats.avgScore}%</div>
                                                    <div style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>Avg. Cocok</div>
                                                </div>
                                            </div>

                                            {/* Avatar strip */}
                                            <div style={{ padding: '0 20px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', paddingLeft: 6 }}>
                                                    {job.applications.slice(0, 5).map((app, i) => (
                                                        <div key={app.id} style={{ width: 28, height: 28, borderRadius: 8, background: T.navyLight, color: T.navyMid, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, marginLeft: -6, zIndex: 10 - i }}>
                                                            {app.alumni?.user?.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                    ))}
                                                    {job.applications.length > 5 && (
                                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: T.borderSoft, color: T.mutedDark, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, marginLeft: -6 }}>
                                                            +{job.applications.length - 5}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: T.orange, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    Tinjau
                                                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    VIEW 2 — Panel daftar + detail pelamar
                ══════════════════════════════════════════════════════════ */}
                {activeJob && (
                    <div style={{ animation: 'fadeIn 0.25s both' }}>
                        <div className="ats-two-panel">

                            {/* ── Mobile tab switcher ── */}
                            <div className="mob-tabs">
                                <button className={`mob-tab ${mobilePanel === 'list' ? 'active' : ''}`} onClick={() => setMobilePanel('list')}>
                                    📋 Daftar ({filteredApps.length})
                                </button>
                                <button className={`mob-tab ${mobilePanel === 'detail' ? 'active' : ''}`} onClick={() => setMobilePanel('detail')}>
                                    👤 Detail
                                </button>
                            </div>

                            {/* ──────── PANEL KIRI — Daftar Pelamar ──────── */}
                            <div className={`ats-left panel-list ${mobilePanel !== 'list' ? 'hidden-mobile' : ''}`}>

                                {/* Filter bar */}
                                <div style={{ padding: '16px', background: '#fff', borderBottom: `1px solid ${T.borderSoft}` }}>
                                    {/* Search */}
                                    <div style={{ position: 'relative', marginBottom: 10 }}>
                                        <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.muted, pointerEvents: 'none' }} width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
                                        <input
                                            style={{ ...fieldBase, height: 38, paddingLeft: 32, fontSize: 13, borderRadius: 8 }}
                                            placeholder="Cari nama atau keahlian..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            onFocus={onFocus} onBlur={onBlur}
                                        />
                                    </div>

                                    {/* Sort + Filter */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        <Select value={sortBy} onValueChange={setSortBy}>
                                            <SelectTrigger style={{ height: 36, borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.bg, fontSize: 12, boxShadow: 'none' }}>
                                                <SelectValue placeholder="Urutkan..." />
                                            </SelectTrigger>
                                            <SelectContent position="popper" sideOffset={4} className="z-[500] rounded-xl overflow-hidden shadow-xl" style={{ background: '#fff', border: `1px solid ${T.border}` }}>
                                                <SelectItem className="text-sm cursor-pointer px-3 py-2" value="match_score">🌟 Skor Kecocokan</SelectItem>
                                                <SelectItem className="text-sm cursor-pointer px-3 py-2" value="newest">🕒 Terbaru</SelectItem>
                                                <SelectItem className="text-sm cursor-pointer px-3 py-2" value="oldest">⏳ Terlama</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={selectedSkillFilter} onValueChange={setSelectedSkillFilter}>
                                            <SelectTrigger style={{ height: 36, borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.bg, fontSize: 12, boxShadow: 'none' }}>
                                                <SelectValue placeholder="Filter Skill..." />
                                            </SelectTrigger>
                                            <SelectContent position="popper" sideOffset={4} className="z-[500] rounded-xl overflow-hidden shadow-xl" style={{ background: '#fff', border: `1px solid ${T.border}` }}>
                                                <SelectItem className="text-sm cursor-pointer px-3 py-2" value="all">Semua Skill</SelectItem>
                                                {activeJob.requirements?.map((s, i) => (
                                                    <SelectItem key={i} className="text-sm cursor-pointer px-3 py-2" value={s}>{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Jumlah hasil */}
                                <div style={{ padding: '10px 18px', fontSize: 11, fontWeight: 700, color: T.muted, background: T.bg, borderBottom: `1px solid ${T.borderSoft}` }}>
                                    {filteredApps.length} KANDIDAT DITEMUKAN
                                </div>

                                {/* Daftar */}
                                <div className="panel-scroll" style={{ overflowY: 'auto', flex: 1 }}>
                                    {filteredApps.length === 0 ? (
                                        <div style={{ padding: '40px 20px', textAlign: 'center', color: T.muted, fontSize: 13 }}>
                                            <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
                                            Tidak ada kandidat yang cocok dengan filter ini.
                                        </div>
                                    ) : filteredApps.map((app, index) => {
                                        const isActive = activeAppId === app.id;
                                        const skills = Array.isArray(app.alumni?.skills) ? app.alumni.skills : [];
                                        return (
                                            <div key={app.id}
                                                className={`app-row ${isActive ? 'active' : ''}`}
                                                onClick={() => handleSelectApp(app.id)}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                                    <Avatar name={app.alumni?.user?.name} size={36} index={index} />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                            <span style={{ fontSize: 13, fontWeight: 800, color: T.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {index + 1}. {app.alumni?.user?.name}
                                                            </span>
                                                            <ScoreRing score={app.match_score} size={38} />
                                                        </div>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                                                            {skills.length > 0
                                                                ? skills.slice(0, 2).map((s, i) => (
                                                                    <span key={i} style={{ fontSize: 10, fontWeight: 600, background: T.borderSoft, color: T.mutedDark, padding: '2px 7px', borderRadius: 4 }}>{s}</span>
                                                                ))
                                                                : <span style={{ fontSize: 11, color: T.muted, fontStyle: 'italic' }}>Belum mengisi keahlian</span>
                                                            }
                                                            {skills.length > 2 && <span style={{ fontSize: 10, color: T.muted, fontWeight: 700 }}>+{skills.length - 2}</span>}
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <StatusBadge status={app.status} />
                                                            <span style={{ fontSize: 10, color: T.muted }}>{formatDate(app.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ──────── PANEL KANAN — Detail Pelamar ──────── */}
                            <div className={`ats-right panel-detail ${mobilePanel !== 'detail' ? 'hidden-mobile' : ''}`}>
                                {!activeApp ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: T.muted, textAlign: 'center', padding: 40, gap: 12 }}>
                                        <div style={{ fontSize: 52 }}>🤖</div>
                                        <p style={{ fontSize: 15, fontWeight: 700, color: T.mutedDark, margin: 0 }}>Pilih kandidat di panel kiri</p>
                                        <p style={{ fontSize: 13, color: T.muted, margin: 0, maxWidth: 260 }}>Algoritma ATS telah mengurutkan kandidat dari yang paling relevan.</p>
                                    </div>
                                ) : (
                                    <div className="ats-detail-inner" style={{ padding: '28px 32px', animation: 'slideIn 0.25s both' }}>

                                        {/* ─ Header kandidat ─ */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                                            <Avatar name={activeApp.alumni?.user?.name} size={60} index={filteredApps.findIndex(a => a.id === activeAppId)} />
                                            <div style={{ flex: 1, minWidth: 180 }}>
                                                <h3 style={{ fontSize: 20, fontWeight: 800, color: T.navy, margin: '0 0 4px' }}>{activeApp.alumni?.user?.name}</h3>
                                                <div style={{ fontSize: 12, color: T.mutedDark, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                                                    {activeApp.alumni?.user?.email}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                                <StatusBadge status={activeApp.status} size="lg" />
                                                {activeApp.cv_path ? (
                                                    <a href={`/storage/${activeApp.cv_path}`} target="_blank" rel="noreferrer"
                                                        style={{ fontSize: 12, fontWeight: 700, color: T.orange, textDecoration: 'none', background: T.orangeLight, padding: '6px 12px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 5, border: `1px solid ${T.orangeBorder}` }}>
                                                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                                        Lihat CV
                                                    </a>
                                                ) : <span style={{ fontSize: 11, color: T.muted, fontStyle: 'italic' }}>Tidak ada CV</span>}
                                            </div>
                                        </div>

                                        {/* ─ Skor ATS besar ─ */}
                                        <div style={{ background: activeApp.match_score >= 70 ? T.greenLight : activeApp.match_score >= 40 ? T.orangeLight : T.redLight, border: `1px solid ${activeApp.match_score >= 70 ? T.greenBorder : activeApp.match_score >= 40 ? T.orangeBorder : T.redBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <ScoreRing score={activeApp.match_score} size={60} />
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 800, color: activeApp.match_score >= 70 ? T.green : activeApp.match_score >= 40 ? T.orange : T.red }}>
                                                    {activeApp.match_score >= 70 ? '🟢 Kandidat Sangat Sesuai' : activeApp.match_score >= 40 ? '🟡 Kandidat Cukup Sesuai' : '🔴 Kandidat Kurang Sesuai'}
                                                </div>
                                                <div style={{ fontSize: 12, color: T.mutedDark, marginTop: 3 }}>
                                                    Skor kecocokan ATS berdasarkan keahlian, pendidikan, pengalaman, dan usia.
                                                </div>
                                            </div>
                                        </div>

                                        {/* ─ Rincian skor ─ */}
                                        {activeApp.score_details && (
                                            <div style={{ background: '#fff', border: `1px solid ${T.borderSoft}`, borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
                                                <div style={{ fontSize: 11, fontWeight: 800, color: T.navyMid, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
                                                    Rincian Bobot Skor
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                    <ScoreBar label="Keahlian" weight="Bobot 40%" scoreStr={activeApp.score_details.skill_match} />
                                                    <ScoreBar label="Pendidikan" weight="Bobot 25%" scoreStr={activeApp.score_details.education} />
                                                    <ScoreBar label="Pengalaman" weight="Bobot 20%" scoreStr={activeApp.score_details.experience} />
                                                    <ScoreBar label="Usia" weight="Bobot 15%" scoreStr={activeApp.score_details.age} />
                                                </div>
                                            </div>
                                        )}

                                        {/* ─ Komparasi skill ─ */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                                            {/* Syarat posisi */}
                                            <div style={{ background: T.orangeLight, border: `1px solid ${T.orangeBorder}`, borderRadius: 12, padding: '16px 18px' }}>
                                                <div style={{ fontSize: 11, fontWeight: 800, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                                                    Syarat Posisi
                                                </div>
                                                {(!activeJob.requirements || activeJob.requirements.length === 0) ? (
                                                    <span style={{ fontSize: 12, color: '#9a3412', fontStyle: 'italic' }}>Tidak ada syarat spesifik.</span>
                                                ) : (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                        {activeJob.requirements.map((req, i) => (
                                                            <span key={i} style={{ background: '#ffedd5', color: '#c2410c', padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700, border: '1px solid #fdba74' }}>{req}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Keahlian kandidat */}
                                            <div style={{ background: T.navyLight, border: `1px solid #bfdbfe`, borderRadius: 12, padding: '16px 18px' }}>
                                                <div style={{ fontSize: 11, fontWeight: 800, color: T.navyMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                                                    Keahlian Kandidat
                                                </div>
                                                {(!activeApp.alumni?.skills || activeApp.alumni.skills.length === 0) ? (
                                                    <span style={{ fontSize: 12, color: T.navyMid, fontStyle: 'italic' }}>Belum mengisi keahlian.</span>
                                                ) : (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                        {(Array.isArray(activeApp.alumni.skills) ? activeApp.alumni.skills : [activeApp.alumni.skills]).map((skill, i) => {
                                                            const isMatch = activeJob.requirements?.includes(skill);
                                                            return (
                                                                <span key={i} style={{ background: isMatch ? T.greenLight : '#fff', color: isMatch ? T.green : T.navyMid, padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700, border: `1px solid ${isMatch ? '#86efac' : '#cbd5e1'}` }}>
                                                                    {isMatch ? '★ ' : ''}{skill}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* ─ Profil Akademik & Kontak ─ */}
                                        <div style={{ fontSize: 11, fontWeight: 800, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                                            Profil Akademik &amp; Kontak
                                        </div>
                                        <div className="info-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
                                            {[
                                                { label: 'Program Studi', value: `${activeApp.alumni?.jenjang_pendidikan || ''} ${activeApp.alumni?.major || '—'}` },
                                                { label: 'Pengalaman', value: `${activeApp.alumni?.experience ?? 0} Tahun` },
                                                { label: 'Usia', value: calculateAge(activeApp.alumni?.tanggal_lahir) },
                                                { label: 'No. Telepon', value: activeApp.alumni?.phone_number || '—' },
                                                { label: 'Domisili', value: activeApp.alumni?.address || '—', span: 2 },
                                            ].map((f, i) => (
                                                <div key={i} style={{ background: T.bg, padding: '12px 14px', borderRadius: 10, border: `1px solid ${T.borderSoft}`, gridColumn: f.span ? `span ${f.span}` : undefined }}>
                                                    <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{f.label}</div>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{f.value}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ borderTop: `1px solid ${T.borderSoft}`, margin: '0 0 20px' }} />

                                        {/* ─ Tindakan Keputusan ─ */}
                                        <div style={{ fontSize: 11, fontWeight: 800, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                                            Tindakan Keputusan
                                        </div>
                                        <form onSubmit={submitStatus} style={{ background: T.bg, padding: '20px', borderRadius: 12, border: `1px solid ${T.borderSoft}` }}>
                                            <div style={{ marginBottom: 16 }}>
                                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 7 }}>UBAH STATUS KANDIDAT</label>
                                                <Select value={data.status} onValueChange={v => setData('status', v)}>
                                                    <SelectTrigger className="focus:ring-0 focus:ring-offset-0" style={{ height: 42, borderRadius: 9, border: `1.5px solid ${T.border}`, background: '#fff', fontSize: 13.5, width: '100%' }}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent position="popper" sideOffset={4} className="z-[500] rounded-xl overflow-hidden shadow-xl" style={{ background: '#fff', border: `1px solid ${T.border}` }}>
                                                        <SelectItem className="text-sm cursor-pointer px-3 py-2" value="pending">⏳ Menunggu (Pending)</SelectItem>
                                                        <SelectItem className="text-sm cursor-pointer px-3 py-2" value="direview">👁️ Sedang Direview</SelectItem>
                                                        <SelectItem className="text-sm cursor-pointer px-3 py-2" value="wawancara">🎙️ Panggil Wawancara</SelectItem>
                                                        <SelectItem className="text-sm cursor-pointer px-3 py-2" value="diterima">✅ Diterima (Hired)</SelectItem>
                                                        <SelectItem className="text-sm cursor-pointer px-3 py-2" value="ditolak">❌ Ditolak (Rejected)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div style={{ marginBottom: 16 }}>
                                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 7 }}>CATATAN INTERNAL <span style={{ fontWeight: 400, color: T.muted }}>(opsional)</span></label>
                                                <textarea
                                                    style={{ ...fieldBase, height: 'auto', padding: '10px 13px', resize: 'vertical', fontSize: 13 }} rows={3}
                                                    placeholder="Jadwal wawancara, hasil interview, alasan penolakan..."
                                                    value={data.notes} onChange={e => setData('notes', e.target.value)}
                                                    onFocus={onFocus} onBlur={onBlur}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <button type="submit" disabled={processing}
                                                    style={{ height: 42, padding: '0 24px', borderRadius: 9, border: 'none', background: processing ? T.muted : T.orange, color: '#fff', fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 8, boxShadow: processing ? 'none' : '0 2px 10px rgba(249,115,22,0.3)' }}
                                                    onMouseEnter={e => { if (!processing) { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = processing ? T.muted : T.orange; e.currentTarget.style.transform = 'none'; }}
                                                >
                                                    {processing
                                                        ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}><path strokeLinecap="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>Menyimpan...</>
                                                        : <><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Simpan Pembaruan</>
                                                    }
                                                </button>
                                            </div>
                                        </form>

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
