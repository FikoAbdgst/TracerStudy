import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';

const fieldStyle = {
    height: '40px', padding: '0 12px', border: '1.5px solid #e2e8f0',
    borderRadius: '8px', background: '#f8fafc', color: '#1a3560',
    fontSize: '14px', outline: 'none', width: '100%', transition: 'all 0.15s',
};
const onFocus = (e) => { e.target.style.borderColor = '#1a3560'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.08)'; };
const onBlur = (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; };

const FieldLabel = ({ children }) => (
    <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: '#4a5568', letterSpacing: '0.08em' }}>
        {children}
    </label>
);

export default function TracerStudyIndex({ forms }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const { data, setData, post, put, processing, reset } = useForm({
        title: '', description: '', questions: [],
    });

    const openCreate = () => { reset(); setIsEditing(false); setIsModalOpen(true); };
    const openEdit = (form) => {
        setSelectedId(form.id);
        setData({ title: form.title, description: form.description || '', questions: form.questions || [] });
        setIsEditing(true); setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('adminkampus.tracer.update', selectedId), { onSuccess: () => setIsModalOpen(false) });
        } else {
            post(route('adminkampus.tracer.store'), { onSuccess: () => setIsModalOpen(false) });
        }
    };

    const toggleStatus = (id) => router.patch(route('adminkampus.tracer.toggle', id), {}, { preserveScroll: true });

    const addQuestion = () => setData('questions', [...data.questions, { id: Date.now(), type: 'text', question: '', options: [] }]);
    const updateQuestion = (id, field, value) => setData('questions', data.questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    const removeQuestion = (id) => setData('questions', data.questions.filter(q => q.id !== id));
    const addOption = (qId) => setData('questions', data.questions.map(q => q.id === qId ? { ...q, options: [...q.options, 'Opsi Baru'] } : q));
    const updateOption = (qId, idx, val) => setData('questions', data.questions.map(q => {
        if (q.id !== qId) return q;
        const opts = [...q.options]; opts[idx] = val; return { ...q, options: opts };
    }));

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-lg font-bold" style={{ color: '#1a3560' }}>Kuesioner Tracer Study</h2>
                    <p className="text-xs mt-0.5" style={{ color: '#a0aec0' }}>Buat dan kelola form kuesioner untuk alumni</p>
                </div>
            }
        >
            <Head title="Tracer Study — SITAMI" />

            <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #e8edf5' }}>
                <div className="flex items-center justify-between mb-5">
                    <p className="text-sm" style={{ color: '#a0aec0' }}>
                        Total <span className="font-semibold" style={{ color: '#1a3560' }}>{forms.length}</span> kuesioner
                    </p>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 text-sm font-semibold rounded-lg"
                        style={{ height: '40px', background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={e => e.target.style.background = '#ea6c0a'}
                        onMouseLeave={e => e.target.style.background = '#f97316'}
                    >
                        + Buat Kuesioner
                    </button>
                </div>

                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e8edf5' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f4f6fa', borderBottom: '1px solid #e8edf5' }}>
                                {['Judul Kuesioner', 'Jumlah Pertanyaan', 'Status', 'Aksi'].map((h, i) => (
                                    <th key={i} className="text-xs font-bold uppercase"
                                        style={{ padding: '10px 16px', color: '#1a3560', letterSpacing: '0.1em', textAlign: i === 3 ? 'right' : 'left' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {forms.map(form => (
                                <tr key={form.id} style={{ borderBottom: '1px solid #f4f6fa' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '13px 16px' }}>
                                        <div className="font-semibold text-sm" style={{ color: '#1a3560' }}>{form.title}</div>
                                        {form.description && (
                                            <div className="text-xs mt-0.5 truncate max-w-xs" style={{ color: '#a0aec0' }}>{form.description}</div>
                                        )}
                                    </td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                                            style={{ background: '#e8f0fb', color: '#1a3560' }}>
                                            {form.questions?.length || 0} Pertanyaan
                                        </span>
                                    </td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <div className="flex items-center gap-2">
                                            <Switch checked={form.is_active} onCheckedChange={() => toggleStatus(form.id)} />
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                                                style={{
                                                    background: form.is_active ? '#f0fdf4' : '#f4f6fa',
                                                    color: form.is_active ? '#166534' : '#718096',
                                                }}>
                                                {form.is_active ? 'Aktif' : 'Draft'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => openEdit(form)}
                                            className="text-xs font-semibold px-3 rounded-lg"
                                            style={{ height: '32px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1a3560', cursor: 'pointer' }}
                                            onMouseEnter={e => { e.target.style.borderColor = '#1a3560'; e.target.style.background = '#e8f0fb'; }}
                                            onMouseLeave={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                                        >
                                            Edit Form
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {forms.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-sm" style={{ color: '#a0aec0' }}>
                                        Belum ada form kuesioner dibuat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form Builder */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle style={{ color: '#1a3560' }}>
                            {isEditing ? 'Edit Kuesioner' : 'Rancang Kuesioner Baru'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5 pt-1">
                        {/* Info dasar */}
                        <div className="rounded-xl p-4 space-y-3" style={{ background: '#f4f6fa', border: '1px solid #e8edf5' }}>
                            <div>
                                <FieldLabel>Judul Kuesioner</FieldLabel>
                                <input style={fieldStyle} value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder="Contoh: Tracer Study Lulusan 2025"
                                    onFocus={onFocus} onBlur={onBlur} required />
                            </div>
                            <div>
                                <FieldLabel>Deskripsi (Opsional)</FieldLabel>
                                <textarea
                                    style={{ ...fieldStyle, height: 'auto', padding: '10px 12px', resize: 'vertical' }}
                                    rows={2} value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Penjelasan singkat tujuan kuesioner..."
                                    onFocus={onFocus} onBlur={onBlur}
                                />
                            </div>
                        </div>

                        {/* Question Builder */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div style={{ width: '4px', height: '16px', background: '#f97316', borderRadius: '2px' }} />
                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1a3560' }}>
                                        Daftar Pertanyaan ({data.questions.length})
                                    </span>
                                </div>
                                <button type="button" onClick={addQuestion}
                                    className="text-xs font-semibold px-3 rounded-lg"
                                    style={{ height: '32px', border: '1px solid #f97316', background: '#fff3eb', color: '#f97316', cursor: 'pointer' }}>
                                    + Tambah Pertanyaan
                                </button>
                            </div>

                            {data.questions.map((q, index) => (
                                <div key={q.id} className="rounded-xl p-4 relative"
                                    style={{ border: '1px solid #e8edf5', background: '#fff' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                                            style={{ background: '#e8f0fb', color: '#1a3560' }}>
                                            Pertanyaan {index + 1}
                                        </span>
                                        <button type="button" onClick={() => removeQuestion(q.id)}
                                            className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                                            style={{ border: '1px solid #fecaca', background: '#fff5f5', color: '#e53e3e', cursor: 'pointer' }}>
                                            Hapus
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 mb-3">
                                        <div className="col-span-2">
                                            <FieldLabel>Teks Pertanyaan</FieldLabel>
                                            <input style={fieldStyle} value={q.question}
                                                onChange={e => updateQuestion(q.id, 'question', e.target.value)}
                                                placeholder="Tulis pertanyaan Anda..."
                                                onFocus={onFocus} onBlur={onBlur} required />
                                        </div>
                                        <div>
                                            <FieldLabel>Tipe Jawaban</FieldLabel>
                                            <Select value={q.type} onValueChange={v => updateQuestion(q.id, 'type', v)}>
                                                <SelectTrigger style={{ height: '40px', borderRadius: '8px', fontSize: '13px' }}>
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
                                        <div className="pl-4 pt-2 space-y-2"
                                            style={{ borderLeft: '3px solid #f97316' }}>
                                            <div className="text-xs font-bold uppercase" style={{ color: '#a0aec0', letterSpacing: '0.08em' }}>
                                                Pilihan Jawaban
                                            </div>
                                            {q.options.map((opt, optIdx) => (
                                                <input key={optIdx} style={{ ...fieldStyle, width: 'calc(66.66% - 8px)' }}
                                                    value={opt} onChange={e => updateOption(q.id, optIdx, e.target.value)}
                                                    onFocus={onFocus} onBlur={onBlur} />
                                            ))}
                                            <button type="button" onClick={() => addOption(q.id)}
                                                className="text-xs font-semibold"
                                                style={{ color: '#f97316', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                                                + Tambah Opsi
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {data.questions.length === 0 && (
                                <div className="text-center py-8 rounded-xl"
                                    style={{ border: '2px dashed #e8edf5', color: '#a0aec0' }}>
                                    <div className="text-2xl mb-2">📝</div>
                                    <div className="text-sm">Belum ada pertanyaan. Klik "+ Tambah Pertanyaan" untuk mulai.</div>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <button type="button" onClick={() => setIsModalOpen(false)}
                                className="px-4 text-sm rounded-lg"
                                style={{ height: '38px', color: '#718096', cursor: 'pointer', background: 'transparent', border: '1px solid #e2e8f0' }}>
                                Batal
                            </button>
                            <button type="submit" disabled={processing}
                                className="px-5 text-sm font-semibold rounded-lg"
                                style={{ height: '38px', background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', opacity: processing ? 0.6 : 1 }}>
                                {processing ? 'Menyimpan...' : 'Simpan Kuesioner'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
