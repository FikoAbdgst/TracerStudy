import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
};

const STATUS_LABELS = {
    'Bekerja': { icon: '💼', color: T.navyMid },
    'Mencari Kerja': { icon: '🔍', color: T.orange },

    'Wiraswasta': { icon: '🚀', color: T.green },
};

function DetailModal({ open, onClose, response, questions }) {
    if (!open || !response) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,40,0.45)', backdropFilter: 'blur(3px)' }} />
            <div style={{ background: '#fff', borderRadius: 16, position: 'relative', width: '100%', maxWidth: 620, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: T.navy }}>Detail Jawaban</div>
                        <div style={{ fontSize: 12, color: T.muted }}>Oleh: {response.alumni?.user?.name}</div>
                    </div>
                    <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: T.bg, color: T.mutedDark, cursor: 'pointer' }}>✖</button>
                </div>
                <div style={{ padding: '24px', overflowY: 'auto' }}>

                    {/* ── Bagian A: Jawaban Statis ── */}
                    <div style={{ marginBottom: 20, padding: 16, borderRadius: 10, background: '#fffbeb', border: `1px solid #fed7aa` }}>
                        <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#92400e', marginBottom: 12 }}>
                            📋 Informasi Wajib Sistem
                        </div>

                        <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px dashed #fde68a` }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Status Pekerjaan Saat Ini</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>{STATUS_LABELS[response.status_pekerjaan]?.icon || '❓'}</span>
                                <span style={{
                                    fontSize: 13.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                    background: STATUS_LABELS[response.status_pekerjaan]?.color ? `${STATUS_LABELS[response.status_pekerjaan].color}15` : T.bg,
                                    color: STATUS_LABELS[response.status_pekerjaan]?.color || T.navy,
                                }}>
                                    {response.status_pekerjaan || <em style={{ color: T.muted }}>Tidak dijawab</em>}
                                </span>
                            </div>
                        </div>

                        <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px dashed #fde68a` }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Nama Perusahaan / Instansi / Usaha</div>
                            <div style={{ fontSize: 13.5, color: T.navy, padding: '8px 12px', borderRadius: 6, background: '#fff' }}>
                                {response.nama_perusahaan || <em style={{ color: T.muted }}>Tidak diisi</em>}
                            </div>
                        </div>

                        {response.status_pekerjaan === 'Bekerja' && (
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Jabatan / Posisi</div>
                                <div style={{ fontSize: 13.5, color: T.navy, padding: '8px 12px', borderRadius: 6, background: '#fff' }}>
                                    {response.jabatan || <em style={{ color: T.muted }}>Tidak diisi</em>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Bagian B: Jawaban Dinamis ── */}
                    {questions.length > 0 && (
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.navyMid, marginBottom: 12 }}>
                                📝 Pertanyaan Tambahan Kuesioner
                            </div>
                            {questions.map((q, idx) => (
                                <div key={idx} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px dashed ${T.borderSoft}` }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 6 }}>{idx + 1}. {q.question || q.pertanyaan}</div>
                                    <div style={{ fontSize: 13.5, color: T.mutedDark, background: T.bg, padding: '10px 14px', borderRadius: 8 }}>
                                        {response.answers?.[q.id] || response.answers?.[idx] || <em style={{ color: T.muted }}>Tidak dijawab</em>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function TracerStudyResponses({ tracer, responses }) {
    const [selectedResponse, setSelectedResponse] = useState(null);
    let questions = [];
    try { questions = typeof tracer.questions === 'string' ? JSON.parse(tracer.questions) : (tracer.questions || []); }
    catch (e) { questions = []; }

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Link href={route('adminkampus.tracer')} style={{ width: 34, height: 34, borderRadius: 9, border: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.mutedDark, textDecoration: 'none' }}>
                        ←
                    </Link>
                    <div>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0 }}>Data Tanggapan Tracer Study</h2>
                        <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>{tracer.title}</p>
                    </div>
                </div>
            }
        >
            <Head title={`Tanggapan: ${tracer.title}`} />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
            `}</style>

            <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.borderSoft}`, padding: 20, animation: 'cardIn 0.38s both' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <div style={{ fontSize: 13, color: T.muted }}>
                        Total Tanggapan: <strong style={{ color: T.navy }}>{responses.length}</strong> Alumni
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {['Bekerja', 'Mencari Kerja', 'Wiraswasta'].map(s => {
                            const count = responses.filter(r => r.status_pekerjaan === s).length;
                            if (count === 0) return null;
                            return (
                                <span key={s} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: T.bg, color: T.mutedDark }}>
                                    {s}: {count}
                                </span>
                            );
                        })}
                    </div>
                </div>

                <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.borderSoft}` }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', textAlign: 'left' }}>Nama Alumni</th>
                                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', textAlign: 'left' }}>Status Pekerjaan</th>
                                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', textAlign: 'left' }}>Tanggal Pengisian</th>
                                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', textAlign: 'right' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {responses.map((resp, i) => (
                                <tr key={resp.id} style={{ borderBottom: `1px solid ${T.borderSoft}` }}>
                                    <td style={{ padding: '13px 14px', fontSize: 13.5, fontWeight: 600, color: T.navy }}>
                                        {resp.alumni?.user?.name || 'Alumni Tidak Diketahui'}
                                    </td>
                                    <td style={{ padding: '13px 14px' }}>
                                        <span style={{
                                            fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                            background: resp.status_pekerjaan === 'Mencari Kerja' ? T.orangeLight : T.navyLight,
                                            color: resp.status_pekerjaan === 'Mencari Kerja' ? T.orange : T.navyMid,
                                        }}>
                                            {STATUS_LABELS[resp.status_pekerjaan]?.icon} {resp.status_pekerjaan || '—'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '13px 14px', fontSize: 13, color: T.mutedDark }}>
                                        {new Date(resp.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                                        <button onClick={() => setSelectedResponse(resp)} style={{ height: 30, padding: '0 13px', borderRadius: 7, border: 'none', background: T.navyLight, color: T.navyMid, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                            Lihat Jawaban
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {responses.length === 0 && (
                                <tr><td colSpan={4} style={{ padding: '40px 16px', textAlign: 'center', fontSize: 13, color: T.muted }}>Belum ada alumni yang mengisi kuesioner ini.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <DetailModal open={!!selectedResponse} onClose={() => setSelectedResponse(null)} response={selectedResponse} questions={questions} />
        </AuthenticatedLayout>
    );
}
