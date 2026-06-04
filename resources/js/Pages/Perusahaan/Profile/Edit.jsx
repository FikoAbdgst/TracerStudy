import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import InputError from '@/Components/InputError';
import LocationPicker from '@/Components/LocationPicker';

import MapWidget from '@/Components/MapWidget';
import wilayahData from '@/Data/wilayah.json';

/* ─── Tokens ─────────────────────────────────────────────────────────────── */
const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626',
};

const fieldBase = {
    height: 42, padding: '0 13px', border: `1.5px solid ${T.border}`, borderRadius: 9,
    background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none',
    width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box',
};
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; e.target.style.boxShadow = 'none'; };

const FieldLabel = ({ children, required }) => (
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 5 }}>
        {children}{required && <span style={{ color: T.red, marginLeft: 3 }}>*</span>}
    </label>
);

const Section = ({ title, icon, children, delay = 0 }) => (
    <div style={{
        background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`,
        overflow: 'hidden', boxShadow: '0 1px 4px rgba(26,53,96,0.05)',
        animation: `cardIn 0.38s ${delay}s cubic-bezier(0.22,1,0.36,1) both`,
    }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.borderSoft}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.navy }}>{title}</span>
        </div>
        <div style={{ padding: '20px' }}>{children}</div>
    </div>
);

// ─── EDIT MODE ────────────────────────────────────────────────────────────────
const EditMode = ({ data, setData, errors, processing, submit, industries, company, onCancel }) => {

    const [selectedProvinsi, setSelectedProvinsi] = useState(data.province || '');
    const [selectedKota, setSelectedKota] = useState(data.city || '');
    const [detailAlamat, setDetailAlamat] = useState('');
    const [isResolvingAddress, setIsResolvingAddress] = useState(false);

    const matchWilayah = (cityName, provinceName) => {
        // coba cocokkan nama kota/provinsi dari Nominatim ke wilayahData
        let matchedProv = provinceName || '';
        let matchedCity = cityName || '';

        if (matchedProv) {
            const foundProv = Object.keys(wilayahData).find(
                p => p.toLowerCase().includes(matchedProv.toLowerCase()) || matchedProv.toLowerCase().includes(p.toLowerCase())
            );
            if (foundProv) matchedProv = foundProv;
        }

        if (matchedCity && matchedProv && wilayahData[matchedProv]) {
            const foundCity = wilayahData[matchedProv].find(
                k => k.toLowerCase().includes(matchedCity.toLowerCase()) || matchedCity.toLowerCase().includes(k.toLowerCase())
            );
            if (foundCity) matchedCity = foundCity;
        }

        return { matchedProv, matchedCity };
    };

    const listProvinsi = Object.keys(wilayahData);
    const listKota = selectedProvinsi ? (wilayahData[selectedProvinsi] || []) : [];

    const updateAddressInForm = (detail, kota, provinsi) => {
        const parts = [detail, kota, provinsi].filter(Boolean);
        setData('address', parts.join(', '));
    };

    const handleAddressResolve = (lat, lng, address) => {
        setDetailAlamat(address);
        setData({ address, latitude: lat, longitude: lng });
    };

    const handleAddressData = (addr) => {
        const cityFromMap = addr.city || addr.town || addr.village || addr.county || '';
        const provFromMap = addr.state || '';
        const { matchedProv, matchedCity } = matchWilayah(cityFromMap, provFromMap);
        setSelectedProvinsi(matchedProv);
        setSelectedKota(matchedCity);
        setData('province', matchedProv);
        setData('city', matchedCity);
    };

    const onProvinsiChange = (prov) => {
        setSelectedProvinsi(prov);
        setSelectedKota('');
        setData('province', prov);
        setData('city', '');
        setData('latitude', null);
        setData('longitude', null);
        updateAddressInForm(detailAlamat, '', prov);
    };

    const onKotaChange = (kota) => {
        setSelectedKota(kota);
        setData('city', kota);
        setData('latitude', null);
        setData('longitude', null);
        updateAddressInForm(detailAlamat, kota, selectedProvinsi);
    };

    const onDetailChange = (val) => {
        setDetailAlamat(val);
        setData('latitude', null);
        setData('longitude', null);
        updateAddressInForm(val, selectedKota, selectedProvinsi);
    };

    const onLocationChange = (lat, lng) => {
        setData('latitude', lat);
        setData('longitude', lng);
    };

    const safeIndustries = Array.isArray(industries) ? industries : [];

    return (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Section title="Informasi Perusahaan" icon="🏢" delay={0.04}>

                <div style={{ marginBottom: 14 }}>
                    <FieldLabel>Logo Perusahaan (Opsional)</FieldLabel>
                    <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={e => setData('logo_file', e.target.files[0])}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: `2px dashed ${T.border}`, fontSize: 13.5, background: T.bg, boxSizing: 'border-box' }}
                    />
                    <InputError message={errors.logo_file} className="mt-1.5" />
                    {data.logo_file ? (
                        <div style={{ fontSize: 11, color: T.green, marginTop: 4 }}>File terpilih: {data.logo_file.name}</div>
                    ) : company?.logo_url ? (
                        <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Logo saat ini sudah terpasang. Upload file baru untuk menggantinya.</div>
                    ) : (
                        <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Format yang didukung: JPG, PNG. Maksimal 2MB.</div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                        <FieldLabel required>Nama Perusahaan</FieldLabel>
                        <input style={fieldBase} placeholder="Misal: PT Inovasi Maju..." value={data.name}
                            onChange={e => setData('name', e.target.value)} onFocus={onFocus} onBlur={onBlur} required />
                        <InputError message={errors.name} className="mt-1.5" />
                    </div>
                    <div>
                        <FieldLabel required>Sektor Industri</FieldLabel>
                        <Select value={data.industry} onValueChange={v => setData('industry', v)} required>
                            <SelectTrigger className="focus:ring-0 focus:ring-offset-0" style={{ height: 42, borderRadius: 9, border: `1.5px solid ${T.border}`, background: T.bg, fontSize: 13.5 }}>
                                <SelectValue placeholder="Pilih Industri..." />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={4} className="z-[500] rounded-xl overflow-hidden border border-gray-200 shadow-xl" style={{ background: '#ffffff' }}>
                                {safeIndustries.length > 0 ? (
                                    safeIndustries.map(ind => (
                                        <SelectItem key={ind.id} value={ind.name} className="text-sm cursor-pointer px-3 py-2" style={{ color: '#1e293b' }}>
                                            {ind.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="Lainnya" disabled>Data industri tidak tersedia</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.industry} className="mt-1.5" />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                        <FieldLabel>Situs Web (Website)</FieldLabel>
                        <input style={fieldBase} placeholder="https://www.perusahaananda.com" value={data.website}
                            onChange={e => setData('website', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                        <InputError message={errors.website} className="mt-1.5" />
                    </div>
                    <div />
                </div>

                <div style={{ padding: '16px', background: T.bg, border: `1px solid ${T.borderSoft}`, borderRadius: 12, marginBottom: 14 }}>
                    <div style={{ marginBottom: 14 }}>
                        <FieldLabel required>Domisili Kota & Provinsi</FieldLabel>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div style={{ position: 'relative' }}>
                                <select
                                    style={{
                                        ...fieldBase,
                                        appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
                                        paddingRight: 36, cursor: 'pointer',
                                        color: selectedProvinsi ? T.navy : T.muted
                                    }}
                                    value={selectedProvinsi}
                                    onChange={e => onProvinsiChange(e.target.value)}
                                    onFocus={onFocus} onBlur={onBlur} required
                                >
                                    <option value="" disabled>Pilih Provinsi...</option>
                                    {listProvinsi.map(prov => (
                                        <option key={prov} value={prov}>{prov}</option>
                                    ))}
                                </select>
                                <svg style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.mutedDark }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <select
                                    style={{
                                        ...fieldBase,
                                        appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
                                        paddingRight: 36,
                                        cursor: selectedProvinsi ? 'pointer' : 'not-allowed',
                                        background: selectedProvinsi ? '#fff' : T.borderSoft,
                                        color: selectedKota ? T.navy : T.muted
                                    }}
                                    value={selectedKota}
                                    onChange={e => onKotaChange(e.target.value)}
                                    onFocus={onFocus} onBlur={onBlur} disabled={!selectedProvinsi} required
                                >
                                    <option value="" disabled>
                                        {selectedProvinsi ? 'Pilih Kota...' : 'Pilih Provinsi Dulu'}
                                    </option>
                                    {listKota.map(kota => (
                                        <option key={kota} value={kota}>{kota}</option>
                                    ))}
                                </select>
                                <svg style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.mutedDark }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <FieldLabel>Alamat Lengkap (Jalan, Gedung, Patokan)</FieldLabel>
                        <textarea style={{ ...fieldBase, height: 'auto', padding: '12px 14px', resize: 'vertical' }} rows={2}
                            placeholder="Misal: Gedung Cyber Lt. 2, Jl. Kuningan Barat Raya No. 8..."
                            value={detailAlamat}
                            onChange={e => onDetailChange(e.target.value)}
                            onFocus={onFocus} onBlur={onBlur} />
                        {isResolvingAddress && (
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                                ⏳ Mencari alamat dari peta...
                            </div>
                        )}
                    </div>

                    <InputError message={errors.address} className="mt-1.5" />

                    {data.address && (
                        <div style={{ fontSize: 11, fontWeight: 600, color: T.navyMid, marginTop: 10, padding: '8px 12px', background: '#e2e8f0', borderRadius: 6 }}>
                            <span style={{ color: T.mutedDark }}>Preview Alamat:</span> {data.address}
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: 14 }}>
                    <FieldLabel>Tandai Lokasi di Peta <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#94a3b8' }}>(opsional)</span></FieldLabel>
                    <LocationPicker
                        latitude={data.latitude}
                        longitude={data.longitude}
                        onLocationChange={onLocationChange}
                        onAddressResolve={handleAddressResolve}
                        onAddressData={handleAddressData}
                        onResolvingChange={setIsResolvingAddress}
                        height={280}
                    />
                    <InputError message={errors.latitude} className="mt-1.5" />
                </div>

                <div>
                    <FieldLabel required>Deskripsi Perusahaan</FieldLabel>
                    <textarea style={{ ...fieldBase, height: 'auto', padding: '12px 14px', resize: 'vertical' }} rows={5}
                        placeholder="Ceritakan tentang perusahaan Anda, visi misi, dan lingkungan kerja..."
                        value={data.description} onChange={e => setData('description', e.target.value)}
                        onFocus={onFocus} onBlur={onBlur} required />
                    <InputError message={errors.description} className="mt-1.5" />
                </div>
            </Section>

            <div style={{
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                padding: '16px 20px', background: '#fff', borderRadius: 14,
                border: `1px solid ${T.borderSoft}`,
                animation: `cardIn 0.38s 0.08s cubic-bezier(0.22,1,0.36,1) both`,
            }}>
                <p style={{ fontSize: 12, color: T.muted, margin: 0, flex: 1, minWidth: 160 }}>
                    Profil yang lengkap akan meningkatkan kepercayaan kandidat pelamar.
                </p>
                <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                    <button type="button" onClick={onCancel}
                        style={{
                            height: 42, padding: '0 18px', borderRadius: 9, border: `1.5px solid ${T.border}`,
                            background: '#fff', color: T.mutedDark, fontSize: 13, fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = T.mutedDark; e.currentTarget.style.background = T.bg; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = '#fff'; }}
                    >
                        ✕ Batal
                    </button>
                    <button type="submit" disabled={processing}
                        style={{
                            height: 42, padding: '0 22px', borderRadius: 9, border: 'none',
                            background: processing ? T.muted : T.orange, color: '#fff',
                            fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: 7,
                            boxShadow: processing ? 'none' : '0 2px 8px rgba(249,115,22,0.25)',
                        }}
                        onMouseEnter={e => { if (!processing) { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.background = processing ? T.muted : T.orange; e.currentTarget.style.transform = 'none'; }}
                    >
                        {processing ? 'Menyimpan...' : 'Simpan Profil Perusahaan'}
                    </button>
                </div>
            </div>
        </form>
    );
};

// ─── VIEW MODE ────────────────────────────────────────────────────────────────
const ProfileField = ({ label, value, full = false }) => (
    <div style={{ padding: '12px 0', borderBottom: `1px solid ${T.borderSoft}`, gridColumn: full ? '1 / -1' : undefined }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 4 }}>
            {label}
        </div>
        <div style={{ fontSize: 13.5, color: value ? T.navy : T.muted, fontStyle: value ? 'normal' : 'italic', fontWeight: value ? 500 : 400, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {value || 'Belum diisi'}
        </div>
    </div>
);

const ViewMode = ({ profile }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Section title="Informasi Perusahaan" icon="🏢" delay={0.04}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                    <ProfileField label="Nama Perusahaan" value={profile?.name} />
                    <ProfileField label="Sektor Industri" value={profile?.industry} />
                    <ProfileField label="Situs Web" value={profile?.website} />
                    <ProfileField label="Alamat Lengkap" value={profile?.address} />
                    <ProfileField label="Deskripsi Perusahaan" value={profile?.description} full />
                </div>
                {profile?.latitude && profile?.longitude && (
                    <div style={{ marginTop: 16 }}>
                        <MapWidget
                            latitude={parseFloat(profile.latitude)}
                            longitude={parseFloat(profile.longitude)}
                            label={profile.name}
                            height={220}
                        />
                    </div>
                )}
            </Section>
        </div>
    );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function EditCompanyProfile({ company, industries = [] }) {
    const { auth, flash } = usePage().props;
    const [isEditing, setIsEditing] = useState(!company);

    // Tambahkan data logo_file dengan null sebagai inisialisasi agar Inertia bersiap mengirimkan file
    const { data, setData, post, processing, errors } = useForm({
        name: company?.name || '',
        industry: company?.industry || '',
        address: company?.address || '',
        province: company?.province || '',
        city: company?.city || '',
        latitude: company?.latitude ? parseFloat(company.latitude) : null,
        longitude: company?.longitude ? parseFloat(company.longitude) : null,
        description: company?.description || '',
        website: company?.website || '',
        logo_file: null,
    });

    const isComplete = !!(company?.name && company?.industry && company?.address && company?.province && company?.city && company?.description);

    const submit = e => {
        e.preventDefault();
        post(route('perusahaan.profile.update'), {
            preserveScroll: true,
            onSuccess: () => setIsEditing(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Profil Perusahaan</h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>
                        {isEditing ? 'Edit data identitas perusahaan Anda' : 'Informasi identitas perusahaan Anda di mata pelamar'}
                    </p>
                </div>
            }
        >
            <Head title="Profil Perusahaan — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .pt-root * { font-family: 'Plus Jakarta Sans', sans-serif; }
                [data-radix-popper-content-wrapper] { z-index: 99999 !important; }
                @keyframes cardIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>

            <div className="pt-root" style={{ maxWidth: 720, margin: '0 auto', padding: '0 2px' }}>

                {flash?.message && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, marginBottom: 18, background: T.greenLight, border: '1px solid #bbf7d0', animation: 'fadeIn 0.3s both' }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={T.green} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>{flash.message}</span>
                    </div>
                )}

                {!isEditing && !isComplete && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', borderRadius: 12, marginBottom: 16, background: '#fffbeb', border: '1px solid #fed7aa', animation: 'fadeIn 0.3s both' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: T.orangeLight, color: T.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Profil Perusahaan Belum Lengkap</div>
                            <div style={{ fontSize: 12, color: '#b45309', marginTop: 3, lineHeight: 1.5 }}>Lengkapi identitas perusahaan Anda sebelum dapat membuat lowongan baru.</div>
                        </div>
                    </div>
                )}

                {/* ── Hero Card ── */}
                {company && (
                    <div style={{
                        background: `linear-gradient(135deg, ${T.navyMid} 0%, ${T.navy} 100%)`,
                        borderRadius: 14, padding: '20px 24px', marginBottom: 16,
                        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                        boxShadow: '0 4px 20px rgba(15,31,61,0.18)',
                        animation: 'cardIn 0.4s cubic-bezier(0.22,1,0.36,1) both',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(249,115,22,0.1)', pointerEvents: 'none' }} />

                        {/* Tampilkan Logo jika ada, jika tidak tampilkan Inisial Huruf */}
                        {company.logo_url ? (
                            <img
                                src={`/storage/${company.logo_url}`}
                                alt={`Logo ${company.name}`}
                                style={{ width: 54, height: 54, borderRadius: 14, objectFit: 'cover', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', position: 'relative', zIndex: 1, backgroundColor: '#fff' }}
                            />
                        ) : (
                            <div style={{ width: 54, height: 54, borderRadius: 14, background: '#fff', color: T.navy, fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', position: 'relative' }}>
                                {(company.name || '?').charAt(0).toUpperCase()}
                            </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {company.name}
                            </div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
                                {company.industry || 'Sektor belum diisi'} · {company.verification_status === 'verified' ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                            </div>
                        </div>

                        {/* TOMBOL EDIT / BATAL */}
                        {isEditing ? (
                            <button type="button" onClick={() => setIsEditing(false)}
                                style={{
                                    height: 36, padding: '0 16px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.3)',
                                    background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                            >
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                Batal
                            </button>
                        ) : (
                            <button type="button" onClick={() => setIsEditing(true)}
                                style={{
                                    height: 36, padding: '0 16px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.3)',
                                    background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                            >
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.25 2.25 0 113.182 3.182L7.5 20.213l-4.5 1.125 1.125-4.5L16.862 4.487z" /></svg>
                                Edit Profil
                            </button>
                        )}
                    </div>
                )}

                {/* ── Konten utama ── */}
                {isEditing ? (
                    <EditMode
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        submit={submit}
                        industries={industries}
                        company={company} // Oper data company ke komponen form agar kita bisa cek apakah sudah ada logo lama
                        onCancel={() => {
                            if (!company) window.history.back();
                            else setIsEditing(false);
                        }}
                    />
                ) : (
                    <ViewMode profile={company} />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
