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

            <div className="min-h-screen flex" style={{ background: '#f5f4f1' }}>

                {/* ===== PANEL KIRI — BRANDING ===== */}
                <div
                    className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-12"
                    style={{ background: '#1c1c1c' }}
                >
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{ background: '#e8e0d0', color: '#1c1c1c' }}
                        >
                            S
                        </div>
                        <span className="font-semibold tracking-widest text-xs uppercase" style={{ color: '#e8e0d0', letterSpacing: '0.2em' }}>
                            SITAMI
                        </span>
                    </div>

                    {/* Tengah */}
                    <div>
                        <div
                            className="text-xs uppercase tracking-widest mb-6 font-medium"
                            style={{ color: '#6b6b6b', letterSpacing: '0.15em' }}
                        >
                            Sistem Informasi Tracer Study Alumni
                        </div>
                        <h1
                            className="text-4xl font-bold leading-tight mb-6"
                            style={{ color: '#f0ece4', fontFamily: 'Georgia, serif' }}
                        >
                            Pantau karir<br />alumni secara<br />terukur.
                        </h1>
                        <p className="text-sm leading-relaxed" style={{ color: '#888', maxWidth: '280px' }}>
                            Platform terintegrasi untuk memantau perkembangan karir alumni dan meningkatkan kualitas pendidikan vokasi.
                        </p>

                        {/* Stats */}
                        <div className="flex gap-8 mt-10">
                            {[
                                { num: '1.200+', label: 'Alumni' },
                                { num: '85%', label: 'Respons' },
                                { num: '40+', label: 'Mitra' },
                            ].map((s) => (
                                <div key={s.label}>
                                    <div className="text-xl font-bold" style={{ color: '#e8e0d0' }}>{s.num}</div>
                                    <div className="text-xs mt-0.5" style={{ color: '#6b6b6b' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-xs" style={{ color: '#444' }}>
                        &copy; {new Date().getFullYear()} SITAMI. Hak cipta dilindungi.
                    </div>
                </div>

                {/* ===== PANEL KANAN — FORM ===== */}
                <div className="flex-1 flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-sm">

                        {/* Mobile logo */}
                        <div className="flex items-center gap-2 mb-10 lg:hidden">
                            <div
                                className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold"
                                style={{ background: '#1c1c1c', color: '#e8e0d0' }}
                            >
                                S
                            </div>
                            <span className="font-semibold tracking-widest text-xs" style={{ color: '#1c1c1c' }}>SITAMI</span>
                        </div>

                        <h2
                            className="text-2xl font-bold mb-1"
                            style={{ color: '#1c1c1c', fontFamily: 'Georgia, serif' }}
                        >
                            Selamat datang
                        </h2>
                        <p className="text-sm mb-8" style={{ color: '#999' }}>
                            Masuk dengan akun yang telah didaftarkan.
                        </p>

                        {status && (
                            <div className="mb-5 text-sm px-4 py-3 rounded" style={{ background: '#d4edd9', color: '#2d6a3f' }}>
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                                    style={{ color: '#555' }}
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nama@institusi.ac.id"
                                    className="w-full px-4 py-3 text-sm outline-none transition-all"
                                    style={{
                                        background: '#fff',
                                        border: '1px solid #ddd8d0',
                                        borderRadius: '6px',
                                        color: '#1c1c1c',
                                    }}
                                    onFocus={e => {
                                        e.target.style.borderColor = '#1c1c1c';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(28,28,28,0.06)';
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor = '#ddd8d0';
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
                                        className="block text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: '#555' }}
                                    >
                                        Kata Sandi
                                    </label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs transition-colors"
                                            style={{ color: '#999' }}
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
                                    className="w-full px-4 py-3 text-sm outline-none transition-all"
                                    style={{
                                        background: '#fff',
                                        border: '1px solid #ddd8d0',
                                        borderRadius: '6px',
                                        color: '#1c1c1c',
                                    }}
                                    onFocus={e => {
                                        e.target.style.borderColor = '#1c1c1c';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(28,28,28,0.06)';
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor = '#ddd8d0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <InputError message={errors.password} className="mt-1.5" />
                            </div>

                            {/* Remember */}
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="text-sm" style={{ color: '#777' }}>Ingat saya</span>
                            </label>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 text-sm font-semibold tracking-wide transition-opacity rounded"
                                style={{
                                    background: '#1c1c1c',
                                    color: '#e8e0d0',
                                    opacity: processing ? 0.6 : 1,
                                    cursor: processing ? 'not-allowed' : 'pointer',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                {processing ? 'Memproses...' : 'Masuk ke Sistem'}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-xs" style={{ color: '#bbb' }}>
                            Masalah akses?{' '}
                            <a href="mailto:admin@sitami.ac.id" style={{ color: '#888' }} className="underline underline-offset-2">
                                Hubungi administrator
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
