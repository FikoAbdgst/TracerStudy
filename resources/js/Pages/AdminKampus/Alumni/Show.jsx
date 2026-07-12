import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626',
};

const EMPLOYMENT_STATUS = {
    'Bekerja': { color: T.navyMid, bg: T.navyLight },
    'Mencari Kerja': { color: T.orange, bg: T.orangeLight },
    'Wiraswasta': { color: T.green, bg: T.greenLight },
    'Tidak Terdeteksi': { color: T.muted, bg: T.bg },
};

function InfoRow({ label, value }) {
    return (
        <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: `1px solid ${T.borderSoft}` }}>
            <div style={{ width: 180, flexShrink: 0, fontSize: 12, fontWeight: 700, color: T.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontSize: 13.5, color: T.navy, fontWeight: 500 }}>{value || '-'}</div>
        </div>
    );
}

function StatusBadge({ status }) {
    const s = EMPLOYMENT_STATUS[status] || EMPLOYMENT_STATUS['Tidak Terdeteksi'];
    return (
        <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20, background: s.bg, color: s.color }}>
            {status || '-'}
        </span>
    );
}

export default function AlumniShow({ alumni, applications, totalApplications }) {
    const statusStyle = EMPLOYMENT_STATUS[alumni.employment_status] || EMPLOYMENT_STATUS['Tidak Terdeteksi'];

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Link href={route('adminkampus.alumni.index')} style={{ width: 34, height: 34, borderRadius: 9, border: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.mutedDark, textDecoration: 'none' }}>
                        ←
                    </Link>
                    <div>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0 }}>Profil Alumni</h2>
                        <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>{alumni.user?.name} — {alumni.nim}</p>
                    </div>
                </div>
            }
        >
            <Head title={`Profil: ${alumni.user?.name}`} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
            `}</style>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, animation: 'cardIn 0.38s both' }}>
                {/* Profile Card */}
                <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, overflow: 'hidden' }}>
                    {/* Avatar Header */}
                    <div style={{ padding: '24px 24px 20px', borderBottom: `1px solid ${T.borderSoft}`, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 60, height: 60, borderRadius: '50%', background: statusStyle.bg, border: `2px solid ${statusStyle.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: statusStyle.color }}>
                            {alumni.user?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: T.navy }}>{alumni.user?.name}</div>
                            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{alumni.nim}</div>
                            <div style={{ marginTop: 6 }}><StatusBadge status={alumni.employment_status} /></div>
                        </div>
                    </div>
                    {/* Info Rows */}
                    <div style={{ padding: '16px 24px 24px' }}>
                        <InfoRow label="Jenjang" value={alumni.jenjang_pendidikan} />
                        <InfoRow label="Program Studi" value={alumni.major} />
                        <InfoRow label="Tahun Lulus" value={alumni.graduation_year} />
                        <InfoRow label="Tanggal Lahir" value={alumni.tanggal_lahir ? new Date(alumni.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : null} />
                        <InfoRow label="Email" value={alumni.user?.email} />
                        {alumni.current_company && <InfoRow label="Perusahaan Saat Ini" value={alumni.current_company} />}
                        {alumni.current_position && <InfoRow label="Jabatan" value={alumni.current_position} />}
                        {alumni.phone_number && <InfoRow label="Telepon" value={alumni.phone_number} />}
                        <InfoRow label="Total Lamaran" value={<span style={{ fontWeight: 800, color: T.navy }}>{totalApplications}</span>} />
                    </div>
                </div>

                {/* Applications */}
                <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.borderSoft}`, background: '#fafbfc' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: T.navy }}>Riwayat Lamaran ({totalApplications})</div>
                    </div>
                    <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {applications.length === 0 ? (
                            <div style={{ padding: '40px 24px', textAlign: 'center', color: T.muted, fontSize: 13 }}>
                                Belum ada riwayat lamaran kerja.
                            </div>
                        ) : applications.map((app, i) => (
                            <div key={app.id} style={{ padding: '16px 24px', borderBottom: `1px solid ${T.borderSoft}`, animation: 'cardIn 0.26s both', animationDelay: `${i * 0.04}s` }}
                                onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                    <div>
                                        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.navy }}>{app.jobPosting?.title || 'Lowongan'}</div>
                                        <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{app.jobPosting?.company?.name || '-'}</div>
                                    </div>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                        background: app.status === 'diterima' ? T.greenLight : app.status === 'ditolak' ? '#fff1f2' : T.orangeLight,
                                        color: app.status === 'diterima' ? T.green : app.status === 'ditolak' ? T.red : T.orange,
                                    }}>
                                        {app.status || 'menunggu'}
                                    </span>
                                </div>
                                <div style={{ fontSize: 11.5, color: T.mutedDark }}>
                                    Dilamar: {new Date(app.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
