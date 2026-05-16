import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

/* ─── Tokens ─────────────────────────────────────────────────────────────── */
const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
};

const fieldBase = {
    width: '100%', padding: '12px 14px', borderRadius: 8, border: `1.5px solid ${T.border}`,
    fontSize: 14, outline: 'none', transition: 'all 0.2s', background: '#fff', color: T.navy,
    fontFamily: 'inherit'
};

export default function KuesionerIndex({ kuesioner, hasResponded }) {
    const { data, setData, post, processing } = useForm({
        answers: {}
    });

    const handleChange = (questionId, value) => {
        setData('answers', { ...data.answers, [questionId]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('alumni.kuesioner.store', kuesioner.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Tracer Study Lulusan</h2>
                    <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Bantu almamater dengan memberikan feedback perjalanan karir Anda.</p>
                </div>
            }
        >
            <Head title="Tracer Study — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .ak-root * { font-family:'Plus Jakarta Sans',sans-serif; }
            `}</style>

            <div className="ak-root" style={{ maxWidth: 800, margin: '0 auto' }}>

                {/* STATE 1: Kuesioner Belum Ada / Tidak Aktif */}
                {!kuesioner ? (
                    <div style={{ background: '#fff', padding: 50, textAlign: 'center', borderRadius: 14, border: `1px solid ${T.borderSoft}`, marginTop: 20 }}>
                        <div style={{ fontSize: 50, marginBottom: 16 }}>📭</div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: T.navy }}>Belum Ada Kuesioner Aktif</h3>
                        <p style={{ fontSize: 14, color: T.mutedDark, marginTop: 8 }}>Saat ini tidak ada tracer study yang perlu Anda isi.<br />Silakan cek kembali nanti atau tunggu notifikasi dari Kampus.</p>
                    </div>
                )

                    /* STATE 2: Alumni Sudah Mengisi */
                    : hasResponded ? (
                        <div style={{ background: T.greenLight, border: `1px solid #bbf7d0`, padding: 50, textAlign: 'center', borderRadius: 14, marginTop: 20 }}>
                            <div style={{ fontSize: 50, marginBottom: 16 }}>🎉</div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: T.green }}>Terima Kasih Banyak!</h3>
                            <p style={{ fontSize: 14, color: '#166534', marginTop: 8 }}>Anda sudah berpartisipasi mengisi kuesioner <strong>{kuesioner.title}</strong>.<br />Data yang Anda berikan sangat berarti untuk peningkatan Akreditasi Kampus.</p>
                        </div>
                    )

                        /* STATE 3: Alumni Belum Mengisi (Tampilkan Form) */
                        : (
                            <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, overflow: 'hidden', marginTop: 20 }}>
                                <div style={{ background: T.navy, padding: '24px 30px', color: '#fff' }}>
                                    <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>{kuesioner.title}</h3>
                                    {kuesioner.description && <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>{kuesioner.description}</p>}
                                </div>

                                <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
                                    {kuesioner.questions && kuesioner.questions.map((q, idx) => (
                                        <div key={q.id} style={{ marginBottom: 28 }}>
                                            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 12 }}>
                                                {idx + 1}. {q.question}
                                            </label>

                                            {/* Teks Pendek */}
                                            {q.type === 'text' && (
                                                <input type="text" style={fieldBase} required
                                                    placeholder="Ketik jawaban Anda..."
                                                    value={data.answers[q.id] || ''}
                                                    onChange={e => handleChange(q.id, e.target.value)}
                                                    onFocus={e => e.target.style.borderColor = T.orange}
                                                    onBlur={e => e.target.style.borderColor = T.border}
                                                />
                                            )}

                                            {/* Teks Panjang (Paragraf) */}
                                            {q.type === 'textarea' && (
                                                <textarea style={{ ...fieldBase, minHeight: 100, resize: 'vertical' }} required
                                                    placeholder="Jelaskan secara detail..."
                                                    value={data.answers[q.id] || ''}
                                                    onChange={e => handleChange(q.id, e.target.value)}
                                                    onFocus={e => e.target.style.borderColor = T.orange}
                                                    onBlur={e => e.target.style.borderColor = T.border}
                                                />
                                            )}

                                            {/* Pilihan Ganda (Radio) */}
                                            {q.type === 'radio' && q.options && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                    {q.options.map((opt, oIdx) => (
                                                        <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, cursor: 'pointer', padding: '10px 14px', border: `1px solid ${data.answers[q.id] === opt ? T.orange : T.border}`, borderRadius: 8, background: data.answers[q.id] === opt ? T.orangeLight : '#fff', transition: 'all 0.2s' }}>
                                                            <input type="radio" name={`q_${q.id}`} value={opt} required
                                                                checked={data.answers[q.id] === opt}
                                                                onChange={e => handleChange(q.id, e.target.value)}
                                                                style={{ width: 18, height: 18, accentColor: T.orange }}
                                                            />
                                                            <span style={{ fontWeight: data.answers[q.id] === opt ? 700 : 500, color: data.answers[q.id] === opt ? T.orange : T.navy }}>{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <hr style={{ border: 'none', borderTop: `1px solid ${T.borderSoft}`, margin: '36px 0 24px' }} />

                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button type="submit" disabled={processing} style={{
                                            height: 44, padding: '0 32px', borderRadius: 9, border: 'none',
                                            background: processing ? T.muted : T.orange, color: '#fff',
                                            fontSize: 14, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                                            fontFamily: 'inherit', transition: 'all 0.15s',
                                            boxShadow: processing ? 'none' : '0 4px 12px rgba(249,115,22,0.3)',
                                        }}>
                                            {processing ? 'Menyimpan...' : 'Kirim Jawaban Tracer'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
            </div>
        </AuthenticatedLayout>
    );
}
