import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
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

const fieldBase = { height: 44, padding: '0 13px', border: `1.5px solid ${T.border}`, borderRadius: 9, background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none', width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box' };
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; e.target.style.boxShadow = 'none'; };

const FieldLabel = ({ children, required, htmlFor }) => (
    <label htmlFor={htmlFor} style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 6 }}>
        {children}{required && <span style={{ color: T.red, marginLeft: 3 }}>*</span>}
    </label>
);

/* ─── Section Header ─────────────────────────────────────────────────────── */
const SectionHeader = ({ title, desc }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 3, height: 18, background: T.orange, borderRadius: 2 }} />
        <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{title}</div>
            {desc && <div style={{ fontSize: 11.5, color: T.muted, marginTop: 1 }}>{desc}</div>}
        </div>
    </div>
);

// PERBAIKAN: Berikan default value array kosong pada parameter industries
export default function EditProfile({ company, industries = [] }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        name: company?.name || '',
        industry: company?.industry || '',
        description: company?.description || '',
        address: company?.address || '',
        website: company?.website || '',
    });

    const submit = e => { e.preventDefault(); post(route('perusahaan.profile.update')); };

    const isComplete = company?.name && company?.industry;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Profil Perusahaan</h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Kelola informasi dan identitas perusahaan Anda</p>
                </div>
            }
        >
            <Head title="Profil Perusahaan — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                [data-radix-popper-content-wrapper] { z-index: 99999 !important; }
                .ak-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
            `}</style>

            <div className="ak-root" style={{ maxWidth: 760, margin: '0 auto' }}>

                {/* Notifikasi */}
                {!isComplete ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, marginBottom: 16, background: T.orangeLight, border: `1px solid #fed7aa`, animation: 'slideDown 0.3s ease both' }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>⚠️</div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Profil belum lengkap</div>
                            <div style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>Lengkapi nama perusahaan dan sektor industri agar lowongan Anda dapat tampil di bursa kerja alumni.</div>
                        </div>
                    </div>
                ) : flash?.message && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, marginBottom: 16, background: T.greenLight, border: `1px solid #bbf7d0`, animation: 'slideDown 0.3s ease both' }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>✅</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>{flash.message}</div>
                    </div>
                )}

                {/* Main Card */}
                <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, overflow: 'hidden', animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>

                    {/* Card Header / Company Banner */}
                    <div style={{
                        background: `linear-gradient(135deg, ${T.navyMid} 0%, ${T.navy} 100%)`,
                        padding: '22px 26px',
                        display: 'flex', alignItems: 'center', gap: 16,
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* Decoration */}
                        <div style={{ position: 'absolute', right: -20, top: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(249,115,22,0.12)' }} />
                        <div style={{ position: 'absolute', right: 50, bottom: -50, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

                        <div style={{ width: 52, height: 52, borderRadius: 14, background: T.orange, color: '#fff', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(249,115,22,0.35)', position: 'relative' }}>
                            {(data.name || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
                                {data.name || 'Nama Perusahaan Belum Diisi'}
                            </div>
                            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
                                {data.industry || 'Sektor industri belum dipilih'} · Mitra SITAMI
                            </div>
                        </div>
                        {isComplete && (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: 'rgba(249,115,22,0.2)', color: T.orange, flexShrink: 0, position: 'relative' }}>
                                ✓ Profil Aktif
                            </span>
                        )}
                    </div>

                    {/* Form Body */}
                    <div style={{ padding: '24px 26px' }}>
                        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                            {/* Section: Identitas */}
                            <div>
                                <SectionHeader title="Identitas Perusahaan" desc="Informasi utama yang tampil di profil publik" />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <div>
                                        <FieldLabel required>Nama Perusahaan</FieldLabel>
                                        <input style={fieldBase} id="name" placeholder="PT. Inovasi Dinamika Solusi"
                                            value={data.name} onChange={e => setData('name', e.target.value)}
                                            onFocus={onFocus} onBlur={onBlur} />
                                        <InputError message={errors.name} className="mt-1" />
                                    </div>
                                    <div>
                                        <FieldLabel required>Sektor Industri</FieldLabel>
                                        <Select value={data.industry} onValueChange={v => setData('industry', v)}>
                                            <SelectTrigger className="focus:ring-0 focus:ring-offset-0" style={{ height: 44, borderRadius: 9, border: `1.5px solid ${T.border}`, background: T.bg, fontSize: 13.5 }}>
                                                <SelectValue placeholder="Pilih sektor industri..." />
                                            </SelectTrigger>
                                            <SelectContent position="popper" sideOffset={4} className="z-[500] rounded-xl overflow-hidden border border-gray-200 shadow-xl" style={{ background: '#ffffff' }}>
                                                {/* PERBAIKAN: Gunakan optional chaining atau fallback OR */}
                                                {(industries || []).map(ind => (
                                                    <SelectItem key={ind.id} value={ind.name} className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50" style={{ color: '#1e293b' }}>{ind.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.industry} className="mt-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div style={{ height: 1, background: T.borderSoft }} />

                            {/* Section: Kontak */}
                            <div>
                                <SectionHeader title="Kontak & Lokasi" desc="Informasi untuk alumni menghubungi Anda" />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <div>
                                        <FieldLabel>Situs Web</FieldLabel>
                                        <div style={{ position: 'relative' }}>
                                            <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: T.muted }} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
                                            </svg>
                                            <input type="url" style={{ ...fieldBase, paddingLeft: 38 }} placeholder="https://contohperusahaan.com"
                                                value={data.website} onChange={e => setData('website', e.target.value)}
                                                onFocus={onFocus} onBlur={onBlur} />
                                        </div>
                                        <InputError message={errors.website} className="mt-1" />
                                    </div>
                                    <div>
                                        <FieldLabel>Alamat Lengkap</FieldLabel>
                                        <textarea style={{ ...fieldBase, height: 'auto', padding: '10px 13px', resize: 'vertical' }} rows={3}
                                            placeholder="Jl. Raya Contoh No. 123, Kota, Provinsi..."
                                            value={data.address} onChange={e => setData('address', e.target.value)}
                                            onFocus={onFocus} onBlur={onBlur} />
                                        <InputError message={errors.address} className="mt-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div style={{ height: 1, background: T.borderSoft }} />

                            {/* Section: Deskripsi */}
                            <div>
                                <SectionHeader title="Tentang Perusahaan" desc="Ceritakan visi, misi, atau budaya perusahaan Anda" />
                                <textarea style={{ ...fieldBase, height: 'auto', padding: '10px 13px', resize: 'vertical' }} rows={5}
                                    placeholder="Ceritakan visi, misi, atau budaya perusahaan Anda secara singkat..."
                                    value={data.description} onChange={e => setData('description', e.target.value)}
                                    onFocus={onFocus} onBlur={onBlur} />
                                <InputError message={errors.description} className="mt-1" />
                            </div>

                            {/* Footer */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: `1px solid ${T.borderSoft}` }}>
                                <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>
                                    Data yang disimpan akan ditampilkan kepada alumni di halaman bursa kerja.
                                </p>
                                <button type="submit" disabled={processing} style={{
                                    height: 42, padding: '0 22px', borderRadius: 9, border: 'none',
                                    background: processing ? T.muted : T.orange, color: '#fff',
                                    fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                                    fontFamily: 'inherit', transition: 'all 0.15s', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', gap: 7,
                                    boxShadow: processing ? 'none' : '0 2px 12px rgba(249,115,22,0.3)',
                                }}
                                    onMouseEnter={e => { if (!processing) { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                                    onMouseLeave={e => { e.currentTarget.style.background = processing ? T.muted : T.orange; e.currentTarget.style.transform = 'none'; }}
                                >
                                    {processing ? (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                                                <path d="M4 12a8 8 0 018-8" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                                            </svg>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                                            </svg>
                                            Simpan Profil
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </AuthenticatedLayout>
    );
}
