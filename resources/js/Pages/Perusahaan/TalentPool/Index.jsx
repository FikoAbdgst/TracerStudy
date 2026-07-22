import React, { useState, useRef, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff7ed',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc', bgAlt: '#f0f4f8',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626', redLight: '#fff1f2',
    purple: '#7c3aed', purpleLight: '#f5f3ff',
    yellow: '#eab308',
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'Mencari Kerja':
            return { color: T.green, bg: T.greenLight, label: 'Mencari Kerja' };
        case 'Wirausaha':
            return { color: T.purple, bg: T.purpleLight, label: 'Wirausaha' };
        default:
            return { color: T.green, bg: T.greenLight, label: status || 'Open to Work' };
    }
};

const AlumniCard = ({ alumni }) => {
    const p = alumni;
    const totalSkills = p.skills?.length ?? 0;
    const [saved, setSaved] = useState(p.is_saved ?? false);
    const statusBadge = getStatusBadge(p.employment_status);

    const toggleBookmark = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = !saved;
        setSaved(next);
        axios.post(route('perusahaan.talent-pool.bookmark', p.id)).catch(() => setSaved(!next));
    };

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
                    <button onClick={toggleBookmark} title={saved ? 'Hapus dari Tersimpan' : 'Simpan Kandidat'} style={{
                        width: 32, height: 32, borderRadius: 8, border: 'none',
                        background: saved ? '#fef9c3' : T.bg,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, transition: 'all 0.15s',
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? T.yellow : 'none'} stroke={saved ? T.yellow : T.muted} strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
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
                </div>
            </div>
        </Link>
    );
};

