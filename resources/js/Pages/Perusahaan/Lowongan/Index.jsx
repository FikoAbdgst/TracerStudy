import React, { useState, useRef, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import LocationPicker from '@/Components/LocationPicker';
import axios from 'axios';
import wilayahData from '@/Data/wilayah.json';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626', redLight: '#fff1f2',
};

/* ─── Format Rupiah ───────────────────────────────────────────────────────── */
const formatRp = (n) => {
    if (!n && n !== 0) return '';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
};

const parseRp = (str) => {
    const n = parseInt(String(str).replace(/\D/g, ''), 10);
    return isNaN(n) ? 0 : n;
};

/* ─── Salary Range Input ──────────────────────────────────────────────────── */
// Mengubah salary_range string "Rp5jt - Rp10jt" → { min, max }
const parseSalaryRange = (str) => {
    if (!str) return { min: 0, max: 0 };
    const nums = str.replace(/[^\d\-]/g, ' ').trim().split(/[\s\-]+/).filter(Boolean).map(Number);
    // Jika format lama: "5000000 - 10000000"
    if (nums.length >= 2) return { min: nums[0], max: nums[1] };
    if (nums.length === 1) return { min: nums[0], max: nums[0] };
    return { min: 0, max: 0 };
};

const SalaryRangeInput = ({ value, onChange }) => {
    const parsed = parseSalaryRange(value);
    const [min, setMin] = useState(parsed.min || 3000000);
    const [max, setMax] = useState(parsed.max || 10000000);
    const [negotiable, setNegotiable] = useState(value === 'Negotiable');

    // Sync ke parent
    useEffect(() => {
        if (negotiable) { onChange('Negotiable'); return; }
        if (min === 0 && max === 0) { onChange(''); return; }
        onChange(`${min}-${max}`);
    }, [min, max, negotiable]);

    // Sync dari parent (saat edit job)
    useEffect(() => {
        if (value === 'Negotiable') { setNegotiable(true); return; }
        const p = parseSalaryRange(value);
        if (p.min) setMin(p.min);
        if (p.max) setMax(p.max);
    }, []);

    const STEP = 500000;
    const SALARY_MIN = 1000000;
    const SALARY_MAX = 50000000;

    const handleMinChange = (v) => {
        const n = Math.min(Number(v), max - STEP);
        setMin(Math.max(SALARY_MIN, n));
    };
    const handleMaxChange = (v) => {
        const n = Math.max(Number(v), min + STEP);
        setMax(Math.min(SALARY_MAX, n));
    };

    const minPct = ((min - SALARY_MIN) / (SALARY_MAX - SALARY_MIN)) * 100;
    const maxPct = ((max - SALARY_MIN) / (SALARY_MAX - SALARY_MIN)) * 100;

    if (negotiable) {
        return (
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: T.mutedDark, fontWeight: 600 }}>Gaji dapat dinegosiasi</span>
                    <button type="button" onClick={() => setNegotiable(false)}
                        style={{ fontSize: 11, color: T.orange, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        Atur Rentang →
                    </button>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: 9, background: T.orangeLight, border: `1.5px solid ${T.border}`, fontSize: 13.5, fontWeight: 700, color: T.orange }}>
                    Negotiable / Dapat Dinegosiasi
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Preview nilai */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ background: T.navyLight, borderRadius: 8, padding: '5px 12px', fontSize: 13, fontWeight: 700, color: T.navyMid }}>
                        {formatRp(min)}
                    </div>
                    <span style={{ fontSize: 12, color: T.muted }}>—</span>
                    <div style={{ background: T.navyLight, borderRadius: 8, padding: '5px 12px', fontSize: 13, fontWeight: 700, color: T.navyMid }}>
                        {formatRp(max)}
                    </div>
                </div>
                <button type="button" onClick={() => setNegotiable(true)}
                    style={{ fontSize: 11, color: T.muted, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Ganti ke Negotiable
                </button>
            </div>

            {/* Dual slider track */}
            <div style={{ position: 'relative', height: 36, display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                {/* Track background */}
                <div style={{ position: 'absolute', left: 0, right: 0, height: 6, background: T.borderSoft, borderRadius: 3 }} />
                {/* Track fill (antara min dan max) */}
                <div style={{
                    position: 'absolute', height: 6, background: T.orange, borderRadius: 3,
                    left: `${minPct}%`, width: `${maxPct - minPct}%`,
                    transition: 'left 0.05s, width 0.05s',
                }} />
                {/* Slider MIN */}
                <input type="range" min={SALARY_MIN} max={SALARY_MAX} step={STEP} value={min}
                    onChange={e => handleMinChange(e.target.value)}
                    style={{ position: 'absolute', width: '100%', appearance: 'none', WebkitAppearance: 'none', height: 6, background: 'transparent', outline: 'none', cursor: 'pointer', zIndex: 2 }}
                    className="salary-thumb"
                />
                {/* Slider MAX */}
                <input type="range" min={SALARY_MIN} max={SALARY_MAX} step={STEP} value={max}
                    onChange={e => handleMaxChange(e.target.value)}
                    style={{ position: 'absolute', width: '100%', appearance: 'none', WebkitAppearance: 'none', height: 6, background: 'transparent', outline: 'none', cursor: 'pointer', zIndex: 3 }}
                    className="salary-thumb"
                />
            </div>

            {/* Input angka manual */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Minimal</div>
                    <input
                        type="text"
                        value={min.toLocaleString('id-ID')}
                        onChange={e => handleMinChange(parseRp(e.target.value))}
                        onFocus={onFocus} onBlur={onBlur}
                        style={{ ...fieldBase, fontSize: 13 }}
                    />
                </div>
                <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Maksimal</div>
                    <input
                        type="text"
                        value={max.toLocaleString('id-ID')}
                        onChange={e => handleMaxChange(parseRp(e.target.value))}
                        onFocus={onFocus} onBlur={onBlur}
                        style={{ ...fieldBase, fontSize: 13 }}
                    />
                </div>
            </div>
        </div>
    );
};

/* ─── Custom Switch ───────────────────────────────────────────────────────── */
function CustomSwitch({ checked, onChange, disabled = false }) {
    return (
        <button type="button" role="switch" aria-checked={checked}
            onClick={disabled ? undefined : onChange}
            style={{
                position: 'relative', display: 'inline-flex', alignItems: 'center',
                width: 48, height: 26, borderRadius: 999, border: 'none',
                cursor: disabled ? 'not-allowed' : 'pointer', padding: 3,
                transition: 'background 0.22s cubic-bezier(0.22,1,0.36,1)',
                background: disabled ? '#e2e8f0' : checked ? T.green : '#cbd5e1',
                boxShadow: (!disabled && checked) ? '0 0 0 3px rgba(22,163,74,0.15)' : 'none',
                flexShrink: 0, outline: 'none', opacity: disabled ? 0.55 : 1,
            }}>
            <span style={{
                display: 'block', width: 20, height: 20, borderRadius: '50%', background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                transform: checked ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform 0.22s cubic-bezier(0.22,1,0.36,1)',
            }} />
        </button>
    );
}

/* ─── Modal ───────────────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children, footer, wide = false }) {
    const [visible, setVisible] = React.useState(false);
    const [render, setRender] = React.useState(false);
    React.useEffect(() => {
        if (open) { setRender(true); requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); }
        else { setVisible(false); const t = setTimeout(() => setRender(false), 260); return () => clearTimeout(t); }
    }, [open]);
    if (!render) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease' }}>
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)' }} />
            <div style={{
                background: '#fff', borderRadius: 16, position: 'relative', width: '100%', maxWidth: wide ? 700 : 520,
                boxShadow: '0 24px 60px rgba(10,20,40,0.2)', display: 'flex', flexDirection: 'column', maxHeight: '92vh',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
                transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1)',
            }}>
                <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.borderSoft}`, flexShrink: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: T.navy }}>{title}</span>
                    <button type="button" onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: T.bg, color: T.mutedDark, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.background = T.border}
                        onMouseLeave={e => e.currentTarget.style.background = T.bg}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>{children}</div>
                {footer && <>
                    <div style={{ height: 1, background: T.borderSoft }} />
                    <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div>
                </>}
            </div>
        </div>
    );
}

/* ─── Alert Dialog ────────────────────────────────────────────────────────── */
function AlertDialog({ open, onClose, onConfirm, title, message, processing }) {
    const [visible, setVisible] = useState(false);
    const [render, setRender] = useState(false);
    useEffect(() => {
        if (open) { setRender(true); requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); }
        else { setVisible(false); const t = setTimeout(() => setRender(false), 260); return () => clearTimeout(t); }
    }, [open]);
    if (!render) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease' }}>
            <div onClick={!processing ? onClose : undefined} style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)' }} />
            <div style={{ background: '#fff', borderRadius: 16, position: 'relative', width: '100%', maxWidth: 420, boxShadow: '0 24px 60px rgba(10,20,40,0.2)', overflow: 'hidden', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(10px) scale(0.97)', transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1)' }}>
                <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.borderSoft}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: T.redLight, color: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 800, color: T.navy }}>{title}</span>
                    </div>
                    <button onClick={!processing ? onClose : undefined} disabled={processing} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: T.bg, color: T.mutedDark, cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div style={{ padding: '16px 22px' }}><p style={{ fontSize: 13, color: T.mutedDark, lineHeight: 1.65, margin: 0 }}>{message}</p></div>
                <div style={{ height: 1, background: T.borderSoft }} />
                <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button onClick={onClose} disabled={processing} style={{ height: 36, padding: '0 16px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: 'transparent', color: T.mutedDark, fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: processing ? 0.5 : 1 }}>Batal</button>
                    <button onClick={onConfirm} disabled={processing} style={{ height: 36, padding: '0 18px', borderRadius: 8, border: 'none', background: processing ? T.muted : T.red, color: '#fff', fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {processing
                            ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}><path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>Menghapus...</>
                            : <><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Ya, Hapus</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Form atoms ──────────────────────────────────────────────────────────── */
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

/* Pembatas section dalam modal */
const FormSection = ({ title, children }) => (
    <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: T.navyMid, marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${T.borderSoft}` }}>
            {title}
        </div>
        {children}
    </div>
);

/* Native select dengan chevron */
const NativeSelect = ({ value, onChange, children, placeholder, disabled = false }) => (
    <div style={{ position: 'relative' }}>
        <select value={value} onChange={e => onChange(e.target.value)} onFocus={onFocus} onBlur={onBlur} disabled={disabled}
            style={{ ...fieldBase, appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', paddingRight: 36, cursor: disabled ? 'not-allowed' : 'pointer', color: value ? T.navy : T.muted, background: disabled ? T.borderSoft : T.bg }}>
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {children}
        </select>
        <svg style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.mutedDark }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
    </div>
);

/* ════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════════════ */
export default function LowonganIndex({ jobs, company, isVerified, verificationStatus, keahlianMaster = [] }) {
    const { flash } = usePage().props;
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [q, setQ] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [masterSkills, setMasterSkills] = useState(keahlianMaster);
    const [searchSkill, setSearchSkill] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchRef = useRef(null);

    const [selectedProvinsi, setSelectedProvinsi] = useState('');
    const [selectedKota, setSelectedKota] = useState('');
    const [sameAsCompany, setSameAsCompany] = useState(false);
    const [isResolvingAddress, setIsResolvingAddress] = useState(false);
    const [isRemoteAnywhere, setIsRemoteAnywhere] = useState(false);

    const listProvinsi = Object.keys(wilayahData);
    const listKota = selectedProvinsi ? (wilayahData[selectedProvinsi] || []) : [];

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        title: '', location: '', province: '', city: '', latitude: null, longitude: null,
        salary_range: '',
        description: '', requirements: [],
        min_education: '', min_experience: '', max_age: '', work_model: '',
        weight_skill: 40, weight_education: 25, weight_experience: 20, weight_age: 15,
    });

    const showLocationFields = data.work_model === 'On-site' || data.work_model === 'Hybrid' || (data.work_model === 'Remote' && !isRemoteAnywhere);
    const totalWeight = (data.weight_skill || 0) + (data.weight_education || 0) + (data.weight_experience || 0) + (data.weight_age || 0);
    const isWeightValid = totalWeight === 100;

    const filtered = jobs.filter(j =>
        j.title.toLowerCase().includes(q.toLowerCase()) ||
        (j.location && j.location.toLowerCase().includes(q.toLowerCase()))
    );

    const resetLocationState = () => { setSelectedProvinsi(''); setSelectedKota(''); setSameAsCompany(false); setIsRemoteAnywhere(false); };
    const handleAddressResolve = (address) => setData({ ...data, location: address });

    const openCreate = () => {
        reset(); clearErrors(); setData('requirements', []);
        resetLocationState(); setIsEditing(false); setModalOpen(true);
    };

    const normalizeWorkModel = (wm) => {
        if (!wm) return '';
        if (wm === 'WFO') return 'On-site';
        if (wm === 'WFH' || wm === 'WFA') return 'Remote';
        return wm;
    };

    const openEdit = job => {
        const normalizedWm = normalizeWorkModel(job.work_model);
        reset(); clearErrors(); setSelectedJob(job);
        setSelectedProvinsi(job.province || ''); setSelectedKota(job.city || '');
        setIsRemoteAnywhere(normalizedWm === 'Remote' && !job.province && !job.city);
        setSameAsCompany(false);
        setData({
            title: job.title, location: job.location || '',
            province: job.province || '', city: job.city || '',
            latitude: job.latitude ? parseFloat(job.latitude) : null,
            longitude: job.longitude ? parseFloat(job.longitude) : null,
            salary_range: job.salary_range || '',
            description: job.description,
            requirements: Array.isArray(job.requirements) ? job.requirements : (job.requirements ? [job.requirements] : []),
            min_education: job.min_education || '', min_experience: job.min_experience || '',
            max_age: job.max_age || '', work_model: normalizedWm,
            weight_skill: job.weight_skill ?? 40, weight_education: job.weight_education ?? 25,
            weight_experience: job.weight_experience ?? 20, weight_age: job.weight_age ?? 15,
        });
        setIsEditing(true); setModalOpen(true);
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (!isWeightValid) return;
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
    const toggleActive = id => { if (!isVerified) return; router.patch(route('perusahaan.lowongan.toggle', id), {}, { preserveScroll: true }); };

    const availableSkills = masterSkills.filter(s => s.name.toLowerCase().includes(searchSkill.toLowerCase()));
    const addSkill = (name) => { if (!data.requirements.includes(name)) setData('requirements', [...data.requirements, name]); setSearchSkill(''); setIsDropdownOpen(false); };
    const removeSkill = (name) => setData('requirements', data.requirements.filter(s => s !== name));
    const createNewSkill = async () => {
        if (!searchSkill.trim()) return;
        try {
            const res = await axios.post(route('master-data.keahlian.quick-add'), { name: searchSkill.trim() });
            setMasterSkills([...masterSkills, res.data]); addSkill(res.data.name);
        } catch { /* silent */ }
    };

    useEffect(() => {
        const handler = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setIsDropdownOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const activeCount = jobs.filter(j => j.is_active).length;

    /* ─ Fungsi format salary_range untuk ditampilkan di tabel ─ */
    const displaySalary = (raw) => {
        if (!raw) return '—';
        if (raw === 'Negotiable') return 'Negotiable';
        const [a, b] = raw.split('-').map(s => parseInt(s.trim(), 10));
        if (b) return `${formatRp(a)} – ${formatRp(b)}`;
        if (a) return formatRp(a);
        return raw;
    };

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
                .ak-root * { font-family: 'Plus Jakarta Sans', sans-serif; }
                @keyframes cardIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
                @keyframes rowIn  { from { opacity:0; transform:translateX(-4px); } to { opacity:1; transform:translateX(0); } }
                @keyframes spin   { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
                .tbl-row:hover td { background: #fafbfc; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

                /* Slider thumb styling */
                .salary-thumb::-webkit-slider-thumb {
                    -webkit-appearance: none; appearance: none;
                    width: 18px; height: 18px; border-radius: 50%;
                    background: #fff; border: 2.5px solid ${T.orange};
                    box-shadow: 0 1px 6px rgba(249,115,22,0.3);
                    cursor: pointer; transition: transform 0.15s;
                }
                .salary-thumb::-webkit-slider-thumb:hover { transform: scale(1.2); }
                .salary-thumb::-moz-range-thumb {
                    width: 18px; height: 18px; border-radius: 50%;
                    background: #fff; border: 2.5px solid ${T.orange};
                    box-shadow: 0 1px 6px rgba(249,115,22,0.3); cursor: pointer;
                }
            `}</style>

            <div className="ak-root">

                {/* Flash */}
                {(flash?.message || flash?.error) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderRadius: 12, marginBottom: 16, background: flash.error ? T.redLight : T.greenLight, border: `1px solid ${flash.error ? '#fecaca' : '#bbf7d0'}` }}>
                        <span style={{ fontSize: 15 }}>{flash.error ? '⚠️' : '✅'}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: flash.error ? T.red : T.green }}>{flash.message || flash.error}</span>
                    </div>
                )}

                {/* Verifikasi banner */}
                {!isVerified && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', borderRadius: 12, marginBottom: 20, background: verificationStatus === 'rejected' ? T.redLight : T.orangeLight, border: `1px solid ${verificationStatus === 'rejected' ? '#fecaca' : '#fed7aa'}` }}>
                        <span style={{ fontSize: 22 }}>{verificationStatus === 'rejected' ? '❌' : '⏳'}</span>
                        <div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: verificationStatus === 'rejected' ? T.red : '#92400e' }}>
                                {verificationStatus === 'rejected' ? 'Izin Posting Ditolak/Dicabut' : 'Menunggu Verifikasi Admin Kampus'}
                            </div>
                            <div style={{ fontSize: 12, color: verificationStatus === 'rejected' ? T.red : '#b45309', marginTop: 3, lineHeight: 1.5 }}>
                                {verificationStatus === 'rejected'
                                    ? 'Admin Kampus mencabut izin akses Anda. Semua lowongan Anda dinonaktifkan dari bursa kerja alumni.'
                                    : 'Anda belum bisa memposting lowongan sebelum Admin Kampus menyetujui profil dan legalitas perusahaan Anda.'}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Tabel utama ── */}
                <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20, animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>

                    {/* Toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: T.navyLight, color: T.navyMid }}>{jobs.length} Total</span>
                            {activeCount > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: T.greenLight, color: T.green }}>{activeCount} Aktif</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#b0bec5', pointerEvents: 'none' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
                                <input style={{ ...fieldBase, paddingLeft: 33, width: 220 }} placeholder="Cari posisi atau lokasi..."
                                    value={q} onChange={e => setQ(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                            </div>
                            <button onClick={() => isVerified && openCreate()} disabled={!isVerified}
                                style={{ height: 42, padding: '0 16px', borderRadius: 9, border: 'none', background: isVerified ? T.orange : T.muted, color: '#fff', fontSize: 13, fontWeight: 700, cursor: isVerified ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6, boxShadow: isVerified ? '0 2px 10px rgba(249,115,22,0.28)' : 'none', whiteSpace: 'nowrap' }}
                                onMouseEnter={e => { if (isVerified) { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                                onMouseLeave={e => { if (isVerified) { e.currentTarget.style.background = T.orange; e.currentTarget.style.transform = 'none'; } }}>
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                Posting Lowongan
                            </button>
                        </div>
                    </div>

                    {/* Tabel */}
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
                                        <td style={{ padding: '13px 14px', fontSize: 13, color: T.mutedDark }}>{displaySalary(job.salary_range)}</td>
                                        <td style={{ padding: '13px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <CustomSwitch checked={job.is_active} onChange={() => toggleActive(job.id)} disabled={!isVerified} />
                                                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: job.is_active ? T.greenLight : T.borderSoft, color: job.is_active ? T.green : T.mutedDark }}>
                                                    {job.is_active ? 'Dibuka' : 'Ditutup'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                                                <button onClick={() => isVerified && openEdit(job)} disabled={!isVerified}
                                                    style={{ height: 30, padding: '0 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: isVerified ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.14s', border: `1.5px solid ${isVerified ? T.border : 'transparent'}`, background: isVerified ? T.bg : T.borderSoft, color: isVerified ? T.navyMid : T.muted }}
                                                    onMouseEnter={e => { if (isVerified) { e.currentTarget.style.borderColor = T.navyMid; e.currentTarget.style.background = T.navyLight; } }}
                                                    onMouseLeave={e => { if (isVerified) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.bg; } }}>Edit</button>
                                                <button onClick={() => confirmDelete(job.id)}
                                                    style={{ height: 30, padding: '0 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.14s', border: `1.5px solid #fecaca`, background: T.redLight, color: T.red }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                                    onMouseLeave={e => e.currentTarget.style.background = T.redLight}>Hapus</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={4} style={{ padding: '48px 16px', textAlign: 'center', fontSize: 13, color: T.muted }}>
                                        {q ? 'Tidak ada lowongan yang cocok.' : 'Belum ada lowongan yang diposting.'}
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ─── Alert Dialog ─── */}
            <AlertDialog open={alertOpen} onClose={() => !isDeleting && setAlertOpen(false)}
                onConfirm={executeDelete} processing={isDeleting}
                title="Hapus Lowongan?"
                message="Tindakan ini tidak dapat dibatalkan. Lowongan ini beserta semua data lamaran terkait akan dihapus secara permanen." />

            {/* ════════════════════════════════════════════════════════════
                FORM MODAL
            ════════════════════════════════════════════════════════════ */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}
                title={isEditing ? 'Edit Lowongan' : 'Posting Lowongan Baru'}
                wide
                footer={<>
                    <BtnGhost onClick={() => setModalOpen(false)}>Batal</BtnGhost>
                    <button type="submit" form="lowongan-form" disabled={processing || !isWeightValid}
                        style={{ height: 36, padding: '0 18px', borderRadius: 8, border: 'none', background: (processing || !isWeightValid) ? T.muted : T.orange, color: '#fff', fontSize: 13, fontWeight: 700, cursor: (processing || !isWeightValid) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: (processing || !isWeightValid) ? 'none' : '0 2px 8px rgba(249,115,22,0.3)', transition: 'all 0.15s' }}>
                        {processing ? 'Menyimpan...' : 'Simpan Lowongan'}
                    </button>
                </>}
            >
                <form id="lowongan-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

                    {/* ── 1. Informasi Dasar ── */}
                    <FormSection title="Informasi Dasar">
                        <div style={{ marginBottom: 14 }}>
                            <FieldLabel required>Posisi Pekerjaan</FieldLabel>
                            <input style={fieldBase} value={data.title} onChange={e => setData('title', e.target.value)}
                                placeholder="Contoh: Frontend Developer" onFocus={onFocus} onBlur={onBlur} required />
                            <InputError message={errors.title} className="mt-1" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div>
                                <FieldLabel required>Sistem Kerja</FieldLabel>
                                <NativeSelect value={data.work_model} placeholder="Pilih Sistem Kerja..."
                                    onChange={val => { setData({ ...data, work_model: val, province: '', city: '', latitude: null, longitude: null, location: '' }); resetLocationState(); }}>
                                    <option value="On-site">On-site (WFO)</option>
                                    <option value="Hybrid">Hybrid</option>
                                    <option value="Remote">Remote (WFH / WFA)</option>
                                </NativeSelect>
                            </div>
                            <div>
                                <FieldLabel>Minimal Pendidikan</FieldLabel>
                                <NativeSelect value={data.min_education} placeholder="Pilih Pendidikan..." onChange={v => setData('min_education', v)}>
                                    <option value="SMA/SMK">SMA / SMK Sederajat</option>
                                    <option value="D3">Diploma 3 (D3)</option>
                                    <option value="D4/S1">Sarjana (D4 / S1)</option>
                                    <option value="S2">Magister (S2)</option>
                                </NativeSelect>
                            </div>
                        </div>
                    </FormSection>

                    {/* ── 2. Lokasi ── */}
                    {data.work_model && (
                        <FormSection title="Lokasi Penempatan">
                            {data.work_model === 'Remote' && (
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.mutedDark, cursor: 'pointer', marginBottom: 12 }}>
                                    <input type="checkbox" checked={isRemoteAnywhere}
                                        onChange={e => {
                                            const checked = e.target.checked;
                                            setIsRemoteAnywhere(checked);
                                            if (checked) { setData({ ...data, province: '', city: '', latitude: null, longitude: null, location: '' }); setSelectedProvinsi(''); setSelectedKota(''); setSameAsCompany(false); }
                                        }}
                                        style={{ accentColor: T.orange, width: 16, height: 16, cursor: 'pointer' }} />
                                    Bebas dari mana saja (Seluruh Indonesia)
                                </label>
                            )}

                            {showLocationFields && (
                                <>
                                    {company && (
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.mutedDark, cursor: 'pointer', marginBottom: 12 }}>
                                            <input type="checkbox" checked={sameAsCompany}
                                                onChange={e => {
                                                    const checked = e.target.checked;
                                                    setSameAsCompany(checked);
                                                    if (checked && company) {
                                                        setSelectedProvinsi(company.province || ''); setSelectedKota(company.city || '');
                                                        setData({ ...data, province: company.province || '', city: company.city || '', latitude: company.latitude ? parseFloat(company.latitude) : null, longitude: company.longitude ? parseFloat(company.longitude) : null, location: [company.city, company.province].filter(Boolean).join(', ') });
                                                    } else { setSelectedProvinsi(''); setSelectedKota(''); setData({ ...data, province: '', city: '', latitude: null, longitude: null, location: '' }); }
                                                }}
                                                style={{ accentColor: T.orange, width: 16, height: 16, cursor: 'pointer' }} />
                                            Sama dengan alamat pusat perusahaan
                                        </label>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                        <NativeSelect value={selectedProvinsi} placeholder="Pilih Provinsi..."
                                            onChange={prov => { setSelectedProvinsi(prov); setSelectedKota(''); setSameAsCompany(false); setData({ ...data, province: prov, city: '', location: '' }); }}>
                                            {listProvinsi.map(p => <option key={p} value={p}>{p}</option>)}
                                        </NativeSelect>
                                        <NativeSelect value={selectedKota} placeholder={selectedProvinsi ? 'Pilih Kota...' : 'Pilih Provinsi Dulu'} disabled={!selectedProvinsi}
                                            onChange={kota => { setSelectedKota(kota); setSameAsCompany(false); setData({ ...data, city: kota, location: `${kota}, ${selectedProvinsi}` }); }}>
                                            {listKota.map(k => <option key={k} value={k}>{k}</option>)}
                                        </NativeSelect>
                                    </div>

                                    {isResolvingAddress && <div style={{ fontSize: 11, color: T.mutedDark, marginBottom: 6 }}>⏳ Mencari alamat dari peta...</div>}
                                    <LocationPicker latitude={data.latitude} longitude={data.longitude}
                                        onLocationChange={(lat, lng) => setData({ ...data, latitude: lat, longitude: lng })}
                                        onAddressResolve={handleAddressResolve} onResolvingChange={setIsResolvingAddress} height={200} />
                                </>
                            )}
                        </FormSection>
                    )}

                    {/* ── 3. Kompensasi ── */}
                    <FormSection title="Kompensasi">
                        <FieldLabel>Rentang Gaji</FieldLabel>
                        <SalaryRangeInput value={data.salary_range} onChange={v => setData('salary_range', v)} />
                    </FormSection>

                    {/* ── 4. Deskripsi ── */}
                    <FormSection title="Deskripsi Pekerjaan">
                        <textarea style={{ ...fieldBase, height: 'auto', padding: '10px 13px', resize: 'vertical' }} rows={4}
                            value={data.description} onChange={e => setData('description', e.target.value)}
                            placeholder="Tanggung jawab utama, kualifikasi, dan benefit posisi ini..." onFocus={onFocus} onBlur={onBlur} required />
                        <InputError message={errors.description} className="mt-1" />
                    </FormSection>

                    {/* ── 5. Kriteria ATS ── */}
                    <FormSection title="Kriteria & Keahlian (Sistem ATS)">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                            <div>
                                <FieldLabel>Min. Pengalaman (Tahun)</FieldLabel>
                                <input type="number" min="0" style={fieldBase} value={data.min_experience}
                                    onChange={e => setData('min_experience', e.target.value)}
                                    placeholder="0 = Fresh Graduate ok" onFocus={onFocus} onBlur={onBlur} />
                            </div>
                            <div>
                                <FieldLabel>Batas Usia Maksimal</FieldLabel>
                                <input type="number" min="15" style={fieldBase} value={data.max_age}
                                    onChange={e => setData('max_age', e.target.value)}
                                    placeholder="Kosongkan jika tidak ada batas" onFocus={onFocus} onBlur={onBlur} />
                            </div>
                        </div>

                        {/* Skill input */}
                        <FieldLabel>Keahlian yang Dibutuhkan</FieldLabel>
                        <div style={{ position: 'relative', marginBottom: 10 }} ref={searchRef}>
                            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#b0bec5', pointerEvents: 'none' }} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
                            <input style={{ ...fieldBase, paddingLeft: 36 }} placeholder="Ketik keahlian (Misal: PHP, MySQL...)"
                                value={searchSkill}
                                onChange={e => { setSearchSkill(e.target.value); setIsDropdownOpen(true); }}
                                onFocus={e => { onFocus(e); setIsDropdownOpen(true); }} onBlur={onBlur} />
                            {isDropdownOpen && searchSkill && (
                                <div className="custom-scrollbar" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', borderRadius: 10, border: `1px solid ${T.borderSoft}`, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 200, maxHeight: 200, overflowY: 'auto', padding: 6 }}>
                                    {availableSkills.length > 0 ? availableSkills.map(skill => {
                                        const isSel = data.requirements.includes(skill.name);
                                        return (
                                            <div key={skill.id} onClick={() => !isSel && addSkill(skill.name)}
                                                style={{ padding: '8px 12px', borderRadius: 6, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: isSel ? T.muted : T.navy, cursor: isSel ? 'not-allowed' : 'pointer', background: isSel ? T.borderSoft : 'transparent' }}
                                                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = T.navyLight; }}
                                                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}>
                                                <span>{skill.name}</span>
                                                {isSel && <span style={{ fontSize: 11, color: T.mutedDark, fontStyle: 'italic' }}>Sudah dipilih</span>}
                                            </div>
                                        );
                                    }) : (
                                        <div style={{ padding: '8px 12px', fontSize: 13, color: T.mutedDark, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>"{searchSkill}" belum ada di sistem.</span>
                                            <button type="button" onClick={createNewSkill} style={{ background: T.orangeLight, color: T.orange, border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ Tambahkan</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 14, background: T.bg, border: `1px solid ${T.borderSoft}`, borderRadius: 10, minHeight: 56 }}>
                            {data.requirements.length === 0
                                ? <span style={{ fontSize: 13, color: T.muted, width: '100%', textAlign: 'center', padding: '4px 0' }}>Belum ada keahlian dipilih.</span>
                                : data.requirements.map(s => (
                                    <button key={s} type="button" title="Double-click hapus" onDoubleClick={() => removeSkill(s)}
                                        style={{ padding: '4px 12px 4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', border: `1.5px solid ${T.orange}`, background: T.orangeLight, color: T.orange, display: 'flex', alignItems: 'center', gap: 6 }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#fecaca'; e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#dc2626'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = T.orangeLight; e.currentTarget.style.borderColor = T.orange; e.currentTarget.style.color = T.orange; }}>
                                        {s}<span style={{ fontSize: 14, fontWeight: 800 }}>&times;</span>
                                    </button>
                                ))
                            }
                        </div>
                        <div style={{ fontSize: 11, color: T.muted, marginTop: 5 }}>*Double-click pada tag untuk menghapus keahlian.</div>
                    </FormSection>

                    {/* ── 6. Bobot ATS ── */}
                    <FormSection title="Bobot Skor ATS (%)">
                        <p style={{ fontSize: 12, color: T.mutedDark, marginBottom: 14, marginTop: -6 }}>
                            Tentukan prioritas kriteria penilaian. <strong>Total wajib 100%.</strong>
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
                            {[
                                { label: 'Keahlian', key: 'weight_skill' },
                                { label: 'Pendidikan', key: 'weight_education' },
                                { label: 'Pengalaman', key: 'weight_experience' },
                                { label: 'Usia', key: 'weight_age' },
                            ].map(({ label, key }) => (
                                <div key={key}>
                                    <FieldLabel>{label}</FieldLabel>
                                    <input type="number" style={fieldBase} value={data[key]}
                                        onChange={e => setData(key, parseInt(e.target.value) || 0)}
                                        onFocus={onFocus} onBlur={onBlur} />
                                </div>
                            ))}
                        </div>
                        <div style={{ padding: '8px 14px', borderRadius: 8, background: isWeightValid ? T.greenLight : T.redLight, border: `1px solid ${isWeightValid ? '#bbf7d0' : '#fecaca'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: isWeightValid ? T.green : T.red }}>Total Bobot</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: isWeightValid ? T.green : T.red }}>{totalWeight}% {isWeightValid ? '✅' : '❌ (Wajib 100%)'}</span>
                        </div>
                    </FormSection>

                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
