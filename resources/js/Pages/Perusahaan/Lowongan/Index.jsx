import React, { useState, useRef, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import axios from 'axios';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626', redLight: '#fff1f2',
};

/* ─── Custom Switch ──────────────────────────────────────────────────────── */
function CustomSwitch({ checked, onChange, disabled = false }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={disabled ? undefined : onChange}
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                width: 48,
                height: 26,
                borderRadius: 999,
                border: 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                padding: 3,
                transition: 'background 0.22s cubic-bezier(0.22,1,0.36,1)',
                background: disabled ? '#e2e8f0' : checked ? T.green : '#cbd5e1',
                boxShadow: (!disabled && checked)
                    ? '0 0 0 3px rgba(22,163,74,0.15), inset 0 1px 2px rgba(0,0,0,0.08)'
                    : 'inset 0 1px 2px rgba(0,0,0,0.08)',
                flexShrink: 0,
                outline: 'none',
                opacity: disabled ? 0.55 : 1,
            }}
        >
            <span style={{
                display: 'block',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                transform: checked ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform 0.22s cubic-bezier(0.22,1,0.36,1)',
            }} />
        </button>
    );
}

/* ─── Modal ──────────────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children, footer, wide = false }) {
    const [visible, setVisible] = React.useState(false);
    const [render, setRender] = React.useState(false);
    React.useEffect(() => {
        if (open) { setRender(true); requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); }
        else { setVisible(false); const t = setTimeout(() => setRender(false), 260); return () => clearTimeout(t); }
    }, [open]);
    if (!render) return null;
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease',
        }}>
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)', cursor: 'default' }} />
            <div style={{
                background: '#fff', borderRadius: 16, position: 'relative',
                width: '100%', maxWidth: wide ? 680 : 520,
                boxShadow: '0 24px 60px rgba(10,20,40,0.2)',
                display: 'flex', flexDirection: 'column', maxHeight: '90vh',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
                transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1)',
            }}>
                <div style={{ padding: '20px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.borderSoft}`, flexShrink: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: T.navy }}>{title}</span>
                    <button type="button" onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: T.bg, color: T.mutedDark, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.background = T.border}
                        onMouseLeave={e => e.currentTarget.style.background = T.bg}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1 }}>{children}</div>
                {footer && <>
                    <div style={{ height: 1, background: T.borderSoft, flexShrink: 0 }} />
                    <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>{footer}</div>
                </>}
            </div>
        </div>
    );
}

/* ─── Alert Dialog — konsisten dengan desain proyek ─────────────────────── */
function AlertDialog({ open, onClose, onConfirm, title, message, processing }) {
    const [visible, setVisible] = useState(false);
    const [render, setRender] = useState(false);

    useEffect(() => {
        if (open) { setRender(true); requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); }
        else { setVisible(false); const t = setTimeout(() => setRender(false), 260); return () => clearTimeout(t); }
    }, [open]);

    if (!render) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease',
        }}>
            <div onClick={!processing ? onClose : undefined} style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)', cursor: 'default' }} />
            <div style={{
                background: '#fff', borderRadius: 16,
                position: 'relative', width: '100%', maxWidth: 420,
                boxShadow: '0 24px 60px rgba(10,20,40,0.2)',
                display: 'flex', flexDirection: 'column',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
                transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1)',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.borderSoft}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: T.redLight, color: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 800, color: T.navy }}>{title}</span>
                    </div>
                    <button
                        onClick={!processing ? onClose : undefined}
                        disabled={processing}
                        style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: T.bg, color: T.mutedDark, cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', opacity: processing ? 0.4 : 1 }}
                        onMouseEnter={e => { if (!processing) e.currentTarget.style.background = T.border; }}
                        onMouseLeave={e => e.currentTarget.style.background = T.bg}
                    >
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {/* Body */}
                <div style={{ padding: '16px 22px 20px' }}>
                    <p style={{ fontSize: 13, color: T.mutedDark, lineHeight: 1.65, margin: 0 }}>{message}</p>
                </div>
                {/* Footer */}
                <div style={{ height: 1, background: T.borderSoft, flexShrink: 0 }} />
                <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <button
                        onClick={onClose} disabled={processing}
                        style={{ height: 36, padding: '0 16px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: 'transparent', color: T.mutedDark, fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', opacity: processing ? 0.5 : 1 }}
                        onMouseEnter={e => { if (!processing) e.currentTarget.style.background = T.bg; }}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >Batal</button>
                    <button
                        onClick={onConfirm} disabled={processing}
                        style={{ height: 36, padding: '0 18px', borderRadius: 8, border: 'none', background: processing ? T.muted : T.red, color: '#fff', fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', boxShadow: processing ? 'none' : '0 2px 8px rgba(220,38,38,0.25)', display: 'flex', alignItems: 'center', gap: 6 }}
                        onMouseEnter={e => { if (!processing) e.currentTarget.style.filter = 'brightness(0.9)'; }}
                        onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                    >
                        {processing ? (
                            <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                                    <path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                </svg>
                                Menghapus...
                            </>
                        ) : (
                            <>
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Ya, Hapus
                            </>
                        )}
                    </button>
                </div>
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

const FieldLabel = ({ children, required }) => (
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 5 }}>
        {children}{required && <span style={{ color: T.red, marginLeft: 3 }}>*</span>}
    </label>
);

export default function LowonganIndex({ jobs, isVerified, verificationStatus, keahlianMaster = [] }) {
    const { flash } = usePage().props;
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [q, setQ] = useState('');

    // Alert state
    const [alertOpen, setAlertOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [masterSkills, setMasterSkills] = useState(keahlianMaster);
    const [searchSkill, setSearchSkill] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchRef = useRef(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        title: '', location: '', salary_range: '', description: '', requirements: [],
        min_education: '', min_experience: '', max_age: '', work_model: '' // <--- Update state
    });
    const filtered = jobs.filter(j =>
        j.title.toLowerCase().includes(q.toLowerCase()) ||
        (j.location && j.location.toLowerCase().includes(q.toLowerCase()))
    );

    const openCreate = () => {
        reset(); clearErrors();
        setData('requirements', []);
        setIsEditing(false);
        setModalOpen(true);
    };

    const openEdit = job => {
        reset(); clearErrors(); setSelectedJob(job);
        setData({
            title: job.title,
            location: job.location || '',
            salary_range: job.salary_range || '',
            description: job.description,
            requirements: Array.isArray(job.requirements) ? job.requirements : (job.requirements ? [job.requirements] : []),
            min_education: job.min_education || '',
            min_experience: job.min_experience || '',
            max_age: job.max_age || '',
            work_model: job.work_model || '' // <--- Binding data dari database
        });
        setIsEditing(true); setModalOpen(true);
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (isEditing) put(route('perusahaan.lowongan.update', selectedJob.id), { onSuccess: () => setModalOpen(false) });
        else post(route('perusahaan.lowongan.store'), { onSuccess: () => setModalOpen(false) });
    };

    const confirmDelete = (id) => { setIdToDelete(id); setAlertOpen(true); };

    const executeDelete = () => {
        setIsDeleting(true);
        router.delete(route('perusahaan.lowongan.destroy', idToDelete), {
            preserveScroll: true,
            onSuccess: () => { setAlertOpen(false); setIdToDelete(null); },
            onFinish: () => setIsDeleting(false),
        });
    };

    const toggleActive = id => {
        if (!isVerified) return;
        router.patch(route('perusahaan.lowongan.toggle', id), {}, { preserveScroll: true });
    };

    const availableSkills = masterSkills.filter(s =>
        s.name.toLowerCase().includes(searchSkill.toLowerCase())
    );

    const addSkill = (skillName) => {
        if (!data.requirements.includes(skillName)) {
            setData('requirements', [...data.requirements, skillName]);
        }
        setSearchSkill('');
        setIsDropdownOpen(false);
    };

    const removeSkill = (skillName) => {
        setData('requirements', data.requirements.filter(s => s !== skillName));
    };

    const createNewSkill = async () => {
        if (!searchSkill.trim()) return;
        try {
            const res = await axios.post(route('master-data.keahlian.quick-add'), { name: searchSkill.trim() });
            setMasterSkills([...masterSkills, res.data]);
            addSkill(res.data.name);
        } catch (error) {
            console.error("Gagal menambah keahlian baru", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const activeCount = jobs.filter(j => j.is_active).length;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Kelola Lowongan Kerja</h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Posting dan kelola posisi pekerjaan perusahaan Anda</p>
                </div>
            }
        >
            <Head title="Lowongan Kerja — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .ak-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes rowIn  { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
                @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                .tbl-row:hover td { background:#fafbfc; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            `}</style>

            <div className="ak-root">
                {(flash?.message || flash?.error) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, marginBottom: 16, background: flash.error ? T.redLight : T.greenLight, border: `1px solid ${flash.error ? '#fecaca' : '#bbf7d0'}` }}>
                        <div style={{ fontSize: 16 }}>{flash.error ? '⚠️' : '✅'}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: flash.error ? T.red : T.green }}>{flash.message || flash.error}</div>
                    </div>
                )}

                {!isVerified && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, marginBottom: 20, background: verificationStatus === 'rejected' ? T.redLight : T.orangeLight, border: `1px solid ${verificationStatus === 'rejected' ? '#fecaca' : '#fed7aa'}` }}>
                        <div style={{ fontSize: 24 }}>{verificationStatus === 'rejected' ? '❌' : '⏳'}</div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: verificationStatus === 'rejected' ? T.red : '#92400e' }}>
                                {verificationStatus === 'rejected' ? 'Izin Posting Ditolak/Dicabut' : 'Menunggu Verifikasi Admin Kampus'}
                            </div>
                            <div style={{ fontSize: 12.5, color: verificationStatus === 'rejected' ? T.red : '#b45309', marginTop: 2 }}>
                                {verificationStatus === 'rejected'
                                    ? 'Admin Kampus mencabut izin akses Anda. Semua lowongan Anda dinonaktifkan dari bursa kerja alumni.'
                                    : 'Anda belum bisa memposting lowongan kerja sebelum Admin Kampus menyetujui profil dan legalitas perusahaan Anda.'}
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20, animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, background: T.navyLight, border: `1px solid ${T.navyMid}22` }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: T.navyMid }}>{jobs.length} Total</span>
                            </div>
                            {activeCount > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, background: T.greenLight, border: `1px solid ${T.green}22` }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: T.green }}>{activeCount} Aktif</span>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#b0bec5' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                                </svg>
                                <input style={{ ...fieldBase, paddingLeft: 33, width: 220 }} placeholder="Cari posisi atau lokasi..."
                                    value={q} onChange={e => setQ(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                            </div>
                            <button
                                onClick={() => isVerified && openCreate()}
                                disabled={!isVerified}
                                style={{
                                    height: 42, padding: '0 16px', borderRadius: 9, border: 'none',
                                    background: isVerified ? T.orange : T.muted, color: '#fff', fontSize: 13, fontWeight: 700,
                                    cursor: isVerified ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.15s',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    boxShadow: isVerified ? '0 2px 10px rgba(249,115,22,0.28)' : 'none', whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={e => { if (isVerified) { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                                onMouseLeave={e => { if (isVerified) { e.currentTarget.style.background = T.orange; e.currentTarget.style.transform = 'none'; } }}
                            >
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                Posting Lowongan
                            </button>
                        </div>
                    </div>

                    <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.borderSoft}` }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                                    {['Posisi & Lokasi', 'Rentang Gaji', 'Status', 'Aksi'].map((h, i) => (
                                        <th key={i} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((job, i) => (
                                    <tr key={job.id} className="tbl-row" style={{ borderBottom: `1px solid ${T.borderSoft}`, animation: `rowIn 0.26s ${i * 0.04}s both` }}>
                                        <td style={{ padding: '13px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: 8, background: T.navyLight, color: T.navyMid, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {job.title.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: T.navy }}>{job.title}</div>
                                                    <div style={{ fontSize: 11.5, color: T.muted }}>{job.location || '—'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '13px 14px', fontSize: 13, color: T.mutedDark }}>{job.salary_range || '—'}</td>
                                        <td style={{ padding: '13px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <CustomSwitch
                                                    checked={job.is_active}
                                                    onChange={() => toggleActive(job.id)}
                                                    disabled={!isVerified}
                                                />
                                                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: job.is_active ? T.greenLight : T.borderSoft, color: job.is_active ? T.green : T.mutedDark }}>
                                                    {job.is_active ? 'Dibuka' : 'Ditutup'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                                                <button
                                                    onClick={() => isVerified && openEdit(job)}
                                                    disabled={!isVerified}
                                                    style={{
                                                        height: 30, padding: '0 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                                                        cursor: isVerified ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.14s',
                                                        border: `1.5px solid ${isVerified ? T.border : 'transparent'}`,
                                                        background: isVerified ? T.bg : T.borderSoft,
                                                        color: isVerified ? T.navyMid : T.muted,
                                                    }}
                                                    onMouseEnter={e => { if (isVerified) { e.currentTarget.style.borderColor = T.navyMid; e.currentTarget.style.background = T.navyLight; } }}
                                                    onMouseLeave={e => { if (isVerified) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.bg; } }}
                                                >Edit</button>
                                                <button
                                                    onClick={() => confirmDelete(job.id)}
                                                    style={{
                                                        height: 30, padding: '0 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                                                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.14s',
                                                        border: `1.5px solid #fecaca`, background: T.redLight, color: T.red,
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                                    onMouseLeave={e => e.currentTarget.style.background = T.redLight}
                                                >Hapus</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={4} style={{ padding: '48px 16px', textAlign: 'center', fontSize: 13, color: T.muted }}>
                                        {q ? 'Tidak ada lowongan yang cocok dengan pencarian.' : 'Belum ada lowongan yang diposting.'}
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Alert Dialog — konsisten dengan desain proyek */}
            <AlertDialog
                open={alertOpen}
                onClose={() => !isDeleting && setAlertOpen(false)}
                onConfirm={executeDelete}
                processing={isDeleting}
                title="Hapus Lowongan?"
                message="Tindakan ini tidak dapat dibatalkan. Lowongan ini beserta semua data lamaran terkait akan dihapus secara permanen dari sistem."
            />

            {/* Form Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}
                title={isEditing ? 'Edit Lowongan' : 'Posting Lowongan Baru'}
                wide
                footer={<>
                    <BtnGhost onClick={() => setModalOpen(false)}>Batal</BtnGhost>
                    <button type="submit" form="lowongan-form" disabled={processing} style={{
                        height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
                        background: processing ? T.muted : T.orange, color: '#fff',
                        fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', boxShadow: processing ? 'none' : '0 2px 8px rgba(249,115,22,0.3)',
                        transition: 'all 0.15s',
                    }}>
                        {processing ? 'Menyimpan...' : 'Simpan Lowongan'}
                    </button>
                </>}
            >
                <form id="lowongan-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ padding: '14px 16px', borderRadius: 10, background: T.bg, border: `1px solid ${T.borderSoft}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <FieldLabel required>Posisi Pekerjaan</FieldLabel>
                            <input style={fieldBase} value={data.title} onChange={e => setData('title', e.target.value)}
                                placeholder="Contoh: Frontend Developer" onFocus={onFocus} onBlur={onBlur} required />
                            <InputError message={errors.title} className="mt-1" />
                        </div>
                        <div>
                            <FieldLabel>Rentang Gaji</FieldLabel>
                            <input style={fieldBase} value={data.salary_range} onChange={e => setData('salary_range', e.target.value)}
                                placeholder="Rp 5.000.000 – Rp 7.000.000" onFocus={onFocus} onBlur={onBlur} />
                        </div>
                    </div>

                    <div>
                        <FieldLabel>Lokasi Penempatan</FieldLabel>
                        <input style={fieldBase} value={data.location} onChange={e => setData('location', e.target.value)}
                            placeholder="Contoh: Bandung, Jawa Barat (WFO/Remote)" onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    {/* Tambahkan blok ini di bawah input "Lokasi Penempatan" atau "Deskripsi Pekerjaan" */}
                    <div style={{ padding: '14px 16px', borderRadius: 10, background: T.navyLight, border: `1px solid ${T.navyMid}40`, marginBottom: 14 }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: 13, fontWeight: 800, color: T.navy }}>Kriteria Khusus (Untuk Sistem Skor ATS)</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

                            {/* Pendidikan */}
                            <div>
                                <FieldLabel>Minimal Pendidikan</FieldLabel>
                                <select style={fieldBase} value={data.min_education} onChange={e => setData('min_education', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                                    <option value="">Pilih Pendidikan...</option>
                                    <option value="SMA/SMK">SMA / SMK Sederajat</option>
                                    <option value="D3">Diploma 3 (D3)</option>
                                    <option value="D4/S1">Sarjana (D4 / S1)</option>
                                    <option value="S2">Magister (S2)</option>
                                </select>
                            </div>

                            {/* Pengalaman */}
                            <div>
                                <FieldLabel>Minimal Pengalaman (Tahun)</FieldLabel>
                                <input type="number" min="0" style={fieldBase} value={data.min_experience} onChange={e => setData('min_experience', e.target.value)}
                                    placeholder="Contoh: 1 (Kosongkan jika Fresh Graduate)" onFocus={onFocus} onBlur={onBlur} />
                            </div>

                            {/* Usia */}
                            <div>
                                <FieldLabel>Batas Usia Maksimal</FieldLabel>
                                <input type="number" min="15" style={fieldBase} value={data.max_age} onChange={e => setData('max_age', e.target.value)}
                                    placeholder="Contoh: 30" onFocus={onFocus} onBlur={onBlur} />
                            </div>

                            <div>
                                <FieldLabel>Sistem Kerja</FieldLabel>
                                <select style={fieldBase} value={data.work_model} onChange={e => setData('work_model', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                                    <option value="">Pilih Sistem...</option>
                                    <option value="WFO">WFO (Work From Office)</option>
                                    <option value="WFH">WFH (Work From Home)</option>
                                    <option value="Hybrid">Hybrid (Kombinasi)</option>
                                    <option value="WFA">WFA (Work From Anywhere)</option>
                                </select>
                            </div>

                        </div>
                    </div>

                    <div>
                        <FieldLabel required>Deskripsi Pekerjaan</FieldLabel>
                        <textarea style={{ ...fieldBase, height: 'auto', padding: '10px 13px', resize: 'vertical' }} rows={4}
                            value={data.description} onChange={e => setData('description', e.target.value)}
                            placeholder="Tanggung jawab utama posisi ini..." onFocus={onFocus} onBlur={onBlur} required />
                        <InputError message={errors.description} className="mt-1" />
                    </div>

                    <div>
                        <FieldLabel>Cari atau Tambah Keahlian yang Dibutuhkan</FieldLabel>
                        <div style={{ position: 'relative' }} ref={searchRef}>
                            <div style={{ position: 'relative' }}>
                                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#b0bec5' }} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                                </svg>
                                <input
                                    style={{ ...fieldBase, paddingLeft: 36 }}
                                    placeholder="Ketik keahlian (Misal: PHP, MySQL...)"
                                    value={searchSkill}
                                    onChange={e => { setSearchSkill(e.target.value); setIsDropdownOpen(true); }}
                                    onFocus={(e) => { onFocus(e); setIsDropdownOpen(true); }}
                                    onBlur={onBlur}
                                />
                            </div>
                            {isDropdownOpen && searchSkill && (
                                <div className="custom-scrollbar" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', borderRadius: 10, border: `1px solid ${T.borderSoft}`, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: 200, overflowY: 'auto', padding: '6px' }}>
                                    {availableSkills.length > 0 ? (
                                        availableSkills.map(skill => {
                                            const isSelected = data.requirements.includes(skill.name);
                                            return (
                                                <div key={skill.id}
                                                    onClick={() => !isSelected && addSkill(skill.name)}
                                                    style={{ padding: '8px 12px', borderRadius: 6, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: isSelected ? T.muted : T.navy, cursor: isSelected ? 'not-allowed' : 'pointer', background: isSelected ? T.borderSoft : 'transparent', transition: 'background 0.1s' }}
                                                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.navyLight; }}
                                                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    <span>{skill.name}</span>
                                                    {isSelected && <span style={{ fontSize: 11, color: T.mutedDark, fontStyle: 'italic' }}>Sudah dipilih</span>}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div style={{ padding: '8px 12px', fontSize: 13, color: T.mutedDark, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>"{searchSkill}" belum ada di sistem.</span>
                                            <button type="button" onClick={createNewSkill} style={{ background: T.orangeLight, color: T.orange, border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                                                + Tambahkan Baru
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '14px', background: T.bg, border: `1px solid ${T.borderSoft}`, borderRadius: 10, minHeight: 64 }}>
                        {data.requirements.length === 0 ? (
                            <div style={{ fontSize: 13, color: T.muted, width: '100%', textAlign: 'center', padding: '6px 0' }}>Belum ada requirement keahlian yang dipilih.</div>
                        ) : (
                            data.requirements.map(skillName => (
                                <button key={skillName} type="button"
                                    title="Klik dua kali untuk menghapus"
                                    onDoubleClick={() => removeSkill(skillName)}
                                    style={{ padding: '5px 12px 5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', border: `1.5px solid ${T.orange}`, background: T.orangeLight, color: T.orange, display: 'flex', alignItems: 'center', gap: 6 }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#fecaca'; e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#dc2626'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = T.orangeLight; e.currentTarget.style.borderColor = T.orange; e.currentTarget.style.color = T.orange; }}
                                >
                                    {skillName}
                                    <span style={{ fontSize: 14, fontWeight: 800, marginTop: '-2px' }}>&times;</span>
                                </button>
                            ))
                        )}
                    </div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: -8 }}>*Klik dua kali (Double-click) pada keahlian untuk menghapusnya.</div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
