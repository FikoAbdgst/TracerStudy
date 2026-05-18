import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

/* ─── Shared Style Tokens ───────────────────────────────────────────────── */
const TOKEN = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    success: '#10b981', successLight: '#ecfdf5',
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

export default function AlumniIndex({ alumnis }) {
    // Tangkap data dari Middleware
    const { flash } = usePage().props;

    const [q, setQ] = useState('');
    const [modalImportOpen, setModalImportOpen] = useState(false);

    // State untuk Modal Peringatan Duplikat
    const [modalDuplicateOpen, setModalDuplicateOpen] = useState(false);
    const [showDuplicateDetails, setShowDuplicateDetails] = useState(false);

    // Buka otomatis modal duplikat jika flash.duplicates ada isinya
    useEffect(() => {
        if (flash?.duplicates && flash.duplicates.length > 0) {
            setModalDuplicateOpen(true);
            setShowDuplicateDetails(false); // Default tutup dropdown
        }
    }, [flash]);

    // Form Khusus Import File
    const importForm = useForm({
        file: null,
    });

    const filtered = (alumnis || []).filter(al =>
        al.user?.name?.toLowerCase().includes(q.toLowerCase()) ||
        al.nim?.toLowerCase().includes(q.toLowerCase()) ||
        (al.major && al.major.toLowerCase().includes(q.toLowerCase()))
    );

    const submitImport = (e) => {
        e.preventDefault();
        importForm.post(route('adminkampus.alumni.import'), {
            preserveScroll: true,
            onSuccess: () => {
                importForm.reset();
                setModalImportOpen(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: '17px', fontWeight: 800, color: TOKEN.navy, margin: 0, letterSpacing: '-0.01em' }}>Data Mahasiswa & Alumni</h2>
                    <p style={{ fontSize: '12px', color: TOKEN.muted, margin: '3px 0 0' }}>Kelola data lulusan dari Pusat Database Kampus</p>
                </div>
            }
        >
            <Head title="Data Alumni — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .md-root * { font-family: 'Plus Jakarta Sans', sans-serif; }
                .md-card { background: #fff; border-radius: 14px; border: 1px solid ${TOKEN.borderSoft}; overflow: hidden; box-shadow: 0 4px 14px rgba(26,53,96,0.03); }
                .md-submit {
                    height: 38px; padding: 0 16px; border-radius: 8px; border: none; background: ${TOKEN.success}; color: #fff; font-size: 13px; font-weight: 700;
                    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.15s; text-decoration: none;
                }
                .md-submit:hover:not(:disabled) { background: #059669; transform: translateY(-1px); }
                .md-submit:disabled { background: #94a3b8; cursor: not-allowed; }
                .md-row:hover { background: #f8fafc !important; }
                @keyframes rowIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                /* Style Modal Manual */
                .modal-backdrop { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(10,20,40,0.5); backdrop-filter: blur(4px); }
                .modal-box { background: #fff; border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 24px 60px rgba(10,20,40,0.2); overflow: hidden; }
                .modal-header { padding: 20px 24px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid ${TOKEN.borderSoft}; }

                /* Template Button specific */
                .btn-template { background: ${TOKEN.navyLight}; color: ${TOKEN.navyMid}; border: 1px solid #bfdbfe; font-size: 12px; height: 34px; padding: 0 12px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; font-weight: 700; text-decoration: none; transition: all 0.2s; }
                .btn-template:hover { background: #dbeafe; color: ${TOKEN.navy}; }
            `}</style>

            <div className="md-root">
                {/* Tampilkan pesan sukses jika tidak ada duplikat */}
                {flash?.message && !flash?.duplicates?.length && (
                    <div style={{ marginBottom: 20, padding: '14px 20px', background: TOKEN.successLight, color: '#065f46', borderRadius: 10, border: `1px solid #a7f3d0`, fontSize: 13, fontWeight: 700, display: 'flex', gap: 10, alignItems: 'center', animation: 'rowIn 0.3s ease' }}>
                        <div style={{ background: '#34d399', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                        {flash.message}
                    </div>
                )}

                <div className="md-card">
                    {/* Toolbar Atas */}
                    <div style={{ padding: '20px 24px', borderBottom: `1px solid ${TOKEN.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc', flexWrap: 'wrap', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: TOKEN.navy }}>
                                Total Data: <span style={{ color: TOKEN.orange }}>{filtered.length} Alumni</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            {/* Search */}
                            <div style={{ position: 'relative', width: '260px' }}>
                                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
                                <input
                                    style={{ height: 38, width: '100%', padding: '0 12px 0 34px', border: `1.5px solid ${TOKEN.border}`, borderRadius: 8, fontSize: 13, outline: 'none' }}
                                    placeholder="Cari NIM atau Nama..."
                                    value={q} onChange={e => setQ(e.target.value)}
                                />
                            </div>

                            {/* Tombol Import */}
                            <button onClick={() => setModalImportOpen(true)} className="md-submit">
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                Import Excel / CSV
                            </button>
                        </div>
                    </div>

                    {/* Area Tabel */}
                    <div style={{ maxHeight: '60vh', overflowY: 'auto', background: '#fff' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, boxShadow: `0 1px 0 ${TOKEN.borderSoft}` }}>
                                <tr>
                                    <th style={{ padding: '14px 24px', fontSize: 11, fontWeight: 700, color: TOKEN.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>NIM</th>
                                    <th style={{ padding: '14px 24px', fontSize: 11, fontWeight: 700, color: TOKEN.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Nama Lulusan</th>
                                    <th style={{ padding: '14px 24px', fontSize: 11, fontWeight: 700, color: TOKEN.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Program Studi</th>
                                    <th style={{ padding: '14px 24px', fontSize: 11, fontWeight: 700, color: TOKEN.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Thn. Lulus</th>
                                    <th style={{ padding: '14px 24px', fontSize: 11, fontWeight: 700, color: TOKEN.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Email Akun</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={5}><EmptyState message="Belum ada data alumni. Silakan Import file CSV." /></td></tr>
                                ) : filtered.map((al, i) => (
                                    <tr key={al.id} className="md-row" style={{ borderBottom: `1px solid ${TOKEN.borderSoft}`, animation: 'rowIn 0.2s both', animationDelay: `${(i % 15) * 0.02}s` }}>
                                        <td style={{ padding: '14px 24px', fontSize: 13, fontWeight: 800, color: TOKEN.navyMid }}>
                                            {al.nim}
                                        </td>
                                        <td style={{ padding: '14px 24px', fontSize: 13, fontWeight: 600, color: TOKEN.navy }}>
                                            {al.user?.name}
                                        </td>
                                        <td style={{ padding: '14px 24px', fontSize: 13, color: TOKEN.mutedDark }}>
                                            {al.major || '-'}
                                        </td>
                                        <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: TOKEN.orangeLight, color: TOKEN.orange }}>
                                                {al.graduation_year || '-'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 24px', fontSize: 12, color: TOKEN.muted }}>
                                            {al.user?.email}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL PERINGATAN DUPLIKAT */}
            {modalDuplicateOpen && flash?.duplicates && (
                <div className="md-root modal-backdrop" style={{ zIndex: 99999 }}>
                    <div className="modal-box" style={{ animation: 'rowIn 0.25s cubic-bezier(0.22,1,0.36,1)', maxWidth: 520 }}>
                        <div className="modal-header" style={{ background: '#fff7ed', borderBottom: `1px solid #fed7aa` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚠️</div>
                                <span style={{ fontSize: 16, fontWeight: 800, color: '#9a3412' }}>Import Selesai dengan Catatan</span>
                            </div>
                            <button onClick={() => setModalDuplicateOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9a3412' }}>✕</button>
                        </div>

                        <div style={{ padding: 24 }}>
                            <p style={{ fontSize: 13.5, color: TOKEN.navy, margin: '0 0 16px', lineHeight: 1.5 }}>
                                {flash.message} Namun, sistem mendeteksi ada <strong style={{ color: TOKEN.danger }}>{flash.duplicates.length} NIM yang duplikat</strong> dengan data yang sudah terdaftar. Data yang duplikat ini dilewati (tidak diinput ulang).
                            </p>

                            {/* Komponen Dropdown/Accordion Detail */}
                            <div style={{ border: `1px solid ${TOKEN.borderSoft}`, borderRadius: 8, overflow: 'hidden' }}>
                                <button
                                    onClick={() => setShowDuplicateDetails(!showDuplicateDetails)}
                                    style={{ width: '100%', padding: '12px 16px', background: '#fafbfc', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: TOKEN.navyMid }}
                                >
                                    <span>Lihat Detail Alumni Duplikat</span>
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ transform: showDuplicateDetails ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Isi Dropdown Detail */}
                                {showDuplicateDetails && (
                                    <div style={{ maxHeight: 200, overflowY: 'auto', background: '#fff', borderTop: `1px solid ${TOKEN.borderSoft}` }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: TOKEN.bg, position: 'sticky', top: 0 }}>
                                                <tr>
                                                    <th style={{ padding: '8px 16px', fontSize: 11, textAlign: 'left', color: TOKEN.mutedDark }}>NIM</th>
                                                    <th style={{ padding: '8px 16px', fontSize: 11, textAlign: 'left', color: TOKEN.mutedDark }}>Nama Lengkap</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {flash.duplicates.map((dup, i) => (
                                                    <tr key={i} style={{ borderBottom: `1px solid ${TOKEN.borderSoft}` }}>
                                                        <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: TOKEN.danger }}>{dup.nim}</td>
                                                        <td style={{ padding: '10px 16px', fontSize: 12, color: TOKEN.mutedDark }}>{dup.name}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => setModalDuplicateOpen(false)} style={{ height: 38, padding: '0 20px', borderRadius: 8, border: 'none', background: TOKEN.navyMid, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Mengerti, Tutup Peringatan</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Import */}
            {modalImportOpen && !modalDuplicateOpen && (
                <div className="md-root modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setModalImportOpen(false) }}>
                    <div className="modal-box" style={{ animation: 'rowIn 0.25s cubic-bezier(0.22,1,0.36,1)' }}>
                        <div className="modal-header">
                            <span style={{ fontSize: 16, fontWeight: 800, color: TOKEN.navy }}>Import Data Alumni</span>
                            <button onClick={() => setModalImportOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: TOKEN.mutedDark }}>✕</button>
                        </div>

                        <form onSubmit={submitImport} style={{ padding: 24 }}>

                            {/* Petunjuk & Tombol Download Template */}
                            <div style={{ background: '#fafbfc', padding: 16, borderRadius: 10, border: `1px solid ${TOKEN.borderSoft}`, marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                    <div style={{ fontSize: 12, fontWeight: 800, color: TOKEN.navyMid }}>Format Kolom File (Wajib CSV):</div>
                                    <a href={route('adminkampus.alumni.template')} className="btn-template" download>
                                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        Unduh Template CSV
                                    </a>
                                </div>
                                <div style={{ fontSize: 11, color: TOKEN.navyMid, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    <span style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700, border: `1px solid ${TOKEN.borderSoft}` }}>A: NIM</span>
                                    <span style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700, border: `1px solid ${TOKEN.borderSoft}` }}>B: Nama</span>
                                    <span style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700, border: `1px solid ${TOKEN.borderSoft}` }}>C: Jenjang</span>
                                    <span style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700, border: `1px solid ${TOKEN.borderSoft}` }}>D: Prodi</span>
                                    <span style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700, border: `1px solid ${TOKEN.borderSoft}` }}>E: Tgl. Lahir</span>
                                    <span style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700, border: `1px solid ${TOKEN.borderSoft}` }}>F: Tahun Lulus</span>
                                </div>
                                <div style={{ fontSize: 11, color: TOKEN.mutedDark, marginTop: 8, fontStyle: 'italic' }}>
                                    *Note: Jika menggunakan Excel, pastikan di-"Save As" ke format CSV (Comma delimited).
                                </div>
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: TOKEN.navy, marginBottom: 8 }}>Pilih File CSV Lulusan</label>
                                <input
                                    type="file" accept=".csv, .txt" required
                                    onChange={e => importForm.setData('file', e.target.files[0])}
                                    style={{ width: '100%', padding: 10, border: `2px dashed ${TOKEN.border}`, borderRadius: 8, fontSize: 13, background: TOKEN.bg }}
                                />
                                {importForm.errors.file && <div style={{ fontSize: 12, color: TOKEN.danger, marginTop: 4 }}>{importForm.errors.file}</div>}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                <button type="button" onClick={() => setModalImportOpen(false)} style={{ height: 38, padding: '0 16px', borderRadius: 8, border: `1.5px solid ${TOKEN.border}`, background: '#fff', color: TOKEN.mutedDark, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Batal</button>
                                <button type="submit" disabled={importForm.processing} className="md-submit" style={{ margin: 0 }}>
                                    {importForm.processing ? 'Sedang Memproses...' : 'Mulai Import & Buat Akun'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
