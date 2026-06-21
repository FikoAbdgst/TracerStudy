import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff7ed',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc', bgAlt: '#f0f4f8',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626', redLight: '#fff1f2',
    yellow: '#eab308', yellowLight: '#fef9c3',
};

const MaskedText = ({ hidden, children }) => {
    if (hidden) {
        return (
            <span style={{ fontSize: 13, color: T.muted, fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                Disembunyikan oleh pengguna
            </span>
        );
    }
    return <span style={{ fontSize: 13.5, color: children ? T.navy : T.muted, fontWeight: children ? 500 : 400, fontStyle: children ? 'normal' : 'italic' }}>{children || 'Tidak diisi'}</span>;
};

const Field = ({ label, value, hidden = false }) => (
    <div style={{ padding: '12px 0', borderBottom: `1px solid ${T.borderSoft}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 4 }}>{label}</div>
        <MaskedText hidden={hidden}>{value}</MaskedText>
    </div>
);

const SectionCard = ({ title, icon, children }) => (
    <div style={{
        background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`,
        overflow: 'hidden', boxShadow: '0 1px 4px rgba(26,53,96,0.05)',
    }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.borderSoft}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15 }}>{icon}</span>
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.navy }}>{title}</span>
        </div>
        <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
);

export default function TalentPoolShow({ alumni, company, jobList }) {
    const p = alumni;
    const [saved, setSaved] = useState(p.is_saved ?? false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState('');

    const toggleBookmark = () => {
        const next = !saved;
        setSaved(next);
        axios.post(route('perusahaan.talent-pool.bookmark', p.id)).catch(() => setSaved(!next));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getAge = (dateStr) => {
        if (!dateStr) return null;
        const today = new Date();
        const birth = new Date(dateStr);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };

    const phoneHidden = p.phone_hidden ?? false;
    const addressHidden = p.address_hidden ?? false;

    const waNumber = !phoneHidden ? p.phone_number?.replace(/\D/g, '') : null;
    const waLink = waNumber ? `https://wa.me/62${waNumber.startsWith('0') ? waNumber.slice(1) : waNumber}` : null;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0 }}>Detail Kandidat</h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Informasi lengkap alumni SITAMI</p>
                </div>
            }
        >
            <Head title={`${p.user?.name} — Bakat Potensial`} />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .tp-root * { font-family: 'Plus Jakarta Sans', sans-serif; }

                @keyframes cardIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 640px) {
                    .tp-detail-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>

            <div className="tp-root" style={{ maxWidth: 820, margin: '0 auto', padding: '0 2px' }}>

                {/* ── Back button ── */}
                <Link href={route('perusahaan.talent-pool')} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 12.5, fontWeight: 600, color: T.mutedDark, textDecoration: 'none',
                    marginBottom: 16, padding: '6px 12px', borderRadius: 8,
                    transition: 'all 0.15s',
                }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.borderSoft; e.currentTarget.style.color = T.navy; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.mutedDark; }}
                >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                    Kembali ke Bakat Potensial
                </Link>

                {/* ── Profile Header ── */}
                <div style={{
                    background: `linear-gradient(135deg, ${T.navyMid} 0%, ${T.navy} 100%)`,
                    borderRadius: 14, padding: '24px', marginBottom: 16,
                    display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
                    boxShadow: '0 4px 20px rgba(15,31,61,0.18)',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', right: -20, top: -20, width: 140, height: 140, borderRadius: '50%', background: 'rgba(249,115,22,0.1)', pointerEvents: 'none' }} />

                    {p.photo_path ? (
                        <img src={`/storage/${p.photo_path}`} style={{ width: 60, height: 60, borderRadius: 14, objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: 60, height: 60, borderRadius: 14, background: T.orange, color: '#fff', fontSize: 26, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {(p.user?.name || '?').charAt(0).toUpperCase()}
                        </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.user?.name}
                        </div>
                        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>
                            {p.jenjang_pendidikan ? `${p.jenjang_pendidikan} — ` : ''}{p.major || 'Prodi tidak diisi'} · Lulus {p.graduation_year || '—'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.green }} />
                            <span style={{ fontSize: 11.5, fontWeight: 600, color: T.green }}>Open to Work</span>
                        </div>
                    </div>

                    {/* ── Bookmark Button ── */}
                    <button onClick={toggleBookmark} title={saved ? 'Hapus dari Tersimpan' : 'Simpan Kandidat'} style={{
                        height: 38, padding: '0 16px', borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.3)',
                        background: saved ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.1)',
                        color: saved ? T.yellow : '#fff', fontSize: 12.5, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 7,
                        flexShrink: 0, transition: 'all 0.15s', position: 'relative',
                    }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? T.yellow : 'none'} stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                        {saved ? 'Tersimpan' : 'Simpan'}
                    </button>

                    {/* ── WhatsApp Button ── */}
                    {waLink ? (
                        <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
                            height: 38, padding: '0 18px', borderRadius: 9, border: 'none',
                            background: '#25D366', color: '#fff', fontSize: 12.5, fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none',
                            display: 'inline-flex', alignItems: 'center', gap: 7, flexShrink: 0,
                            boxShadow: '0 2px 8px rgba(37,211,102,0.25)', position: 'relative',
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            Hubungi via WhatsApp
                        </a>
                    ) : (
                        <div style={{
                            height: 38, padding: '0 18px', borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.2)',
                            background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 12.5, fontWeight: 600,
                            display: 'inline-flex', alignItems: 'center', gap: 7, flexShrink: 0,
                            fontFamily: 'inherit', cursor: 'not-allowed',
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            {phoneHidden ? 'Kontak Disembunyikan' : 'WhatsApp Tidak Tersedia'}
                        </div>
                    )}

                    {/* ── Undang Melamar ── */}
                    {p.user?.id && (
                        <button onClick={() => setInviteOpen(true)} style={{
                            height: 38, padding: '0 16px', borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.3)',
                            background: 'rgba(249,115,22,0.2)', color: '#fff', fontSize: 12.5, fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 7,
                            flexShrink: 0, transition: 'all 0.15s', position: 'relative',
                        }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.98V19.5z" />
                            </svg>
                            Undang Melamar
                        </button>
                    )}
                </div>

                {/* ── Content Grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="tp-detail-grid">

                    {/* Informasi Personal */}
                    <SectionCard title="Informasi Personal" icon="📋">
                        <Field label="NIM" value={p.nim} />
                        <Field label="Jenis Kelamin" value={p.jenis_kelamin} />
                        <Field label="Tanggal Lahir" value={formatDate(p.tanggal_lahir)} />
                        {p.tanggal_lahir && <Field label="Usia" value={`${getAge(p.tanggal_lahir)} tahun`} />}
                        <Field label="No. WhatsApp" value={p.phone_number} hidden={phoneHidden} />
                    </SectionCard>

                    {/* Pendidikan */}
                    <SectionCard title="Pendidikan" icon="🎓">
                        <Field label="Program Studi" value={p.major} />
                        <Field label="Jenjang" value={p.jenjang_pendidikan} />
                        <Field label="Tahun Lulus" value={p.graduation_year} />
                    </SectionCard>

                    {/* Lokasi & Pengalaman */}
                    <SectionCard title="Lokasi & Pengalaman" icon="📍">
                        <Field label="Domisili" value={p.address} hidden={addressHidden} />
                        {!addressHidden && p.detail_address && <Field label="Detail Alamat" value={p.detail_address} />}
                        <Field label="Pengalaman Kerja" value={p.experience !== null ? `${p.experience} tahun` : null} />
                    </SectionCard>

                    {/* Keahlian */}
                    <SectionCard title="Keahlian" icon="⚡">
                        {p.skills?.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 0' }}>
                                {p.skills.map(s => (
                                    <span key={s} style={{
                                        padding: '5px 13px', borderRadius: 20, fontSize: 12.5, fontWeight: 600,
                                        border: `1.5px solid ${T.orange}`, background: T.orangeLight, color: T.orange,
                                    }}>
                                        {s}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: 13, color: T.muted, fontStyle: 'italic' }}>Belum ada keahlian yang ditambahkan.</div>
                        )}
                    </SectionCard>
                </div>

                {/* ── CV ── */}
                {p.cv_path && (
                    <div style={{ marginTop: 16 }}>
                        <SectionCard title="Curriculum Vitae" icon="📄">
                            <a href={route('private-file', p.cv_path)} target="_blank" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '10px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                                color: T.orange, border: `1.5px solid ${T.orange}`, background: T.orangeLight,
                                textDecoration: 'none', transition: 'all 0.15s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = T.orange; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = T.orangeLight; e.currentTarget.style.color = T.orange; }}
                            >
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                Lihat CV / Unduh
                            </a>
                        </SectionCard>
                    </div>
                )}
            </div>

            {/* ── Undang Melamar Modal ── */}
            {inviteOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
                    background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)',
                }} onClick={() => { setInviteOpen(false); setSelectedJobId(''); }}>
                    <div style={{
                        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, overflow: 'hidden',
                        boxShadow: '0 24px 60px rgba(10,20,40,0.2)',
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px 22px 14px', borderBottom: `1px solid ${T.borderSoft}` }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: T.navy }}>Undang Melamar</div>
                            <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>Pilih lowongan untuk dikirimkan ke {p.user?.name}</div>
                        </div>
                        <div style={{ padding: '18px 22px' }}>
                            <select value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)} style={{
                                width: '100%', height: 42, padding: '0 13px', border: `1.5px solid ${T.border}`,
                                borderRadius: 9, background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none',
                                fontFamily: 'inherit', transition: 'all 0.18s', marginBottom: 4,
                            }}>
                                <option value="">Pilih lowongan aktif...</option>
                                {jobList?.map(j => (
                                    <option key={j.id} value={j.id}>{j.title}</option>
                                ))}
                            </select>
                            {(!jobList || jobList.length === 0) && (
                                <p style={{ fontSize: 12, color: T.red, marginTop: 6 }}>Tidak ada lowongan aktif. Buat lowongan terlebih dahulu.</p>
                            )}
                        </div>
                        <div style={{ padding: '14px 22px', borderTop: `1px solid ${T.borderSoft}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button onClick={() => { setInviteOpen(false); setSelectedJobId(''); }}
                                style={{ height: 36, padding: '0 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: 'transparent', color: T.mutedDark, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                Batal
                            </button>
                            <button onClick={() => {
                                if (!selectedJobId) return;
                                router.post(route('messages.invite-candidate'), {
                                    alumni_id: p.user.id,
                                    job_id: selectedJobId,
                                });
                                setInviteOpen(false);
                            }} disabled={!selectedJobId}
                                style={{
                                    height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
                                    background: selectedJobId ? T.orange : T.muted,
                                    color: '#fff', fontSize: 13, fontWeight: 700,
                                    cursor: selectedJobId ? 'pointer' : 'not-allowed',
                                    fontFamily: 'inherit', boxShadow: selectedJobId ? '0 2px 8px rgba(249,115,22,0.3)' : 'none',
                                }}>
                                Kirim Undangan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
