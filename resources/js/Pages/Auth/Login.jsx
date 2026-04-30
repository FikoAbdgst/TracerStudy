import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title="Masuk — SITAMI" />

            <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#f4f6fa' }}>
                <div
                    className="w-full max-w-4xl flex rounded-2xl overflow-hidden"
                    style={{ boxShadow: '0 8px 40px rgba(26,53,96,0.13)', minHeight: '520px' }}
                >
                    {/* ===== PANEL KIRI ===== */}
                    <div
                        className="hidden lg:flex flex-col justify-between w-80 flex-shrink-0 p-10"
                        style={{ background: '#1a3560' }}
                    >
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold flex-shrink-0"
                                style={{ background: '#f97316', color: '#fff' }}
                            >
                                M
                            </div>
                            <div>
                                <div className="text-xs font-bold tracking-widest" style={{ color: '#fff', letterSpacing: '0.15em' }}>
                                    STMIK
                                </div>
                                <div className="text-xs font-bold tracking-widest" style={{ color: '#f97316', letterSpacing: '0.15em' }}>
                                    MARDIRA
                                </div>
                            </div>
                        </div>

                        {/* Tengah */}
                        <div>
                            <div
                                className="text-xs font-bold uppercase mb-5"
                                style={{ color: '#f97316', letterSpacing: '0.15em' }}
                            >
                                SITAMI
                            </div>
                            <h1
                                className="text-3xl font-bold leading-snug mb-4"
                                style={{ color: '#ffffff' }}
                            >
                                Sistem Informasi<br />
                                Tracer Study<br />
                                <span style={{ color: '#f97316' }}>Alumni</span>
                            </h1>
                            <p className="text-sm leading-relaxed" style={{ color: '#7fa3cc' }}>
                                Platform terintegrasi untuk memantau perkembangan karir alumni dan meningkatkan kualitas pendidikan vokasi.
                            </p>

                            {/* Garis oranye */}
                            <div
                                className="my-7"
                                style={{ width: '40px', height: '3px', background: '#f97316', borderRadius: '2px' }}
                            />

                            {/* Stats */}
                            <div className="flex gap-8">
                                {[
                                    { num: '1.200+', label: 'Alumni' },
                                    { num: '85%', label: 'Respons' },
                                    { num: '40+', label: 'Mitra' },
                                ].map((s) => (
                                    <div key={s.label}>
                                        <div className="text-xl font-bold" style={{ color: '#fff' }}>{s.num}</div>
                                        <div className="text-xs mt-0.5" style={{ color: '#7fa3cc' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-xs" style={{ color: '#3a5f8a' }}>
                            &copy; {new Date().getFullYear()} STMIK Mardira Indonesia
                        </div>
                    </div>

                    {/* ===== PANEL KANAN — FORM ===== */}
                    <div className="flex-1 flex flex-col justify-center px-10 py-12" style={{ background: '#fff' }}>

                        {/* Mobile logo */}
                        <div className="flex items-center gap-2 mb-8 lg:hidden">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                                style={{ background: '#f97316', color: '#fff' }}
                            >
                                M
                            </div>
                            <span className="font-bold text-xs tracking-widest" style={{ color: '#1a3560' }}>STMIK MARDIRA</span>
                        </div>

                        {/* Header form */}
                        <div className="mb-7">
                            <div
                                className="text-xs font-bold uppercase mb-2"
                                style={{ color: '#f97316', letterSpacing: '0.15em' }}
                            >
                                Portal Masuk
                            </div>
                            <h2 className="text-2xl font-bold mb-1" style={{ color: '#1a3560' }}>
                                Selamat Datang
                            </h2>
                            <p className="text-sm" style={{ color: '#9aa5b4' }}>
                                Masuk dengan akun yang telah didaftarkan administrator.
                            </p>
                        </div>

                        {status && (
                            <div
                                className="mb-5 text-sm px-4 py-3 rounded-lg"
                                style={{ background: '#e8f5ee', color: '#1e6b3c', border: '1px solid #b7dfc8' }}
                            >
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-xs font-bold uppercase mb-1.5"
                                    style={{ color: '#4a5568', letterSpacing: '0.1em' }}
                                >
                                    Alamat Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nama@mardira.ac.id"
                                    className="w-full text-sm outline-none transition-all"
                                    style={{
                                        height: '44px',
                                        padding: '0 14px',
                                        border: '1.5px solid #e2e8f0',
                                        borderRadius: '8px',
                                        background: '#f8fafc',
                                        color: '#1a3560',
                                    }}
                                    onFocus={e => {
                                        e.target.style.borderColor = '#1a3560';
                                        e.target.style.background = '#fff';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.08)';
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.background = '#f8fafc';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <InputError message={errors.email} className="mt-1.5" />
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label
                                        htmlFor="password"
                                        className="block text-xs font-bold uppercase"
                                        style={{ color: '#4a5568', letterSpacing: '0.1em' }}
                                    >
                                        Kata Sandi
                                    </label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs transition-colors hover:underline"
                                            style={{ color: '#f97316' }}
                                        >
                                            Lupa kata sandi?
                                        </Link>
                                    )}
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full text-sm outline-none transition-all"
                                    style={{
                                        height: '44px',
                                        padding: '0 14px',
                                        border: '1.5px solid #e2e8f0',
                                        borderRadius: '8px',
                                        background: '#f8fafc',
                                        color: '#1a3560',
                                    }}
                                    onFocus={e => {
                                        e.target.style.borderColor = '#1a3560';
                                        e.target.style.background = '#fff';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.08)';
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.background = '#f8fafc';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <InputError message={errors.password} className="mt-1.5" />
                            </div>

                            {/* Remember */}
                            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="text-sm" style={{ color: '#718096' }}>Ingat saya di perangkat ini</span>
                            </label>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full text-sm font-bold tracking-wide transition-all rounded-lg"
                                style={{
                                    height: '44px',
                                    background: processing ? '#f0a070' : '#f97316',
                                    color: '#fff',
                                    border: 'none',
                                    cursor: processing ? 'not-allowed' : 'pointer',
                                    letterSpacing: '0.05em',
                                }}
                                onMouseEnter={e => { if (!processing) e.target.style.background = '#ea6c0a'; }}
                                onMouseLeave={e => { if (!processing) e.target.style.background = '#f97316'; }}
                            >
                                {processing ? 'Memproses...' : 'Masuk ke SITAMI'}
                            </button>
                        </form>

                        <p className="mt-7 text-center text-xs" style={{ color: '#cbd5e0' }}>
                            Butuh bantuan?{' '}
                            <a
                                href="mailto:admin@mardira.ac.id"
                                className="underline underline-offset-2 transition-colors"
                                style={{ color: '#9aa5b4' }}
                            >
                                Hubungi administrator kampus
                            </a>
                        </p>
                    </div>
                </div>
            </div >
        </>
    );
}
