import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

/* ─── Tokens ─────────────────────────────────────────────────────────────── */
const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626', redLight: '#fff1f2',
};

const fieldBase = { height: 42, padding: '0 13px', border: `1.5px solid ${T.border}`, borderRadius: 9, background: T.bg, color: T.navy, fontSize: 13.5, outline: 'none', width: '100%', transition: 'all 0.18s', fontFamily: 'inherit' };
const onFocus = e => { e.target.style.borderColor = T.navyMid; e.target.style.background = '#fff'; };
const onBlur = e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; };

/* ─── Komponen Pendukung ─────────────────────────────────────────────────── */
const BtnGhost = ({ children, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        style={{
            height: '38px', padding: '0 16px',
            background: 'transparent', color: '#64748b',
            border: '1.5px solid #e2e8f0', borderRadius: '9px',
            fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
            cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f0f4f9'; e.currentTarget.style.borderColor = '#d1d9e3'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
    >
        {children}
    </button>
);

function Modal({ open, onClose, title, children, footer }) {
    const [visible, setVisible] = useState(false);
    const [render, setRender] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (open) {
            setRender(true);
            document.body.style.overflow = 'hidden';
            requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
        } else {
            setVisible(false);
            document.body.style.overflow = '';
            const t = setTimeout(() => setRender(false), 260);
            return () => clearTimeout(t);
        }
    }, [open]);

    if (!render || !mounted) return null;

    return createPortal(
        <>
            <style>{`
                .modal-backdrop {
                    position: fixed; inset: 0; z-index: 99999;
                    background: rgba(10, 20, 40, 0.45);
                    backdrop-filter: blur(3px);
                    display: flex; align-items: center; justify-content: center;
                    padding: 20px;
                    transition: opacity 0.25s ease;
                }
                .modal-backdrop.in  { opacity: 1; }
                .modal-backdrop.out { opacity: 0; }

                .modal-box {
                    background: #ffffff;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 480px;
                    box-shadow: 0 24px 60px rgba(10,20,40,0.2), 0 4px 12px rgba(10,20,40,0.08);
                    overflow: hidden;
                    transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1);
                }
                .modal-box.in  { opacity: 1; transform: translateY(0) scale(1); }
                .modal-box.out { opacity: 0; transform: translateY(10px) scale(0.97); }

                .modal-header { padding: 22px 24px 0; display: flex; align-items: center; justify-content: space-between; }
                .modal-title { font-size: 16px; font-weight: 800; color: #0f1f3d; letter-spacing: -0.01em; }
                .modal-close { width: 30px; height: 30px; border-radius: 7px; border: none; background: #f0f4f9; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s, color 0.15s; }
                .modal-close:hover { background: #e2e8f0; color: #1a3560; }
                .modal-body { padding: 20px 24px; }
                .modal-footer { padding: 0 24px 20px; display: flex; justify-content: flex-end; gap: 8px; }
                .modal-divider { height: 1px; background: #f1f5f9; margin: 0 24px 16px; }
            `}</style>

            <div
                className={`modal-backdrop ${visible ? 'in' : 'out'}`}
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div className={`modal-box ${visible ? 'in' : 'out'}`}>
                    <div className="modal-header">
                        <span className="modal-title">{title}</span>
                        <button className="modal-close" onClick={onClose}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="modal-body">{children}</div>
                    {footer && (
                        <>
                            <div className="modal-divider" />
                            <div className="modal-footer">{footer}</div>
                        </>
                    )}
                </div>
            </div>
        </>,
        document.body
    );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function KuesionerShow({ tracerForm, industries, existingResponse }) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Parsing pertanyaan kuesioner dari JSON database
    let questions = [];
    try {
        questions = typeof tracerForm.questions === 'string'
            ? JSON.parse(tracerForm.questions)
            : (tracerForm.questions || []);
    } catch (e) {
        questions = [];
    }

    // State form (menampung jawaban berdasarkan index/urutan pertanyaan)
    const { data, setData, post, processing } = useForm({
        answers: existingResponse || {}
    });

    const handleChange = (qIndex, value) => {
        setData('answers', {
            ...data.answers,
            [qIndex]: value
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('alumni.kuesioner.store', tracerForm.id));
    };

    // Eksekusi fungsi Hapus dengan Modal
    const executeDelete = () => {
        setIsDeleting(true);
        router.delete(route('alumni.kuesioner.destroy-response', tracerForm.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                setIsDeleteModalOpen(false);
            },
            onError: () => setIsDeleting(false)
        });
    };

    // Fungsi bantu untuk merender input/select berdasarkan tipe pertanyaan
    const renderQuestionInput = (q, idx) => {
        const type = q.type || 'text';
        const value = data.answers[idx] || '';

        // Tipe Radio (Pilihan Ganda)
        if (type === 'radio' || type === 'pilihan ganda' || type === 'multiple_choice' || type === 'master_industry') {
            const isIndustry = type === 'master_industry';
            const options = isIndustry ? (industries || []).map(i => i.name) : (q.options || []);

            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                    {options.map((opt, oIdx) => (
                        <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: T.navy, cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name={`q_${idx}`}
                                value={opt}
                                checked={value === opt}
                                onChange={e => handleChange(idx, e.target.value)}
                                style={{ width: 16, height: 16, accentColor: T.orange }}
                            />
                            {opt}
                        </label>
                    ))}
                </div>
            );
        }

        // Tipe Dropdown / Select
        if (type === 'dropdown' || type === 'select') {
            return (
                <select style={{ ...fieldBase, marginTop: 10 }} value={value} onChange={e => handleChange(idx, e.target.value)} onFocus={onFocus} onBlur={onBlur} required>
                    <option value="" disabled>-- Pilih Jawaban --</option>
                    {q.use_industries ? (
                        (industries || []).map(ind => <option key={ind.id} value={ind.name}>{ind.name}</option>)
                    ) : (
                        (q.options || []).map((opt, oIdx) => <option key={oIdx} value={opt}>{opt}</option>)
                    )}
                </select>
            );
        }

        // Tipe Textarea (Paragraf)
        if (type === 'textarea') {
            return (
                <textarea
                    style={{ ...fieldBase, height: 'auto', padding: '10px 13px', marginTop: 10, resize: 'vertical' }}
                    rows={4} placeholder="Tuliskan jawaban Anda di sini..."
                    value={value} onChange={e => handleChange(idx, e.target.value)}
                    onFocus={onFocus} onBlur={onBlur} required
                />
            );
        }

        // Default Input (Text/Isian Singkat)
        return (
            <input
                type="text" style={{ ...fieldBase, marginTop: 10 }}
                placeholder="Jawaban Anda..."
                value={value} onChange={e => handleChange(idx, e.target.value)}
                onFocus={onFocus} onBlur={onBlur} required
            />
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Link href={route('alumni.kuesioner')} style={{ width: 34, height: 34, borderRadius: 9, border: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.mutedDark, background: '#fff', transition: 'all 0.15s', textDecoration: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = T.bg}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Form Kuesioner</h2>
                        <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>{tracerForm.title}</p>
                    </div>
                </div>
            }
        >
            <Head title={`Kuesioner ${tracerForm.title} — SITAMI`} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .ak-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
            `}</style>

            <div className="ak-root" style={{ maxWidth: 840, margin: '0 auto' }}>

                {/* NOTIFIKASI JIKA SUDAH PERNAH MENGISI */}
                {existingResponse && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, marginBottom: 20, background: T.navyLight, border: `1px solid #c7d8f0` }}>
                        <div style={{ fontSize: 16 }}>📝</div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.navyMid }}>Anda sudah mengisi kuesioner ini</div>
                            <div style={{ fontSize: 12, color: T.navyMid, marginTop: 2 }}>Anda dapat memperbarui jawaban di bawah ini atau menghapusnya.</div>
                        </div>
                    </div>
                )}

                <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 30, boxShadow: '0 4px 24px rgba(15,31,61,0.04)', animation: 'cardIn 0.38s both' }}>

                    {/* Judul & Deskripsi Kuesioner */}
                    <div style={{ marginBottom: 26, paddingBottom: 20, borderBottom: `2px dashed ${T.borderSoft}` }}>
                        <h3 style={{ fontSize: 22, fontWeight: 800, color: T.navy, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
                            {tracerForm.title}
                        </h3>
                        {tracerForm.description && (
                            <p style={{ fontSize: 14, color: T.mutedDark, lineHeight: 1.6, margin: 0 }}>
                                {tracerForm.description}
                            </p>
                        )}
                    </div>

                    {/* Render Pertanyaan Form */}
                    {questions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                            <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: T.navy }}>Belum ada pertanyaan</div>
                            <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>Kuesioner ini belum memiliki daftar pertanyaan yang valid dari Admin.</div>
                        </div>
                    ) : (
                        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {questions.map((q, idx) => (
                                <div key={idx} style={{ padding: 20, borderRadius: 12, background: T.bg, border: `1px solid ${T.borderSoft}` }}>
                                    <label style={{ fontSize: 14, fontWeight: 700, color: T.navy, display: 'block', lineHeight: 1.5 }}>
                                        <span style={{ color: T.orange }}>{idx + 1}.</span> {q.question || q.pertanyaan || 'Pertanyaan'}
                                        <span style={{ color: T.red, marginLeft: 3 }}>*</span>
                                    </label>

                                    {renderQuestionInput(q, idx)}
                                </div>
                            ))}

                            <div style={{ marginTop: 14, paddingTop: 20, borderTop: `1px solid ${T.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                                {/* TOMBOL HAPUS (Memicu state Modal) */}
                                {existingResponse ? (
                                    <button type="button" onClick={() => setIsDeleteModalOpen(true)} style={{
                                        height: 44, padding: '0 20px', borderRadius: 9, border: 'none',
                                        background: T.redLight, color: T.red, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'
                                    }}>
                                        Hapus Jawaban
                                    </button>
                                ) : <div></div>}

                                <button type="submit" disabled={processing} style={{
                                    height: 44, padding: '0 28px', borderRadius: 9, border: 'none',
                                    background: processing ? T.muted : T.orange, color: '#fff', display: 'flex', alignItems: 'center', gap: 8,
                                    fontSize: 14, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                                    boxShadow: processing ? 'none' : '0 4px 16px rgba(249,115,22,0.3)', transition: 'all 0.15s',
                                }}
                                    onMouseEnter={e => { if (!processing) { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                                    onMouseLeave={e => { if (!processing) { e.currentTarget.style.background = T.orange; e.currentTarget.style.transform = 'none'; } }}
                                >
                                    {processing ? 'Menyimpan...' : (existingResponse ? 'Perbarui Jawaban' : 'Kirim Kuesioner')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Modal Konfirmasi Hapus */}
            <Modal
                open={isDeleteModalOpen}
                onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
                title="Konfirmasi Hapus"
                footer={
                    <>
                        <BtnGhost onClick={() => setIsDeleteModalOpen(false)}>Batal</BtnGhost>
                        <button
                            onClick={executeDelete}
                            disabled={isDeleting}
                            style={{
                                height: '38px', padding: '0 20px',
                                background: isDeleting ? '#fca5a5' : '#dc2626',
                                color: '#fff', border: 'none', borderRadius: '9px',
                                fontSize: '13px', fontWeight: 700, fontFamily: 'inherit',
                                cursor: isDeleting ? 'not-allowed' : 'pointer',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { if (!isDeleting) e.currentTarget.style.background = '#b91c1c'; }}
                            onMouseLeave={e => { if (!isDeleting) e.currentTarget.style.background = '#dc2626'; }}
                        >
                            {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '4px 0' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff1f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#0f1f3d', margin: '0 0 4px' }}>
                            Hapus jawaban untuk <em style={{ fontStyle: 'normal', color: '#dc2626' }}>{tracerForm.title}</em>?
                        </p>
                        <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                            Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                        </p>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
