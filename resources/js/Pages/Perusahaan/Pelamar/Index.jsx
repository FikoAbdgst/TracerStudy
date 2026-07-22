import React, { Suspense, useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Dialog, DialogContent } from '@/Components/ui/dialog';

const LocationPicker = React.lazy(() => import('@/Components/LocationPicker'));

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
    menunggu: { bg: T.borderSoft, color: T.mutedDark, border: T.border, label: 'Menunggu', dot: '#94a3b8', desc: 'Belum ditindaklanjuti' },
    wawancara: { bg: T.purpleLight, color: T.purple, border: T.purpleBorder, label: 'Wawancara', dot: T.purple, desc: 'Panggil kandidat' },
    diterima: { bg: T.greenLight, color: T.green, border: T.greenBorder, label: 'Diterima ✓', dot: T.green, desc: 'Kandidat terpilih' },
    ditolak: { bg: T.redLight, color: T.red, border: T.redBorder, label: 'Ditolak', dot: T.red, desc: 'Tidak lolos seleksi' },
};

const StatusBadge = ({ status, size = 'sm', onClick }) => {
    const s = STATUS[status] ?? STATUS.menunggu;
    const pad = size === 'lg' ? '5px 14px' : '3px 10px';
    const fs = size === 'lg' ? 12 : 11;
    return (
        <span onClick={onClick} style={{
            fontSize: fs, fontWeight: 700, padding: pad, borderRadius: 20,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
            cursor: onClick ? 'pointer' : 'default', transition: 'opacity 0.15s',
        }}
            onMouseEnter={e => { if (onClick) e.currentTarget.style.opacity = '0.75'; }}
            onMouseLeave={e => { if (onClick) e.currentTarget.style.opacity = '1'; }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block', flexShrink: 0 }} />
            {s.label}
        </span>
    );
};

/* ─── Score ring ──────────────────────────────────────────────────────────── */
const ScoreRing = ({ score, size = 48 }) => {
    const color = score >= 70 ? T.green : score >= 40 ? T.orange : T.red;
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
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
    const safeIdx = ((index % AVATAR_COLORS.length) + AVATAR_COLORS.length) % AVATAR_COLORS.length;
    const [bg, fg] = AVATAR_COLORS[safeIdx];
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
   STATUS OPTION CARD (modal)
════════════════════════════════════════════════════════════════════════════ */
const StatusOptionCard = ({ value, current, onClick, locked }) => {
    const s = STATUS[value];
    const isActive = current === value;

    const activeBorderColor = {
        menunggu: '#94a3b8',
        wawancara: T.purple,
        diterima: T.green,
        ditolak: T.red,
    }[value];

    const activeBg = {
        menunggu: T.borderSoft,
        wawancara: T.purpleLight,
        diterima: T.greenLight,
        ditolak: T.redLight,
    }[value];

    return (
        <div
            onClick={() => { if (!locked) onClick(value); }}
            style={{
                border: `${isActive ? '1.5px' : '1px'} solid ${locked ? T.border : isActive ? activeBorderColor : T.border}`,
                borderRadius: 10,
                padding: '10px 13px',
                cursor: locked ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'all 0.15s',
                background: locked ? T.borderSoft : isActive ? activeBg : '#fff',
                opacity: locked ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (!isActive && !locked) e.currentTarget.style.background = T.bg; }}
            onMouseLeave={e => { if (!isActive && !locked) e.currentTarget.style.background = '#fff'; }}
        >
            <span style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: locked ? T.muted : s.dot,
                boxShadow: isActive ? `0 0 0 3px ${activeBg}, 0 0 0 4px ${s.dot}` : 'none',
                transition: 'box-shadow 0.15s',
            }} />
            <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: locked ? T.muted : isActive ? s.color : T.navy, lineHeight: 1.2 }}>
                    {s.label}
                    {locked && <span style={{ fontSize: 10, color: T.muted, marginLeft: 6 }}>🔒</span>}
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{locked ? 'Sudah ditetapkan' : s.desc}</div>
            </div>
        </div>
    );
};

/* ─── Template chat per status ────────────────────────────────────────────── */
const formatDt = (d) => {
    if (!d) return '';
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(new Date(d));
};