export default function TalentPoolIndex({ alumni, filters, skills, majors, graduationYears, company }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [graduationYear, setGraduationYear] = useState(filters?.graduation_year || '');
    const [major, setMajor] = useState(filters?.major || '');
    const debounceRef = useRef(null);

    const fetchResults = useCallback((params) => {
        router.get(route('perusahaan.talent-pool'), params, { preserveState: true, replace: true });
    }, []);

    const handleSearchChange = (value) => {
        setSearch(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchResults({ search: value, graduation_year: graduationYear, major });
        }, 400);
    };

    const handleGraduationYearChange = (value) => {
        const next = value === '__all__' ? '' : value;
        setGraduationYear(next);
        fetchResults({ search, graduation_year: next, major });
    };

    const handleMajorChange = (value) => {
        const next = value === '__all__' ? '' : value;
        setMajor(next);
        fetchResults({ search, graduation_year: graduationYear, major: next });
    };

    const clearFilters = () => {
        setSearch('');
        setGraduationYear('');
        setMajor('');
        fetchResults({});
    };

    const hasFilters = search || graduationYear || major;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0 }}>Bakat Potensial</h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Temukan kandidat alumni SITAMI yang membuka diri untuk peluang kerja</p>
                </div>
            }
        >
            <Head title="Bakat Potensial — SITAMI" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .tp-root * { font-family: 'Plus Jakarta Sans', sans-serif; }

                @keyframes cardIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

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
                        flex: 1, padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700,
                        textDecoration: 'none', borderBottom: `2.5px solid ${T.orange}`, color: T.orange,
                        background: T.orangeLight,
                    }}>
                        🔍 Semua Kandidat
                    </Link>
                    <Link href={route('perusahaan.talent-pool.saved')} style={{
                        flex: 1, padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600,
                        textDecoration: 'none', borderBottom: `2.5px solid transparent`, color: T.mutedDark,
                    }}>
                        ⭐ Tersimpan
                    </Link>
                </div>

                {/* ── Filter Bar ── */}
                <div style={{
                    background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`,
                    padding: '16px 20px', marginBottom: 18,
                    boxShadow: '0 1px 4px rgba(26,53,96,0.05)',
                }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flex: '1 1 220px', minWidth: 160 }}>
                            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.mutedDark, marginBottom: 4 }}>Cari Nama</label>
                            <input value={search} onChange={e => handleSearchChange(e.target.value)}
                                placeholder="Ketik nama alumni..."
                                style={{
                                    height: 40, padding: '0 14px', border: `1.5px solid ${T.border}`, borderRadius: 10,
                                    background: T.bg, color: T.navy, fontSize: 13, outline: 'none',
                                    width: '100%', boxSizing: 'border-box', fontFamily: 'inherit',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                }}
                                onFocus={e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.08)'; }}
                                onBlur={e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>

                        <div style={{ minWidth: 160, flex: '0 1 180px' }}>
                            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.mutedDark, marginBottom: 4 }}>Tahun Lulus</label>
                            <Select value={graduationYear || '__all__'} onValueChange={handleGraduationYearChange}>
                                <SelectTrigger style={{ height: 40, fontSize: 13, borderRadius: 10, borderColor: T.border, background: T.bg, fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                                    <SelectValue placeholder="Semua Tahun" />
                                </SelectTrigger>
                                <SelectContent
                                    position="popper"
                                    side="bottom"
                                    align="start"
                                    sideOffset={6}
                                    avoidCollisions={true}
                                    collisionPadding={12}
                                    className="z-[9999]"
                                    style={{ borderRadius: 10, border: `1px solid ${T.border}`, boxShadow: '0 8px 24px rgba(15,31,61,0.12)', maxHeight: 260, overflowY: 'auto' }}
                                >
                                    <SelectItem value="__all__" style={{ fontSize: 13, borderRadius: 6, padding: '8px 12px' }}>Semua Tahun</SelectItem>
                                    {(graduationYears || []).map(y => (
                                        <SelectItem key={y} value={String(y)} style={{ fontSize: 13, borderRadius: 6, padding: '8px 12px' }}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div style={{ minWidth: 160, flex: '0 1 180px' }}>
                            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.mutedDark, marginBottom: 4 }}>Program Studi</label>
                            <Select value={major || '__all__'} onValueChange={handleMajorChange}>
                                <SelectTrigger style={{ height: 40, fontSize: 13, borderRadius: 10, borderColor: T.border, background: T.bg, fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                                    <SelectValue placeholder="Semua Prodi" />
                                </SelectTrigger>
                                <SelectContent
                                    position="popper"
                                    side="bottom"
                                    align="start"
                                    sideOffset={6}
                                    avoidCollisions={true}
                                    collisionPadding={12}
                                    className="z-[9999]"
                                    style={{ borderRadius: 10, border: `1px solid ${T.border}`, boxShadow: '0 8px 24px rgba(15,31,61,0.12)', maxHeight: 260, overflowY: 'auto' }}
                                >
                                    <SelectItem value="__all__" style={{ fontSize: 13, borderRadius: 6, padding: '8px 12px' }}>Semua Prodi</SelectItem>
                                    {(majors || []).map(m => (
                                        <SelectItem key={m} value={m} style={{ fontSize: 13, borderRadius: 6, padding: '8px 12px' }}>{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div style={{ display: 'flex', gap: 8, paddingBottom: 1 }}>
                            {hasFilters && (
                                <button onClick={clearFilters}
                                    style={{
                                        height: 40, padding: '0 14px', borderRadius: 10, border: `1.5px solid ${T.border}`,
                                        background: '#fff', color: T.mutedDark, fontSize: 12.5, fontWeight: 600,
                                        cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                                        transition: 'background 0.15s, color 0.15s',
                                    }}
                                    onMouseEnter={e => { e.target.style.background = T.bg; e.target.style.color = T.navy; }}
                                    onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.color = T.mutedDark; }}
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Results ── */}
                {alumni.data?.length > 0 ? (
                    <>
                        <div style={{ fontSize: 12, color: T.muted, marginBottom: 12, fontWeight: 600 }}>
                            Menampilkan {alumni.from}–{alumni.to} dari {alumni.total} kandidat
                        </div>
                        <div className="tp-grid" style={{ animation: 'cardIn 0.35s ease-out both' }}>
                            {alumni.data.map(a => (
                                <div key={a.id} style={{ animation: `cardIn 0.35s ${Math.random() * 0.1}s ease-out both` }}>
                                    <AlumniCard alumni={a} />
                                </div>
                            ))}
                        </div>

                        {/* ── Pagination ── */}
                        {alumni.last_page > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
                                {alumni.links.filter(l => !isNaN(l.label)).map((link, i) => (
                                    <button key={i} onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true })}
                                        disabled={!link.url}
                                        style={{
                                            height: 34, minWidth: 34, padding: '0 10px', borderRadius: 8, border: link.active ? 'none' : `1.5px solid ${T.border}`,
                                            background: link.active ? T.orange : '#fff', color: link.active ? '#fff' : T.navyMid,
                                            fontSize: 12.5, fontWeight: 700, cursor: link.url ? 'pointer' : 'default',
                                            fontFamily: 'inherit', transition: 'all 0.15s',
                                        }}>
                                        {link.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{
                        textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 14,
                        border: `1px solid ${T.borderSoft}`,
                    }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 6 }}>Tidak ada kandidat ditemukan</div>
                        <p style={{ fontSize: 12.5, color: T.mutedDark, lineHeight: 1.6, maxWidth: 360, margin: '0 auto' }}>
                            {hasFilters
                                ? 'Coba ubah kata kunci atau filter pencarian Anda untuk mendapatkan hasil yang lebih luas.'
                                : 'Belum ada alumni yang mengaktifkan status Open to Work. Alumni perlu mengaktifkannya di profil mereka.'}
                        </p>
                        {hasFilters && (
                            <button onClick={clearFilters}
                                style={{
                                    marginTop: 14, height: 38, padding: '0 20px', borderRadius: 9, border: 'none',
                                    background: T.orange, color: '#fff', fontSize: 12.5, fontWeight: 700,
                                    cursor: 'pointer', fontFamily: 'inherit',
                                }}>
                                Reset Filter
                            </button>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
