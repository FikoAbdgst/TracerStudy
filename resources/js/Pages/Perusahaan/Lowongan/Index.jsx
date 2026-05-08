import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Switch } from '@/Components/ui/switch';
import InputError from '@/Components/InputError';

/* ─── Tokens ─────────────────────────────────────────────────────────────── */
const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626', redLight: '#fff1f2',
};

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

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function LowonganIndex({ jobs, isVerified, verificationStatus, keahlianMaster = [] }) {
    const { flash } = usePage().props;
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [q, setQ] = useState('');

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        title: '', location: '', salary_range: '', description: '', requirements: [],
    });

    const filtered = jobs.filter(j =>
        j.title.toLowerCase().includes(q.toLowerCase()) ||
        (j.location && j.location.toLowerCase().includes(q.toLowerCase()))
    );

    const openCreate = () => {
        reset();
        clearErrors();
        setData('requirements', []); // Pastikan selalu array kosong saat create
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
            // Ambil array requirement dari DB, jika null berikan array kosong
            requirements: Array.isArray(job.requirements) ? job.requirements : (job.requirements ? [job.requirements] : [])
        });
        setIsEditing(true); setModalOpen(true);
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (isEditing) put(route('perusahaan.lowongan.update', selectedJob.id), { onSuccess: () => setModalOpen(false) });
        else post(route('perusahaan.lowongan.store'), { onSuccess: () => setModalOpen(false) });
    };

    const handleDelete = id => { if (confirm('Yakin ingin menghapus lowongan ini?')) destroy(route('perusahaan.lowongan.destroy', id)); };

    const toggleActive = id => {
        if (!isVerified) return;
        router.patch(route('perusahaan.lowongan.toggle', id), {}, { preserveScroll: true });
    };

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
                .tbl-row:hover td { background:#fafbfc; }
            `}</style>

            <div className="ak-root">
                {/* ── Flash Notifikasi ── */}
                {(flash?.message || flash?.error) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, marginBottom: 16, background: flash.error ? T.redLight : T.greenLight, border: `1px solid ${flash.error ? '#fecaca' : '#bbf7d0'}` }}>
                        <div style={{ fontSize: 16 }}>{flash.error ? '⚠️' : '✅'}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: flash.error ? T.red : T.green }}>{flash.message || flash.error}</div>
                    </div>
                )}

                {/* ── BANNER PERINGATAN JIKA BELUM TERVERIFIKASI ── */}
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

                    {/* Header Bar */}
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

                            {/* ── TOMBOL POSTING ── */}
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

                    {/* Table */}
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
                                                <Switch
                                                    checked={job.is_active}
                                                    onCheckedChange={() => toggleActive(job.id)}
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
                                                >
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(job.id)} style={{
                                                    height: 30, padding: '0 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.14s',
                                                    border: `1.5px solid #fecaca`, background: T.redLight, color: T.red,
                                                }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                                    onMouseLeave={e => e.currentTarget.style.background = T.redLight}
                                                >
                                                    Hapus
                                                </button>
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

            {/* Modal Tambah / Edit */}
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

                    <div>
                        <FieldLabel required>Deskripsi Pekerjaan</FieldLabel>
                        <textarea style={{ ...fieldBase, height: 'auto', padding: '10px 13px', resize: 'vertical' }} rows={4}
                            value={data.description} onChange={e => setData('description', e.target.value)}
                            placeholder="Tanggung jawab utama posisi ini..." onFocus={onFocus} onBlur={onBlur} required />
                        <InputError message={errors.description} className="mt-1" />
                    </div>

                    {/* Master Data KEAHLIAN Selection */}
                    <div>
                        <FieldLabel>Keahlian yang Dibutuhkan</FieldLabel>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '10px 14px', background: T.bg, border: `1px solid ${T.borderSoft}`, borderRadius: 10 }}>
                            {(!keahlianMaster || keahlianMaster.length === 0) ? (
                                <span style={{ fontSize: 12, color: T.mutedDark }}>Admin kampus belum mengatur Master Data Keahlian.</span>
                            ) : (
                                keahlianMaster?.map(skill => {
                                    const reqArray = Array.isArray(data.requirements) ? data.requirements : [];
                                    const isSelected = reqArray.includes(skill.name);

                                    return (
                                        <button
                                            key={skill.id} type="button"
                                            onClick={() => {
                                                if (isSelected) {
                                                    setData('requirements', reqArray.filter(s => s !== skill.name));
                                                } else {
                                                    setData('requirements', [...reqArray, skill.name]);
                                                }
                                            }}
                                            style={{
                                                padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                                border: `1.5px solid ${isSelected ? T.orange : T.border}`,
                                                background: isSelected ? T.orangeLight : '#fff',
                                                color: isSelected ? T.orange : T.mutedDark,
                                            }}
                                        >
                                            {isSelected ? '✓ ' : '+ '} {skill.name}
                                        </button>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
