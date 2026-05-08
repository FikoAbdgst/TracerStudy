import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const T = {
    navy: '#0f1f3d', navyMid: '#1a3560', navyLight: '#e8f0fb',
    orange: '#f97316', orangeLight: '#fff3eb',
    border: '#e2e8f0', borderSoft: '#f1f5f9', bg: '#f8fafc',
    muted: '#94a3b8', mutedDark: '#64748b',
    green: '#16a34a', greenLight: '#f0fdf4',
};

export default function KuesionerIndex({ forms, respondedFormIds, flash }) {
    const doneCount = forms.filter(f => respondedFormIds.includes(f.id)).length;
    const pending = forms.length - doneCount;

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.01em' }}>Tracer Study</h2>
                        <p style={{ fontSize: 12, color: T.muted, margin: '3px 0 0' }}>Partisipasi Anda sangat berarti bagi pengembangan kampus</p>
                    </div>
                    {forms.length > 0 && (
                        <div style={{ display: 'flex', gap: 8 }}>
                            {pending > 0 && <div style={{ padding: '4px 10px', borderRadius: 8, background: T.orangeLight, border: `1px solid ${T.orange}22`, fontSize: 12, fontWeight: 700, color: T.orange }}>{pending} Belum Diisi</div>}
                            {doneCount > 0 && <div style={{ padding: '4px 10px', borderRadius: 8, background: T.greenLight, border: `1px solid ${T.green}22`, fontSize: 12, fontWeight: 700, color: T.green }}>{doneCount} Selesai</div>}
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Tracer Study — SITAMI" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .al-root * { font-family:'Plus Jakarta Sans',sans-serif; }
                @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes fadeIn { from{opacity:0} to{opacity:1} }
                .ks-card { transition:all 0.2s ease; }
                .ks-card:hover:not(.done) { transform:translateY(-3px); box-shadow:0 12px 32px rgba(15,31,61,0.1); }
            `}</style>

            <div className="al-root">
                {flash?.message && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, marginBottom: 18, background: T.greenLight, border: '1px solid #bbf7d0', animation: 'fadeIn 0.3s both' }}>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke={T.green} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>{flash.message}</span>
                    </div>
                )}

                {/* Info banner */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                    borderRadius: 12, marginBottom: 22,
                    background: `linear-gradient(135deg, ${T.navyMid} 0%, ${T.navy} 100%)`,
                    boxShadow: '0 4px 16px rgba(15,31,61,0.16)',
                    animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', right: -10, top: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(249,115,22,0.1)' }} />
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: T.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 4px 12px rgba(249,115,22,0.35)' }}>📋</div>
                    <div style={{ position: 'relative' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>Mengapa Tracer Study Penting?</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>Data Anda membantu kampus meningkatkan kualitas pendidikan dan menyesuaikan kurikulum dengan kebutuhan industri.</div>
                    </div>
                </div>

                {/* Cards Grid */}
                {forms.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
                        {forms.map((form, i) => {
                            const isDone = respondedFormIds.includes(form.id);
                            return (
                                <div key={form.id} className={`ks-card${isDone ? ' done' : ''}`} style={{
                                    background: '#fff', borderRadius: 14,
                                    border: `1px solid ${isDone ? '#bbf7d0' : T.borderSoft}`,
                                    padding: '20px', display: 'flex', flexDirection: 'column',
                                    opacity: isDone ? 0.8 : 1,
                                    boxShadow: isDone ? 'none' : '0 2px 8px rgba(15,31,61,0.05)',
                                    animation: `cardIn 0.38s ${i * 0.07}s cubic-bezier(0.22,1,0.36,1) both`,
                                    position: 'relative', overflow: 'hidden',
                                }}>
                                    {isDone && (
                                        <div style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: '50%', background: T.greenLight, color: T.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✓</div>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: isDone ? T.greenLight : T.navyLight, color: isDone ? T.green : T.navyMid, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                                            {isDone ? '✅' : '📝'}
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: isDone ? T.greenLight : T.orangeLight, color: isDone ? T.green : T.orange }}>
                                                {isDone ? 'Selesai' : 'Belum Diisi'}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ flex: 1, marginBottom: 16 }}>
                                        <div style={{ fontSize: 15, fontWeight: 800, color: T.navy, marginBottom: 6, letterSpacing: '-0.01em' }}>{form.title}</div>
                                        {form.description && (
                                            <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {form.description}
                                            </p>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: 12, color: T.muted }}>
                                            {form.questions?.length || 0} pertanyaan
                                        </span>
                                        {isDone ? (
                                            <button disabled style={{ height: 36, padding: '0 16px', borderRadius: 8, border: `1.5px solid #bbf7d0`, background: T.greenLight, color: T.green, fontSize: 12, fontWeight: 700, cursor: 'not-allowed', fontFamily: 'inherit' }}>
                                                Sudah Berpartisipasi
                                            </button>
                                        ) : (
                                            <Link href={route('alumni.kuesioner.show', form.id)}>
                                                <button style={{
                                                    height: 36, padding: '0 16px', borderRadius: 8, border: 'none',
                                                    background: T.orange, color: '#fff', fontSize: 12, fontWeight: 700,
                                                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                                                    boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
                                                    display: 'flex', alignItems: 'center', gap: 6,
                                                }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = T.orange; e.currentTarget.style.transform = 'none'; }}
                                                >
                                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                                                    Isi Kuesioner
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ padding: '64px 20px', textAlign: 'center', background: '#fff', borderRadius: 14, border: `2px dashed ${T.borderSoft}`, animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Belum ada kuesioner aktif</div>
                        <div style={{ fontSize: 13, color: T.muted }}>Kuesioner Tracer Study akan muncul di sini saat admin kampus mengaktifkannya.</div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