const TEMPLATES = {
    wawancara: [
        {
            id: 'w1', label: 'Formal & Lengkap',
            desc: 'Undangan wawancara formal dengan detail jadwal dan lokasi',
            body: (jobTitle, companyName, iv) => {
                let t = `Dengan hormat,\n\nKami mengundang Saudara/i untuk mengikuti sesi wawancara sebagai bagian dari seleksi posisi *${jobTitle}* di *${companyName}*.`;
                if (iv?.scheduled_at) t += `\n\n📅 Jadwal: ${formatDt(iv.scheduled_at)}`;
                if (iv?.location) t += `\n📍 Lokasi: ${iv.location}`;
                if (iv?.duration) t += `\n⏱ Durasi: ${iv.duration} menit`;
                if (iv?.notes) t += `\n📝 Catatan: ${iv.notes}`;
                t += `\n\nHadirlah tepat waktu dan bawakan dokumen pendukung yang diperlukan. Konfirmasi kehadiran Anda dengan membalas pesan ini.\n\nTerima kasih.\n\nSalam hormat,\nTim Rekrutmen ${companyName}`;
                return t;
            },
        },
        {
            id: 'w2', label: 'Singkat & Padat',
            desc: 'Pemberitahuan wawancara singkat dan langsung ke inti',
            body: (jobTitle, companyName, iv) => {
                let t = `Halo,\n\nSelamat! Anda lolos ke tahap wawancara untuk posisi ${jobTitle}.\n\nBerikut detailnya:`;
                if (iv?.scheduled_at) t += `\n• Waktu: ${formatDt(iv.scheduled_at)}`;
                if (iv?.location) t += `\n• Tempat: ${iv.location}`;
                if (iv?.notes) t += `\n• Catatan: ${iv.notes}`;
                t += `\n\nSilakan persiapkan diri Anda. Kami tunggu konfirmasinya.\n\nTim Rekrutmen ${companyName}`;
                return t;
            },
        },
        {
            id: 'w3', label: 'Teknis & Persiapan',
            desc: 'Fokus pada persiapan teknis dan dokumen yang dibawa',
            body: (jobTitle, companyName, iv) => {
                let t = `Yth. Kandidat,\n\nAnda diundang untuk mengikuti wawancara teknis posisi *${jobTitle}* di *${companyName}*.`;
                if (iv?.scheduled_at) t += `\n\n🗓 Waktu: ${formatDt(iv.scheduled_at)}`;
                if (iv?.location) t += `\n🔗 ${iv.interview_mode === 'online' ? 'Link' : 'Lokasi'}: ${iv.location}`;
                t += `\n\nPersiapkan hal-hal berikut:\n1. Dokumen pendukung (CV, portofolio, ijazah)\n2. Koneksi internet stabil ${iv.interview_mode === 'online' ? 'dan perangkat yang memadai' : ''}\n3. Catatan pengalaman kerja relevan\n\nSemoga sukses!\n\nTim Rekrutmen ${companyName}`;
                return t;
            },
        },
    ],
    diterima: [
        {
            id: 'a1', label: 'Resmi & Profesional',
            desc: 'Surat penerimaan formal dengan langkah selanjutnya',
            body: (jobTitle, companyName) => {
                return `Dengan hormat,\n\nMelalui surat ini, dengan gembira kami mengumumkan bahwa Anda telah **DITERIMA** untuk bergabung sebagai ${jobTitle} di ${companyName}.\n\nKami akan menghubungi Anda dalam waktu dekat untuk memberikan informasi lebih lanjut mengenai:\n- Jadwal onboarding\n- Dokumen kelengkapan administrasi\n- Hari pertama masuk kerja\n\nSelamat bergabung dengan keluarga besar ${companyName}!\n\nSalam hangat,\nTim Rekrutmen ${companyName}`;
            },
        },
        {
            id: 'a2', label: 'Ramah & Hangat',
            desc: 'Pemberitahuan diterima dengan nuansa personal',
            body: (jobTitle, companyName) => {
                return `Halo,\n\nSelamattt! 🎉 Kami dengan senang hati menginformasikan bahwa Anda telah **DITERIMA** untuk posisi ${jobTitle} di ${companyName}.\n\nKami sangat antusias menyambut Anda sebagai bagian dari tim kami. Langkah selanjutnya akan kami informasikan melalui pesan terpisah.\n\nJika ada pertanyaan, jangan ragu untuk menghubungi kami.\n\nSampai jumpa!\n\nTim Rekrutmen ${companyName}`;
            },
        },
        {
            id: 'a3', label: 'Singkat & Jelas',
            desc: 'Pemberitahuan singkat dan langsung',
            body: (jobTitle, companyName) => {
                return `Halo,\n\nSelamat! Anda dinyatakan **DITERIMA** sebagai ${jobTitle} di ${companyName}.\n\nKami akan segera menghubungi Anda untuk informasi proses selanjutnya.\n\nTerima kasih telah melamar di perusahaan kami.\n\nTim Rekrutmen ${companyName}`;
            },
        },
    ],
    ditolak: [
        {
            id: 'r1', label: 'Santun & Profesional',
            desc: 'Penolakan formal yang sopan dan profesional',
            body: (jobTitle, companyName) => {
                return `Dengan hormat,\n\nTerima kasih telah meluangkan waktu untuk melamar posisi ${jobTitle} di ${companyName}.\n\nSetelah melalui proses seleksi yang ketat, dengan berat hati kami informasikan bahwa Anda belum memenuhi kualifikasi yang kami butuhkan pada tahap ini.\n\nKami menghargai ketertarikan Anda untuk bergabung dengan kami dan berharap dapat berkesempatan bekerja sama di lain waktu.\n\nTetap semangat dan jangan menyerah!\n\nSalam hormat,\nTim Rekrutmen ${companyName}`;
            },
        },
        {
            id: 'r2', label: 'Memotivasi',
            desc: 'Penolakan dengan semangat dan dorongan positif',
            body: (jobTitle, companyName) => {
                return `Halo,\n\nTerima kasih sudah berpartisipasi dalam seleksi posisi ${jobTitle} di ${companyName}.\n\nKeputusan yang kami ambil bukanlah refleksi dari kemampuan Anda. Kami yakin ada kesempatan lain yang lebih cocok menanti.\n\nTeruslah belajar dan berkembang. Suatu saat nanti, kami akan senang melihat lamaran Anda kembali.\n\nJangan menyerah! 💪\n\nTim Rekrutmen ${companyName}`;
            },
        },
        {
            id: 'r3', label: 'Singkat & Jelas',
            desc: 'Pemberitahuan penolakan singkat tanpa bertele-tele',
            body: (jobTitle, companyName) => {
                return `Halo,\n\nTerima kasih telah melamar untuk posisi ${jobTitle} di ${companyName}.\n\nSetelah proses seleksi, kami informasikan bahwa Anda belum lolos pada tahap ini.\n\nKami berharap Anda dapat mencoba kembali di kesempatan lain.\n\nSalam,\nTim Rekrutmen ${companyName}`;
            },
        },
    ],
};

