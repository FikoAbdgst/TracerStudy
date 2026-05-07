import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import InputError from '@/Components/InputError';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626', redLight: '#fff1f2',
};

/* ─── Modal ──────────────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children, footer }) {
    const [visible, setVisible] = useState(false);
    const [render, setRender] = useState(false);
    useEffect(() => {
        if (open) { setRender(true); requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); }
        else { setVisible(false); const t = setTimeout(() => setRender(false), 260); return () => clearTimeout(t); }
    }, [open]);
    if (!render) return null;
    return (
        <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease',
        }}>
            <div style={{
                background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500,
                boxShadow: '0 24px 60px rgba(10,20,40,0.2)', overflow: 'hidden',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
                transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1)',
            }}>
                <div style={{ padding: '20px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.borderSoft}` }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: T.navy }}>{title}</span>
                    <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: T.bg, color: T.mutedDark, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = T.border}
                        onMouseLeave={e => e.currentTarget.style.background = T.bg}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div style={{ padding: '18px 22px' }}>{children}</div>
                {footer && <>
                    <div style={{ height: 1, background: T.borderSoft, margin: '0 22px' }} />
                    <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div>
                </>}
            </div>
        </div>
    );
}

const BtnGhost = ({ children, onClick }) => (
    <button type="button" onClick={onClick} style={{ height: 36, padding: '0 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: 'transparent', color: T.mutedDark, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = T.bg}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >{children}</button>
);

const FieldLabel = ({ children }) => (
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: 5 }}>{children}</label>
);

const fieldBase = { height: 42, padding: '0 13px', border: `1.5px solid ${T.border}`, borderRadius: 9, background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none', width: '100%', transition: 'all 0.18s', fontFamily: 'inherit', boxSizing: 'border-box' };
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.09)'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; e.target.style.boxShadow = 'none'; };

const mouStatusMap = {
    active: { bg: T.greenLight, color: T.green, label: 'Aktif' },
    expired: { bg: T.redLight, color: T.red, label: 'Kadaluwarsa' },
    terminated: { bg: T.borderSoft, color: T.mutedDark, label: 'Diakhiri' },
};

const MouBadge = ({ status, expiresAt }) => {
    const isExpired = status === 'active' && new Date(expiresAt) < new Date();
    const s = mouStatusMap[isExpired ? 'expired' : status] ?? mouStatusMap.active;
    return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>;
};

const formatDate = d => d ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d)) : '—';

export default function MoUIndex({ mous, companies }) {
    const [uploadOpen, setUploadOpen] = useState(false);
    const [terminateTarget, setTerminateTarget] = useState(null);
    const [terminating, setTerminating] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        company_id: '', file: null, signed_at: '', expires_at: '',
    });

    const openUpload = () => { reset(); clearErrors(); setUploadOpen(true); };

    const handleUpload = e => {
        e.preventDefault();
        post(route('adminkampus.mou.store'), { onSuccess: () => setUploadOpen(false) });
    };

    const handleTerminate = () => {
        setTerminating(true);
        router.patch(route('adminkampus.mou.terminate', terminateTarget.id), {}, {
            onFinish: () => { setTerminating(false); setTerminateTarget(null); },
        });
    };

    // summary counts
    const activeCount = mous.filter(m => m.status === 'active' && new Date(m.expires_at) >= new Date()).length;
    const expiredCount = mous.filter(m => m.status !== 'terminated' && new Date(m.expires_at) < new Date()).length;

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Manajemen Kerja Sama (MoU)</h2>
                        <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Arsip dan pelacakan masa berlaku dokumen MoU perusahaan mitra</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ padding: '4px 10px', borderRadius: 8, background: T.greenLight, border: `1px solid ${T.green}22`, fontSize: 12, fontWeight: 700, color: T.green }}>{activeCount} Aktif</div>
                        {expiredCount > 0 && <div style={{ padding: '4px 10px', borderRadius: 8, background: T.redLight, border: `1px solid ${T.red}22`, fontSize: 12, fontWeight: 700, color: T.red }}>{expiredCount} Kadaluwarsa</div>}
                    </div>
                </div>
            }
        >
            <Head title="Dokumen MoU — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .ak-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes rowIn  { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
                .tbl-row:hover td { background:#fafbfc; }
            `}</style>

            <div className="ak-root">
                <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20, animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                        <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
                            Total <span style={{ fontWeight: 700, color: T.navy }}>{mous.length}</span> dokumen MoU
                        </p>
                        <button onClick={openUpload} style={{
                            height: 40, padding: '0 16px', borderRadius: 9, border: 'none',
                            background: T.orange, color: '#fff', fontSize: 13, fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: 6,
                            boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(249,115,22,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = T.orange; e.currentTarget.style.boxShadow = '0 2px 8px rgba(249,115,22,0.25)'; e.currentTarget.style.transform = 'none'; }}
                        >
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            Unggah MoU Baru
                        </button>
                    </div>

                    <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.borderSoft}` }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                                    {['Perusahaan Mitra', 'Tgl. TTD', 'Berlaku Sampai', 'Dokumen', 'Status', 'Aksi'].map((h, i) => (
                                        <th key={i} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', textAlign: i === 5 ? 'right' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {mous.map((mou, i) => (
                                    <tr key={mou.id} className="tbl-row" style={{ borderBottom: `1px solid ${T.borderSoft}`, animation: `rowIn 0.26s ${i * 0.04}s both` }}>
                                        <td style={{ padding: '13px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: T.navyLight, color: T.navyMid, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {(mou.company?.name ?? 'P').charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontSize: 13.5, fontWeight: 700, color: T.navy }}>{mou.company?.name ?? 'Perusahaan Dihapus'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '13px 14px', fontSize: 13, color: T.mutedDark }}>{formatDate(mou.signed_at)}</td>
                                        <td style={{ padding: '13px 14px', fontSize: 13, color: T.mutedDark }}>{formatDate(mou.expires_at)}</td>
                                        <td style={{ padding: '13px 14px' }}>
                                            <a href={`/storage/${mou.file_url}`} target="_blank" style={{ color: T.orange, fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'opacity 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                                                PDF
                                            </a>
                                        </td>
                                        <td style={{ padding: '13px 14px' }}><MouBadge status={mou.status} expiresAt={mou.expires_at} /></td>
                                        <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                                            {mou.status === 'active' && (
                                                <button onClick={() => setTerminateTarget(mou)} style={{
                                                    height: 30, padding: '0 12px', borderRadius: 7,
                                                    border: `1.5px solid #fecaca`, background: T.redLight,
                                                    color: T.red, fontSize: 12, fontWeight: 600,
                                                    cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.14s',
                                                }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                                    onMouseLeave={e => e.currentTarget.style.background = T.redLight}
                                                >Akhiri</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {mous.length === 0 && (
                                    <tr><td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', fontSize: 13, color: T.muted }}>Belum ada dokumen MoU.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Unggah Dokumen MoU"
                footer={<>
                    <BtnGhost onClick={() => setUploadOpen(false)}>Batal</BtnGhost>
                    <button type="submit" form="mou-form" disabled={processing} style={{
                        height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
                        background: processing ? T.muted : T.orange, color: '#fff',
                        fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.15s',
                        boxShadow: processing ? 'none' : '0 2px 8px rgba(249,115,22,0.3)',
                    }}>
                        {processing ? 'Mengunggah...' : 'Unggah & Simpan'}
                    </button>
                </>}
            >
                <form id="mou-form" onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <FieldLabel>Perusahaan Mitra</FieldLabel>
                        <Select value={data.company_id} onValueChange={v => setData('company_id', v)}>
                            <SelectTrigger style={{ height: 42, borderRadius: 9, border: `1.5px solid ${T.border}`, background: T.bg, fontSize: 13.5 }}>
                                <SelectValue placeholder="Pilih perusahaan..." />
                            </SelectTrigger>
                            <SelectContent>
                                {companies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.company_id} className="mt-1.5" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <FieldLabel>Tgl. Penandatanganan</FieldLabel>
                            <input type="date" style={fieldBase} value={data.signed_at}
                                onChange={e => setData('signed_at', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                            <InputError message={errors.signed_at} className="mt-1.5" />
                        </div>
                        <div>
                            <FieldLabel>Berlaku Sampai</FieldLabel>
                            <input type="date" style={fieldBase} value={data.expires_at}
                                onChange={e => setData('expires_at', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                            <InputError message={errors.expires_at} className="mt-1.5" />
                        </div>
                    </div>
                    <div>
                        <FieldLabel>File Dokumen (PDF, maks 5MB)</FieldLabel>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 9, border: `1.5px dashed ${data.file ? T.navyMid : T.border}`, background: data.file ? T.navyLight : T.bg, cursor: 'pointer', transition: 'all 0.18s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = T.navyMid}
                            onMouseLeave={e => e.currentTarget.style.borderColor = data.file ? T.navyMid : T.border}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: data.file ? T.navyMid : '#e2e8f0', color: data.file ? '#fff' : T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.18s' }}>
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: data.file ? T.navyMid : T.mutedDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {data.file ? data.file.name : 'Klik untuk memilih file PDF'}
                                </div>
                                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Maksimal ukuran 5MB</div>
                            </div>
                            <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setData('file', e.target.files[0])} />
                        </label>
                        <InputError message={errors.file} className="mt-1.5" />
                    </div>
                </form>
            </Modal>

            {/* Terminate Confirm Modal */}
            <Modal open={!!terminateTarget} onClose={() => setTerminateTarget(null)} title="Konfirmasi Akhiri MoU"
                footer={<>
                    <BtnGhost onClick={() => setTerminateTarget(null)}>Batal</BtnGhost>
                    <button onClick={handleTerminate} disabled={terminating} style={{
                        height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
                        background: terminating ? T.muted : T.red, color: '#fff',
                        fontSize: 13, fontWeight: 700, cursor: terminating ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.15s',
                        boxShadow: terminating ? 'none' : '0 2px 8px rgba(220,38,38,0.28)',
                    }}
                        onMouseEnter={e => { if (!terminating) { e.currentTarget.style.background = '#b91c1c'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.background = terminating ? T.muted : T.red; e.currentTarget.style.transform = 'none'; }}
                    >
                        {terminating ? 'Mengakhiri...' : 'Ya, Akhiri MoU'}
                    </button>
                </>}
            >
                {terminateTarget && (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: T.redLight, color: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                        </div>
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: T.navy, margin: '0 0 5px' }}>
                                Akhiri MoU dengan <em style={{ fontStyle: 'normal', color: T.red }}>{terminateTarget.company?.name}</em>?
                            </p>
                            <p style={{ fontSize: 13, color: T.mutedDark, margin: 0, lineHeight: 1.55 }}>
                                Status MoU akan berubah menjadi <strong>Diakhiri</strong> dan tidak dapat diaktifkan kembali secara otomatis.
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
