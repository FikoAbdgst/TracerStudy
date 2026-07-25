import React, { useState, useEffect, useCallback } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626', redLight: '#fff1f2',
    gray: '#6b7280', grayLight: '#f3f4f6',
    purple: '#7c3aed', purpleLight: '#f5f3ff',
};

const ALL_STATUSES = [
    { value: 'Bekerja', label: 'Bekerja', icon: '💼' },
    { value: 'Mencari Kerja', label: 'Mencari Kerja', icon: '🔍' },
    { value: 'Wiraswasta', label: 'Wiraswasta', icon: '🚀' },
    { value: 'Lanjutkan Pendidikan', label: 'Lanjutkan Pendidikan', icon: '🎓' },
];

/* ─── Modal ──────────────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children, footer, wide = false, maxWidth }) {
    const [visible, setVisible] = useState(false);
    const [render, setRender] = useState(false);
    useEffect(() => {
        if (open) { setRender(true); requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); }
        else { setVisible(false); const t = setTimeout(() => setRender(false), 260); return () => clearTimeout(t); }
    }, [open]);
    if (!render) return null;
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease',
        }}>
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)', cursor: 'default' }} />
            <div style={{
                background: '#fff', borderRadius: 16,
                position: 'relative', width: '100%', maxWidth: maxWidth || (wide ? 720 : 460),
                boxShadow: '0 24px 60px rgba(10,20,40,0.2)',
                display: 'flex', flexDirection: 'column',
                maxHeight: '92vh',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
                transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1)',
            }}>
                <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.borderSoft}`, flexShrink: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: T.navy }}>{title}</span>
                    <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: T.bg, color: T.mutedDark, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = T.border}
                        onMouseLeave={e => e.currentTarget.style.background = T.bg}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1 }}>{children}</div>
                {footer && <>
                    <div style={{ height: 1, background: T.borderSoft, flexShrink: 0 }} />
                    <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>{footer}</div>
                </>}
            </div>
        </div>
    );
}

/* ─── Alert Dialog ───────────────────────────────────────────────────────── */
function AlertDialog({ open, onClose, onConfirm, title, message, processing, confirmLabel, confirmIcon }) {
    const [visible, setVisible] = useState(false);
    const [render, setRender] = useState(false);
    useEffect(() => {
        if (open) { setRender(true); requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); }
        else { setVisible(false); const t = setTimeout(() => setRender(false), 260); return () => clearTimeout(t); }
    }, [open]);
    if (!render) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease' }}>
            <div onClick={!processing ? onClose : undefined} style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)', cursor: 'default' }} />
            <div style={{ background: '#fff', borderRadius: 16, position: 'relative', width: '100%', maxWidth: 420, boxShadow: '0 24px 60px rgba(10,20,40,0.2)', display: 'flex', flexDirection: 'column', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)', transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1)', overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.borderSoft}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: T.redLight, color: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {confirmIcon || <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 800, color: T.navy }}>{title}</span>
                    </div>
                    <button onClick={!processing ? onClose : undefined} disabled={processing} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: T.bg, color: T.mutedDark, cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: processing ? 0.4 : 1 }}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div style={{ padding: '16px 22px 20px' }}>
                    <p style={{ fontSize: 13, color: T.mutedDark, lineHeight: 1.65, margin: 0 }}>{message}</p>
                </div>
                <div style={{ height: 1, background: T.borderSoft, flexShrink: 0 }} />
                <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <button onClick={onClose} disabled={processing} style={{ height: 36, padding: '0 16px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: 'transparent', color: T.mutedDark, fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: processing ? 0.5 : 1 }}>Batal</button>
                    <button onClick={onConfirm} disabled={processing} style={{ height: 36, padding: '0 18px', borderRadius: 8, border: 'none', background: processing ? T.muted : T.orange, color: '#fff', fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {processing ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}><path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg> Memproses...</> : <>{confirmLabel || 'Ya, Tutup'}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Preview Modal ──────────────────────────────────────────────────────── */
function PreviewModal({ open, onClose, formId, formTitle }) {
    const [activeTab, setActiveTab] = useState('table');
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open) {
            setActiveTab('table');
            setTableData(null);
            setError(null);
            return;
        }
        setLoading(true);
        setError(null);
        fetch(route('adminkampus.tracer.preview.excel', formId))
            .then(r => { if (!r.ok) throw new Error('Gagal memuat data'); return r.json(); })
            .then(d => { setTableData(d); setLoading(false); })
            .catch(e => { setError(e.message); setLoading(false); });
    }, [open, formId]);

    if (!open || !formId) return null;

    const pdfUrl = route('adminkampus.tracer.preview.pdf', formId);
    const downloadExcelUrl = route('adminkampus.tracer.export.excel', formId);
    const downloadPdfUrl = route('adminkampus.tracer.export.pdf', formId);

    const tabs = [
        { key: 'table', label: 'Tabel Data', icon: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M3 6h18M3 18h18" /></svg> },
        { key: 'pdf', label: 'Preview PDF', icon: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
    ];

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,40,0.55)', backdropFilter: 'blur(4px)', cursor: 'default' }} />
            <div style={{ background: '#fff', borderRadius: 16, position: 'relative', width: '100%', maxWidth: 1100, height: '90vh', boxShadow: '0 24px 80px rgba(10,20,40,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.borderSoft}`, flexShrink: 0, background: '#fafbfc' }}>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: T.navy }}>Preview Ekspor</div>
                        <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{formTitle}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <a href={downloadExcelUrl} style={{ height: 34, padding: '0 14px', borderRadius: 8, border: 'none', background: T.greenLight, color: '#059669', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Unduh Excel
                        </a>
                        <a href={downloadPdfUrl} style={{ height: 34, padding: '0 14px', borderRadius: 8, border: 'none', background: T.redLight, color: T.red, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Unduh PDF
                        </a>
                        <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', color: T.mutedDark, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4 }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ padding: '0 22px', display: 'flex', gap: 0, borderBottom: `1px solid ${T.borderSoft}`, flexShrink: 0, background: '#fafbfc' }}>
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                            height: 40, padding: '0 16px', border: 'none', background: 'transparent',
                            fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 600,
                            color: activeTab === tab.key ? T.navy : T.muted,
                            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                            borderBottom: activeTab === tab.key ? `2px solid ${T.navy}` : '2px solid transparent',
                            display: 'flex', alignItems: 'center', gap: 6, marginBottom: -1,
                        }}>
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'hidden', background: activeTab === 'pdf' ? '#e2e8f0' : '#fff' }}>
                    {activeTab === 'table' && (
                        <div style={{ height: '100%', overflow: 'auto', padding: 0 }}>
                            {loading && <LoadingState />}
                            {error && <ErrorState message={error} />}
                            {tableData && <PreviewTable data={tableData} />}
                        </div>
                    )}
                    {activeTab === 'pdf' && (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'stretch' }}>
                            <iframe src={pdfUrl} style={{ flex: 1, border: 'none' }} title="Preview PDF" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Preview Table (Excel data) ─────────────────────────────────────────── */
function PreviewTable({ data }) {
    if (!data?.rows?.length) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, padding: 40 }}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke={T.muted} strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                <p style={{ fontSize: 13, color: T.muted }}>Belum ada data respons untuk ditampilkan.</p>
            </div>
        );
    }

    const cols = Object.entries(data.columns || {});

    return (
        <div>
            {/* Summary Bar */}
            <div style={{ padding: '12px 22px', borderBottom: `1px solid ${T.borderSoft}`, display: 'flex', alignItems: 'center', gap: 16, background: '#fafbfc', position: 'sticky', top: 0, zIndex: 5 }}>
                <span style={{ fontSize: 12, color: T.muted }}>Menampilkan <strong style={{ color: T.navy }}>{data.rows.length}</strong> data</span>
                <span style={{ fontSize: 11, color: T.muted }}>|</span>
                <span style={{ fontSize: 12, color: T.muted }}>{data.columns ? Object.keys(data.columns).length - 7 : 0} pertanyaan tambahan</span>
            </div>
            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                        <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                            {cols.map(([key, label], i) => (
                                <th key={key} style={{ padding: '10px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#374151', textAlign: i === 0 ? 'center' : 'left', whiteSpace: 'nowrap', position: 'sticky', top: 0, background: T.bg }}>
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((row, i) => (
                            <tr key={i} style={{ borderBottom: `1px solid ${T.borderSoft}` }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {cols.map(([key], ci) => (
                                    <td key={key} style={{ padding: '9px 12px', fontSize: 12, color: ci === 0 ? T.mutedDark : T.navy, fontWeight: ci === 0 ? 700 : 400, textAlign: ci === 0 ? 'center' : 'left', whiteSpace: key === 'nim' || key === 'tanggal' ? 'nowrap' : 'normal' }}>
                                        {key === 'status' ? (
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: row[key] === 'Bekerja' ? T.navyLight : row[key] === 'Mencari Kerja' ? T.orangeLight : row[key] === 'Wiraswasta' ? T.greenLight : row[key] === 'Lanjutkan Pendidikan' ? T.purpleLight : T.bg, color: row[key] === 'Bekerja' ? T.navyMid : row[key] === 'Mencari Kerja' ? T.orange : row[key] === 'Wiraswasta' ? T.green : row[key] === 'Lanjutkan Pendidikan' ? T.purple : T.mutedDark }}>
                                                {row[key] || '-'}
                                            </span>
                                        ) : (row[key] || '-')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ─── Loading / Error states ─────────────────────────────────────────────── */
function LoadingState() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: 40 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.navyMid} strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                <path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <p style={{ fontSize: 13, color: T.muted, fontWeight: 500 }}>Memuat data preview...</p>
        </div>
    );
}

function ErrorState({ message }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, padding: 40 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: T.redLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={T.red} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            </div>
            <p style={{ fontSize: 13, color: T.red, fontWeight: 600 }}>{message}</p>
            <p style={{ fontSize: 12, color: T.muted }}>Tidak ada data respons untuk kuesioner ini.</p>
        </div>
    );
}

/* ─── Shared small components ────────────────────────────────────────────── */
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

const ACTION_BTN = {
    height: 32, padding: '0 12px', borderRadius: 7, fontSize: 12, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.14s',
    display: 'inline-flex', alignItems: 'center', gap: 5,
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function TracerStudyIndex({ forms }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [closeAlertOpen, setCloseAlertOpen] = useState(false);
    const [idToClose, setIdToClose] = useState(null);
    const [isClosing, setIsClosing] = useState(false);

    const [activateAlertOpen, setActivateAlertOpen] = useState(false);
    const [idToActivate, setIdToActivate] = useState(null);
    const [isActivating, setIsActivating] = useState(false);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewFormId, setPreviewFormId] = useState(null);
    const [previewFormTitle, setPreviewFormTitle] = useState('');

    const { data, setData, post, put, processing, reset } = useForm({
        title: '', description: '', questions: [],
    });

    const openCreate = () => { reset(); setIsEditing(false); setModalOpen(true); };
    const openEdit = form => {
        setSelectedId(form.id);
        const questions = (form.questions || []).map(q => ({ ...q, target_statuses: q.target_statuses || [] }));
        setData({ title: form.title, description: form.description || '', questions });
        setIsEditing(true); setModalOpen(true);
    };

    const openPreview = (form) => {
        setPreviewFormId(form.id);
        setPreviewFormTitle(form.title);
        setPreviewOpen(true);
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (isEditing) put(route('adminkampus.tracer.update', selectedId), { onSuccess: () => setModalOpen(false) });
        else post(route('adminkampus.tracer.store'), { onSuccess: () => setModalOpen(false) });
    };

    const confirmClose = (id) => { setIdToClose(id); setCloseAlertOpen(true); };
    const executeClose = () => {
        setIsClosing(true);
        router.patch(route('adminkampus.tracer.close', idToClose), {}, {
            preserveScroll: true,
            onSuccess: () => { setCloseAlertOpen(false); setIdToClose(null); },
            onFinish: () => setIsClosing(false),
        });
    };

    const confirmActivate = (id) => { setIdToActivate(id); setActivateAlertOpen(true); };
    const executeActivate = () => {
        setIsActivating(true);
        router.patch(route('adminkampus.tracer.activate', idToActivate), {}, {
            preserveScroll: true,
            onSuccess: () => { setActivateAlertOpen(false); setIdToActivate(null); },
            onFinish: () => setIsActivating(false),
        });
    };

    const confirmDelete = (id) => { setIdToDelete(id); setDeleteAlertOpen(true); };
    const executeDelete = () => {
        setIsDeleting(true);
        router.delete(route('adminkampus.tracer.destroy', idToDelete), {
            preserveScroll: true,
            onSuccess: () => { setDeleteAlertOpen(false); setIdToDelete(null); },
            onFinish: () => setIsDeleting(false),
        });
    };

    const addQuestion = () => setData('questions', [...data.questions, { id: Date.now(), type: 'text', question: '', options: [], target_statuses: [] }]);
    const removeQuestion = id => setData('questions', data.questions.filter(q => q.id !== id));
    const updateQuestion = (id, field, value) => setData('questions', data.questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    const toggleTargetStatus = (qId, status) => setData('questions', data.questions.map(q => {
        if (q.id !== qId) return q;
        const current = q.target_statuses || [];
        const next = current.includes(status) ? current.filter(s => s !== status) : [...current, status];
        return { ...q, target_statuses: next };
    }));
    const addOption = qId => setData('questions', data.questions.map(q => q.id === qId ? { ...q, options: [...q.options, 'Opsi Baru'] } : q));
    const updateOption = (qId, idx, val) => setData('questions', data.questions.map(q => {
        if (q.id !== qId) return q;
        const opts = [...q.options]; opts[idx] = val; return { ...q, options: opts };
    }));

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Kuesioner Tracer Study</h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Buat dan kelola form kuesioner untuk alumni</p>
                </div>
            }
        >
            <Head title="Tracer Study — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                [data-radix-popper-content-wrapper] { z-index: 99999 !important; }
                .ak-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes rowIn  { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
                @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                .tbl-row:hover td { background:#fafbfc; }
                .q-card { background:#fff; border-radius:10px; border:1px solid ${T.borderSoft}; padding:16px; margin-bottom:10px; }
                .q-card:last-child { margin-bottom:0; }
            `}</style>

            <div className="ak-root">
                <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20, animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', marginBottom: 18 }}>
                        <p style={{ fontSize: 13, color: T.muted, margin: 0, flex: 1 }}>
                            Total <span style={{ fontWeight: 700, color: T.navy }}>{forms.length}</span> kuesioner
                            {forms.filter(f => f.status === 'active').length > 0 && (
                                <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: T.greenLight, color: T.green }}>
                                    {forms.filter(f => f.status === 'active').length} Aktif
                                </span>
                            )}
                        </p>
                        <button onClick={openCreate} style={{
                            height: 40, padding: '0 16px', borderRadius: 9, border: 'none',
                            background: T.orange, color: '#fff', fontSize: 13, fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: 6,
                            boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = T.orange; e.currentTarget.style.transform = 'none'; }}
                        >
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            Buat Kuesioner
                        </button>
                    </div>

                    <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.borderSoft}` }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                                    {['Judul Kuesioner', 'Pertanyaan', 'Status', 'Aksi'].map((h, i) => (
                                        <th key={i} style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {forms.map((form, i) => (
                                    <tr key={form.id} className="tbl-row" style={{ borderBottom: `1px solid ${T.borderSoft}`, animation: `rowIn 0.26s ${i * 0.04}s both` }}>
                                        <td style={{ padding: '14px' }}>
                                            <div style={{ fontSize: 13.5, fontWeight: 700, color: T.navy }}>{form.title}</div>
                                            {form.description && <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2, maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.description}</div>}
                                        </td>
                                        <td style={{ padding: '14px' }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: T.navyLight, color: T.navyMid }}>
                                                {form.questions?.length || 0} Pertanyaan
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px' }}>
                                            <span style={{
                                                fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                                                background: form.status === 'active' ? T.greenLight : form.status === 'draft' ? T.grayLight : T.redLight,
                                                color: form.status === 'active' ? T.green : form.status === 'draft' ? T.gray : T.red,
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                            }}>
                                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: form.status === 'active' ? T.green : form.status === 'draft' ? T.gray : T.red, flexShrink: 0 }} />
                                                {form.status === 'active' ? 'Aktif' : form.status === 'draft' ? 'Draft' : 'Ditutup'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, flexWrap: 'wrap' }}>
                                                {/* Preview Button — always visible */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openPreview(form); }}
                                                    style={{ ...ACTION_BTN, background: T.navyLight, color: T.navyMid, border: 'none' }}
                                                >
                                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    Preview &amp; Unduh
                                                </button>

                                                {/* Status-specific actions */}
                                                {form.status === 'draft' && (
                                                    <>
                                                        <button onClick={() => confirmActivate(form.id)} style={{ ...ACTION_BTN, border: `1.5px solid ${T.green}`, background: T.greenLight, color: T.green }}>
                                                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                            Aktifkan
                                                        </button>
                                                        <button onClick={() => openEdit(form)} style={{ ...ACTION_BTN, border: `1.5px solid ${T.border}`, background: T.bg, color: T.navyMid }}>
                                                            Edit
                                                        </button>
                                                        <button onClick={() => confirmDelete(form.id)} style={{ ...ACTION_BTN, border: `1.5px solid #fecaca`, background: '#fff5f5', color: T.red }}>
                                                            Hapus
                                                        </button>
                                                    </>
                                                )}

                                                {form.status === 'active' && (
                                                    <>
                                                        <button onClick={() => confirmClose(form.id)} style={{ ...ACTION_BTN, border: `1.5px solid ${T.orange}`, background: T.orangeLight, color: T.orange }}>
                                                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                            Tutup
                                                        </button>
                                                        <Link href={route('adminkampus.tracer.responses', form.id)}>
                                                            <button style={{ ...ACTION_BTN, border: `1.5px solid ${T.border}`, background: T.bg, color: T.navyMid }}>
                                                                Jawaban
                                                            </button>
                                                        </Link>
                                                        <button onClick={() => openEdit(form)} style={{ ...ACTION_BTN, border: `1.5px solid ${T.border}`, background: T.bg, color: T.navyMid }}>
                                                            Edit
                                                        </button>
                                                    </>
                                                )}

                                                {form.status === 'closed' && (
                                                    <>
                                                        <Link href={route('adminkampus.tracer.responses', form.id)}>
                                                            <button style={{ ...ACTION_BTN, border: `1.5px solid ${T.border}`, background: T.bg, color: T.navyMid }}>
                                                                Jawaban
                                                            </button>
                                                        </Link>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {forms.length === 0 && (
                                    <tr><td colSpan={4} style={{ padding: '48px 16px', textAlign: 'center', fontSize: 13, color: T.muted }}>Belum ada form kuesioner. Klik tombol buat kuesioner di atas.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Activate Confirmation */}
            <AlertDialog open={activateAlertOpen} onClose={() => !isActivating && setActivateAlertOpen(false)} onConfirm={executeActivate} processing={isActivating} title="Aktifkan Kuesioner?" message="Kuesioner akan dipublikasikan dan bisa diisi oleh alumni. Jika ada kuesioner lain yang sedang aktif, kuesioner tersebut akan ditutup otomatis. Hanya 1 kuesioner yang bisa aktif dalam satu waktu." confirmLabel="Ya, Aktifkan" confirmIcon={<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />

            {/* Close Confirmation */}
            <AlertDialog open={closeAlertOpen} onClose={() => !isClosing && setCloseAlertOpen(false)} onConfirm={executeClose} processing={isClosing} title="Tutup Kuesioner?" message="Apakah Anda yakin ingin menutup sesi Tracer Study ini? Sesi yang sudah ditutup tidak akan dapat diaktifkan kembali. Semua data jawaban tetap tersimpan di sistem." confirmLabel="Ya, Tutup Permanen" />

            {/* Delete Confirmation */}
            <AlertDialog open={deleteAlertOpen} onClose={() => !isDeleting && setDeleteAlertOpen(false)} onConfirm={executeDelete} processing={isDeleting} title="Hapus Kuesioner?" message="Tindakan ini tidak dapat dibatalkan. Semua daftar pertanyaan dan jawaban dari alumni terkait kuesioner ini akan dihapus secara permanen dari sistem." confirmLabel="Ya, Hapus" />

            {/* Preview Modal */}
            <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} formId={previewFormId} formTitle={previewFormTitle} />

            {/* Form Builder Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}
                title={isEditing ? 'Edit Kuesioner' : 'Rancang Kuesioner Baru'}
                wide
                footer={<>
                    <BtnGhost onClick={() => setModalOpen(false)}>Batal</BtnGhost>
                    <button type="submit" form="tracer-form" disabled={processing} style={{
                        height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
                        background: processing ? T.muted : T.orange, color: '#fff',
                        fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.15s',
                        boxShadow: processing ? 'none' : '0 2px 8px rgba(249,115,22,0.3)',
                    }}>
                        {processing ? 'Menyimpan...' : 'Simpan Kuesioner'}
                    </button>
                </>}
            >
                <form id="tracer-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ padding: '14px 16px', borderRadius: 10, background: T.bg, border: `1px solid ${T.borderSoft}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                            <FieldLabel>Judul Kuesioner</FieldLabel>
                            <input style={fieldBase} value={data.title} onChange={e => setData('title', e.target.value)}
                                placeholder="Contoh: Tracer Study Lulusan 2025" onFocus={onFocus} onBlur={onBlur} required />
                        </div>
                        <div>
                            <FieldLabel>Deskripsi (Opsional)</FieldLabel>
                            <textarea style={{ ...fieldBase, height: 'auto', padding: '10px 13px', resize: 'vertical' }}
                                rows={2} value={data.description} onChange={e => setData('description', e.target.value)}
                                placeholder="Penjelasan singkat tujuan kuesioner..." onFocus={onFocus} onBlur={onBlur} />
                        </div>
                    </div>

                    {/* Locked system questions */}
                    <div style={{ marginBottom: 20, padding: '16px 18px', borderRadius: 10, background: '#fffbeb', border: `1.5px solid #fed7aa` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#d97706" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#92400e' }}>Pertanyaan Wajib Sistem (Statis)</span>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: '#fed7aa', color: '#92400e' }}>LOCKED</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fff', border: `1px solid #fde68a` }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 2 }}>Q1 — Status Pekerjaan Saat Ini <span style={{ color: '#ef4444' }}>*</span></div>
                                    <div style={{ fontSize: 12.5, color: T.mutedDark }}>Pilihan: Bekerja / Mencari Kerja / Wiraswasta / Lanjutkan Pendidikan</div>
                                </div>
                            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fff', border: `1px solid #fde68a` }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 2 }}>Q2 — Nama Perusahaan / Instansi / Usaha</div>
                                <div style={{ fontSize: 12.5, color: T.mutedDark }}>Input teks (opsional jika tidak bekerja)</div>
                            </div>
                            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fff', border: `1px solid #fde68a` }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 2 }}>Q3 — Jabatan / Posisi</div>
                                <div style={{ fontSize: 12.5, color: T.mutedDark }}>Input teks (wajib jika status "Bekerja")</div>
                            </div>
                        </div>
                        <div style={{ fontSize: 11, color: '#b45309', marginTop: 10, fontStyle: 'italic' }}>
                            Pertanyaan di atas bersifat bawaan sistem dan tidak dapat diubah.
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 3, height: 16, background: T.orange, borderRadius: 2 }} />
                                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: T.navy }}>Pertanyaan ({data.questions.length})</span>
                            </div>
                            <button type="button" onClick={addQuestion} style={{ height: 30, padding: '0 12px', borderRadius: 7, border: `1.5px solid ${T.orange}`, background: T.orangeLight, color: T.orange, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                Tambah Pertanyaan
                            </button>
                        </div>

                        {data.questions.map((q, idx) => (
                            <div key={q.id} className="q-card">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: T.navyLight, color: T.navyMid }}>Pertanyaan {idx + 1}</span>
                                    <button type="button" onClick={() => removeQuestion(q.id)} style={{ height: 26, padding: '0 10px', borderRadius: 6, border: `1.5px solid #fecaca`, background: T.redLight, color: T.red, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Hapus</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: q.type === 'radio' ? 10 : 0 }}>
                                    <div>
                                        <FieldLabel>Teks Pertanyaan</FieldLabel>
                                        <input style={fieldBase} value={q.question} onChange={e => updateQuestion(q.id, 'question', e.target.value)} placeholder="Tulis pertanyaan..." onFocus={onFocus} onBlur={onBlur} required />
                                    </div>
                                    <div style={{ minWidth: 160 }}>
                                        <FieldLabel>Tipe Jawaban</FieldLabel>
                                        <Select value={q.type} onValueChange={v => updateQuestion(q.id, 'type', v)}>
                                            <SelectTrigger className="focus:ring-0 focus:ring-offset-0" style={{ height: 42, borderRadius: 9, border: `1.5px solid ${T.border}`, background: T.bg, fontSize: 13 }}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent position="popper" sideOffset={4} className="z-[500] rounded-xl overflow-hidden border border-gray-200 shadow-xl" style={{ background: "#ffffff", minWidth: "var(--radix-select-trigger-width)" }}>
                                                <SelectItem className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50" style={{ color: "#1e293b", background: "transparent" }} value="text">Teks Singkat</SelectItem>
                                                <SelectItem className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50" style={{ color: "#1e293b", background: "transparent" }} value="textarea">Paragraf</SelectItem>
                                                <SelectItem className="text-sm cursor-pointer px-3 py-2 outline-none data-[highlighted]:bg-slate-50" style={{ color: "#1e293b", background: "transparent" }} value="radio">Pilihan Ganda</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {q.type === 'radio' && (
                                    <div style={{ paddingLeft: 12, borderLeft: `3px solid ${T.orange}` }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 6 }}>Pilihan Jawaban</div>
                                        {q.options.map((opt, oi) => (
                                            <input key={oi} style={{ ...fieldBase, height: 36, marginBottom: 5, width: '65%', fontSize: 13 }} value={opt} onChange={e => updateOption(q.id, oi, e.target.value)} placeholder={`Opsi ${oi + 1}`} onFocus={onFocus} onBlur={onBlur} />
                                        ))}
                                        <button type="button" onClick={() => addOption(q.id)} style={{ fontSize: 12, fontWeight: 600, color: T.orange, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'inherit' }}>+ Tambah Opsi</button>
                                    </div>
                                )}
                                <div style={{ marginTop: q.type === 'radio' ? 12 : 8, padding: '10px 12px', borderRadius: 8, background: T.bg, border: `1px solid ${T.borderSoft}` }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 6 }}>Tampilkan untuk Status</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {ALL_STATUSES.map(s => {
                                            const active = (q.target_statuses || []).includes(s.value);
                                            return (
                                                <button key={s.value} type="button" onClick={() => toggleTargetStatus(q.id, s.value)} style={{
                                                    height: 28, padding: '0 10px', borderRadius: 14, fontSize: 11, fontWeight: 600,
                                                    border: `1.5px solid ${active ? T.orange : T.border}`,
                                                    background: active ? T.orangeLight : '#fff',
                                                    color: active ? T.orange : T.mutedDark,
                                                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                                }}>
                                                    {s.icon} {s.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {(!q.target_statuses || q.target_statuses.length === 0) && (
                                        <div style={{ fontSize: 10, color: T.muted, marginTop: 4, fontStyle: 'italic' }}>Semua status (default)</div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {data.questions.length === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', borderRadius: 10, border: `2px dashed ${T.borderSoft}`, gap: 8 }}>
                                <div style={{ fontSize: 28 }}>📝</div>
                                <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>Belum ada pertanyaan. Klik "+ Tambah Pertanyaan" untuk mulai.</p>
                            </div>
                        )}
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
