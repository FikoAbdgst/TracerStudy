import { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const TOKEN = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    success: '#10b981', successLight: '#ecfdf5',
    danger: '#dc2626', dangerLight: '#fef2f2',
};

const statusLabel = {
    active: 'Aktif',
    expired: 'Kadaluwarsa',
    terminated: 'Diakhiri',
};

const statusStyle = (s) => {
    if (s === 'active') return { bg: '#ecfdf5', color: '#166534' };
    if (s === 'expired') return { bg: '#fff1f2', color: '#dc2626' };
    if (s === 'terminated') return { bg: '#f1f5f9', color: '#64748b' };
    return { bg: '#f1f5f9', color: '#94a3b8' };
};

const formatDate = (d) =>
    d
        ? new Intl.DateTimeFormat('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          }).format(new Date(d))
        : '—';

function EmptyState({ message }) {
    return (
        <tr>
            <td colSpan={6} style={{ padding: '52px 24px', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: TOKEN.navyLight, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={TOKEN.navyMid} strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <p style={{ fontSize: 13, color: TOKEN.muted, margin: 0, fontWeight: 500 }}>{message}</p>
            </td>
        </tr>
    );
}

export default function MitraIndex({ companies }) {
    const { flash } = usePage().props;

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [terminateTarget, setTerminateTarget] = useState(null);
    const [terminating, setTerminating] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        company_name: '',
        hr_email: '',
        mou_document: null,
    });

    const openAdd = () => {
        setEditTarget(null);
        reset();
        clearErrors();
        setAddOpen(true);
    };

    const openEdit = (company) => {
        setEditTarget(company);
        setData({
            company_name: company.name,
            hr_email: company.user?.email || '',
            mou_document: null,
        });
        clearErrors();
        setAddOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editTarget) {
            put(route('adminkampus.mitra.update', editTarget.id), {
                onSuccess: () => {
                    setAddOpen(false);
                    setEditTarget(null);
                },
            });
        } else {
            post(route('adminkampus.mitra.store'), {
                onSuccess: () => setAddOpen(false),
            });
        }
    };

    const handleTerminate = () => {
        setTerminating(true);
        router.patch(route('adminkampus.mitra.terminate', terminateTarget.id), {}, {
            onFinish: () => {
                setTerminating(false);
                setTerminateTarget(null);
            },
        });
    };

    const handleDelete = () => {
        setDeleting(true);
        router.delete(route('adminkampus.mitra.destroy', deleteTarget.id), {
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    const activeMouCount = companies.reduce(
        (sum, c) =>
            sum +
            c.mou_documents.filter(
                (m) => m.status === 'active' && new Date(m.expires_at) >= new Date(),
            ).length,
        0,
    );

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                        <h2 style={{ fontSize: '17px', fontWeight: 800, color: TOKEN.navy, margin: 0, letterSpacing: '-0.01em' }}>Manajemen Mitra</h2>
                        <p style={{ fontSize: '12px', color: TOKEN.muted, margin: '3px 0 0' }}>Daftar perusahaan mitra dan dokumen kerja sama (MoU)</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: TOKEN.navyLight, color: TOKEN.navyMid, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {companies.length} Mitra
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: '#ecfdf5', color: '#166534', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {activeMouCount} MoU Aktif
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Manajemen Mitra — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .md-root * { font-family: 'Plus Jakarta Sans', sans-serif; }
                .md-card { background: #fff; border-radius: 14px; border: 1px solid ${TOKEN.borderSoft}; overflow: hidden; box-shadow: 0 4px 14px rgba(26,53,96,0.03); }
                .md-submit {
                    height: 38px; padding: 0 16px; border-radius: 8px; border: none; background: ${TOKEN.navyMid}; color: #fff; font-size: 13px; font-weight: 700;
                    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.15s; text-decoration: none;
                }
                .md-submit:hover:not(:disabled) { background: #0f2444; transform: translateY(-1px); }
                .md-submit:disabled { background: #94a3b8; cursor: not-allowed; }
                .md-row:hover { background: #f8fafc !important; }
                @keyframes rowIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .modal-backdrop { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(10,20,40,0.5); backdrop-filter: blur(4px); }
                .modal-box { background: #fff; border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 24px 60px rgba(10,20,40,0.2); overflow: hidden; }
                .modal-header { padding: 20px 24px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid ${TOKEN.borderSoft}; }

                .btn-outline {
                    height: 36px; padding: 0 14px; border-radius: 8px; border: 1.5px solid ${TOKEN.border}; background: #fff; color: ${TOKEN.mutedDark}; font-size: 13px; font-weight: 600;
                    cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.15s; text-decoration: none;
                }
                .btn-outline:hover { border-color: #cbd5e1; background: #fafbfc; }
                .btn-ghost {
                    height: 32px; width: 32px; border: none; background: transparent; color: ${TOKEN.mutedDark}; cursor: pointer; display: inline-flex;
                    align-items: center; justify-content: center; border-radius: 6px; transition: all 0.15s;
                }
                .btn-ghost:hover { background: ${TOKEN.bg}; }
            `}</style>

            <div className="md-root">
                {/* Flash message */}
                {flash?.message && (
                    <div style={{ marginBottom: 20, padding: '14px 20px', background: TOKEN.successLight, color: '#065f46', borderRadius: 10, border: `1px solid #a7f3d0`, fontSize: 13, fontWeight: 700, display: 'flex', gap: 10, alignItems: 'center', animation: 'rowIn 0.3s ease' }}>
                        <div style={{ background: '#34d399', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</div>
                        {flash.message}
                    </div>
                )}

                <div className="md-card">
                    {/* Toolbar */}
                    <div style={{ padding: '20px 24px', borderBottom: `1px solid ${TOKEN.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc', flexWrap: 'wrap', gap: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: TOKEN.navy }}>
                            Total: <span style={{ color: TOKEN.orange }}>{companies.length} Perusahaan</span>
                        </div>
                        <button onClick={openAdd} className="md-submit">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            Tambah Mitra Baru
                        </button>
                    </div>

                    {/* Table */}
                    <div style={{ maxHeight: '60vh', overflowY: 'auto', background: '#fff' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, boxShadow: `0 1px 0 ${TOKEN.borderSoft}` }}>
                                <tr>
                                    <th style={{ padding: '14px 24px', fontSize: 11, fontWeight: 700, color: TOKEN.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Perusahaan Mitra</th>
                                    <th style={{ padding: '14px 24px', fontSize: 11, fontWeight: 700, color: TOKEN.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Email HRD</th>
                                    <th style={{ padding: '14px 24px', fontSize: 11, fontWeight: 700, color: TOKEN.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Tanggal Bergabung</th>
                                    <th style={{ padding: '14px 24px', fontSize: 11, fontWeight: 700, color: TOKEN.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Status MoU</th>
                                    <th style={{ padding: '14px 24px', fontSize: 11, fontWeight: 700, color: TOKEN.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Dokumen MoU</th>
                                    <th style={{ padding: '14px 24px', fontSize: 11, fontWeight: 700, color: TOKEN.mutedDark, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.length === 0 ? (
                                    <EmptyState message="Belum ada mitra terdaftar. Klik 'Tambah Mitra Baru' untuk memulai." />
                                ) : companies.map((c, i) => {
                                    const latestMou = c.mou_documents?.[0] ?? null;
                                    const isExpired =
                                        latestMou?.status === 'active' &&
                                        new Date(latestMou.expires_at) < new Date();
                                    const status = isExpired ? 'expired' : (latestMou?.status ?? null);
                                    const sc = statusStyle(status);

                                    return (
                                        <tr key={c.id} className="md-row" style={{ borderBottom: `1px solid ${TOKEN.borderSoft}`, animation: 'rowIn 0.2s both', animationDelay: `${(i % 15) * 0.02}s` }}>
                                            <td style={{ padding: '14px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: TOKEN.navyLight, color: TOKEN.navyMid, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                                                        {c.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: TOKEN.navy }}>{c.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 24px', fontSize: 12, color: TOKEN.mutedDark }}>{c.user?.email ?? '—'}</td>
                                            <td style={{ padding: '14px 24px', fontSize: 13, color: TOKEN.mutedDark }}>{formatDate(c.created_at)}</td>
                                            <td style={{ padding: '14px 24px' }}>
                                                {status ? (
                                                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: sc.bg, color: sc.color, display: 'inline-block' }}>
                                                        {statusLabel[status] ?? status}
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: 12, color: TOKEN.muted }}>Belum ada MoU</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                                                {latestMou ? (
                                                    <a
                                                        href={route('private-file', latestMou.file_url)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-outline"
                                                        style={{ height: 30, fontSize: 12, padding: '0 10px' }}
                                                    >
                                                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                                        Lihat PDF
                                                    </a>
                                                ) : (
                                                    <span style={{ fontSize: 12, color: TOKEN.muted }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                                    <button onClick={() => openEdit(c)} className="btn-ghost" title="Edit">
                                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                                    </button>
                                                    {status === 'terminated' || !status ? (
                                                        <button onClick={() => setDeleteTarget(c)} className="btn-ghost" title="Hapus" style={{ color: TOKEN.danger }}>
                                                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => setTerminateTarget(latestMou)} className="btn-ghost" title="Akhiri MoU" style={{ color: TOKEN.orange }}>
                                                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ─── Add/Edit Modal ─── */}
            {addOpen && (
                <div className="md-root modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) { setAddOpen(false); setEditTarget(null); } }}>
                    <div className="modal-box" style={{ animation: 'rowIn 0.25s cubic-bezier(0.22,1,0.36,1)', maxWidth: 500 }}>
                        <div className="modal-header">
                            <span style={{ fontSize: 16, fontWeight: 800, color: TOKEN.navy }}>{editTarget ? 'Edit Mitra' : 'Tambah Mitra Baru'}</span>
                            <button onClick={() => { setAddOpen(false); setEditTarget(null); reset(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: TOKEN.mutedDark }}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: TOKEN.navy, marginBottom: 6 }}>Nama Perusahaan</label>
                                <input
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    placeholder="PT. Contoh Sejahtera"
                                    style={{ width: '100%', height: 44, padding: '0 14px', border: `1.5px solid ${errors.company_name ? TOKEN.danger : TOKEN.border}`, borderRadius: 10, fontSize: 14, outline: 'none', background: TOKEN.bg, boxSizing: 'border-box' }}
                                />
                                {errors.company_name && <div style={{ fontSize: 12, color: TOKEN.danger, marginTop: 4 }}>{errors.company_name}</div>}
                            </div>

                            <div style={{ marginBottom: 18 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: TOKEN.navy, marginBottom: 6 }}>Email HRD Perusahaan</label>
                                <input
                                    type="email"
                                    value={data.hr_email}
                                    onChange={(e) => setData('hr_email', e.target.value)}
                                    placeholder="hr@perusahaan.com"
                                    style={{ width: '100%', height: 44, padding: '0 14px', border: `1.5px solid ${errors.hr_email ? TOKEN.danger : TOKEN.border}`, borderRadius: 10, fontSize: 14, outline: 'none', background: TOKEN.bg, boxSizing: 'border-box' }}
                                />
                                {errors.hr_email && <div style={{ fontSize: 12, color: TOKEN.danger, marginTop: 4 }}>{errors.hr_email}</div>}
                            </div>

                            <div style={{ marginBottom: 18 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: TOKEN.navy, marginBottom: 6 }}>Dokumen MoU (PDF, maks 5MB)</label>
                                <label
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10,
                                        border: `2px dashed ${data.mou_document ? TOKEN.navyMid : TOKEN.border}`,
                                        background: data.mou_document ? TOKEN.navyLight : TOKEN.bg, cursor: 'pointer',
                                        transition: 'border-color 0.15s',
                                    }}
                                    onMouseEnter={(e) => { if (!data.mou_document) e.currentTarget.style.borderColor = TOKEN.navyMid; }}
                                    onMouseLeave={(e) => { if (!data.mou_document) e.currentTarget.style.borderColor = TOKEN.border; }}
                                >
                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: data.mou_document ? TOKEN.navyMid : TOKEN.border, color: data.mou_document ? '#fff' : TOKEN.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: data.mou_document ? TOKEN.navyMid : TOKEN.mutedDark, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {data.mou_document ? data.mou_document.name : 'Klik untuk memilih file PDF'}
                                        </p>
                                        <p style={{ fontSize: 11, color: TOKEN.muted, margin: '2px 0 0' }}>
                                            {editTarget ? 'Kosongkan jika tidak ingin mengganti MoU' : 'Maksimal ukuran 5MB'}
                                        </p>
                                    </div>
                                    <input type="file" accept=".pdf" hidden onChange={(e) => setData('mou_document', e.target.files[0])} />
                                </label>
                                {errors.mou_document && <div style={{ fontSize: 12, color: TOKEN.danger, marginTop: 4 }}>{errors.mou_document}</div>}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                                <button type="button" onClick={() => { setAddOpen(false); setEditTarget(null); reset(); }} className="btn-outline" style={{ height: 38, padding: '0 16px', letterSpacing: 0 }}>Batal</button>
                                <button type="submit" disabled={processing} className="md-submit">
                                    {processing && (
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                                        </svg>
                                    )}
                                    {processing ? 'Menyimpan...' : (editTarget ? 'Simpan Perubahan' : 'Tambah & Kirim Email')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Terminate MoU Modal ─── */}
            {terminateTarget && (
                <div className="md-root modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setTerminateTarget(null); }}>
                    <div className="modal-box" style={{ animation: 'rowIn 0.25s cubic-bezier(0.22,1,0.36,1)', maxWidth: 420 }}>
                        <div className="modal-header">
                            <span style={{ fontSize: 16, fontWeight: 800, color: TOKEN.navy }}>Konfirmasi Akhiri MoU</span>
                            <button onClick={() => setTerminateTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: TOKEN.mutedDark }}>✕</button>
                        </div>
                        <div style={{ padding: '24px 24px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: TOKEN.dangerLight, color: TOKEN.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                            </div>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 700, color: TOKEN.navy, margin: '0 0 6px' }}>Akhiri MoU perusahaan mitra ini?</p>
                                <p style={{ fontSize: 12, color: TOKEN.mutedDark, margin: 0, lineHeight: 1.5 }}>
                                    Status MoU akan berubah menjadi <strong>Diakhiri</strong> dan tidak dapat diaktifkan kembali secara otomatis.
                                </p>
                            </div>
                        </div>
                        <div style={{ padding: '0 24px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button onClick={() => setTerminateTarget(null)} className="btn-outline" style={{ height: 36, padding: '0 14px', letterSpacing: 0 }}>Batal</button>
                            <button onClick={handleTerminate} disabled={terminating} className="md-submit" style={{ background: TOKEN.danger, height: 36, fontSize: 12 }}>
                                {terminating && (
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                                    </svg>
                                )}
                                {terminating ? 'Mengakhiri...' : 'Ya, Akhiri MoU'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Delete Company Modal ─── */}
            {deleteTarget && (
                <div className="md-root modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
                    <div className="modal-box" style={{ animation: 'rowIn 0.25s cubic-bezier(0.22,1,0.36,1)', maxWidth: 420 }}>
                        <div className="modal-header">
                            <span style={{ fontSize: 16, fontWeight: 800, color: TOKEN.navy }}>Konfirmasi Hapus Mitra</span>
                            <button onClick={() => setDeleteTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: TOKEN.mutedDark }}>✕</button>
                        </div>
                        <div style={{ padding: '24px 24px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: TOKEN.dangerLight, color: TOKEN.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                            </div>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 700, color: TOKEN.navy, margin: '0 0 6px' }}>Hapus mitra ini secara permanen?</p>
                                <p style={{ fontSize: 12, color: TOKEN.mutedDark, margin: 0, lineHeight: 1.5 }}>
                                    Akun <strong>{deleteTarget?.name}</strong> dan semua datanya (termasuk MoU) akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                                </p>
                            </div>
                        </div>
                        <div style={{ padding: '0 24px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button onClick={() => setDeleteTarget(null)} className="btn-outline" style={{ height: 36, padding: '0 14px', letterSpacing: 0 }}>Batal</button>
                            <button onClick={handleDelete} disabled={deleting} className="md-submit" style={{ background: TOKEN.danger, height: 36, fontSize: 12 }}>
                                {deleting && (
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                                    </svg>
                                )}
                                {deleting ? 'Menghapus...' : 'Ya, Hapus Mitra'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
