import React, { Suspense, useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import { Badge } from '@/Components/ui/badge';

const MapWidget = React.lazy(() => import('@/Components/MapWidget'));

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626', redLight: '#fff1f2',
};

const formatSalary = (salary) => {
    if (!salary) return 'Gaji dirahasiakan';
    if (salary.startsWith('Rp')) return salary;
    const match = salary.match(/^(\d+)\s*-\s*(\d+)$/);
    if (match) {
        const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(n));
        return `${fmt(match[1])} - ${fmt(match[2])}`;
    }
    if (/^\d+$/.test(salary)) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(salary));
    }
    return salary;
};

const workModelMap = {
    'Remote': { variant: 'secondary', icon: '🌐' },
    'Hybrid': { variant: 'outline', icon: '🏢' },
    'On-site': { variant: 'default', icon: '📍' },
};

/* ─── Modal ──────────────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, subtitle, children, footer }) {
    const [visible, setVisible] = React.useState(false);
    const [render, setRender] = React.useState(false);
    React.useEffect(() => {
        if (open) { setRender(true); requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); }
        else { setVisible(false); const t = setTimeout(() => setRender(false), 260); return () => clearTimeout(t); }
    }, [open]);
    if (!render) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease' }}>
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)', cursor: 'default' }} />
            <div style={{
                background: '#fff', borderRadius: 16, position: 'relative', width: '100%',
                maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 24px 60px rgba(10,20,40,0.2)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
                transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1)',
            }}
            className="modal-scrollable"
            >
                <div style={{ padding: '20px 22px 14px', borderBottom: `1px solid ${T.borderSoft}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: subtitle ? 4 : 0 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: T.navy }}>{title}</span>
                        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: T.bg, color: T.mutedDark, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onMouseEnter={e => e.currentTarget.style.background = T.border}
                            onMouseLeave={e => e.currentTarget.style.background = T.bg}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    {subtitle && <div style={{ fontSize: 12.5, color: T.muted }}>{subtitle}</div>}
                </div>
                <div style={{ padding: '18px 22px' }}>{children}</div>
                {footer && <>
                    <div style={{ height: 1, background: T.borderSoft }} />
                    <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div>
                </>}
            </div>
        </div>
    );
}

const BtnGhost = ({ children, onClick }) => (
    <button type="button" onClick={onClick} style={{ height: 36, padding: '0 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: 'transparent', color: T.mutedDark, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = T.bg}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >{children}</button>
);

const fieldBase = { height: 42, padding: '0 13px', border: `1.5px solid ${T.border}`, borderRadius: 9, background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none', width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box' };
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; e.target.style.boxShadow = 'none'; };

export default function LokerIndex({ jobs, myApplications, appliedConversationIds, alumniProfile }) {
    const { flash, auth } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isUpdatingCV, setIsUpdatingCV] = useState(false);
    const [inviteJob, setInviteJob] = useState(null);
    const [inviteAction, setInviteAction] = useState(null);
    const [inviteConfirmOpen, setInviteConfirmOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        cv_option: 'profile',
        cv_file: null,
    });

    const hasProfileCv = !!alumniProfile?.cv_path;

    const filtered = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const openApply = (job, isUpdate = false) => {
        clearErrors();
        setSelectedJob(job);
        setIsUpdatingCV(isUpdate);
        setData({
            cv_option: hasProfileCv ? 'profile' : 'upload',
            cv_file: null,
        });
        setModalOpen(true);
    };

    const openInviteResponse = (job) => {
        setInviteJob(job);
        setInviteAction(null);
        setInviteConfirmOpen(true);
    };

    const handleInviteResponse = () => {
        const app = myApplications?.[inviteJob.id];
        if (!app) return;
        const url = inviteAction === 'accept'
            ? route('alumni.lamaran.accept-invitation', app.id)
            : route('alumni.lamaran.reject-invitation', app.id);
        post(url, {
            preserveScroll: true,
            onFinish: () => { setInviteConfirmOpen(false); setInviteJob(null); setInviteAction(null); },
        });
    };

    const handleApply = (e) => {
        e.preventDefault();
        if (data.cv_option === 'upload' && !data.cv_file) return;
        const routeName = isUpdatingCV ? 'alumni.loker.update-cv' : 'alumni.loker.apply';
        post(route(routeName, selectedJob.id), { onSuccess: () => setModalOpen(false) });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Bursa Kerja</h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Temukan karir impian Anda dari perusahaan mitra SITAMI</p>
                </div>
            }
        >
            <Head title="Bursa Kerja — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .ak-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
                .job-card { transition: all 0.2s ease; }
                .job-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,31,61,0.1); }
                @media (max-width: 540px) {
                    .modal-scrollable { border-radius: 12px !important; max-width: 100% !important; margin: 0 8px; }
                    .modal-scrollable > div:first-child { padding: 16px 18px 10px !important; }
                    .modal-scrollable > div:nth-child(2) { padding: 14px 18px !important; }
                    .modal-scrollable > div:last-child { padding: 12px 18px !important; }
                    .map-company-wrapper .leaflet-container { height: 120px !important; }
                }
                @media (max-width: 400px) {
                    .modal-scrollable > div:nth-child(2) { padding: 12px 14px !important; }
                    .map-company-wrapper .leaflet-container { height: 100px !important; }
                }
            `}</style>

            <div className="ak-root">
                {/* Flash */}
                {(flash?.message || flash?.error) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, marginBottom: 16, background: flash.error ? T.redLight : T.greenLight, border: `1px solid ${flash.error ? '#fecaca' : '#bbf7d0'}`, animation: 'slideDown 0.3s ease both' }}>
                        <div style={{ fontSize: 16 }}>{flash.error ? '⚠️' : '✅'}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: flash.error ? T.red : T.green }}>{flash.message || flash.error}</div>
                    </div>
                )}

                {/* Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ padding: '4px 10px', borderRadius: 8, background: T.navyLight, border: `1px solid ${T.navyMid}22` }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: T.navyMid }}>{filtered.length} Lowongan Tersedia</span>
                        </div>
                        {Object.keys(myApplications).length > 0 && (
                            <div style={{ padding: '4px 10px', borderRadius: 8, background: T.greenLight, border: `1px solid ${T.green}22` }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: T.green }}>{Object.keys(myApplications).length} Terkait</span>
                            </div>
                        )}
                    </div>
                    <div style={{ position: 'relative' }}>
                        <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#b0bec5' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input style={{ ...fieldBase, paddingLeft: 33, width: 280 }} placeholder="Cari posisi, perusahaan, atau lokasi..."
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                </div>

                {/* Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {filtered.map((job, i) => {
                        const app = myApplications?.[job.id] || null;
                        const wm = job.work_model;
                        const wmInfo = workModelMap[wm] || null;

                        /* ── State derivation ── */
                        const isInvitation = app?.source_type === 'invitation';
                        const invitePending = isInvitation && app?.invitation_status === 'pending';
                        const inviteAccepted = isInvitation && app?.invitation_status === 'accepted';
                        const inviteRejected = isInvitation && app?.invitation_status === 'rejected';
                        const isManual = app && !isInvitation;
                        const hasConv = !!appliedConversationIds?.[job.id];

                        /* ── Card border color ── */
                        const cardBorder = invitePending ? '#c4b5fd' : inviteAccepted ? T.greenLight : isManual ? T.greenLight : T.borderSoft;

                        return (
                            <div key={job.id} className="job-card" style={{
                                background: '#fff', borderRadius: 14,
                                border: `1px solid ${cardBorder}`,
                                padding: '20px', display: 'flex', flexDirection: 'column',
                                animation: `cardIn 0.38s ${i * 0.05}s cubic-bezier(0.22,1,0.36,1) both`,
                                boxShadow: '0 2px 8px rgba(15,31,61,0.05)',
                            }}>
                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: T.navyLight, color: T.navyMid, fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {job.company?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 800, color: T.navy }}>{job.title}</div>
                                            <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{job.company?.name}</div>
                                            <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
                                                <Badge variant="secondary" className="text-[10px] leading-none">Full-Time</Badge>
                                                {wmInfo && (
                                                    <Badge variant={wmInfo.variant} className="text-[10px] leading-none">
                                                        {wmInfo.icon} {wm}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Status pill */}
                                    {invitePending && (
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#ede9fe', color: '#7c3aed', flexShrink: 0, whiteSpace: 'nowrap' }}>Undangan</span>
                                    )}
                                    {inviteAccepted && (
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: T.greenLight, color: T.green, flexShrink: 0, whiteSpace: 'nowrap' }}>Diterima</span>
                                    )}
                                    {inviteRejected && (
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: T.redLight, color: T.red, flexShrink: 0, whiteSpace: 'nowrap' }}>Ditolak</span>
                                    )}
                                    {isManual && (
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: T.greenLight, color: T.green, flexShrink: 0, whiteSpace: 'nowrap' }}>Dilamar</span>
                                    )}
                                </div>

                                {/* Details */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14, flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: T.mutedDark }}>
                                        <span>📍</span> {job.location || 'Lokasi tidak disebutkan'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: T.mutedDark }}>
                                        <span>💰</span> {formatSalary(job.salary_range)}
                                    </div>
                                    {job.description && (
                                        <p style={{ fontSize: 12.5, color: T.muted, marginTop: 4, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {job.description}
                                        </p>
                                    )}
                                    {job.latitude && job.longitude && (
                                        <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden' }}>
                                            <Suspense fallback={<div style={{ height: 120, borderRadius: 8, background: '#f0f4f9' }} />}>
                                                <MapWidget
                                                    latitude={parseFloat(job.latitude)}
                                                    longitude={parseFloat(job.longitude)}
                                                    height={120}
                                                />
                                            </Suspense>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Buttons — 5 states */}
                                {invitePending ? (
                                    /* STATE 3: Invitation pending — show response button */
                                    <button
                                        onClick={() => openInviteResponse(job)}
                                        style={{
                                            height: 38, borderRadius: 9, border: 'none', width: '100%',
                                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                            fontFamily: 'inherit', transition: 'all 0.15s',
                                            background: '#7c3aed', color: '#fff',
                                            boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#6d28d9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.transform = 'none'; }}
                                    >
                                        Respon Undangan
                                    </button>
                                ) : inviteAccepted && hasConv ? (
                                    /* STATE 4a: Accepted + has conversation */
                                    <button
                                        onClick={() => router.get(route('messages.index', { conversation: appliedConversationIds[job.id] }))}
                                        style={{
                                            height: 38, borderRadius: 9, border: 'none', width: '100%',
                                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                            fontFamily: 'inherit', transition: 'all 0.15s',
                                            background: T.orange, color: '#fff',
                                            boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = T.orange; e.currentTarget.style.transform = 'none'; }}
                                    >
                                        Lanjutkan Obrolan
                                    </button>
                                ) : inviteAccepted ? (
                                    /* STATE 4b: Accepted, waiting for HR */
                                    <div style={{
                                        height: 38, borderRadius: 9, width: '100%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 13, fontWeight: 700,
                                        background: T.greenLight, color: T.green, cursor: 'default',
                                    }}>
                                        Undangan Diterima
                                    </div>
                                ) : inviteRejected ? (
                                    /* STATE 5: Rejected — allow re-apply */
                                    <button
                                        onClick={() => openApply(job, false)}
                                        style={{
                                            height: 38, borderRadius: 9, border: 'none', width: '100%',
                                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                            fontFamily: 'inherit', transition: 'all 0.15s',
                                            background: T.orange, color: '#fff',
                                            boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = T.orange; e.currentTarget.style.transform = 'none'; }}
                                    >
                                        Lamar Pekerjaan
                                    </button>
                                ) : isManual && hasConv ? (
                                    /* STATE 2a: Manual application + has conversation */
                                    <button
                                        onClick={() => router.get(route('messages.index', { conversation: appliedConversationIds[job.id] }))}
                                        style={{
                                            height: 38, borderRadius: 9, border: 'none', width: '100%',
                                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                            fontFamily: 'inherit', transition: 'all 0.15s',
                                            background: T.orange, color: '#fff',
                                            boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = T.orange; e.currentTarget.style.transform = 'none'; }}
                                    >
                                        Lanjutkan Obrolan
                                    </button>
                                ) : isManual ? (
                                    /* STATE 2b: Manual application, no conversation yet */
                                    <div style={{
                                        height: 38, borderRadius: 9, width: '100%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 13, fontWeight: 700,
                                        background: T.greenLight, color: T.green, cursor: 'default',
                                    }}>
                                        Lamaran Terkirim
                                    </div>
                                ) : (
                                    /* STATE 1: No relation — show apply button */
                                    <button
                                        onClick={() => openApply(job, false)}
                                        style={{
                                            height: 38, borderRadius: 9, border: 'none', width: '100%',
                                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                            fontFamily: 'inherit', transition: 'all 0.15s',
                                            background: T.orange, color: '#fff',
                                            boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = T.orange; e.currentTarget.style.transform = 'none'; }}
                                    >
                                        Lamar Pekerjaan
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div style={{ padding: '64px 20px', textAlign: 'center', background: '#fff', borderRadius: 14, border: `2px dashed ${T.borderSoft}` }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Tidak ada lowongan ditemukan</div>
                        <div style={{ fontSize: 13, color: T.muted }}>Coba gunakan kata kunci pencarian yang berbeda.</div>
                    </div>
                )}
            </div>

            {/* Modal Konfirmasi Lamaran */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}
                title={isUpdatingCV ? `Perbarui Lamaran: ${selectedJob?.title}` : `Konfirmasi Lamaran: ${selectedJob?.title}`}
                subtitle={`${selectedJob?.company?.name}`}
                footer={<>
                    <BtnGhost onClick={() => setModalOpen(false)}>Batal</BtnGhost>
                    <button type="submit" form="apply-form"
                        disabled={processing || (data.cv_option === 'upload' && !data.cv_file)}
                        style={{
                            height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
                            background: (processing || (data.cv_option === 'upload' && !data.cv_file)) ? T.muted : (isUpdatingCV ? T.green : T.orange),
                            color: '#fff', fontSize: 13, fontWeight: 700,
                            cursor: (processing || (data.cv_option === 'upload' && !data.cv_file)) ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', boxShadow: (processing || (data.cv_option === 'upload' && !data.cv_file)) ? 'none' : '0 2px 8px rgba(249,115,22,0.3)',
                            transition: 'all 0.15s',
                        }}>
                        {processing ? 'Mengirim...' : (isUpdatingCV ? 'Perbarui Lamaran' : 'Kirim Lamaran')}
                    </button>
                </>}
            >
                <form id="apply-form" onSubmit={handleApply}>
                    {/* Job info card */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: T.bg, border: `1px solid ${T.borderSoft}`, marginBottom: 16 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 9, background: T.navyLight, color: T.navyMid, fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {selectedJob?.company?.name?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{selectedJob?.title}</div>
                            <div style={{ fontSize: 11.5, color: T.muted }}>{selectedJob?.company?.name}</div>
                        </div>
                    </div>

                    {/* Company Location Map */}
                    {selectedJob?.company?.latitude && selectedJob?.company?.longitude && (
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 6 }}>
                                Lokasi Perusahaan
                            </label>
                            <div className="map-company-wrapper" style={{ borderRadius: 9, overflow: 'hidden', border: `1px solid ${T.borderSoft}` }}>
                                <Suspense fallback={<div style={{ height: 150, borderRadius: 9, background: '#f0f4f9' }} />}>
                                    <MapWidget
                                        latitude={parseFloat(selectedJob.company.latitude)}
                                        longitude={parseFloat(selectedJob.company.longitude)}
                                        height={150}
                                    />
                                </Suspense>
                            </div>
                            {selectedJob.company.address && (
                                <div style={{ fontSize: 11.5, color: T.muted, marginTop: 4, paddingLeft: 2 }}>
                                    📍 {selectedJob.company.address}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Disclaimer */}
                    <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: T.navyLight, border: `1px solid ${T.navyMid}22`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
                        <div style={{ fontSize: 12.5, lineHeight: 1.6, color: T.navyMid }}>
                            Data profil Anda (<strong>{auth?.user?.name || 'Nama'}</strong>
                            {alumniProfile?.nim && <>, NIM: <strong>{alumniProfile.nim}</strong></>}
                            {alumniProfile?.major && <>, Jurusan: <strong>{alumniProfile.major}</strong></>}) akan otomatis terlampir dan dikirimkan ke HRD perusahaan bersama lamaran ini.
                        </div>
                    </div>

                    {/* CV Option */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 8 }}>
                            Curriculum Vitae (CV) <span style={{ color: T.red }}>*</span>
                        </label>

                        <label style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                            borderRadius: 9, border: `1.5px solid ${data.cv_option === 'profile' ? T.navyMid : T.border}`,
                            background: data.cv_option === 'profile' ? T.navyLight : '#fff',
                            cursor: hasProfileCv ? 'pointer' : 'not-allowed', opacity: hasProfileCv ? 1 : 0.5, marginBottom: 8,
                            transition: 'all 0.15s',
                        }}>
                            <input type="radio" name="cv_option" value="profile"
                                checked={data.cv_option === 'profile'}
                                onChange={() => setData('cv_option', 'profile')}
                                disabled={!hasProfileCv}
                                style={{ accentColor: T.navyMid }} />
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>Gunakan CV dari Profil</div>
                                <div style={{ fontSize: 11.5, color: T.muted, marginTop: 1 }}>
                                    {hasProfileCv ? 'CV tersimpan akan dilampirkan' : 'Belum ada CV di profil'}
                                </div>
                            </div>
                        </label>

                        <label style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                            borderRadius: 9, border: `1.5px solid ${data.cv_option === 'upload' ? T.navyMid : T.border}`,
                            background: data.cv_option === 'upload' ? T.orangeLight : '#fff',
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                            <input type="radio" name="cv_option" value="upload"
                                checked={data.cv_option === 'upload'}
                                onChange={() => setData('cv_option', 'upload')}
                                style={{ accentColor: T.navyMid }} />
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>Upload CV Baru (.pdf)</div>
                            </div>
                        </label>

                        {data.cv_option === 'upload' && (
                            <label style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8,
                                height: 80, borderRadius: 9, marginTop: 8,
                                border: `2px dashed ${data.cv_file ? T.orange : T.border}`,
                                background: data.cv_file ? T.orangeLight : T.bg, cursor: 'pointer', transition: 'all 0.18s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = T.orange}
                                onMouseLeave={e => e.currentTarget.style.borderColor = data.cv_file ? T.orange : T.border}
                            >
                                <input type="file" accept=".pdf" onChange={e => setData('cv_file', e.target.files[0])} style={{ display: 'none' }} />
                                {data.cv_file ? (
                                    <>
                                        <div style={{ fontSize: 18 }}>📄</div>
                                        <div style={{ fontSize: 12.5, fontWeight: 700, color: T.orange }}>{data.cv_file.name}</div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ fontSize: 18 }}>📎</div>
                                        <div style={{ fontSize: 12.5, fontWeight: 600, color: T.mutedDark }}>Klik untuk pilih file PDF</div>
                                        <div style={{ fontSize: 11, color: T.muted }}>Maks. 5MB</div>
                                    </>
                                )}
                            </label>
                        )}
                        <InputError message={errors.cv_file} className="mt-1" />
                    </div>

                </form>
            </Modal>

            {/* Modal Konfirmasi Respon Undangan */}
            <Modal open={inviteConfirmOpen} onClose={() => !processing && setInviteConfirmOpen(false)}
                title="Respon Undangan Kerja"
                subtitle={inviteJob?.company?.name}
                footer={<>
                    <BtnGhost onClick={() => setInviteConfirmOpen(false)}>Batal</BtnGhost>
                    {inviteAction === 'accept' ? (
                        <button type="button" onClick={handleInviteResponse} disabled={processing}
                            style={{
                                height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
                                background: processing ? T.muted : T.green, color: '#fff',
                                fontSize: 13, fontWeight: 700,
                                cursor: processing ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit', transition: 'all 0.15s',
                            }}>
                            {processing ? 'Memproses...' : 'Ya, Terima'}
                        </button>
                    ) : inviteAction === 'reject' ? (
                        <button type="button" onClick={handleInviteResponse} disabled={processing}
                            style={{
                                height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
                                background: processing ? T.muted : T.red, color: '#fff',
                                fontSize: 13, fontWeight: 700,
                                cursor: processing ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit', transition: 'all 0.15s',
                            }}>
                            {processing ? 'Memproses...' : 'Ya, Tolak'}
                        </button>
                    ) : null}
                </>}
            >
                {/* Job info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: T.bg, border: `1px solid ${T.borderSoft}`, marginBottom: 16 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: T.navyLight, color: T.navyMid, fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {inviteJob?.company?.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{inviteJob?.title}</div>
                        <div style={{ fontSize: 11.5, color: T.muted }}>{inviteJob?.company?.name}</div>
                    </div>
                </div>

                {/* Invitation notice */}
                <div style={{ padding: '14px 16px', borderRadius: 10, background: '#ede9fe', border: '1px solid #c4b5fd', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>📩</span>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#5b21b6', marginBottom: 4 }}>Anda diundang untuk melamar posisi ini</div>
                        <div style={{ fontSize: 12.5, color: '#6d28d9', lineHeight: 1.6 }}>
                            Perusahaan ini mengundang Anda secara khusus untuk melamar posisi ini. Pilih <strong>Terima</strong> untuk mengirim lamaran, atau <strong>Tolak</strong> jika tidak berminat.
                        </div>
                    </div>
                </div>

                {/* Action selection */}
                {!inviteAction && (
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" onClick={() => setInviteAction('accept')}
                            style={{
                                flex: 1, height: 44, borderRadius: 10, border: `2px solid ${T.green}`,
                                background: T.greenLight, color: T.green, fontSize: 13, fontWeight: 700,
                                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = T.green; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = T.greenLight; e.currentTarget.style.color = T.green; }}
                        >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            Terima Undangan
                        </button>
                        <button type="button" onClick={() => setInviteAction('reject')}
                            style={{
                                flex: 1, height: 44, borderRadius: 10, border: `2px solid ${T.red}`,
                                background: T.redLight, color: T.red, fontSize: 13, fontWeight: 700,
                                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = T.red; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = T.redLight; e.currentTarget.style.color = T.red; }}
                        >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            Tolak
                        </button>
                    </div>
                )}

                {inviteAction && (
                    <div style={{
                        padding: '14px 16px', borderRadius: 10,
                        background: inviteAction === 'accept' ? T.greenLight : T.redLight,
                        border: `1px solid ${inviteAction === 'accept' ? '#bbf7d0' : '#fecaca'}`,
                        fontSize: 13, fontWeight: 600,
                        color: inviteAction === 'accept' ? T.green : T.red,
                        textAlign: 'center',
                    }}>
                        {inviteAction === 'accept'
                            ? 'Anda akan menerima undangan ini. Lamaran akan dikirim ke perusahaan.'
                            : 'Anda akan menolak undangan ini. Perusahaan akan diberitahu.'}
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
