import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626', redLight: '#fff1f2',
};

/* ─── Modal (with maxHeight scroll for form builder) ─────────────────────── */
function Modal({ open, onClose, title, children, footer, wide = false }) {
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
                background: '#fff', borderRadius: 16,
                width: '100%', maxWidth: wide ? 720 : 460,
                boxShadow: '0 24px 60px rgba(10,20,40,0.2)',
                display: 'flex', flexDirection: 'column',
                maxHeight: '90vh',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
                transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1)',
            }}>
                {/* sticky header */}
                <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.borderSoft}`, flexShrink: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: T.navy }}>{title}</span>
                    <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: T.bg, color: T.mutedDark, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = T.border}
                        onMouseLeave={e => e.currentTarget.style.background = T.bg}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {/* scrollable body */}
                <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1 }}>{children}</div>
                {/* sticky footer */}
                {footer && <>
                    <div style={{ height: 1, background: T.borderSoft, flexShrink: 0 }} />
                    <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>{footer}</div>
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

export default function TracerStudyIndex({ forms }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const { data, setData, post, put, processing, reset } = useForm({
        title: '', description: '', questions: [],
    });

    const openCreate = () => { reset(); setIsEditing(false); setModalOpen(true); };
    const openEdit = form => {
        setSelectedId(form.id);
        setData({ title: form.title, description: form.description || '', questions: form.questions || [] });
        setIsEditing(true); setModalOpen(true);
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (isEditing) put(route('adminkampus.tracer.update', selectedId), { onSuccess: () => setModalOpen(false) });
        else post(route('adminkampus.tracer.store'), { onSuccess: () => setModalOpen(false) });
    };

    const toggleStatus = id => router.patch(route('adminkampus.tracer.toggle', id), {}, { preserveScroll: true });

    const addQuestion = () => setData('questions', [...data.questions, { id: Date.now(), type: 'text', question: '', options: [] }]);
    const removeQuestion = id => setData('questions', data.questions.filter(q => q.id !== id));
    const updateQuestion = (id, field, value) => setData('questions', data.questions.map(q => q.id === id ? { ...q, [field]: value } : q));
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
                .ak-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes rowIn  { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
                .tbl-row:hover td { background:#fafbfc; }
                .q-card { background:#fff; border-radius:10px; border:1px solid ${T.borderSoft}; padding:16px; margin-bottom:10px; }
                .q-card:last-child { margin-bottom:0; }
            `}</style>

            <div className="ak-root">
                <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20, animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                        <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
                            Total <span style={{ fontWeight: 700, color: T.navy }}>{forms.length}</span> kuesioner
                            {forms.filter(f => f.is_active).length > 0 && (
                                <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: T.greenLight, color: T.green }}>
                                    {forms.filter(f => f.is_active).length} Aktif
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
                                        <th key={i} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {forms.map((form, i) => (
                                    <tr key={form.id} className="tbl-row" style={{ borderBottom: `1px solid ${T.borderSoft}`, animation: `rowIn 0.26s ${i * 0.04}s both` }}>
                                        <td style={{ padding: '13px 14px' }}>
                                            <div style={{ fontSize: 13.5, fontWeight: 700, color: T.navy }}>{form.title}</div>
                                            {form.description && <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.description}</div>}
                                        </td>
                                        <td style={{ padding: '13px 14px' }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: T.navyLight, color: T.navyMid }}>
                                                {form.questions?.length || 0} Pertanyaan
                                            </span>
                                        </td>
                                        <td style={{ padding: '13px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Switch checked={form.is_active} onCheckedChange={() => toggleStatus(form.id)} />
                                                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: form.is_active ? T.greenLight : T.borderSoft, color: form.is_active ? T.green : T.mutedDark }}>
                                                    {form.is_active ? 'Aktif' : 'Draft'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                                            <button onClick={() => openEdit(form)} style={{
                                                height: 30, padding: '0 13px', borderRadius: 7,
                                                border: `1.5px solid ${T.border}`, background: T.bg,
                                                color: T.navyMid, fontSize: 12, fontWeight: 600,
                                                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.14s',
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = T.navyMid; e.currentTarget.style.background = T.navyLight; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.bg; }}
                                            >Edit Form</button>
                                        </td>
                                    </tr>
                                ))}
                                {forms.length === 0 && (
                                    <tr><td colSpan={4} style={{ padding: '48px 16px', textAlign: 'center', fontSize: 13, color: T.muted }}>Belum ada form kuesioner.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

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
                    {/* Info dasar */}
                    <div style={{ padding: '14px 16px', borderRadius: 10, background: T.bg, border: `1px solid ${T.borderSoft}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                            <FieldLabel>Judul Kuesioner</FieldLabel>
                            <input style={fieldBase} value={data.title} onChange={e => setData('title', e.target.value)}
                                placeholder="Contoh: Tracer Study Lulusan 2025" onFocus={onFocus} onBlur={onBlur} required />
                        </div>
                        <div>
                            <FieldLabel>Deskripsi (Opsional)</FieldLabel>
                            <textarea
                                style={{ ...fieldBase, height: 'auto', padding: '10px 13px', resize: 'vertical' }}
                                rows={2} value={data.description} onChange={e => setData('description', e.target.value)}
                                placeholder="Penjelasan singkat tujuan kuesioner..." onFocus={onFocus} onBlur={onBlur} />
                        </div>
                    </div>

                    {/* Question Builder */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 3, height: 16, background: T.orange, borderRadius: 2 }} />
                                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: T.navy }}>
                                    Pertanyaan ({data.questions.length})
                                </span>
                            </div>
                            <button type="button" onClick={addQuestion} style={{
                                height: 30, padding: '0 12px', borderRadius: 7,
                                border: `1.5px solid ${T.orange}`, background: T.orangeLight,
                                color: T.orange, fontSize: 12, fontWeight: 700,
                                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.14s',
                                display: 'flex', alignItems: 'center', gap: 5,
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = '#ffedd5'}
                                onMouseLeave={e => e.currentTarget.style.background = T.orangeLight}
                            >
                                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                Tambah Pertanyaan
                            </button>
                        </div>

                        {data.questions.map((q, idx) => (
                            <div key={q.id} className="q-card">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: T.navyLight, color: T.navyMid }}>Pertanyaan {idx + 1}</span>
                                    <button type="button" onClick={() => removeQuestion(q.id)} style={{
                                        height: 26, padding: '0 10px', borderRadius: 6,
                                        border: `1.5px solid #fecaca`, background: T.redLight,
                                        color: T.red, fontSize: 11, fontWeight: 600,
                                        cursor: 'pointer', fontFamily: 'inherit',
                                    }}>Hapus</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: q.type === 'radio' ? 10 : 0 }}>
                                    <div>
                                        <FieldLabel>Teks Pertanyaan</FieldLabel>
                                        <input style={fieldBase} value={q.question} onChange={e => updateQuestion(q.id, 'question', e.target.value)}
                                            placeholder="Tulis pertanyaan..." onFocus={onFocus} onBlur={onBlur} required />
                                    </div>
                                    <div style={{ minWidth: 160 }}>
                                        <FieldLabel>Tipe Jawaban</FieldLabel>
                                        <Select value={q.type} onValueChange={v => updateQuestion(q.id, 'type', v)}>
                                            <SelectTrigger style={{ height: 42, borderRadius: 9, border: `1.5px solid ${T.border}`, background: T.bg, fontSize: 13 }}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">Teks Singkat</SelectItem>
                                                <SelectItem value="textarea">Paragraf</SelectItem>
                                                <SelectItem value="radio">Pilihan Ganda</SelectItem>
                                                <SelectItem value="master_industry">Dropdown Industri</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {q.type === 'radio' && (
                                    <div style={{ paddingLeft: 12, borderLeft: `3px solid ${T.orange}` }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted, marginBottom: 6 }}>Pilihan Jawaban</div>
                                        {q.options.map((opt, oi) => (
                                            <input key={oi} style={{ ...fieldBase, height: 36, marginBottom: 5, width: '65%', fontSize: 13 }}
                                                value={opt} onChange={e => updateOption(q.id, oi, e.target.value)}
                                                placeholder={`Opsi ${oi + 1}`} onFocus={onFocus} onBlur={onBlur} />
                                        ))}
                                        <button type="button" onClick={() => addOption(q.id)} style={{ fontSize: 12, fontWeight: 600, color: T.orange, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'inherit' }}>
                                            + Tambah Opsi
                                        </button>
                                    </div>
                                )}
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