/* ════════════════════════════════════════════════════════════════════════════
   HALAMAN UTAMA
════════════════════════════════════════════════════════════════════════════ */
export default function PelamarIndex({ applications, company }) {
    const [activeJobId, setActiveJobId] = useState(null);
    const [activeAppId, setActiveAppId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSkillFilter, setSelectedSkillFilter] = useState('');
    const [sortBy, setSortBy] = useState('match_score');
    const [mobilePanel, setMobilePanel] = useState('list');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTarget, setModalTarget] = useState(null);
    const [activeNoteTab, setActiveNoteTab] = useState('alumni'); // 'alumni' | 'internal'
    const [alumniNoteLen, setAlumniNoteLen] = useState(0);
    const [sameAsCompany, setSameAsCompany] = useState(false);
    const [freshCompany, setFreshCompany] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState('custom');

    const statusForm = useForm({
        status: '',
        notes: '',
        hr_notes: '',
        interview_details: { scheduled_at: '', location: '', latitude: null, longitude: null, duration: '60', notes: '', interview_mode: 'offline' },
    });

    const openStatusModal = (app) => {
        setModalTarget(app);
        setActiveNoteTab('alumni');
        setAlumniNoteLen((app.notes || '').length);
        setSelectedTemplate('custom');
        setSameAsCompany(false);
        setFreshCompany(null);
        const prev = app.interview_details || {};
        statusForm.setData({
            status: app.status || 'menunggu',
            notes: app.notes || '',
            hr_notes: app.hr_notes || '',
            interview_details: {
                scheduled_at: prev.scheduled_at || '',
                location: prev.location || '',
                latitude: prev.latitude ?? null,
                longitude: prev.longitude ?? null,
                duration: prev.duration || '60',
                notes: prev.notes || '',
                interview_mode: prev.interview_mode || 'offline',
            },
        });
        setModalOpen(true);
    };

    const submitStatus = (e) => {
        e.preventDefault();
        if (!modalTarget) return;
        statusForm.patch(route('perusahaan.pelamar.status', modalTarget.id), {
            preserveScroll: true,
            onSuccess: () => { setModalOpen(false); setModalTarget(null); },
        });
    };

    const handleInterviewLocationChange = (lat, lng) => {
        statusForm.setData('interview_details', { ...statusForm.data.interview_details, latitude: lat, longitude: lng });
    };

    const handleInterviewAddressResolve = (lat, lng, address) => {
        if (address) {
            statusForm.setData('interview_details', { ...statusForm.data.interview_details, latitude: lat, longitude: lng, location: address });
        }
    };

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

    const jobStats = job => {
        const total = job.applications.length;
        const diterima = job.applications.filter(a => a.status === 'diterima').length;
        const proses = job.applications.filter(a => a.status === 'wawancara').length;
        const avgScore = total ? Math.round(job.applications.reduce((s, a) => s + (a.match_score || 0), 0) / total) : 0;
        return { total, diterima, proses, avgScore };
    };

    /* auto-draft berdasarkan status */
    const getAutoDraft = (status) => {
        const jobTitle = modalTarget?.job_posting?.title || 'Posisi';
        const companyName = modalTarget?.job_posting?.company?.name || 'Perusahaan';
        const iv = statusForm.data.interview_details || {};

        switch (status) {
            case 'wawancara': {
                let draft = `Selamat! Anda lolos ke tahap wawancara untuk posisi ${jobTitle}.`;
                if (iv.scheduled_at) draft += `\n\nJadwal: ${formatDt(iv.scheduled_at)}`;
                if (iv.location) draft += `\nLokasi/Link: ${iv.location}`;
                if (iv.notes) draft += `\nCatatan: ${iv.notes}`;
                draft += `\n\nSilakan persiapkan diri Anda dengan baik.\n\nSalam hangat,\nTim Rekrutmen ${companyName}`;
                return draft;
            }
            case 'diterima':
                return `Selamat! Anda telah diterima untuk posisi ${jobTitle}.\n\nKami akan menghubungi Anda untuk informasi lebih lanjut mengenai proses onboarding.\n\nTerima kasih telah melamar di perusahaan kami.\n\nSalam hangat,\nTim Rekrutmen ${companyName}`;
            case 'ditolak':
                return `Terima kasih telah melamar untuk posisi ${jobTitle}.\n\nSetelah melalui proses seleksi, dengan berat hati kami informasikan bahwa Anda belum lolos kualifikasi pada tahap ini.\n\nKami berharap Anda dapat mencoba kembali di kesempatan lain.\n\nSalam hangat,\nTim Rekrutmen ${companyName}`;
            default:
                return modalTarget?.notes || '';
        }
    };

    const applyTemplate = (tpl) => {
        setSelectedTemplate(tpl.id);
        const jobTitle = modalTarget?.job_posting?.title || 'Posisi';
        const companyName = modalTarget?.job_posting?.company?.name || 'Perusahaan';
        const iv = statusForm.data.interview_details;
        const body = tpl.body(jobTitle, companyName, iv);
        statusForm.setData('notes', body);
        setAlumniNoteLen(body.length);
    };

    const handleStatusChange = (newStatus) => {
        statusForm.setData('status', newStatus);
        setSelectedTemplate('custom');
        const draft = getAutoDraft(newStatus);
        if (draft) {
            statusForm.setData('notes', draft);
            setAlumniNoteLen(draft.length);
        }
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
                @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }

                .ats-card { background:#fff; border-radius:14px; border:1px solid ${T.borderSoft}; box-shadow:0 1px 4px rgba(15,31,61,0.05); transition:box-shadow 0.2s,transform 0.2s; }
                .ats-card:hover { box-shadow:0 4px 16px rgba(15,31,61,0.10); transform:translateY(-2px); }

                .app-row { border-bottom:1px solid ${T.borderSoft}; cursor:pointer; transition:background 0.12s; padding:14px 18px; }
                .app-row:hover { background:${T.bgAlt}; }
                .app-row.active { background:#fff; border-left:3px solid ${T.orange}; padding-left:15px; }

                .panel-scroll::-webkit-scrollbar { width:5px; }
                .panel-scroll::-webkit-scrollbar-track { background:transparent; }
                .panel-scroll::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:4px; }

                .ats-two-panel { display:flex; gap:0; background:#fff; border:1px solid ${T.borderSoft}; border-radius:14px; min-height:80vh; overflow:hidden; }
                .ats-left  { width:340px; flex-shrink:0; border-right:1px solid ${T.borderSoft}; display:flex; flex-direction:column; background:${T.bg}; }
                .ats-right { flex:1; overflow-y:auto; }

                .mob-tabs  { display:none; }

                /* ── Modal note tabs ── */
                .modal-note-tabs { display:flex; border:1px solid ${T.border}; border-radius:8px; overflow:hidden; margin-bottom:10px; }
                .modal-note-tab  { flex:1; padding:8px 12px; font-size:12px; font-weight:700; border:none; background:transparent; cursor:pointer; color:${T.muted}; font-family:'Plus Jakarta Sans',sans-serif; transition:all 0.15s; display:flex; align-items:center; justify-content:center; gap:5px; }
                .modal-note-tab:first-child { border-right:1px solid ${T.border}; }
                .modal-note-tab.active { background:${T.bg}; color:${T.navy}; }

                /* ── Interview panel slide ── */
                .interview-panel-animated { animation: slideDown 0.2s ease both; }

                /* ── Modal overlay & elevation ── */
                [data-slot="dialog-overlay"] { background:rgba(15,31,61,0.45) !important; backdrop-filter:blur(2px); }
                [data-slot="dialog-content"] { box-shadow:0 16px 70px rgba(15,31,61,0.2) !important; }

                @media (max-width: 768px) {
                    .ats-left  { width:100%; border-right:none; }
                    .ats-right { width:100%; }
                    .ats-two-panel { flex-direction:column; }
                    .panel-list.hidden-mobile  { display:none; }
                    .panel-detail.hidden-mobile { display:none; }
                    .mob-tabs { display:flex; border-bottom:1px solid ${T.borderSoft}; background:#fff; }
                    .mob-tab  { flex:1; padding:12px; font-size:13px; font-weight:700; border:none; background:transparent; cursor:pointer; color:${T.muted}; transition:all 0.15s; }
                    .mob-tab.active { color:${T.orange}; border-bottom:2px solid ${T.orange}; }
                    .status-option-grid { grid-template-columns:1fr 1fr !important; }
                }

                @media (max-width: 640px) {
                    [data-slot="dialog-content"].sm\:max-w-lg { max-height:calc(100vh - 1rem) !important; border-radius:12px !important; }
                }

                @media (max-width: 480px) {
                    .ats-detail-inner { padding:20px 16px !important; }
                    .info-grid-3 { grid-template-columns:1fr 1fr !important; }
                    .score-grid  { grid-template-columns:1fr !important; }
                    .ats-card-grid { grid-template-columns:1fr !important; }
                    .status-option-grid { grid-template-columns:1fr !important; }
                    .modal-interview-two-col { grid-template-columns:1fr !important; }
                    .modal-body { padding:16px !important; }
                    .modal-footer { flex-direction:column !important; gap:8px !important; }
                    .modal-footer > div:first-child { display:none !important; }
                    .modal-footer > div:last-child { width:100% !important; justify-content:stretch !important; }
                    .modal-footer button { flex:1 !important; justify-content:center !important; }
                    .location-picker-wrap .leaflet-container { height:130px !important; }
                }

                @media (min-width: 481px) {
                    .location-picker-wrap .leaflet-container { height:180px !important; }
                }

                @media (min-width: 481px) and (max-width: 768px) {
                    .modal-body { padding:18px !important; }
                    .status-option-grid { grid-template-columns:1fr 1fr !important; }
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

                            <div className="mob-tabs">
                                <button className={`mob-tab ${mobilePanel === 'list' ? 'active' : ''}`} onClick={() => setMobilePanel('list')}>
                                    📋 Daftar ({filteredApps.length})
                                </button>
                                <button className={`mob-tab ${mobilePanel === 'detail' ? 'active' : ''}`} onClick={() => setMobilePanel('detail')}>
                                    👤 Detail
                                </button>
                            </div>

                            {/* ──────── PANEL KIRI ──────── */}
                            <div className={`ats-left panel-list ${mobilePanel !== 'list' ? 'hidden-mobile' : ''}`}>
                                <div style={{ padding: '16px', background: '#fff', borderBottom: `1px solid ${T.borderSoft}` }}>
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

                                <div style={{ padding: '10px 18px', fontSize: 11, fontWeight: 700, color: T.muted, background: T.bg, borderBottom: `1px solid ${T.borderSoft}` }}>
                                    {filteredApps.length} KANDIDAT DITEMUKAN
                                </div>

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
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <StatusBadge status={app.status} />
                                                                {app.source_type === 'invitation' && (
                                                                    <span style={{
                                                                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                                                                        background: T.navyLight, color: T.navyMid, border: `1px solid #bfdbfe`,
                                                                        whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4,
                                                                    }}>
                                                                        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.98V19.5z" /></svg>
                                                                        Diundang
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span style={{ fontSize: 10, color: T.muted }}>{formatDate(app.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ──────── PANEL KANAN ──────── */}
                            <div className={`ats-right panel-detail ${mobilePanel !== 'detail' ? 'hidden-mobile' : ''}`}>
                                {!activeApp ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: T.muted, textAlign: 'center', padding: 40, gap: 12 }}>
                                        <div style={{ fontSize: 52 }}>🤖</div>
                                        <p style={{ fontSize: 15, fontWeight: 700, color: T.mutedDark, margin: 0 }}>Pilih kandidat di panel kiri</p>
                                        <p style={{ fontSize: 13, color: T.muted, margin: 0, maxWidth: 260 }}>Algoritma ATS telah mengurutkan kandidat dari yang paling relevan.</p>
                                    </div>
                                ) : (
                                    <div className="ats-detail-inner" style={{ padding: '28px 32px', animation: 'slideIn 0.25s both' }}>

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
                                                <StatusBadge status={activeApp.status} size="lg" onClick={() => openStatusModal(activeApp)} />
                                                {activeApp.source_type === 'invitation' && (
                                                    <span style={{
                                                        fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                                                        background: T.navyLight, color: T.navyMid, border: `1px solid #bfdbfe`,
                                                        whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5,
                                                    }}>
                                                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.98V19.5z" /></svg>
                                                        Diundang Perusahaan
                                                    </span>
                                                )}
                                                {activeApp.cv_path ? (
                                                    <a href={route('private-file', activeApp.cv_path)} target="_blank" rel="noreferrer"
                                                        style={{ fontSize: 12, fontWeight: 700, color: T.orange, textDecoration: 'none', background: T.orangeLight, padding: '6px 12px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 5, border: `1px solid ${T.orangeBorder}` }}>
                                                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                                        Lihat CV
                                                    </a>
                                                ) : <span style={{ fontSize: 11, color: T.muted, fontStyle: 'italic' }}>Tidak ada CV</span>}
                                            </div>
                                        </div>

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

                                        {activeApp.score_details && (
                                            <div style={{ background: '#fff', border: `1px solid ${T.borderSoft}`, borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
                                                <div style={{ fontSize: 11, fontWeight: 800, color: T.navyMid, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
                                                    Rincian Bobot Skor
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                    <ScoreBar label="Keahlian" weight={`Bobot ${activeJob.weight_skill ?? 40}%`} scoreStr={`${activeApp.score_details.skill_match}%`} />
                                                    <ScoreBar label="Pendidikan" weight={`Bobot ${activeJob.weight_education ?? 25}%`} scoreStr={`${activeApp.score_details.education}%`} />
                                                    <ScoreBar label="Pengalaman" weight={`Bobot ${activeJob.weight_experience ?? 20}%`} scoreStr={`${activeApp.score_details.experience}%`} />
                                                    <ScoreBar label="Usia" weight={`Bobot ${activeJob.weight_age ?? 15}%`} scoreStr={`${activeApp.score_details.age}%`} />
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                                            <div style={{ background: T.orangeLight, border: `1px solid ${T.orangeBorder}`, borderRadius: 12, padding: '16px 18px' }}>
                                                <div style={{ fontSize: 11, fontWeight: 800, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Syarat Posisi</div>
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
                                            <div style={{ background: T.navyLight, border: `1px solid #bfdbfe`, borderRadius: 12, padding: '16px 18px' }}>
                                                <div style={{ fontSize: 11, fontWeight: 800, color: T.navyMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Keahlian Kandidat</div>
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

                                        <div style={{ fontSize: 11, fontWeight: 800, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                                            Tindakan
                                        </div>
                                        <button onClick={() => openStatusModal(activeApp)}
                                            style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 20px', borderRadius: 9, border: 'none', background: T.orange, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', boxShadow: '0 2px 10px rgba(249,115,22,0.3)' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = T.orange; e.currentTarget.style.transform = 'none'; }}
                                        >
                                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                            Update Status &amp; Kirim Notifikasi
                                        </button>

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════════
                MODAL — Update Status Lamaran (REDESIGN)
            ══════════════════════════════════════════════════════════ */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-lg" style={{ background: '#fff', padding: 0, overflowY: 'auto', borderRadius: 16, border: `1px solid ${T.border}`, maxHeight: 'min(90vh, 700px)' }}>
                    <form onSubmit={submitStatus}>

                        {/* ── Header ── */}
                        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.borderSoft}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                            <Avatar
                                name={modalTarget?.alumni?.user?.name}
                                size={40}
                                index={filteredApps.findIndex(a => a.id === modalTarget?.id)}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 800, color: T.navy, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    Update Status Lamaran
                                </div>
                                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                                    {modalTarget?.alumni?.user?.name || '—'} &middot; {modalTarget?.job_posting?.title || '—'}
                                </div>
                            </div>
                            {/* current status badge */}
                            <StatusBadge status={statusForm.data.status} size="sm" />
                        </div>

                        {/* ── Body ── */}
                        <div className="modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

                            {/* Status grid cards */}
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.mutedDark, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                                    Status Lamaran
                                </label>
                                <div className="status-option-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                                    {Object.keys(STATUS).map(val => (
                                        <StatusOptionCard
                                            key={val}
                                            value={val}
                                            current={statusForm.data.status}
                                            onClick={handleStatusChange}
                                            locked={modalTarget?.status === 'diterima' || modalTarget?.status === 'ditolak' || (val !== 'menunggu' && val === modalTarget?.status)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Template picker — hanya untuk status non-menunggu */}
                            {statusForm.data.status !== 'menunggu' && TEMPLATES[statusForm.data.status] && (
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.mutedDark, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                                        Template Pesan ke Alumni
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                                        {TEMPLATES[statusForm.data.status].map(tpl => (
                                            <div
                                                key={tpl.id}
                                                onClick={() => applyTemplate(tpl)}
                                                style={{
                                                    border: `${selectedTemplate === tpl.id ? '2px' : '1px'} solid ${selectedTemplate === tpl.id ? T.orange : T.border}`,
                                                    borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
                                                    background: selectedTemplate === tpl.id ? T.orangeLight : '#fff',
                                                    transition: 'all 0.15s',
                                                }}
                                                onMouseEnter={e => { if (selectedTemplate !== tpl.id) e.currentTarget.style.borderColor = T.muted; }}
                                                onMouseLeave={e => { if (selectedTemplate !== tpl.id) e.currentTarget.style.borderColor = T.border; }}
                                            >
                                                <div style={{ fontSize: 12, fontWeight: 700, color: selectedTemplate === tpl.id ? T.orange : T.navy }}>{tpl.label}</div>
                                                <div style={{ fontSize: 10, color: T.muted, marginTop: 2, lineHeight: 1.3 }}>{tpl.desc}</div>
                                            </div>
                                        ))}
                                        <div
                                            onClick={() => {
                                                setSelectedTemplate('custom');
                                                statusForm.setData('notes', '');
                                                setAlumniNoteLen(0);
                                            }}
                                            style={{
                                                border: `${selectedTemplate === 'custom' ? '2px' : '1px'} solid ${selectedTemplate === 'custom' ? T.orange : T.border}`,
                                                borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
                                                background: selectedTemplate === 'custom' ? T.orangeLight : '#fff',
                                                transition: 'all 0.15s',
                                                display: 'flex', alignItems: 'center', gap: 8,
                                            }}
                                            onMouseEnter={e => { if (selectedTemplate !== 'custom') e.currentTarget.style.borderColor = T.muted; }}
                                            onMouseLeave={e => { if (selectedTemplate !== 'custom') e.currentTarget.style.borderColor = T.border; }}
                                        >
                                            <span style={{ fontSize: 16 }}>✏️</span>
                                            <div>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: selectedTemplate === 'custom' ? T.orange : T.navy }}>Custom</div>
                                                <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>Tulis pesan sendiri</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Interview panel — hanya muncul saat wawancara */}
                            {statusForm.data.status === 'wawancara' && (() => {
                                const mode = statusForm.data.interview_details.interview_mode || 'offline';
                                return (
                                    <div className="interview-panel-animated" style={{ background: T.purpleLight, border: `1px solid ${T.purpleBorder}`, borderRadius: 12, padding: '16px 18px' }}>
                                        <div style={{ fontSize: 11, fontWeight: 800, color: T.purple, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                                            Detail Panggilan Wawancara
                                        </div>

                                        {/* Mode toggle */}
                                        <div style={{ display: 'flex', border: `1px solid ${T.purpleBorder}`, borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
                                            {['offline', 'online'].map(m => (
                                                <button key={m} type="button"
                                                    onClick={() => {
                                                        const isOnline = m === 'online';
                                                        statusForm.setData('interview_details', {
                                                            ...statusForm.data.interview_details,
                                                            interview_mode: m,
                                                            location: isOnline ? '' : statusForm.data.interview_details.location,
                                                            latitude: isOnline ? null : statusForm.data.interview_details.latitude,
                                                            longitude: isOnline ? null : statusForm.data.interview_details.longitude,
                                                        });
                                                        if (isOnline) setSameAsCompany(false);
                                                    }}
                                                    style={{
                                                        flex: 1, padding: '9px 12px', fontSize: 12, fontWeight: 700,
                                                        border: 'none', cursor: 'pointer',
                                                        background: mode === m ? T.purple : 'transparent',
                                                        color: mode === m ? '#fff' : T.purple,
                                                        fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                        transition: 'all 0.15s',
                                                    }}>
                                                    {m === 'offline' ? (
                                                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                                    ) : (
                                                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" /></svg>
                                                    )}
                                                    {m === 'offline' ? 'Offline (Temu Langsung)' : 'Online (Video Call)'}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="modal-interview-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7 }}>Jadwal</label>
                                                <input
                                                    type="datetime-local"
                                                    style={{ ...fieldBase }}
                                                    value={statusForm.data.interview_details.scheduled_at || ''}
                                                    onChange={e => statusForm.setData('interview_details', { ...statusForm.data.interview_details, scheduled_at: e.target.value })}
                                                    onFocus={onFocus} onBlur={onBlur}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7 }}>Durasi</label>
                                                <select
                                                    style={{ ...fieldBase, cursor: 'pointer' }}
                                                    value={statusForm.data.interview_details.duration || '60'}
                                                    onChange={e => statusForm.setData('interview_details', { ...statusForm.data.interview_details, duration: e.target.value })}
                                                    onFocus={onFocus} onBlur={onBlur}
                                                >
                                                    <option value="30">30 menit</option>
                                                    <option value="60">60 menit</option>
                                                    <option value="90">90 menit</option>
                                                    <option value="120">120 menit</option>
                                                </select>
                                            </div>
                                        </div>

                                        {mode === 'offline' && company && (
                                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12, fontWeight: 600, color: T.mutedDark, cursor: 'pointer', marginBottom: 10, padding: '10px 12px', borderRadius: 8, background: '#fff', border: `1px solid ${T.borderSoft}`, userSelect: 'none', transition: 'border-color 0.15s', borderColor: sameAsCompany ? T.purple : T.borderSoft }}>
                                                <input type="checkbox" checked={sameAsCompany}
                                                    onChange={async e => {
                                                        const checked = e.target.checked;
                                                        setSameAsCompany(checked);
                                                        if (checked) {
                                                            try {
                                                                const res = await fetch(route('perusahaan.profile.company-address'));
                                                                if (!res.ok) throw new Error('Gagal memuat data');
                                                                const data = await res.json();
                                                                setFreshCompany(data);
                                                                statusForm.setData('interview_details', {
                                                                    ...statusForm.data.interview_details,
                                                                    location: data.address || '',
                                                                    latitude: data.latitude ? parseFloat(data.latitude) : null,
                                                                    longitude: data.longitude ? parseFloat(data.longitude) : null,
                                                                });
                                                            } catch {
                                                                const loc = company.address || '';
                                                                statusForm.setData('interview_details', {
                                                                    ...statusForm.data.interview_details,
                                                                    location: loc,
                                                                    latitude: company.latitude ? parseFloat(company.latitude) : null,
                                                                    longitude: company.longitude ? parseFloat(company.longitude) : null,
                                                                });
                                                            }
                                                        }
                                                    }}
                                                    style={{ marginTop: 2, width: 15, height: 15, accentColor: T.purple, cursor: 'pointer', flexShrink: 0 }}
                                                />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                                        <span>Samakan dengan alamat kantor</span>
                                                    </div>
                                                    <div style={{ fontSize: 11, fontWeight: 500, color: T.muted, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {(freshCompany ? freshCompany.address : company.address) || '—'}
                                                    </div>
                                                </div>
                                            </label>
                                        )}

                                        <div>
                                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7 }}>
                                                {mode === 'offline' ? 'Lokasi' : 'Link Meeting'}
                                            </label>
                                            <textarea
                                                rows={2}
                                                style={{ ...fieldBase, resize: 'vertical', minHeight: 56 }}
                                                placeholder={mode === 'offline' ? 'Letakkan lokasi, misal kantor' : 'Letakkan link video call, misal Zoom/Google Meet/Teams'}
                                                value={statusForm.data.interview_details.location || ''}
                                                onChange={e => {
                                                    setSameAsCompany(false);
                                                    statusForm.setData('interview_details', {
                                                        ...statusForm.data.interview_details,
                                                        location: e.target.value,
                                                        ...(mode === 'offline' ? {} : { latitude: null, longitude: null }),
                                                    });
                                                }}
                                                onFocus={onFocus} onBlur={onBlur}
                                            />
                                        </div>

                                        {mode === 'offline' && (
                                            <div style={{ marginTop: 12 }}>
                                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7 }}>Pilih Lokasi di Peta</label>
                                                <div className="location-picker-wrap">
                                                    <Suspense fallback={<div style={{ height: 200, borderRadius: 9, background: '#f0f4f9' }} />}>
                                                        <LocationPicker
                                                            latitude={statusForm.data.interview_details.latitude}
                                                            longitude={statusForm.data.interview_details.longitude}
                                                            onLocationChange={(lat, lng) => {
                                                                setSameAsCompany(false);
                                                                handleInterviewLocationChange(lat, lng);
                                                            }}
                                                            onAddressResolve={handleInterviewAddressResolve}
                                                            height={180}
                                                        />
                                                    </Suspense>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Catatan — tab alumni / internal */}
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.mutedDark, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                                    Catatan
                                </label>
                                <div className="modal-note-tabs">
                                    <button
                                        type="button"
                                        className={`modal-note-tab ${activeNoteTab === 'alumni' ? 'active' : ''}`}
                                        onClick={() => setActiveNoteTab('alumni')}
                                    >
                                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                                        Pesan ke Alumni
                                    </button>
                                    <button
                                        type="button"
                                        className={`modal-note-tab ${activeNoteTab === 'internal' ? 'active' : ''}`}
                                        onClick={() => setActiveNoteTab('internal')}
                                    >
                                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                                        Catatan Internal
                                    </button>
                                </div>

                                {activeNoteTab === 'alumni' && (
                                    <div>
                                        <textarea
                                            style={{ ...fieldBase, height: 'auto', padding: '10px 13px', resize: 'vertical', fontSize: 13, lineHeight: 1.5 }}
                                            rows={3}
                                            placeholder="Pesan untuk alumni (akan dikirim ke ruang chat)..."
                                            value={statusForm.data.notes}
                                            onChange={e => {
                                                statusForm.setData('notes', e.target.value);
                                                setAlumniNoteLen(e.target.value.length);
                                            }}
                                            onFocus={onFocus} onBlur={onBlur}
                                            maxLength={500}
                                        />
                                        <div style={{ textAlign: 'right', fontSize: 11, color: T.muted, marginTop: 4 }}>
                                            {alumniNoteLen} / 500
                                        </div>
                                    </div>
                                )}

                                {activeNoteTab === 'internal' && (
                                    <textarea
                                        style={{ ...fieldBase, height: 'auto', padding: '10px 13px', resize: 'vertical', fontSize: 13, lineHeight: 1.5 }}
                                        rows={3}
                                        placeholder="Hasil review, kesimpulan tim HR, dll. — hanya terlihat di panel ini, tidak dikirim ke alumni."
                                        value={statusForm.data.hr_notes}
                                        onChange={e => statusForm.setData('hr_notes', e.target.value)}
                                        onFocus={onFocus} onBlur={onBlur}
                                    />
                                )}
                            </div>
                        </div>

                        {/* ── Footer ── */}
                        <div className="modal-footer" style={{ padding: '14px 24px', borderTop: `1px solid ${T.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: T.bg }}>
                            {/* hint notifikasi */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.muted }}>
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                                Email notifikasi dikirim otomatis
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    style={{ height: 40, padding: '0 18px', borderRadius: 9, border: `1.5px solid ${T.border}`, background: '#fff', color: T.mutedDark, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.mutedDark; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={statusForm.processing}
                                    style={{ height: 40, padding: '0 20px', borderRadius: 9, border: 'none', background: statusForm.processing ? T.muted : T.orange, color: '#fff', fontSize: 13, fontWeight: 700, cursor: statusForm.processing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, boxShadow: statusForm.processing ? 'none' : '0 2px 10px rgba(249,115,22,0.3)', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { if (!statusForm.processing) { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                                    onMouseLeave={e => { e.currentTarget.style.background = statusForm.processing ? T.muted : T.orange; e.currentTarget.style.transform = 'none'; }}
                                >
                                    {statusForm.processing ? (
                                        <>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}><path strokeLinecap="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Simpan &amp; Kirim Notifikasi
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                    </form>
                </DialogContent>
            </Dialog>

        </AuthenticatedLayout>
    );
}
