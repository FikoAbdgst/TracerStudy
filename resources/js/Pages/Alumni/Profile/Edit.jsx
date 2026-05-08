import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import InputError from '@/Components/InputError';

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
const textareaBase = {
    padding: '10px 13px', border: `1.5px solid ${T.border}`, borderRadius: 9,
    background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none',
    width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical',
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

export default function EditProfile({ profile, programStudis = [], keahlianMaster = [] }) {
    // TAMBAHKAN 'auth' DISINI UNTUK MENGAMBIL DATA GLOBAL USER YANG SEDANG LOGIN
    const { auth, flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        nim: profile?.nim || '',
        major: profile?.major || '',
        graduation_year: profile?.graduation_year || '',
        skills: Array.isArray(profile?.skills) ? profile.skills : (profile?.skills ? [profile.skills] : []),
        phone_number: profile?.phone_number || '',
        address: profile?.address || '',
    });

    const submit = e => { e.preventDefault(); post(route('alumni.profile.update')); };

    const isComplete = profile?.nim && profile?.major && profile?.graduation_year;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Profil Alumni</h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Lengkapi data diri Anda untuk melamar pekerjaan</p>
                </div>
            }
        >
            <Head title="Profil Alumni — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .al-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes fadeIn { from{opacity:0} to{opacity:1} }
                @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            `}</style>

            <div className="al-root" style={{ maxWidth: 720, margin: '0 auto' }}>

                {/* Flash success */}
                {flash?.message && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, marginBottom: 18, background: T.greenLight, border: '1px solid #bbf7d0', animation: 'fadeIn 0.3s both' }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={T.green} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>{flash.message}</span>
                    </div>
                )}

                {/* Profile incomplete warning */}
                {!isComplete && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', borderRadius: 12, marginBottom: 20, background: '#fffbeb', border: '1px solid #fed7aa', animation: 'fadeIn 0.3s both' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: T.orangeLight, color: T.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Profil belum lengkap</div>
                            <div style={{ fontSize: 12, color: '#b45309', marginTop: 3, lineHeight: 1.5 }}>Lengkapi NIM, Program Studi, dan Tahun Lulus agar dapat melamar pekerjaan di SITAMI.</div>
                        </div>
                    </div>
                )}

                {/* Identity banner */}
                <div style={{
                    background: `linear-gradient(135deg, ${T.navyMid} 0%, ${T.navy} 100%)`,
                    borderRadius: 14, padding: '20px 24px', marginBottom: 16,
                    display: 'flex', alignItems: 'center', gap: 14,
                    boxShadow: '0 4px 20px rgba(15,31,61,0.18)',
                    animation: 'cardIn 0.4s cubic-bezier(0.22,1,0.36,1) both',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(249,115,22,0.1)' }} />
                    <div style={{ width: 54, height: 54, borderRadius: 14, background: T.orange, color: '#fff', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(249,115,22,0.35)' }}>
                        {/* PERBAIKAN: Menampilkan Huruf Pertama Nama User (Bukan NIM) */}
                        {(auth?.user?.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                        {/* PERBAIKAN: Memanggil nama langsung dari auth.user */}
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{auth?.user?.name}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
                            {data.major || 'Program Studi belum dipilih'} {data.graduation_year ? `· Lulus ${data.graduation_year}` : ''}
                        </div>
                    </div>
                    {isComplete && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: 'rgba(22,163,74,0.2)', color: '#4ade80', flexShrink: 0, position: 'relative' }}>
                            ✓ Profil Lengkap
                        </span>
                    )}
                </div>

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {/* Data Akademik */}
                    <Section title="Data Akademik" icon="🎓" delay={0.06}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div>
                                <FieldLabel required>NIM</FieldLabel>
                                <input style={fieldBase} placeholder="Misal: 12345678" value={data.nim}
                                    onChange={e => setData('nim', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                                <InputError message={errors.nim} className="mt-1.5" />
                            </div>
                            <div>
                                <FieldLabel required>Tahun Lulus</FieldLabel>
                                <input type="number" style={fieldBase} placeholder="Misal: 2024" value={data.graduation_year}
                                    onChange={e => setData('graduation_year', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                                <InputError message={errors.graduation_year} className="mt-1.5" />
                            </div>
                        </div>
                        <div style={{ marginTop: 14 }}>
                            <FieldLabel required>Program Studi</FieldLabel>
                            <Select value={data.major} onValueChange={v => setData('major', v)}>
                                <SelectTrigger className="focus:ring-0 focus:ring-offset-0" style={{ height: 42, borderRadius: 9, border: `1.5px solid ${T.border}`, background: T.bg, fontSize: 13.5 }}>
                                    <SelectValue placeholder="Pilih Program Studi..." />
                                </SelectTrigger>
                                <SelectContent position="popper" sideOffset={4} className="z-[500] rounded-xl overflow-hidden border border-gray-200 shadow-xl" style={{ background: '#ffffff', minWidth: 'var(--radix-select-trigger-width)' }}>
                                    {programStudis?.map(prodi => (
                                        <SelectItem key={prodi.id} value={prodi.name}
                                            className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50"
                                            style={{ color: '#1e293b', background: 'transparent' }}>
                                            {prodi.name} {prodi.parameter_value ? `(${prodi.parameter_value})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.major} className="mt-1.5" />
                        </div>
                    </Section>

                    {/* Kontak */}
                    <Section title="Informasi Kontak" icon="📱" delay={0.09}>
                        <div>
                            <FieldLabel>Nomor WhatsApp / HP</FieldLabel>
                            <div style={{ position: 'relative' }}>
                                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#b0bec5' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                                <input style={{ ...fieldBase, paddingLeft: 34 }} placeholder="Misal: 08123456789" value={data.phone_number}
                                    onChange={e => setData('phone_number', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                            </div>
                            <InputError message={errors.phone_number} className="mt-1.5" />
                        </div>
                        <div style={{ marginTop: 14 }}>
                            <FieldLabel>Domisili Saat Ini</FieldLabel>
                            <textarea style={{ ...textareaBase, minHeight: 72 }} rows={2}
                                placeholder="Misal: Bandung, Jawa Barat" value={data.address}
                                onChange={e => setData('address', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                            <InputError message={errors.address} className="mt-1.5" />
                        </div>
                    </Section>

                    {/* Skills Selection (Master Data Based) */}
                    <Section title="Keahlian & Skills" icon="⚡" delay={0.12}>
                        <FieldLabel>Pilih Keahlian Utama (Klik untuk memilih)</FieldLabel>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '14px', background: T.bg, border: `1px solid ${T.borderSoft}`, borderRadius: 10 }}>
                            {(!keahlianMaster || keahlianMaster.length === 0) ? (
                                <span style={{ fontSize: 13, color: T.muted }}>Belum ada pilihan keahlian dari sistem kampus.</span>
                            ) : (
                                keahlianMaster?.map(skill => {
                                    const skillsArray = Array.isArray(data.skills) ? data.skills : [];
                                    const isSelected = skillsArray.includes(skill.name);

                                    return (
                                        <button
                                            key={skill.id} type="button"
                                            onClick={() => {
                                                if (isSelected) setData('skills', skillsArray.filter(s => s !== skill.name));
                                                else setData('skills', [...skillsArray, skill.name]);
                                            }}
                                            style={{
                                                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                                border: `1.5px solid ${isSelected ? T.orange : T.border}`,
                                                background: isSelected ? T.orangeLight : '#fff',
                                                color: isSelected ? T.orange : T.mutedDark,
                                            }}
                                        >
                                            {isSelected ? '✓ ' : '+ '}{skill.name}
                                        </button>
                                    )
                                })
                            )}
                        </div>
                        <InputError className="mt-2" message={errors.skills} />
                    </Section>

                    {/* Submit */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, animation: `cardIn 0.38s 0.15s cubic-bezier(0.22,1,0.36,1) both` }}>
                        <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>Data profil Anda akan ditampilkan kepada HRD perusahaan saat melamar pekerjaan.</p>
                        <button type="submit" disabled={processing} style={{
                            height: 42, padding: '0 22px', borderRadius: 9, border: 'none',
                            background: processing ? T.muted : T.orange, color: '#fff',
                            fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', transition: 'all 0.15s', flexShrink: 0,
                            display: 'flex', alignItems: 'center', gap: 7,
                            boxShadow: processing ? 'none' : '0 2px 8px rgba(249,115,22,0.25)',
                        }}
                            onMouseEnter={e => { if (!processing) { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                            onMouseLeave={e => { e.currentTarget.style.background = processing ? T.muted : T.orange; e.currentTarget.style.transform = 'none'; }}
                        >
                            {processing
                                ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}><path strokeLinecap="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>Menyimpan...</>
                                : <><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>Simpan Profil</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
