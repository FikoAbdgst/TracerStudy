import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const TOKEN = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    success: '#10b981', successLight: '#ecfdf5',
    red: '#dc2626', redLight: '#fff1f2',
};

const EMPLOYMENT_STATUS = {
    'Bekerja': { color: TOKEN.navyMid, bg: TOKEN.navyLight },
    'Mencari Kerja': { color: TOKEN.orange, bg: TOKEN.orangeLight },
    'Wiraswasta': { color: '#16a34a', bg: '#f0fdf4' },
    'Lanjutkan Pendidikan': { color: '#7c3aed', bg: '#f5f3ff' },
    'Tidak Terdeteksi': { color: TOKEN.muted, bg: TOKEN.bg },
};

function EmptyState({ message }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '52px 24px', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: TOKEN.navyLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={TOKEN.navyMid} strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </div>
            <p style={{ fontSize: 13, color: TOKEN.muted, margin: 0, fontWeight: 500 }}>{message}</p>
        </div>
    );
}

export default function AlumniIndex({ alumnis, prodiList, yearList, filters }) {
    const { flash } = usePage().props;

    const [search, setSearch] = useState(filters?.search || '');
    const [prodi, setProdi] = useState(filters?.major || '');
    const [statusFilter, setStatusFilter] = useState(filters?.employment_status || '');
    const [yearFilter, setYearFilter] = useState(filters?.graduation_year || '');
    const [modalImportOpen, setModalImportOpen] = useState(false);
    const [modalDuplicateOpen, setModalDuplicateOpen] = useState(false);
    const [showDuplicateDetails, setShowDuplicateDetails] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);

    useEffect(() => {
        if (flash?.duplicates && flash.duplicates.length > 0) {
            setModalDuplicateOpen(true);
            setShowDuplicateDetails(false);
        }
    }, [flash]);

    const importForm = useForm({ file: null });

    const applyFilter = (overrides = {}) => {
        const params = {
            search: overrides.search !== undefined ? overrides.search : search,
            major: overrides.major !== undefined ? overrides.major : prodi,
            employment_status: overrides.employment_status !== undefined ? overrides.employment_status : statusFilter,
            graduation_year: overrides.graduation_year !== undefined ? overrides.graduation_year : yearFilter,
        };
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        router.get(route('adminkampus.alumni.index'), params, { preserveState: true, replace: true });
    };

    let debounceRef = null;
    const handleSearch = (val) => {
        setSearch(val);
        clearTimeout(debounceRef);
        debounceRef = setTimeout(() => applyFilter({ search: val }), 400);
    };

    const handleProdiChange = (val) => {
        setProdi(val);
        applyFilter({ major: val });
    };

    const handleStatusChange = (val) => {
        setStatusFilter(val);
        applyFilter({ employment_status: val });
    };

    const handleYearChange = (val) => {
        setYearFilter(val);
        applyFilter({ graduation_year: val });
    };

    const clearFilters = () => {
        setSearch('');
        setProdi('');
        setStatusFilter('');
        setYearFilter('');
        applyFilter({ search: '', major: '', employment_status: '', graduation_year: '' });
    };

    const hasFilters = search || prodi || statusFilter || yearFilter;

    const buildFilterQuery = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (prodi) params.set('major', prodi);
        if (statusFilter) params.set('employment_status', statusFilter);
        if (yearFilter) params.set('graduation_year', yearFilter);
        return params.toString();
    };

    const previewPdfUrl = (() => {
        const qs = buildFilterQuery();
        return route('adminkampus.alumni.preview.pdf') + (qs ? '?' + qs : '');
    })();

    const downloadPdfUrl = (() => {
        const qs = buildFilterQuery();
        return route('adminkampus.alumni.export.pdf') + (qs ? '?' + qs : '');
    })();

    const submitImport = (e) => {
        e.preventDefault();
        importForm.post(route('adminkampus.alumni.import'), {
            preserveScroll: true,
            onSuccess: () => { importForm.reset(); setModalImportOpen(false); },
        });
    };

    const alumniData = alumnis?.data || [];
    const totalPages = alumnis?.last_page || 1;
    const currentPage = alumnis?.current_page || 1;
    const totalItems = alumnis?.total || 0;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: '17px', fontWeight: 800, color: TOKEN.navy, margin: 0, letterSpacing: '-0.01em' }}>Data Alumni Lengkap</h2>
                    <p style={{ fontSize: '12px', color: TOKEN.muted, margin: '3px 0 0' }}>Daftar seluruh alumni beserta status pekerjaan dan lamaran</p>
                </div>
            }
        >
            <Head title="Data Alumni — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .ak-root * { font-family: 'Plus Jakarta Sans', sans-serif; }
                @keyframes rowIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .modal-backdrop { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(10,20,40,0.5); backdrop-filter: blur(4px); }
                .modal-box { background: #fff; border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 24px 60px rgba(10,20,40,0.2); overflow: hidden; }
                .modal-header { padding: 20px 24px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid ${TOKEN.borderSoft}; }
                .btn-template { background: ${TOKEN.navyLight}; color: ${TOKEN.navyMid}; border: 1px solid #bfdbfe; font-size: 12px; height: 34px; padding: 0 12px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; font-weight: 700; text-decoration: none; transition: all 0.2s; }
                .btn-template:hover { background: #dbeafe; color: ${TOKEN.navy}; }
                .filter-select { height: 38px; padding: 0 10px; border: 1.5px solid ${TOKEN.border}; border-radius: 8px; font-size: 13px; color: ${TOKEN.navy}; background: #fff; outline: none; cursor: pointer; min-width: 140px; }
                .filter-select:focus { border-color: ${TOKEN.navyMid}; }
                .page-btn { height: 34px; min-width: 34px; padding: 0 10px; border: 1.5px solid ${TOKEN.border}; border-radius: 8px; background: #fff; color: ${TOKEN.navy}; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
                .page-btn:hover { background: ${TOKEN.navyLight}; border-color: ${TOKEN.navyMid}; }
                .page-btn.active { background: ${TOKEN.navyMid}; color: #fff; border-color: ${TOKEN.navyMid}; }
                .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
            `}</style>

            <div className="ak-root">
                {flash?.message && !flash?.duplicates?.length && (
                    <div style={{ marginBottom: 20, padding: '14px 20px', background: TOKEN.successLight, color: '#065f46', borderRadius: 10, border: '1px solid #a7f3d0', fontSize: 13, fontWeight: 700, display: 'flex', gap: 10, alignItems: 'center', animation: 'rowIn 0.3s ease' }}>
                        <div style={{ background: '#34d399', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                        {flash.message}
                    </div>
                )}

                <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${TOKEN.borderSoft}`, overflow: 'hidden', boxShadow: '0 4px 14px rgba(26,53,96,0.03)' }}>
                    {/* Toolbar */}
                    <div style={{ padding: '20px 24px', borderBottom: `1px solid ${TOKEN.borderSoft}`, background: '#fafbfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: TOKEN.navy }}>
                                Total: <span style={{ color: TOKEN.orange }}>{totalItems}</span> Alumni
                            </div>

                            {/* Search */}
                            <div style={{ position: 'relative', width: '220px' }}>
                                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
                                <input
                                    style={{ height: 38, width: '100%', padding: '0 12px 0 34px', border: `1.5px solid ${TOKEN.border}`, borderRadius: 8, fontSize: 13, outline: 'none' }}
                                    placeholder="Cari NIM atau Nama..."
                                    value={search} onChange={e => handleSearch(e.target.value)}
                                />
                            </div>

                            {/* Filter Prodi */}
                            <select className="filter-select" value={prodi} onChange={e => handleProdiChange(e.target.value)}>
                                <option value="">Semua Prodi</option>
                                {(prodiList || []).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>

                            {/* Filter Status */}
                            <select className="filter-select" value={statusFilter} onChange={e => handleStatusChange(e.target.value)}>
                                <option value="">Semua Status</option>
                                {Object.keys(EMPLOYMENT_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>

                            {/* Filter Tahun Lulus */}
                            <select className="filter-select" value={yearFilter} onChange={e => handleYearChange(e.target.value)} style={{ minWidth: 120 }}>
                                <option value="">Semua Tahun</option>
                                {(yearList || []).map(y => <option key={y} value={y}>{y}</option>)}
                            </select>

                            {hasFilters && (
                                <button onClick={clearFilters} style={{ height: 38, padding: '0 12px', borderRadius: 8, border: `1.5px solid ${TOKEN.border}`, background: '#fff', color: TOKEN.mutedDark, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                    Reset
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setPreviewOpen(true)} style={{
                                height: 38, padding: '0 14px', borderRadius: 8, border: `1.5px solid ${TOKEN.navyMid}`,
                                background: '#fff', color: TOKEN.navyMid, fontSize: 12, fontWeight: 700,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            }}>
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                Preview &amp; Cetak
                            </button>
                            <button onClick={() => setModalImportOpen(true)} style={{
                                height: 38, padding: '0 16px', borderRadius: 8, border: 'none',
                                background: TOKEN.success, color: '#fff', fontSize: 13, fontWeight: 700,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            }}>
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                Import CSV
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ maxHeight: '60vh', overflowY: 'auto', background: '#fff' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, boxShadow: `0 1px 0 ${TOKEN.borderSoft}` }}>
                                <tr>
                                    {['NIM', 'Nama Lulusan', 'Program Studi', 'Tahun Lulus', 'Status Pekerjaan', 'Lamaran', 'Aksi'].map((h, i) => (
                                        <th key={i} style={{ padding: '14px 16px', fontSize: 11, fontWeight: 700, color: TOKEN.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i >= 5 ? 'center' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {alumniData.length === 0 ? (
                                    <tr><td colSpan={7}><EmptyState message="Belum ada data alumni. Silakan Import file CSV." /></td></tr>
                                ) : alumniData.map((al, i) => {
                                    const statusStyle = EMPLOYMENT_STATUS[al.employment_status] || EMPLOYMENT_STATUS['Tidak Terdeteksi'];
                                    return (
                                        <tr key={al.id} style={{ borderBottom: `1px solid ${TOKEN.borderSoft}`, animation: 'rowIn 0.2s both', animationDelay: `${(i % 15) * 0.02}s` }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 800, color: TOKEN.navyMid }}>{al.nim}</td>
                                            <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: TOKEN.navy }}>{al.user?.name}</td>
                                            <td style={{ padding: '13px 16px', fontSize: 13, color: TOKEN.mutedDark }}>{al.major || '-'}</td>
                                            <td style={{ padding: '13px 16px', fontSize: 13, color: TOKEN.mutedDark, textAlign: 'center', fontWeight: 600 }}>{al.graduation_year || '-'}</td>
                                            <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: statusStyle.bg, color: statusStyle.color, whiteSpace: 'nowrap' }}>
                                                    {al.employment_status || '-'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: TOKEN.navyLight, color: TOKEN.navyMid }}>
                                                    {al.total_applications || 0}
                                                </span>
                                            </td>
                                            <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                                                <Link href={route('adminkampus.alumni.show', al.id)}>
                                                    <button style={{ height: 30, padding: '0 12px', borderRadius: 7, border: 'none', background: TOKEN.navyLight, color: TOKEN.navyMid, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                                        Detail
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ padding: '16px 24px', borderTop: `1px solid ${TOKEN.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
                            <div style={{ fontSize: 12, color: TOKEN.mutedDark }}>
                                Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                    className="page-btn"
                                    disabled={currentPage <= 1}
                                    onClick={() => {
                                        const params = new URLSearchParams();
                                        if (search) params.set('search', search);
                                        if (prodi) params.set('major', prodi);
                                        if (statusFilter) params.set('employment_status', statusFilter);
                                        if (yearFilter) params.set('graduation_year', yearFilter);
                                        params.set('page', currentPage - 1);
                                        router.get(route('adminkampus.alumni.index') + '?' + params.toString(), {}, { preserveState: true, replace: true });
                                    }}
                                >
                                    ‹ Prev
                                </button>
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    let page;
                                    if (totalPages <= 7) {
                                        page = i + 1;
                                    } else if (currentPage <= 4) {
                                        page = i + 1;
                                    } else if (currentPage >= totalPages - 3) {
                                        page = totalPages - 6 + i;
                                    } else {
                                        page = currentPage - 3 + i;
                                    }
                                    const params = new URLSearchParams();
                                    if (search) params.set('search', search);
                                    if (prodi) params.set('major', prodi);
                                    if (statusFilter) params.set('employment_status', statusFilter);
                                    if (yearFilter) params.set('graduation_year', yearFilter);
                                    params.set('page', page);
                                    return (
                                        <button
                                            key={page}
                                            className={`page-btn ${page === currentPage ? 'active' : ''}`}
                                            onClick={() => router.get(route('adminkampus.alumni.index') + '?' + params.toString(), {}, { preserveState: true, replace: true })}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                                <button
                                    className="page-btn"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => {
                                        const params = new URLSearchParams();
                                        if (search) params.set('search', search);
                                        if (prodi) params.set('major', prodi);
                                        if (statusFilter) params.set('employment_status', statusFilter);
                                        if (yearFilter) params.set('graduation_year', yearFilter);
                                        params.set('page', currentPage + 1);
                                        router.get(route('adminkampus.alumni.index') + '?' + params.toString(), {}, { preserveState: true, replace: true });
                                    }}
                                >
                                    Next ›
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Duplicate Warning Modal */}
            {modalDuplicateOpen && flash?.duplicates && (
                <div className="modal-backdrop" style={{ zIndex: 99999 }}>
                    <div className="modal-box" style={{ animation: 'rowIn 0.25s cubic-bezier(0.22,1,0.36,1)', maxWidth: 520 }}>
                        <div className="modal-header" style={{ background: '#fff7ed', borderBottom: '1px solid #fed7aa' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚠️</div>
                                <span style={{ fontSize: 16, fontWeight: 800, color: '#9a3412' }}>Import Selesai dengan Catatan</span>
                            </div>
                            <button onClick={() => setModalDuplicateOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9a3412' }}>✕</button>
                        </div>
                        <div style={{ padding: 24 }}>
                            <p style={{ fontSize: 13.5, color: TOKEN.navy, margin: '0 0 16px', lineHeight: 1.5 }}>
                                {flash.message} Terdapat <strong>{flash.duplicates.length} NIM duplikat</strong> yang dilewati.
                            </p>
                            <div style={{ border: `1px solid ${TOKEN.borderSoft}`, borderRadius: 8, overflow: 'hidden' }}>
                                <button onClick={() => setShowDuplicateDetails(!showDuplicateDetails)} style={{ width: '100%', padding: '12px 16px', background: '#fafbfc', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: TOKEN.navyMid }}>
                                    <span>Lihat Detail Duplikat</span>
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ transform: showDuplicateDetails ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {showDuplicateDetails && (
                                    <div style={{ maxHeight: 200, overflowY: 'auto', background: '#fff', borderTop: `1px solid ${TOKEN.borderSoft}` }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: TOKEN.bg, position: 'sticky', top: 0 }}>
                                                <tr>
                                                    <th style={{ padding: '8px 16px', fontSize: 11, textAlign: 'left', color: TOKEN.mutedDark }}>NIM</th>
                                                    <th style={{ padding: '8px 16px', fontSize: 11, textAlign: 'left', color: TOKEN.mutedDark }}>Nama</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {flash.duplicates.map((dup, i) => (
                                                    <tr key={i} style={{ borderBottom: `1px solid ${TOKEN.borderSoft}` }}>
                                                        <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: TOKEN.red }}>{dup.nim}</td>
                                                        <td style={{ padding: '10px 16px', fontSize: 12, color: TOKEN.mutedDark }}>{dup.name}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => setModalDuplicateOpen(false)} style={{ height: 38, padding: '0 20px', borderRadius: 8, border: 'none', background: TOKEN.navyMid, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Mengerti</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {modalImportOpen && !modalDuplicateOpen && (
                <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setModalImportOpen(false) }}>
                    <div className="modal-box" style={{ animation: 'rowIn 0.25s cubic-bezier(0.22,1,0.36,1)' }}>
                        <div className="modal-header">
                            <span style={{ fontSize: 16, fontWeight: 800, color: TOKEN.navy }}>Import Data Alumni</span>
                            <button onClick={() => setModalImportOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: TOKEN.mutedDark }}>✕</button>
                        </div>
                        <form onSubmit={submitImport} style={{ padding: 24 }}>
                            <div style={{ background: '#fafbfc', padding: 16, borderRadius: 10, border: `1px solid ${TOKEN.borderSoft}`, marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                    <div style={{ fontSize: 12, fontWeight: 800, color: TOKEN.navyMid }}>Format File (CSV):</div>
                                    <a href={route('adminkampus.alumni.template')} className="btn-template" download>
                                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        Unduh Template
                                    </a>
                                </div>
                                <div style={{ fontSize: 11, color: TOKEN.mutedDark, fontStyle: 'italic' }}>
                                    Kolom: NIM | Nama | Jenjang | Prodi | Tgl. Lahir (YYYY-MM-DD) | Tahun Lulus
                                </div>
                            </div>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: TOKEN.navy, marginBottom: 8 }}>Pilih File CSV</label>
                                <input type="file" accept=".csv, .txt" required onChange={e => importForm.setData('file', e.target.files[0])}
                                    style={{ width: '100%', padding: 10, border: `2px dashed ${TOKEN.border}`, borderRadius: 8, fontSize: 13, background: TOKEN.bg }} />
                                {importForm.errors.file && <div style={{ fontSize: 12, color: TOKEN.red, marginTop: 4 }}>{importForm.errors.file}</div>}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                <button type="button" onClick={() => setModalImportOpen(false)} style={{ height: 38, padding: '0 16px', borderRadius: 8, border: `1.5px solid ${TOKEN.border}`, background: '#fff', color: TOKEN.mutedDark, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Batal</button>
                                <button type="submit" disabled={importForm.processing} style={{ height: 38, padding: '0 16px', borderRadius: 8, border: 'none', background: importForm.processing ? TOKEN.muted : TOKEN.success, color: '#fff', fontSize: 13, fontWeight: 700, cursor: importForm.processing ? 'not-allowed' : 'pointer' }}>
                                    {importForm.processing ? 'Memproses...' : 'Import & Buat Akun'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Preview & Cetak PDF Modal */}
            {previewOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div onClick={() => setPreviewOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,40,0.55)', backdropFilter: 'blur(4px)', cursor: 'default' }} />
                    <div style={{ background: '#fff', borderRadius: 16, position: 'relative', width: '100%', maxWidth: 1100, height: '90vh', boxShadow: '0 24px 80px rgba(10,20,40,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Header */}
                        <div style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${TOKEN.borderSoft}`, flexShrink: 0, background: '#fafbfc' }}>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: TOKEN.navy }}>Preview Data Alumni</div>
                                <div style={{ fontSize: 12, color: TOKEN.muted, marginTop: 1 }}>
                                    {totalItems} Data{hasFilters ? ' (filtered)' : ''} &mdash; A4 Landscape
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <a href={downloadPdfUrl} style={{
                                    height: 34, padding: '0 14px', borderRadius: 8, border: 'none',
                                    background: TOKEN.redLight, color: TOKEN.red, fontSize: 12, fontWeight: 700,
                                    cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none',
                                }}>
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Unduh PDF
                                </a>
                                <button onClick={() => setPreviewOpen(false)} style={{
                                    width: 34, height: 34, borderRadius: 8, border: `1px solid ${TOKEN.border}`,
                                    background: '#fff', color: TOKEN.mutedDark, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4,
                                }}>
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* PDF Preview */}
                        <div style={{ flex: 1, overflow: 'hidden', background: '#e2e8f0' }}>
                            <iframe src={previewPdfUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Preview PDF" />
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
