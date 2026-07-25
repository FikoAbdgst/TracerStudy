import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff7ed',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626',
    purple: '#7c3aed', purpleLight: '#f5f3ff',
    yellow: '#eab308', yellowLight: '#fef9c3',
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'Mencari Kerja':
            return { color: T.green, bg: T.greenLight, label: 'Mencari Kerja' };
        case 'Wiraswasta':
            return { color: T.purple, bg: T.purpleLight, label: 'Wiraswasta' };
        case 'Lanjutkan Pendidikan':
            return { color: T.purple, bg: T.purpleLight, label: 'Lanjutkan Pendidikan' };
        default:
            return { color: T.green, bg: T.greenLight, label: status || 'Open to Work' };
    }
};

const SavedCard = ({ alumni }) => {
    const p = alumni;
    const totalSkills = p.skills?.length ?? 0;
    const [saved, setSaved] = useState(true);
    const statusBadge = getStatusBadge(p.employment_status);

    const removeBookmark = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved(false);
        axios.post(route('perusahaan.talent-pool.bookmark', p.id)).catch(() => setSaved(true));
    };

    if (!saved) return null;

    return (
        <Link href={route('perusahaan.talent-pool.show', p.id)} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
                background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`,
                padding: '20px', transition: 'all 0.2s', cursor: 'pointer', height: '100%',
                boxShadow: '0 1px 4px rgba(26,53,96,0.05)',
                display: 'flex', flexDirection: 'column', gap: 12, position: 'relative',
            }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,53,96,0.12)'; e.currentTarget.style.borderColor = T.orange; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(26,53,96,0.05)'; e.currentTarget.style.borderColor = T.borderSoft; e.currentTarget.style.transform = 'none'; }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: `linear-gradient(135deg, ${T.navyMid}, ${T.navy})`,
                        color: '#fff', fontSize: 17, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        {(p.user?.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.user?.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: T.mutedDark, marginTop: 2 }}>
                            {p.major || '—'}{p.jenjang_pendidikan ? ` (${p.jenjang_pendidikan})` : ''}
                        </div>
                    </div>
                    <button onClick={removeBookmark} title="Hapus dari Tersimpan" style={{
                        width: 32, height: 32, borderRadius: 8, border: 'none',
                        background: T.redLight, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, transition: 'all 0.15s',
                    }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={T.red} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div style={{ fontSize: 11.5, color: T.muted, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span>🎓 {p.graduation_year || '—'}</span>
                    <span>💼 {p.experience !== null ? `${p.experience} thn` : '—'}</span>
                    {p.tanggal_lahir && <span>📅 {new Date(p.tanggal_lahir).toLocaleDateString('id-ID')}</span>}
                </div>

                {totalSkills > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {p.skills.slice(0, 4).map(s => (
                            <span key={s} style={{
                                fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 12,
                                background: T.navyLight, color: T.navyMid,
                            }}>
                                {s}
                            </span>
                        ))}
                        {totalSkills > 4 && (
                            <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: T.borderSoft, color: T.mutedDark }}>
                                +{totalSkills - 4}
                            </span>
                        )}
                    </div>
                )}

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, paddingTop: 8, borderTop: `1px solid ${T.borderSoft}` }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusBadge.color }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: statusBadge.color }}>{statusBadge.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10.5, fontWeight: 600, color: T.yellow, background: T.yellowLight, padding: '2px 8px', borderRadius: 12 }}>
                        ⭐ Tersimpan
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default function TalentPoolSaved({ alumni, filters, company }) {
    const [search, setSearch] = useState(filters?.search || '');

    const applySearch = () => {
        router.get(route('perusahaan.talent-pool.saved'), { search }, { preserveState: true, replace: true });
    };

    const clearSearch = () => {
        setSearch('');
        router.get(route('perusahaan.talent-pool.saved'), {}, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0 }}>Kandidat Tersimpan</h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Daftar alumni yang Anda simpan untuk direkrut nanti</p>
                </div>
            }
        >
            <Head title="Kandidat Tersimpan — SITAMI" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .tp-root * { font-family: 'Plus Jakarta Sans', sans-serif; }

                @keyframes cardIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

                .tp-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 16px;
                }
                @media (max-width: 640px) {
                    .tp-grid { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="tp-root" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2px' }}>

                {/* ── Tab Navigasi ── */}
                <div style={{ display: 'flex', gap: 0, marginBottom: 18, background: '#fff', borderRadius: 12, border: `1px solid ${T.borderSoft}`, overflow: 'hidden' }}>
                    <Link href={route('perusahaan.talent-pool')} style={{
                        flex: 1, padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600,
                        textDecoration: 'none', borderBottom: `2.5px solid transparent`, color: T.mutedDark,
                    }}>
                        🔍 Semua Kandidat
                    </Link>
                    <Link href={route('perusahaan.talent-pool.saved')} style={{
                        flex: 1, padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700,
                        textDecoration: 'none', borderBottom: `2.5px solid ${T.orange}`, color: T.orange,
                        background: T.orangeLight,
                    }}>
                        ⭐ Tersimpan
                    </Link>
                </div>

                {/* ── Search Bar ── */}
                <div style={{
                    background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`,
                    padding: '14px 18px', marginBottom: 18,
                }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.mutedDark, marginBottom: 4 }}>Cari di Tersimpan</label>
                            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applySearch()}
                                placeholder="Ketik nama alumni..."
                                style={{
                                    height: 38, padding: '0 12px', border: `1.5px solid ${T.border}`, borderRadius: 9,
                                    background: T.bg, color: T.navy, fontSize: 13, outline: 'none',
                                    width: '100%', boxSizing: 'border-box', fontFamily: 'inherit',
                                }}
                                onFocus={e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; }}
                                onBlur={e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; }}
                            />
                        </div>
                        <button onClick={applySearch} style={{
                            height: 38, padding: '0 16px', borderRadius: 9, border: 'none',
                            background: T.orange, color: '#fff', fontSize: 12, fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                        }}>
                            Cari
                        </button>
                        {search && (
                            <button onClick={clearSearch} style={{
                                height: 38, padding: '0 12px', borderRadius: 9, border: `1.5px solid ${T.border}`,
                                background: '#fff', color: T.mutedDark, fontSize: 12, fontWeight: 600,
                                cursor: 'pointer', fontFamily: 'inherit',
                            }}>
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Results ── */}
                {alumni.data?.length > 0 ? (
                    <>
                        <div style={{ fontSize: 12, color: T.muted, marginBottom: 12, fontWeight: 600 }}>
                            Menampilkan {alumni.from}–{alumni.to} dari {alumni.total} kandidat tersimpan
                        </div>
                        <div className="tp-grid">
                            {alumni.data.map(a => (
                                <SavedCard key={a.id} alumni={a} />
                            ))}
                        </div>

                        {alumni.last_page > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
                                {alumni.links.filter(l => !isNaN(l.label)).map((link, i) => (
                                    <button key={i} onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true })}
                                        disabled={!link.url}
                                        style={{
                                            height: 34, minWidth: 34, padding: '0 10px', borderRadius: 8,
                                            border: link.active ? 'none' : `1.5px solid ${T.border}`,
                                            background: link.active ? T.orange : '#fff',
                                            color: link.active ? '#fff' : T.navyMid,
                                            fontSize: 12.5, fontWeight: 700, cursor: link.url ? 'pointer' : 'default',
                                            fontFamily: 'inherit',
                                        }}>
                                        {link.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}` }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 6 }}>
                            {search ? 'Tidak ada hasil' : 'Belum Ada Kandidat Tersimpan'}
                        </div>
                        <p style={{ fontSize: 12.5, color: T.mutedDark, lineHeight: 1.6, maxWidth: 380, margin: '0 auto' }}>
                            {search
                                ? 'Tidak ada kandidat tersimpan yang cocok dengan pencarian Anda.'
                                : 'Klik icon ⭐ pada kartu kandidat di halaman Bakat Potensial untuk menyimpan kandidat favorit Anda.'}
                        </p>
                        {!search && (
                            <Link href={route('perusahaan.talent-pool')} style={{
                                display: 'inline-flex', marginTop: 16, height: 38, padding: '0 20px', borderRadius: 9,
                                background: T.orange, color: '#fff', fontSize: 12.5, fontWeight: 700,
                                textDecoration: 'none', alignItems: 'center',
                            }}>
                                🔍 Cari Kandidat
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
