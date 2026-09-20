import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    red: '#dc2626', redLight: '#fff1f2',
};

export default function AccountLocked({ graduationYear }) {
    const { auth } = usePage().props;

    const logout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0 }}>Akun Alumni Tidak Aktif</h2>
            }
        >
            <Head title="Akun Non-Aktif — SITAMI" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes lockIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
            `}</style>

            <div style={{ maxWidth: 620, margin: '0 auto', animation: 'lockIn 0.4s both' }}>
                <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${T.borderSoft}`, padding: '44px 32px', textAlign: 'center', boxShadow: '0 2px 16px rgba(15,31,61,0.06)' }}>
                    <div style={{ width: 72, height: 72, margin: '0 auto 20px', borderRadius: '50%', background: T.redLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 }}>🔒</div>
                    <h3 style={{ fontSize: 19, fontWeight: 800, color: T.navy, margin: '0 0 8px', letterSpacing: '-0.01em' }}>Akses Portal Alumni Tidak Aktif</h3>
                    <p style={{ fontSize: 14, color: T.mutedDark, lineHeight: 1.65, margin: '0 0 20px' }}>
                        Akun Anda lulus pada tahun <strong style={{ color: T.navy }}>{graduationYear || '-'}</strong> ({new Date().getFullYear() - (graduationYear || new Date().getFullYear())} tahun yang lalu).<br />
                        Hak akses portal alumni berlaku selama <strong style={{ color: T.navy }}>5 tahun</strong> sejak kelulusan. Silakan hubungi admin kampus
                        {auth?.user?.email ? <span> melalui <strong style={{ color: T.navy }}>{auth.user.email}</strong></span> : null} bila Anda merasa ini keliru.
                    </p>
                    <Link href="/" style={{
                        display: 'inline-block', height: 44, padding: '0 26px', borderRadius: 9, lineHeight: '44px',
                        background: T.navy, color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', marginRight: 8,
                    }}>
                        Ke Beranda SITAMI
                    </Link>
                    <button type="button" onClick={logout} style={{
                        height: 44, padding: '0 26px', borderRadius: 9, border: `1.5px solid ${T.border}`,
                        background: '#fff', color: T.mutedDark, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                        Keluar
                    </button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}