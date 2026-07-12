import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
    red: '#dc2626', redLight: '#fff1f2',
};

const fieldBase = {
    width: '100%', padding: '12px 14px', borderRadius: 8, border: `1.5px solid ${T.border}`,
    fontSize: 14, outline: 'none', transition: 'all 0.2s', background: '#fff', color: T.navy,
    fontFamily: 'inherit', boxSizing: 'border-box',
};

const STATUS_OPTIONS = [
    { value: 'Bekerja', label: 'Bekerja', icon: '💼', desc: 'Sudah memiliki pekerjaan tetap/kontrak' },
    { value: 'Mencari Kerja', label: 'Mencari Kerja', icon: '🔍', desc: 'Sedang aktif melamar dan mencari peluang kerja' },
    { value: 'Wiraswasta', label: 'Wiraswasta', icon: '🚀', desc: 'Memiliki usaha sendiri / freelance' },
];

const STATUS_LABELS = {
    'Bekerja': { icon: '💼', color: T.navyMid },
    'Mencari Kerja': { icon: '🔍', color: T.orange },
    'Wiraswasta': { icon: '🚀', color: T.green },
};

export default function KuesionerIndex({ kuesioner, existingResponse, profile, industries }) {
    const [showForm, setShowForm] = useState(!existingResponse);

    const { data, setData, post, processing } = useForm({
        status_pekerjaan: existingResponse?.status_pekerjaan || profile?.employment_status || '',
        nama_perusahaan: existingResponse?.nama_perusahaan || profile?.company_name || '',
        answers: existingResponse?.answers || {},
    });

    const hasResponded = !!existingResponse;

    const handleDynamicChange = (qIndex, value) => {
        setData('answers', { ...data.answers, [qIndex]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!kuesioner) return;
        post(route('alumni.kuesioner.store', kuesioner.id), {
            preserveScroll: true,
            onSuccess: () => setShowForm(false),
        });
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
                @keyframes cardIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
            `}</style>

            <div className="ak-root" style={{ maxWidth: 720, margin: '0 auto' }}>

                {/* ── STATE: Kuesioner Tidak Aktif ── */}
                {!kuesioner ? (
                    <div style={{ background: '#fff', padding: 50, textAlign: 'center', borderRadius: 14, border: `1px solid ${T.borderSoft}`, animation: 'cardIn 0.38s both', marginTop: 20 }}>
                        <div style={{ fontSize: 50, marginBottom: 16 }}>📭</div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: T.navy }}>Belum Ada Kuesioner Aktif</h3>
                        <p style={{ fontSize: 14, color: T.mutedDark, marginTop: 8 }}>Saat ini tidak ada tracer study yang perlu Anda isi.<br />Silakan cek kembali nanti atau tunggu notifikasi dari Kampus.</p>
                    </div>
                ) : showForm ? (
                    /* ════════════════════════════════════════════ */
                    /* MODE: FORM (isi baru / edit)               */
                    /* ════════════════════════════════════════════ */
                    <form onSubmit={handleSubmit} style={{ animation: 'cardIn 0.38s both' }}>
                        <div style={{ background: T.navy, borderRadius: '14px 14px 0 0', padding: '24px 28px', color: '#fff' }}>
                            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>{kuesioner.title}</h3>
                            {kuesioner.description && <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>{kuesioner.description}</p>}
                            {hasResponded && (
                                <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.12)', padding: '8px 14px', borderRadius: 8, color: '#fbbf24' }}>
                                    ✏️ Anda sedang mengedit jawaban yang sudah tersimpan.
                                </div>
                            )}
                        </div>

                        <div style={{ background: '#fff', borderRadius: '0 0 14px 14px', border: `1px solid ${T.borderSoft}`, borderTop: 'none', padding: '24px 28px' }}>

                            {/* ════════════════════════════════════════ */}
                            {/* BAGIAN A: PERTANYAAN STATIS SISTEM     */}
                            {/* ════════════════════════════════════════ */}
                            <div style={{ marginBottom: 28 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                    <div style={{ width: 3, height: 16, background: T.orange, borderRadius: 2 }} />
                                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: T.navy }}>
                                        Informasi Wajib
                                    </span>
                                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: T.orangeLight, color: T.orange, marginLeft: 4 }}>SISTEM</span>
                                </div>

                                {/* Q1: Status Pekerjaan */}
                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 10 }}>
                                        1. Status Pekerjaan Saat Ini <span style={{ color: T.red }}>*</span>
                                    </label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {STATUS_OPTIONS.map(opt => (
                                            <label key={opt.value} style={{
                                                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                                                padding: '12px 16px', borderRadius: 10,
                                                border: `2px solid ${data.status_pekerjaan === opt.value ? T.orange : T.border}`,
                                                background: data.status_pekerjaan === opt.value ? T.orangeLight : '#fff',
                                                transition: 'all 0.2s',
                                            }}>
                                                <input type="radio" name="status_pekerjaan" value={opt.value}
                                                    checked={data.status_pekerjaan === opt.value}
                                                    onChange={e => setData('status_pekerjaan', e.target.value)}
                                                    style={{ width: 18, height: 18, accentColor: T.orange, flexShrink: 0 }}
                                                    required
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ fontSize: 14, fontWeight: 700, color: data.status_pekerjaan === opt.value ? T.orange : T.navy }}>
                                                        {opt.icon} {opt.label}
                                                    </span>
                                                    <div style={{ fontSize: 12, color: T.mutedDark, marginTop: 1 }}>{opt.desc}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Q2: Nama Perusahaan/Instansi (hidden saat Mencari Kerja) */}
                                {data.status_pekerjaan !== 'Mencari Kerja' && (
                                    <div style={{ marginBottom: 24 }}>
                                        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 8 }}>
                                            2. Nama Perusahaan / Instansi / Usaha
                                            <span style={{ fontWeight: 400, fontSize: 12, color: T.muted, marginLeft: 6 }}>(wajib jika bekerja/wiraswasta)</span>
                                        </label>
                                        <input type="text" style={fieldBase}
                                            placeholder={data.status_pekerjaan === 'Bekerja' ? 'Contoh: PT Inovasi Dinamika Solusi' : 'Contoh: Toko Kreatif Mandiri'}
                                            value={data.nama_perusahaan}
                                            onChange={e => setData('nama_perusahaan', e.target.value)}
                                            onFocus={e => e.target.style.borderColor = T.orange}
                                            onBlur={e => e.target.style.borderColor = T.border}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* ════════════════════════════════════════ */}
                            {/* BAGIAN B: PERTANYAAN DINAMIS (JSON)     */}
                            {/* ════════════════════════════════════════ */}
                            {kuesioner.questions && kuesioner.questions.length > 0 && (
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingTop: 20, borderTop: `2px dashed ${T.borderSoft}` }}>
                                        <div style={{ width: 3, height: 16, background: T.navyMid, borderRadius: 2 }} />
                                        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: T.navy }}>
                                            Pertanyaan Tambahan
                                        </span>
                                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: T.navyLight, color: T.navyMid, marginLeft: 4 }}>KUESIONER</span>
                                    </div>

                                    {kuesioner.questions.map((q, idx) => (
                                        <div key={q.id} style={{ marginBottom: 22 }}>
                                            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 10 }}>
                                                <span style={{ color: T.orange }}>{idx + 1}.</span>
                                                {' '}{q.question} <span style={{ color: T.red }}>*</span>
                                            </label>

                                            {q.type === 'text' && (
                                                <input type="text" style={fieldBase} required
                                                    placeholder="Ketik jawaban Anda..."
                                                    value={data.answers[q.id] || ''}
                                                    onChange={e => handleDynamicChange(q.id, e.target.value)}
                                                    onFocus={e => e.target.style.borderColor = T.orange}
                                                    onBlur={e => e.target.style.borderColor = T.border}
                                                />
                                            )}

                                            {q.type === 'textarea' && (
                                                <textarea style={{ ...fieldBase, minHeight: 100, resize: 'vertical' }} required
                                                    placeholder="Jelaskan secara detail..."
                                                    value={data.answers[q.id] || ''}
                                                    onChange={e => handleDynamicChange(q.id, e.target.value)}
                                                    onFocus={e => e.target.style.borderColor = T.orange}
                                                    onBlur={e => e.target.style.borderColor = T.border}
                                                />
                                            )}

                                            {q.type === 'radio' && q.options && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    {q.options.map((opt, oIdx) => (
                                                        <label key={oIdx} style={{
                                                            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                                                            padding: '10px 14px', borderRadius: 8,
                                                            border: `1.5px solid ${data.answers[q.id] === opt ? T.orange : T.border}`,
                                                            background: data.answers[q.id] === opt ? T.orangeLight : T.bg,
                                                            transition: 'all 0.2s',
                                                        }}>
                                                            <input type="radio" name={`q_${q.id}`} value={opt} required
                                                                checked={data.answers[q.id] === opt}
                                                                onChange={e => handleDynamicChange(q.id, e.target.value)}
                                                                style={{ width: 16, height: 16, accentColor: T.orange, flexShrink: 0 }}
                                                            />
                                                            <span style={{
                                                                fontSize: 13.5,
                                                                fontWeight: data.answers[q.id] === opt ? 700 : 500,
                                                                color: data.answers[q.id] === opt ? T.orange : T.navy,
                                                            }}>{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ── Tombol Submit ── */}
                            <hr style={{ border: 'none', borderTop: `1px solid ${T.borderSoft}`, margin: '28px 0 22px' }} />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                {hasResponded && (
                                    <button type="button" onClick={() => setShowForm(false)} style={{
                                        height: 44, padding: '0 24px', borderRadius: 9,
                                        border: `1.5px solid ${T.border}`, background: '#fff', color: T.mutedDark,
                                        fontSize: 14, fontWeight: 600, textDecoration: 'none',
                                        display: 'inline-flex', alignItems: 'center', fontFamily: 'inherit',
                                        cursor: 'pointer',
                                    }}>
                                        Batal
                                    </button>
                                )}
                                <button type="submit" disabled={processing || !data.status_pekerjaan} style={{
                                    height: 44, padding: '0 32px', borderRadius: 9, border: 'none',
                                    background: processing || !data.status_pekerjaan ? T.muted : T.orange,
                                    color: '#fff', fontSize: 14, fontWeight: 700,
                                    cursor: processing || !data.status_pekerjaan ? 'not-allowed' : 'pointer',
                                    fontFamily: 'inherit', transition: 'all 0.15s',
                                    boxShadow: processing ? 'none' : '0 4px 12px rgba(249,115,22,0.3)',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                }}>
                                    {processing ? 'Menyimpan...' : (hasResponded ? 'Perbarui Jawaban' : 'Kirim Jawaban Tracer')}
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    /* ════════════════════════════════════════════ */
                    /* MODE: RINGKASAN (jawaban sudah tersimpan)  */
                    /* ════════════════════════════════════════════ */
                    <div style={{ animation: 'cardIn 0.38s both' }}>
                        <div style={{ background: `linear-gradient(135deg, ${T.green} 0%, #15803d 100%)`, borderRadius: '14px 14px 0 0', padding: '28px', color: '#fff', textAlign: 'center' }}>
                            <div style={{ fontSize: 44, marginBottom: 10 }}>🎉</div>
                            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>Terima Kasih!</h3>
                            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                                Jawaban Tracer Study Anda telah berhasil disimpan.
                            </p>
                        </div>

                        <div style={{ background: '#fff', borderRadius: '0 0 14px 14px', border: `1px solid ${T.borderSoft}`, borderTop: 'none', padding: '24px 28px' }}>

                            {/* ── Info Wajib Sistem ── */}
                            <div style={{ marginBottom: 20, padding: 16, borderRadius: 10, background: '#fffbeb', border: `1px solid #fed7aa` }}>
                                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#92400e', marginBottom: 12 }}>
                                    📋 Informasi Wajib Sistem
                                </div>
                                <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: `1px dashed #fde68a` }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Status Pekerjaan</div>
                                    <span style={{
                                        fontSize: 13.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                        background: STATUS_LABELS[existingResponse?.status_pekerjaan]?.color ? `${STATUS_LABELS[existingResponse.status_pekerjaan].color}15` : T.bg,
                                        color: STATUS_LABELS[existingResponse?.status_pekerjaan]?.color || T.navy,
                                    }}>
                                        {STATUS_LABELS[existingResponse?.status_pekerjaan]?.icon} {existingResponse?.status_pekerjaan}
                                    </span>
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Nama Perusahaan / Instansi / Usaha</div>
                                    <div style={{ fontSize: 13.5, color: T.navy, padding: '8px 12px', borderRadius: 6, background: '#fff' }}>
                                        {existingResponse?.nama_perusahaan || <em style={{ color: T.muted }}>Tidak diisi</em>}
                                    </div>
                                </div>
                            </div>

                            {/* ── Jawaban Dinamis ── */}
                            {kuesioner.questions?.length > 0 && (
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.navyMid, marginBottom: 12 }}>
                                        📝 Jawaban Pertanyaan Tambahan
                                    </div>
                                    {kuesioner.questions.map((q, idx) => (
                                        <div key={q.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px dashed ${T.borderSoft}` }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 6 }}>{idx + 1}. {q.question}</div>
                                            <div style={{ fontSize: 13.5, color: T.mutedDark, background: T.bg, padding: '10px 14px', borderRadius: 8 }}>
                                                {existingResponse?.answers?.[q.id] || <em style={{ color: T.muted }}>Tidak dijawab</em>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ── Tombol Aksi ── */}
                            <hr style={{ border: 'none', borderTop: `1px solid ${T.borderSoft}`, margin: '20px 0 18px' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                <div style={{ fontSize: 12, color: T.muted }}>
                                    Terakhir diperbarui: {existingResponse?.updated_at ? new Date(existingResponse.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button type="button" onClick={() => setShowForm(true)} style={{
                                        height: 42, padding: '0 22px', borderRadius: 9, border: 'none',
                                        background: T.orange, color: '#fff', fontSize: 13, fontWeight: 700,
                                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                                        boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
                                        display: 'flex', alignItems: 'center', gap: 7,
                                    }}>
                                        ✏️ Edit Jawaban
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
