import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import InputError from '@/Components/InputError';

const fieldStyle = {
    height: '44px',
    padding: '0 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    background: '#f8fafc',
    color: '#1a3560',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    transition: 'all 0.15s',
};

const textareaStyle = {
    padding: '10px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    background: '#f8fafc',
    color: '#1a3560',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    transition: 'all 0.15s',
    resize: 'vertical',
};

const onFocus = (e) => {
    e.target.style.borderColor = '#1a3560';
    e.target.style.background = '#fff';
    e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.08)';
};
const onBlur = (e) => {
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.background = '#f8fafc';
    e.target.style.boxShadow = 'none';
};

const FieldLabel = ({ htmlFor, children, required }) => (
    <label
        htmlFor={htmlFor}
        className="block text-xs font-bold uppercase mb-1.5"
        style={{ color: '#4a5568', letterSpacing: '0.08em' }}
    >
        {children}
        {required && <span style={{ color: '#e53e3e', marginLeft: '3px' }}>*</span>}
    </label>
);

export default function EditProfile({ company, industries }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        name: company?.name || '',
        industry: company?.industry || '',
        description: company?.description || '',
        address: company?.address || '',
        website: company?.website || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('perusahaan.profile.update'));
    };

    const isComplete = company?.name && company?.industry;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-lg font-bold" style={{ color: '#1a3560' }}>Profil Perusahaan</h2>
                    <p className="text-xs mt-0.5" style={{ color: '#a0aec0' }}>
                        Kelola informasi dan identitas perusahaan Anda
                    </p>
                </div>
            }
        >
            <Head title="Profil Perusahaan — SITAMI" />

            <div className="max-w-3xl mx-auto">

                {/* Status Banner */}
                {!isComplete ? (
                    <div
                        className="flex items-start gap-3 px-5 py-4 rounded-xl mb-5"
                        style={{ background: '#fffbeb', border: '1px solid #fed7aa' }}
                    >
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#f97316' }}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        <div>
                            <div className="text-sm font-semibold" style={{ color: '#92400e' }}>
                                Profil belum lengkap
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: '#b45309' }}>
                                Lengkapi nama perusahaan dan sektor industri agar lowongan Anda dapat tampil
                                di bursa kerja alumni.
                            </div>
                        </div>
                    </div>
                ) : (
                    flash?.message && (
                        <div
                            className="flex items-center gap-3 px-5 py-4 rounded-xl mb-5"
                            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
                        >
                            <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#16a34a' }}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium" style={{ color: '#15803d' }}>
                                {flash.message}
                            </span>
                        </div>
                    )
                )}

                {/* Main Card */}
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e8edf5' }}>

                    {/* Card Header */}
                    <div
                        className="flex items-center gap-4 px-6 py-5"
                        style={{ background: '#1a3560', borderBottom: '1px solid #1e3d6e' }}
                    >
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                            style={{ background: '#f97316', color: '#fff' }}
                        >
                            {(data.name || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-bold text-base" style={{ color: '#fff' }}>
                                {data.name || 'Nama Perusahaan Belum Diisi'}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: '#7fa3cc' }}>
                                {data.industry || 'Sektor industri belum dipilih'} · Mitra SITAMI
                            </div>
                        </div>
                        {isComplete && (
                            <div
                                className="ml-auto text-xs font-bold px-3 py-1 rounded-full flex-shrink-0"
                                style={{ background: 'rgba(249,115,22,0.2)', color: '#f97316' }}
                            >
                                ✓ Terverifikasi
                            </div>
                        )}
                    </div>

                    {/* Form */}
                    <div className="bg-white px-6 py-6">
                        <form onSubmit={submit} className="space-y-5">

                            {/* Nama & Industri */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <FieldLabel htmlFor="name" required>Nama Perusahaan</FieldLabel>
                                    <input
                                        id="name"
                                        style={fieldStyle}
                                        placeholder="PT. Inovasi Dinamika Solusi"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        onFocus={onFocus}
                                        onBlur={onBlur}
                                    />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                <div>
                                    <FieldLabel htmlFor="industry" required>Sektor Industri</FieldLabel>
                                    <Select
                                        value={data.industry}
                                        onValueChange={(v) => setData('industry', v)}
                                    >
                                        <SelectTrigger
                                            id="industry"
                                            style={{ height: '44px', borderRadius: '8px', fontSize: '14px' }}
                                        >
                                            <SelectValue placeholder="Pilih sektor industri..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {industries.map((ind) => (
                                                <SelectItem key={ind.id} value={ind.name}>
                                                    {ind.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.industry} className="mt-1" />
                                </div>
                            </div>

                            {/* Website */}
                            <div>
                                <FieldLabel htmlFor="website">Situs Web</FieldLabel>
                                <div className="relative">
                                    <svg
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                                        style={{ color: '#a0aec0' }}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
                                    </svg>
                                    <input
                                        id="website"
                                        type="url"
                                        style={{ ...fieldStyle, paddingLeft: '36px' }}
                                        placeholder="https://contohperusahaan.com"
                                        value={data.website}
                                        onChange={e => setData('website', e.target.value)}
                                        onFocus={onFocus}
                                        onBlur={onBlur}
                                    />
                                </div>
                                <InputError message={errors.website} className="mt-1" />
                            </div>

                            {/* Alamat */}
                            <div>
                                <FieldLabel htmlFor="address">Alamat Lengkap</FieldLabel>
                                <textarea
                                    id="address"
                                    style={{ ...textareaStyle, minHeight: '80px' }}
                                    rows={3}
                                    placeholder="Jl. Raya Contoh No. 123, Kota, Provinsi..."
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    onFocus={onFocus}
                                    onBlur={onBlur}
                                />
                                <InputError message={errors.address} className="mt-1" />
                            </div>

                            {/* Deskripsi */}
                            <div>
                                <FieldLabel htmlFor="description">Deskripsi Perusahaan</FieldLabel>
                                <textarea
                                    id="description"
                                    style={{ ...textareaStyle, minHeight: '110px' }}
                                    rows={5}
                                    placeholder="Ceritakan visi, misi, atau budaya perusahaan Anda secara singkat..."
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    onFocus={onFocus}
                                    onBlur={onBlur}
                                />
                                <InputError message={errors.description} className="mt-1" />
                            </div>

                            {/* Divider */}
                            <div style={{ borderTop: '1px solid #e8edf5', paddingTop: '16px' }}>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs" style={{ color: '#a0aec0' }}>
                                        Data yang disimpan akan ditampilkan kepada alumni di halaman bursa kerja.
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex items-center gap-2 px-6 text-sm font-semibold rounded-lg transition-all"
                                        style={{
                                            height: '42px',
                                            background: processing ? '#f0a070' : '#f97316',
                                            color: '#fff',
                                            border: 'none',
                                            cursor: processing ? 'not-allowed' : 'pointer',
                                            flexShrink: 0,
                                        }}
                                        onMouseEnter={e => { if (!processing) e.currentTarget.style.background = '#ea6c0a'; }}
                                        onMouseLeave={e => { if (!processing) e.currentTarget.style.background = '#f97316'; }}
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                </svg>
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                                                </svg>
                                                Simpan Profil
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
