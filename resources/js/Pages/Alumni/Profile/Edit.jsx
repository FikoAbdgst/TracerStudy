import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import InputError from '@/Components/InputError';
import axios from 'axios';

// Import data wilayah hierarkis (Pastikan file JSON ini sudah Anda buat sebelumnya)
import wilayahData from '@/Data/wilayah.json';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626',
};

// ─── Field base styles ────────────────────────────────────────────────────────
const fieldBase = {
    height: 42, padding: '0 13px', border: `1.5px solid ${T.border}`, borderRadius: 9,
    background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none',
    width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box',
};
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; e.target.style.boxShadow = 'none'; };

// ─── Shared atoms ─────────────────────────────────────────────────────────────
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

// ─── VIEW MODE ────────────────────────────────────────────────────────────────
const ProfileField = ({ label, value, full = false }) => (
    <div style={{ padding: '12px 0', borderBottom: `1px solid ${T.borderSoft}`, gridColumn: full ? '1 / -1' : undefined }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 4 }}>
            {label}
        </div>
        <div style={{ fontSize: 13.5, color: value ? T.navy : T.muted, fontStyle: value ? 'normal' : 'italic', fontWeight: value ? 500 : 400, lineHeight: 1.6 }}>
            {value || 'Belum diisi'}
        </div>
    </div>
);

