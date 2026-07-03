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

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

                .login-root {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f0f4f9;
                    padding: 24px;
                }

                .login-card {
                    width: 100%;
                    max-width: 420px;
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 48px 40px 40px;
                    box-shadow: 0 4px 6px -1px rgba(26,53,96,0.06), 0 20px 48px -8px rgba(26,53,96,0.12);
                    animation: cardIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
                }

                @keyframes cardIn {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .login-logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 36px;
                }

                .login-logo-mark {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: #1a3560;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 800;
                    color: #ffffff;
                    letter-spacing: 0.02em;
                    flex-shrink: 0;
                }

                .login-logo-text {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }

                .login-logo-name {
                    font-size: 13px;
                    font-weight: 800;
                    color: #1a3560;
                    letter-spacing: 0.06em;
                    line-height: 1;
                }

                .login-logo-sub {
                    font-size: 10px;
                    font-weight: 500;
                    color: #94a3b8;
                    letter-spacing: 0.04em;
                    line-height: 1;
                }

                .login-divider {
                    width: 1px;
                    height: 28px;
                    background: #e2e8f0;
                    margin: 0 4px;
                }

                .login-heading {
                    font-size: 22px;
                    font-weight: 800;
                    color: #0f1f3d;
                    margin: 0 0 6px;
                    letter-spacing: -0.02em;
                }

                .login-sub {
                    font-size: 13px;
                    color: #94a3b8;
                    margin: 0 0 32px;
                    font-weight: 400;
                }

                .field-group {
                    margin-bottom: 18px;
                }

                .field-label {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 6px;
                }

                .field-label-text {
                    font-size: 12px;
                    font-weight: 700;
                    color: #374151;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                }

                .field-input {
                    width: 100%;
                    height: 44px;
                    padding: 0 14px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    background: #f8fafc;
                    color: #0f1f3d;
                    font-size: 14px;
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
                    box-sizing: border-box;
                }

                .field-input:focus {
                    border-color: #1a3560;
                    background: #ffffff;
                    box-shadow: 0 0 0 3px rgba(26,53,96,0.09);
                }

                .field-input::placeholder {
                    color: #c1ccd6;
                }

                .forgot-link {
                    font-size: 12px;
                    font-weight: 600;
                    color: #f97316;
                    text-decoration: none;
                    transition: opacity 0.15s;
                }
                .forgot-link:hover { opacity: 0.75; }

                .remember-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 24px;
                    margin-top: -4px;
                }

                .remember-label {
                    font-size: 13px;
                    color: #64748b;
                    cursor: pointer;
                    user-select: none;
                }

                .btn-submit {
                    width: 100%;
                    height: 46px;
                    background: #1a3560;
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 700;
                    font-family: inherit;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    letter-spacing: 0.03em;
                    transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
                    box-shadow: 0 2px 8px rgba(26,53,96,0.2);
                }

                .btn-submit:hover:not(:disabled) {
                    background: #0f2444;
                    box-shadow: 0 4px 16px rgba(26,53,96,0.28);
                    transform: translateY(-1px);
                }

                .btn-submit:active:not(:disabled) {
                    transform: translateY(0);
                    box-shadow: 0 2px 6px rgba(26,53,96,0.18);
                }

                .btn-submit:disabled {
                    background: #94a3b8;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .login-footer {
                    margin-top: 28px;
                    padding-top: 20px;
                    border-top: 1px solid #f1f5f9;
                    text-align: center;
                    font-size: 12px;
                    color: #b0bec5;
                }

                .login-footer a {
                    color: #94a3b8;
                    text-decoration: underline;
                    text-underline-offset: 2px;
                    transition: color 0.15s;
                }
                .login-footer a:hover { color: #1a3560; }

                .status-msg {
                    margin-bottom: 20px;
                    padding: 11px 14px;
                    border-radius: 8px;
                    background: #ecfdf5;
                    color: #166534;
                    border: 1px solid #bbf7d0;
                    font-size: 13px;
                }
            `}</style>

            <div className="login-root">
                <div className="login-card">

                    {/* Logo */}
                    <div className="login-logo">
                        <div className="login-logo-mark">M</div>
                        <div className="login-divider" />
                        <div className="login-logo-text">
                            <span className="login-logo-name">Tracer Study</span>
                            <span className="login-logo-sub">STMIK Mardira Indonesia</span>
                        </div>
                    </div>

                    {/* Heading */}
                    <h1 className="login-heading">Selamat Datang</h1>
                    <p className="login-sub">Masuk dengan akun yang telah didaftarkan.</p>

                    {/* Status */}
                    {status && <div className="status-msg">{status}</div>}

                    {/* Form */}
                    <form onSubmit={submit}>
                        <div className="field-group">
                            <div className="field-label">
                                <span className="field-label-text">Email</span>
                            </div>
                            <input
                                id="email"
                                type="email"
                                className="field-input"
                                value={data.email}
                                autoComplete="username"
                                autoFocus
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="nama@mardira.ac.id"
                            />
                            <InputError message={errors.email} className="mt-1.5" />
                        </div>

                        <div className="field-group">
                            <div className="field-label">
                                <span className="field-label-text">Kata Sandi</span>
                                {canResetPassword && (
                                    <Link href={route('password.request')} className="forgot-link">
                                        Lupa kata sandi?
                                    </Link>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                className="field-input"
                                value={data.password}
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                            />
                            <InputError message={errors.password} className="mt-1.5" />
                        </div>

                        <div className="remember-row">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <span className="remember-label">Ingat saya di perangkat ini</span>
                        </div>

                        <button type="submit" className="btn-submit" disabled={processing}>
                            {processing ? 'Memproses...' : 'Masuk ke Tracer Study'}
                        </button>
                    </form>

                    <div className="login-footer">
                        Ingin berkolaborasi dengan kampus?{' '}
                        <a
                            href="https://wa.me/62882001330851?text=Halo,%20saya%20ingin%20mendaftar%20sebagai%20perusahaan%20mitra.%20Mohon%20informasinya%20lebih%20lanjut."
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Hubungi Kami
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