const ViewSection = ({ title, icon, delay = 0, children }) => (
    <div style={{
        background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`,
        overflow: 'hidden', boxShadow: '0 1px 4px rgba(26,53,96,0.05)',
        animation: `cardIn 0.35s ${delay}s cubic-bezier(0.22,1,0.36,1) both`,
    }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.borderSoft}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.navy }}>{title}</span>
        </div>
        <div style={{ padding: '0 20px 8px' }}>{children}</div>
    </div>
);

const ViewMode = ({ profile, data }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="al-layout">
            <div className="al-main">
                <ViewSection title="Data Akademik" icon="🎓" delay={0.04}>
                    <div className="al-grid-2">
                        <ProfileField label="NIM" value={data.nim} />
                        <ProfileField label="Jenjang" value={data.jenjang_pendidikan} />
                        <ProfileField label="Program Studi" value={data.major} full />
                        <ProfileField label="Tahun Lulus" value={data.graduation_year} />
                    </div>
                </ViewSection>

                <ViewSection title="Informasi Personal & Kontak" icon="📱" delay={0.07}>
                    <div className="al-grid-2">
                        <ProfileField label="Tanggal Lahir" value={formatDate(data.tanggal_lahir)} />
                        <ProfileField label="No. WhatsApp / HP" value={data.phone_number} />
                        <ProfileField label="Domisili Saat Ini" value={data.address} full />
                        {data.detail_address && <ProfileField label="Detail Alamat" value={data.detail_address} full />}
                        <ProfileField
                            label="Lama Pengalaman Kerja"
                            value={data.experience !== null && data.experience !== '' ? `${data.experience} Tahun` : 'Belum diisi'}
                            full
                        />
                    </div>
                </ViewSection>

                <ViewSection title="Keahlian & Skills" icon="⚡" delay={0.10}>
                    <div style={{ padding: '14px 0 6px' }}>
                        {data.skills?.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {data.skills.map(skill => (
                                    <span key={skill} style={{
                                        padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                                        border: `1.5px solid ${T.orange}`, background: T.orangeLight, color: T.orange,
                                    }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: 13, color: T.muted, fontStyle: 'italic' }}>Belum ada keahlian yang ditambahkan.</div>
                        )}
                    </div>
                </ViewSection>

            </div>

            <div className="al-sidebar">

                <ViewSection title="Dokumen Pelengkap" icon="📄" delay={0.13}>
                    <div style={{ padding: '14px 0 6px' }}>
                        {profile?.cv_path ? (
                            <a href={route('private-file', profile.cv_path)} target="_blank" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                                color: T.orange, border: `1.5px solid ${T.orange}`, background: T.orangeLight,
                                textDecoration: 'none',
                            }}>
                                📄 Lihat CV Saat Ini
                            </a>
                        ) : (
                            <div style={{ fontSize: 13, color: T.muted, fontStyle: 'italic' }}>Belum ada CV yang diupload.</div>
                        )}
                    </div>
                </ViewSection>

                <ViewSection title="Ketersediaan" icon="🔍" delay={0.16}>
                    <div style={{ padding: '14px 0 6px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 12, height: 12, borderRadius: '50%',
                                background: data.is_open_to_work ? T.green : T.muted,
                                flexShrink: 0,
                            }} />
                            <span style={{ fontSize: 13.5, fontWeight: 600, color: data.is_open_to_work ? T.green : T.mutedDark }}>
                                {data.is_open_to_work ? 'Terbuka untuk peluang kerja (Open to Work)' : 'Tidak sedang mencari peluang kerja'}
                            </span>
                        </div>
                        <div style={{ fontSize: 12, color: T.mutedDark, marginTop: 2 }}>
                            Status pekerjaan: <strong>{data.employment_status || 'Belum diisi'}</strong>
                        </div>
                    </div>
                </ViewSection>

            </div>
        </div>
    );
};

// ─── EDIT MODE ────────────────────────────────────────────────────────────────
const EditMode = ({ data, setData, errors, processing, submit, programStudis, masterSkills, setMasterSkills, onCancel }) => {
    // State Keahlian
    const [searchSkill, setSearchSkill] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchRef = useRef(null);

    // ─── STATE UNTUK DOMISILI HIERARKIS ───
    const initialAddressParts = data.address ? data.address.split(', ') : ['', ''];
    // Asumsi format di DB adalah "Kota, Provinsi"
    const initialKota = initialAddressParts[0] || '';
    const initialProvinsi = initialAddressParts.length > 1 ? initialAddressParts[1] : '';

    const [selectedProvinsi, setSelectedProvinsi] = useState(initialProvinsi);
    const [selectedKota, setSelectedKota] = useState(initialKota);

    const listProvinsi = Object.keys(wilayahData);
    const listKota = selectedProvinsi ? (wilayahData[selectedProvinsi] || []) : [];

    const updateAddressInForm = (kota, provinsi) => {
        if (kota && provinsi) {
            setData('address', `${kota}, ${provinsi}`);
        } else {
            setData('address', '');
        }
    };

    const updateDetailAddress = (detail) => {
        setData('detail_address', detail);
    };
    // ──────────────────────────────────────

    const availableSkills = masterSkills.filter(s =>
        s.name.toLowerCase().includes(searchSkill.toLowerCase())
    );

    const addSkill = (skillName) => {
        if (!data.skills.includes(skillName)) setData('skills', [...data.skills, skillName]);
        setSearchSkill('');
        setIsDropdownOpen(false);
    };

    const removeSkill = (skillName) => setData('skills', data.skills.filter(s => s !== skillName));

    const createNewSkill = async () => {
        if (!searchSkill.trim()) return;
        try {
            const res = await axios.post(route('master-data.keahlian.quick-add'), { name: searchSkill.trim() });
            setMasterSkills(prev => [...prev, res.data]);
            addSkill(res.data.name);
        } catch {
            alert('Terjadi kesalahan saat menambahkan keahlian baru.');
        }
    };

    // Hitung tanggal lahir maksimal (-18 tahun dari hari ini)
    const maxAgeDate = useMemo(() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 18);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }, []);

    // Tutup dropdown keahlian jika klik di luar
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setIsDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div className="al-layout">
                <div className="al-main">

                    {/* ── Data Akademik ── */}
                    <Section title="Data Akademik" icon="🎓" delay={0.04}>
                        <div className="al-grid-akademik" style={{ marginBottom: 14 }}>
                            <div>
                                <FieldLabel required>NIM</FieldLabel>
                                <input
                                    style={{ ...fieldBase, opacity: 0.65, cursor: 'not-allowed' }}
                                    value={data.nim} disabled
                                />
                                <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>*NIM Terkunci (Diisi oleh Kampus)</div>
                            </div>
                            <div>
                                <FieldLabel required>Jenjang</FieldLabel>
                                <input
                                    style={{ ...fieldBase, opacity: 0.65, cursor: 'not-allowed', background: T.borderSoft }}
                                    value={data.jenjang_pendidikan || ''}
                                    placeholder="Otomatis terisi..."
                                    disabled
                                />
                                <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>*Terisi otomatis dari prodi</div>
                            </div>
                            <div>
                                <FieldLabel required>Tahun Lulus</FieldLabel>
                                <input type="number" style={fieldBase} placeholder="2024" value={data.graduation_year}
                                    onChange={e => setData('graduation_year', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                                <InputError message={errors.graduation_year} className="mt-1.5" />
                            </div>
                        </div>

                        {/* Program Studi */}
                        <div>
                            <FieldLabel required>Program Studi</FieldLabel>
                            <Select
                                value={data.major}
                                onValueChange={v => {
                                    const selectedProdi = programStudis.find(p => p.name === v);
                                    setData({
                                        ...data,
                                        major: v,
                                        jenjang_pendidikan: selectedProdi?.parameter_value || ''
                                    });
                                }}
                            >
                                <SelectTrigger className="focus:ring-0 focus:ring-offset-0" style={{ height: 42, borderRadius: 9, border: `1.5px solid ${T.border}`, background: T.bg, fontSize: 13.5, width: '100%' }}>
                                    <SelectValue placeholder="Pilih Program Studi..." />
                                </SelectTrigger>
                                <SelectContent position="popper" sideOffset={4} className="z-[500] rounded-xl overflow-hidden border border-gray-200 shadow-xl" style={{ background: '#ffffff', minWidth: 'var(--radix-select-trigger-width)' }}>
                                    {programStudis?.map(prodi => (
                                        <SelectItem key={prodi.id} value={prodi.name} className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50" style={{ color: '#1e293b' }}>
                                            {prodi.name} {prodi.parameter_value ? `(${prodi.parameter_value})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.major} className="mt-1.5" />
                        </div>
                    </Section>

                    {/* ── Informasi Personal & Kontak ── */}
                    <Section title="Informasi Personal & Kontak" icon="📱" delay={0.07}>
                        <div className="al-grid-2" style={{ marginBottom: 14 }}>
                            <div>
                                <FieldLabel required>Tanggal Lahir</FieldLabel>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="date"
                                        style={{
                                            ...fieldBase,
                                            color: data.tanggal_lahir ? T.navy : T.muted,
                                            cursor: 'pointer'
                                        }}
                                        value={data.tanggal_lahir}
                                        max={maxAgeDate}
                                        onChange={e => setData('tanggal_lahir', e.target.value)}
                                        onFocus={onFocus} onBlur={onBlur}
                                        required
                                    />
                                </div>
                                <InputError message={errors.tanggal_lahir} className="mt-1.5" />
                                <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>*Kandidat minimal berusia 18 tahun.</div>
                            </div>
                            <div>
                                <FieldLabel>No. WhatsApp / HP</FieldLabel>
                                <input style={fieldBase} placeholder="08123456789" value={data.phone_number}
                                    onChange={e => setData('phone_number', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                                <InputError message={errors.phone_number} className="mt-1.5" />
                            </div>
                        </div>

                        {/* ── DOMISILI BERHIERARKI ── */}
                        <div style={{ marginBottom: 14 }}>
                            <FieldLabel required>Domisili Saat Ini</FieldLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {/* Provinsi */}
                                <div style={{ position: 'relative' }}>
                                    <select
                                        style={{
                                            ...fieldBase,
                                            appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
                                            paddingRight: 36, cursor: 'pointer',
                                            color: selectedProvinsi ? T.navy : T.muted
                                        }}
                                        value={selectedProvinsi}
                                        onChange={e => {
                                            const prov = e.target.value;
                                            setSelectedProvinsi(prov);
                                            setSelectedKota('');
                                            updateAddressInForm('', prov);
                                        }}
                                        onFocus={onFocus} onBlur={onBlur}
                                        required
                                    >
                                        <option value="" disabled>Pilih Provinsi...</option>
                                        {listProvinsi.map(prov => (
                                            <option key={prov} value={prov}>{prov}</option>
                                        ))}
                                    </select>
                                    <svg style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.mutedDark }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </div>

                                {/* Kota */}
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
                                        onChange={e => {
                                            const kota = e.target.value;
                                            setSelectedKota(kota);
                                            updateAddressInForm(kota, selectedProvinsi);
                                        }}
                                        onFocus={onFocus} onBlur={onBlur}
                                        disabled={!selectedProvinsi}
                                        required
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
                            <InputError message={errors.address} className="mt-1.5" />
                            {data.address && (
                                <div style={{ fontSize: 11, fontWeight: 600, color: T.green, marginTop: 6 }}>
                                    Alamat tersimpan: {data.address}
                                </div>
                            )}
                        </div>

                        {/* ── DETAIL ALAMAT ── */}
                        <div style={{ marginBottom: 14 }}>
                            <FieldLabel>Detail Alamat <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#94a3b8' }}>(opsional)</span></FieldLabel>
                            <textarea
                                style={{ ...fieldBase, minHeight: 70, paddingTop: 10, resize: 'vertical', fontFamily: 'inherit' }}
                                placeholder="Contoh: Jl. Merdeka No. 123, RT 01/RW 02, Kel. Cibeunying"
                                value={data.detail_address || ''}
                                onChange={e => updateDetailAddress(e.target.value)}
                                onFocus={onFocus} onBlur={onBlur}
                            />
                            <InputError message={errors.detail_address} className="mt-1.5" />
                        </div>
                        {/* ────────────────────────── */}

                        <div>
                            <FieldLabel required>Lama Pengalaman Kerja (Tahun)</FieldLabel>
                            <input type="number" min="0" style={fieldBase}
                                placeholder="Contoh: 1 (Kosongkan atau ketik 0 jika Fresh Graduate)"
                                value={data.experience} onChange={e => setData('experience', e.target.value)}
                                onFocus={onFocus} onBlur={onBlur}
                                required
                            />
                            <InputError message={errors.experience} className="mt-1.5" />
                            <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>*Isi dengan angka dalam hitungan tahun (Ketik 0 jika Fresh Graduate).</div>
                        </div>
                    </Section>

                    {/* ── Keahlian & Skills ── */}
                    <Section title="Keahlian & Skills" icon="⚡" delay={0.10}>
                        <div style={{ marginBottom: 12 }}>
                            <FieldLabel>Cari atau Tambah Keahlian</FieldLabel>
                            <div style={{ position: 'relative' }} ref={searchRef}>
                                <div style={{ position: 'relative' }}>
                                    <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#b0bec5', pointerEvents: 'none' }}
                                        width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                                    </svg>
                                    <input
                                        style={{ ...fieldBase, paddingLeft: 36 }}
                                        placeholder="Ketik keahlian (Misal: Laravel, React, Public Speaking...)"
                                        value={searchSkill}
                                        onChange={e => { setSearchSkill(e.target.value); setIsDropdownOpen(true); }}
                                        onFocus={e => { onFocus(e); setIsDropdownOpen(true); }}
                                        onBlur={onBlur}
                                    />
                                </div>
                                {isDropdownOpen && searchSkill && (
                                    <div className="custom-scrollbar" style={{
                                        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                                        background: '#fff', borderRadius: 10, border: `1px solid ${T.borderSoft}`,
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: 200, overflowY: 'auto', padding: '6px',
                                    }}>
                                        {availableSkills.length > 0 ? availableSkills.map(skill => {
                                            const isSel = data.skills.includes(skill.name);
                                            return (
                                                <div key={skill.id} onClick={() => !isSel && addSkill(skill.name)}
                                                    style={{ padding: '8px 12px', borderRadius: 6, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: isSel ? T.muted : T.navy, cursor: isSel ? 'not-allowed' : 'pointer', background: isSel ? T.borderSoft : 'transparent', transition: 'background 0.1s' }}
                                                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = T.navyLight; }}
                                                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    <span>{skill.name}</span>
                                                    {isSel && <span style={{ fontSize: 11, color: T.mutedDark, fontStyle: 'italic' }}>Sudah dipilih</span>}
                                                </div>
                                            );
                                        }) : (
                                            <div style={{ padding: '8px 12px', fontSize: 13, color: T.mutedDark, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                <span>"{searchSkill}" belum ada di sistem.</span>
                                                <button type="button" onClick={createNewSkill}
                                                    style={{ background: T.orangeLight, color: T.orange, border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                                    + Tambahkan Baru
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '14px', background: T.bg, border: `1px solid ${T.borderSoft}`, borderRadius: 10, minHeight: 64 }}>
                            {data.skills.length === 0 ? (
                                <div style={{ fontSize: 13, color: T.muted, width: '100%', textAlign: 'center', padding: '6px 0' }}>Belum ada keahlian yang dipilih.</div>
                            ) : data.skills.map(skillName => (
                                <button key={skillName} type="button" title="Klik dua kali untuk menghapus"
                                    onDoubleClick={() => removeSkill(skillName)}
                                    style={{ padding: '5px 12px 5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', border: `1.5px solid ${T.orange}`, background: T.orangeLight, color: T.orange, display: 'flex', alignItems: 'center', gap: 6 }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#fecaca'; e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#dc2626'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = T.orangeLight; e.currentTarget.style.borderColor = T.orange; e.currentTarget.style.color = T.orange; }}
                                >
                                    {skillName}<span style={{ fontSize: 14, fontWeight: 800, marginTop: '-2px' }}>&times;</span>
                                </button>
                            ))}
                        </div>
                        <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>*Klik dua kali (Double-click) pada tombol keahlian untuk menghapusnya.</div>
                        <InputError className="mt-2" message={errors.skills} />
                    </Section>

                </div>

                <div className="al-sidebar">

                    {/* ── Status Pekerjaan ── */}
                    <Section title="Status Pekerjaan" icon="💼" delay={0.115}>
                        <div style={{ padding: '12px 0 4px' }}>
                            <FieldLabel>Apa status Anda saat ini? <span style={{ color: 'red' }}>*</span></FieldLabel>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { value: 'Bekerja', label: 'Bekerja', icon: '💼' },
                                    { value: 'Mencari Kerja', label: 'Mencari Kerja', icon: '🔍' },

                                    { value: 'Wiraswasta', label: 'Wiraswasta', icon: '🚀' },
                                ].map(opt => (
                                    <label key={opt.value} style={{
                                        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                                        padding: '10px 14px', borderRadius: 9,
                                        border: `1.5px solid ${data.employment_status === opt.value ? T.orange : T.border}`,
                                        background: data.employment_status === opt.value ? T.orangeLight : T.bg,
                                        transition: 'all 0.15s',
                                    }}>
                                        <input type="radio" name="employment_status" value={opt.value}
                                            checked={data.employment_status === opt.value}
                                            onChange={e => setData('employment_status', e.target.value)}
                                            style={{ width: 16, height: 16, accentColor: T.orange, flexShrink: 0 }}
                                        />
                                        <span style={{ fontSize: 13, fontWeight: data.employment_status === opt.value ? 700 : 500, color: data.employment_status === opt.value ? T.orange : T.navy }}>
                                            {opt.icon} {opt.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <InputError className="mt-2" message={errors.employment_status} />
                        </div>
                    </Section>

                    {/* ── Open to Work Toggle ── */}
                    <Section title="Ketersediaan" icon="🔍" delay={0.12}>
                        <div style={{ padding: '12px 0 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: !data.employment_status ? T.muted : T.navy }}>
                                    Saya terbuka untuk tawaran pekerjaan
                                </div>
                                <div style={{ fontSize: 11.5, color: T.muted, marginTop: 3, lineHeight: 1.5 }}>
                                    Alumni yang mengaktifkan ini akan muncul di pencarian <strong>Bakat Potensial</strong> perusahaan mitra.
                                </div>
                            </div>
                            <button type="button" onClick={() => setData('is_open_to_work', !data.is_open_to_work)}
                                disabled={!data.employment_status}
                                style={{
                                    position: 'relative', flexShrink: 0, width: 48, height: 26, borderRadius: 13, border: 'none',
                                    cursor: !data.employment_status ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.25s',
                                    background: data.is_open_to_work ? T.green : T.border,
                                    padding: 0, fontFamily: 'inherit', outline: 'none',
                                    opacity: !data.employment_status ? 0.4 : 1,
                                }}>
                                <div style={{
                                    position: 'absolute', top: 3, left: data.is_open_to_work ? 24 : 3,
                                    width: 20, height: 20, borderRadius: '50%', background: '#fff',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                    transition: 'left 0.25s cubic-bezier(0.22,1,0.36,1)',
                                }} />
                            </button>
                        </div>
                        {!data.employment_status ? (
                            <div style={{ fontSize: 11, color: T.orange, fontWeight: 600, marginTop: 2, fontStyle: 'italic' }}>
                                Isi Status Pekerjaan terlebih dahulu untuk mengaktifkan fitur ini
                            </div>
                        ) : (
                            <div style={{ fontSize: 11, color: data.is_open_to_work ? T.green : T.muted, fontWeight: 600, marginTop: 2 }}>
                                {data.is_open_to_work ? '✓ Aktif — profil Anda akan muncul di hasil pencarian perusahaan' : '— Tidak ditampilkan di pencarian perusahaan'}
                            </div>
                        )}
                    </Section>

                    {/* ── Pengaturan Privasi ── */}
                    <Section title="Pengaturan Privasi" icon="🔒" delay={0.125}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>Sembunyikan Nomor Telepon WhatsApp</div>
                                    <div style={{ fontSize: 11.5, color: T.muted, marginTop: 3, lineHeight: 1.5 }}>
                                        Perusahaan tidak dapat melihat nomor WhatsApp Anda di halaman Bakat Potensial.
                                    </div>
                                </div>
                                <button type="button" onClick={() => setData('privacy_hide_phone', !data.privacy_hide_phone)}
                                    style={{
                                        position: 'relative', flexShrink: 0, width: 48, height: 26, borderRadius: 13, border: 'none',
                                        cursor: 'pointer', transition: 'all 0.25s',
                                        background: data.privacy_hide_phone ? T.orange : T.border,
                                        padding: 0, fontFamily: 'inherit', outline: 'none',
                                    }}>
                                    <div style={{
                                        position: 'absolute', top: 3, left: data.privacy_hide_phone ? 24 : 3,
                                        width: 20, height: 20, borderRadius: '50%', background: '#fff',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                        transition: 'left 0.25s cubic-bezier(0.22,1,0.36,1)',
                                    }} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>Sembunyikan Alamat / Domisili Lengkap</div>
                                    <div style={{ fontSize: 11.5, color: T.muted, marginTop: 3, lineHeight: 1.5 }}>
                                        Perusahaan tidak dapat melihat alamat dan domisili Anda di halaman Bakat Potensial.
                                    </div>
                                </div>
                                <button type="button" onClick={() => setData('privacy_hide_address', !data.privacy_hide_address)}
                                    style={{
                                        position: 'relative', flexShrink: 0, width: 48, height: 26, borderRadius: 13, border: 'none',
                                        cursor: 'pointer', transition: 'all 0.25s',
                                        background: data.privacy_hide_address ? T.orange : T.border,
                                        padding: 0, fontFamily: 'inherit', outline: 'none',
                                    }}>
                                    <div style={{
                                        position: 'absolute', top: 3, left: data.privacy_hide_address ? 24 : 3,
                                        width: 20, height: 20, borderRadius: '50%', background: '#fff',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                        transition: 'left 0.25s cubic-bezier(0.22,1,0.36,1)',
                                    }} />
                                </button>
                            </div>
                        </div>
                    </Section>

                    {/* ── Dokumen Pelengkap ── */}
                    <Section title="Dokumen Pelengkap" icon="📄" delay={0.13}>
                        <FieldLabel>Upload CV (PDF Maksimal 5MB)</FieldLabel>
                        <input type="file" accept="application/pdf" onChange={e => setData('cv_file', e.target.files[0])}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: `2px dashed ${T.border}`, fontSize: 13.5, background: T.bg, boxSizing: 'border-box' }} />
                        <InputError className="mt-2" message={errors.cv_file} />
                    </Section>
                    {/* Tambahkan di bawah Section Dokumen Pelengkap */}
                    <Section title="Foto Profil" icon="👤" delay={0.16}>
                        <FieldLabel>Upload Foto Profil (PNG/JPG Max 2MB)</FieldLabel>
                        <input type="file" accept="image/*" onChange={e => setData('photo_file', e.target.files[0])}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: `2px dashed ${T.border}`, fontSize: 13.5, background: T.bg }} />
                        {data.photo_file && <div style={{ fontSize: 11, color: T.green, marginTop: 4 }}>Foto baru terpilih.</div>}
                    </Section>

                </div>
            </div>

            {/* ── Footer Simpan / Batal ── */}
            <div className="al-footer-sticky" style={{
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                padding: '14px 20px', background: '#ffffffee', backdropFilter: 'blur(6px)', borderRadius: 14,
                border: `1px solid ${T.borderSoft}`, boxShadow: '0 4px 18px rgba(15,31,61,0.12)',
                animation: `cardIn 0.38s 0.16s cubic-bezier(0.22,1,0.36,1) both`,
            }}>
                <p style={{ fontSize: 12, color: T.muted, margin: 0, flex: 1, minWidth: 160 }}>
                    Data profil Anda akan ditampilkan kepada HRD perusahaan saat melamar pekerjaan.
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
                    <button type="submit" disabled={processing || !data.employment_status}
                        style={{
                            height: 42, padding: '0 22px', borderRadius: 9, border: 'none',
                            background: processing || !data.employment_status ? T.muted : T.orange, color: '#fff',
                            fontSize: 13, fontWeight: 700, cursor: processing || !data.employment_status ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: 7,
                            boxShadow: processing || !data.employment_status ? 'none' : '0 2px 8px rgba(249,115,22,0.25)',
                        }}
                        onMouseEnter={e => { if (!processing && data.employment_status) { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.background = processing || !data.employment_status ? T.muted : T.orange; e.currentTarget.style.transform = 'none'; }}
                    >
                        {processing
                            ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}><path strokeLinecap="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>Menyimpan...</>
                            : <><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>Simpan Profil</>
                        }
                    </button>
                </div>
            </div>
        </form>
    );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function EditProfile({ profile, programStudis = [], keahlianMaster = [] }) {
    const { auth, flash } = usePage().props;

    const [isEditing, setIsEditing] = useState(false);
    const [masterSkills, setMasterSkills] = useState(keahlianMaster);

    const { data, setData, post, processing, errors } = useForm({
        nim: profile?.nim || '',
        major: profile?.major || '',
        graduation_year: profile?.graduation_year || '',
        jenjang_pendidikan: profile?.jenjang_pendidikan || '',
        tanggal_lahir: profile?.tanggal_lahir || '',
        phone_number: profile?.phone_number || '',
        address: profile?.address || '',
        detail_address: profile?.detail_address || '',
        experience: profile?.experience || '',
        skills: profile?.skills || [],
        cv_file: null,
        is_open_to_work: profile?.is_open_to_work ?? false,
        employment_status: profile?.employment_status || '',
        privacy_hide_phone: profile?.privacy_hide_phone ?? false,
        privacy_hide_address: profile?.privacy_hide_address ?? false,
    });

    const isComplete = !!(
        profile?.nim &&
        profile?.major &&
        profile?.graduation_year &&
        profile?.tanggal_lahir &&
        profile?.experience !== null &&
        profile?.experience !== '' &&
        profile?.skills?.length > 0 &&
        profile?.employment_status
    );

    const submit = e => {
        e.preventDefault();
        post(route('alumni.profile.update'), {
            preserveScroll: true,
            onSuccess: () => setIsEditing(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Profil Alumni</h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>
                        {isEditing ? 'Edit data diri Anda' : 'Informasi profil profesional Anda'}
                    </p>
                </div>
            }
        >
            <Head title="Profil Alumni — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .al-root * { font-family: 'Plus Jakarta Sans', sans-serif; }
                [data-radix-popper-content-wrapper] { z-index: 99999 !important; }

                @keyframes cardIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.6; transition: 0.2s; }
                input[type="date"]::-webkit-calendar-picker-indicator:hover { opacity: 1; }

                /* ── Responsive grids ── */

                .al-grid-akademik {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    gap: 14px;
                }
                @media (max-width: 600px) {
                    .al-grid-akademik { grid-template-columns: 1fr 1fr; }
                    .al-grid-akademik > div:first-child { grid-column: 1 / -1; }
                }
                @media (max-width: 420px) {
                    .al-grid-akademik { grid-template-columns: 1fr; }
                    .al-grid-akademik > div:first-child { grid-column: auto; }
                }

                .al-grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0;
                }
                @media (max-width: 500px) {
                    .al-grid-2 { grid-template-columns: 1fr; }
                }

                /* ── Two-column layout: konten utama + sidebar ── */
                .al-layout {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .al-main, .al-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    min-width: 0;
                }
                @media (min-width: 960px) {
                    .al-layout {
                        display: grid;
                        grid-template-columns: 1.65fr 1fr;
                        align-items: start;
                        gap: 20px;
                    }
                    .al-sidebar {
                        position: sticky;
                        top: 16px;
                    }
                }

                /* Tombol Simpan/Batal tetap terlihat saat scroll (mengurangi kebutuhan scroll berulang) */
                .al-footer-sticky {
                    position: sticky;
                    bottom: 14px;
                    z-index: 20;
                }
            `}</style>

            <div className="al-root" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 2px' }}>

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
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Profil belum lengkap</div>
                            <div style={{ fontSize: 12, color: '#b45309', marginTop: 3, lineHeight: 1.5 }}>Lengkapi Data Akademik dan Keahlian Anda agar siap melamar pekerjaan.</div>
                        </div>
                    </div>
                )}

                <div style={{
                    background: `linear-gradient(135deg, ${T.navyMid} 0%, ${T.navy} 100%)`,
                    borderRadius: 14, padding: '20px 24px', marginBottom: 16,
                    display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                    boxShadow: '0 4px 20px rgba(15,31,61,0.18)',
                    animation: 'cardIn 0.4s cubic-bezier(0.22,1,0.36,1) both',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(249,115,22,0.1)', pointerEvents: 'none' }} />

                    {profile?.photo_path ? (
                        <img src={`/storage/${profile.photo_path}`} style={{ width: 54, height: 54, borderRadius: 14, objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: 54, height: 54, borderRadius: 14, background: T.orange, color: '#fff', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {(auth?.user?.name || '?').charAt(0).toUpperCase()}
                        </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {auth?.user?.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
                            {data.jenjang_pendidikan ? `${data.jenjang_pendidikan} ` : ''}
                            {data.major || 'Program Studi belum dipilih'}
                            {data.graduation_year ? ` · Lulus ${data.graduation_year}` : ''}
                        </div>
                    </div>

                    {isComplete && !isEditing && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: 'rgba(22,163,74,0.2)', color: '#4ade80', flexShrink: 0, position: 'relative' }}>
                            ✓ Profil Lengkap
                        </span>
                    )}

                    {isEditing ? (
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            style={{
                                height: 36, padding: '0 16px', borderRadius: 8,
                                border: '1.5px solid rgba(255,255,255,0.3)',
                                background: 'rgba(255,255,255,0.1)', color: '#fff',
                                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                fontFamily: 'inherit', flexShrink: 0, position: 'relative',
                                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                        >
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Batal Edit
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            style={{
                                height: 36, padding: '0 16px', borderRadius: 8,
                                border: '1.5px solid rgba(255,255,255,0.3)',
                                background: 'rgba(255,255,255,0.1)', color: '#fff',
                                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                fontFamily: 'inherit', flexShrink: 0, position: 'relative',
                                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                        >
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.25 2.25 0 113.182 3.182L7.5 20.213l-4.5 1.125 1.125-4.5L16.862 4.487z" />
                            </svg>
                            Edit Profil
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <EditMode
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        submit={submit}
                        programStudis={programStudis}
                        masterSkills={masterSkills}
                        setMasterSkills={setMasterSkills}
                        onCancel={() => setIsEditing(false)}
                    />
                ) : (
                    <ViewMode
                        profile={profile}
                        data={data}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
