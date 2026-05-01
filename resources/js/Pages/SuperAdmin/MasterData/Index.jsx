import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import InputError from '@/Components/InputError';

export default function MasterDataIndex({ prodis, industries }) {
    const prodiForm = useForm({ name: '', jenjang: '' });
    const industryForm = useForm({ name: '' });

    const submitProdi = (e) => {
        e.preventDefault();
        prodiForm.post(route('superadmin.master-data.prodi.store'), {
            onSuccess: () => prodiForm.reset()
        });
    };

    const submitIndustry = (e) => {
        e.preventDefault();
        industryForm.post(route('superadmin.master-data.industry.store'), {
            onSuccess: () => industryForm.reset()
        });
    };

    const fieldStyle = {
        height: '40px',
        padding: '0 12px',
        border: '1.5px solid #e2e8f0',
        borderRadius: '8px',
        background: '#f8fafc',
        color: '#1a3560',
        fontSize: '14px',
        outline: 'none',
        width: '100%',
        transition: 'all 0.15s',
    };

    const handleFocus = (e) => {
        e.target.style.borderColor = '#1a3560';
        e.target.style.background = '#fff';
        e.target.style.boxShadow = '0 0 0 3px rgba(26,53,96,0.08)';
    };
    const handleBlur = (e) => {
        e.target.style.borderColor = '#e2e8f0';
        e.target.style.background = '#f8fafc';
        e.target.style.boxShadow = 'none';
    };

    const FormSection = ({ title, children, onSubmit, processing }) => (
        <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #e8edf5' }}>
            <div className="flex items-center gap-2 mb-5">
                <div style={{ width: '4px', height: '18px', background: '#f97316', borderRadius: '2px' }} />
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1a3560', letterSpacing: '0.1em' }}>
                    {title}
                </h3>
            </div>
            <form onSubmit={onSubmit} className="space-y-3">
                {children}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full text-sm font-semibold rounded-lg transition-all"
                    style={{
                        height: '40px',
                        background: processing ? '#f0a070' : '#f97316',
                        color: '#fff',
                        border: 'none',
                        cursor: processing ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={e => { if (!processing) e.target.style.background = '#ea6c0a'; }}
                    onMouseLeave={e => { if (!processing) e.target.style.background = '#f97316'; }}
                >
                    {processing ? 'Menyimpan...' : 'Simpan Data'}
                </button>
            </form>
        </div>
    );

    const DataTable = ({ headers, children, empty }) => (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e8edf5' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f4f6fa', borderBottom: '1px solid #e8edf5' }}>
                        {headers.map((h, i) => (
                            <th
                                key={i}
                                className="text-left text-xs font-bold uppercase"
                                style={{
                                    padding: '10px 16px',
                                    color: '#1a3560',
                                    letterSpacing: '0.1em',
                                }}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
            {empty}
        </div>
    );

    const TableTr = ({ cells }) => (
        <tr
            style={{ borderBottom: '1px solid #f4f6fa' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            {cells.map((c, i) => (
                <td key={i} style={{ padding: '12px 16px', fontSize: '14px', color: '#2d3748' }}>
                    {c}
                </td>
            ))}
        </tr>
    );

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-lg font-bold" style={{ color: '#1a3560' }}>Manajemen Master Data</h2>
                    <p className="text-xs mt-0.5" style={{ color: '#a0aec0' }}>Kelola data referensi program studi dan sektor industri</p>
                </div>
            }
        >
            <Head title="Master Data — SITAMI" />

            <Tabs defaultValue="prodi" className="w-full">
                {/* Tab trigger custom */}
                <TabsList
                    className="flex gap-1 mb-6 p-1 rounded-xl w-fit"
                    style={{ background: '#e8edf5' }}
                >
                    {['prodi', 'industry'].map((val) => (
                        <TabsTrigger
                            key={val}
                            value={val}
                            className="text-xs font-bold uppercase px-5 py-2 rounded-lg transition-all"
                            style={{ letterSpacing: '0.08em' }}
                        >
                            {val === 'prodi' ? 'Program Studi' : 'Sektor Industri'}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* TAB PROGRAM STUDI */}
                <TabsContent value="prodi">
                    <div className="grid gap-5 md:grid-cols-3">
                        <FormSection title="Tambah Prodi" onSubmit={submitProdi} processing={prodiForm.processing}>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: '#4a5568', letterSpacing: '0.08em' }}>
                                    Nama Program Studi
                                </label>
                                <input
                                    style={fieldStyle}
                                    placeholder="Contoh: Teknik Informatika"
                                    value={prodiForm.data.name}
                                    onChange={e => prodiForm.setData('name', e.target.value)}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />
                                <InputError message={prodiForm.errors.name} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: '#4a5568', letterSpacing: '0.08em' }}>
                                    Jenjang
                                </label>
                                <input
                                    style={fieldStyle}
                                    placeholder="Contoh: D3 / S1"
                                    value={prodiForm.data.jenjang}
                                    onChange={e => prodiForm.setData('jenjang', e.target.value)}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />
                                <InputError message={prodiForm.errors.jenjang} className="mt-1" />
                            </div>
                        </FormSection>

                        <div className="md:col-span-2">
                            <DataTable
                                headers={['No', 'Nama Program Studi', 'Jenjang']}
                                empty={
                                    prodis.length === 0 && (
                                        <div className="text-center py-10 text-sm" style={{ color: '#a0aec0' }}>
                                            Belum ada data program studi.
                                        </div>
                                    )
                                }
                            >
                                {prodis.map((p, i) => (
                                    <TableTr key={p.id} cells={[
                                        <span style={{ color: '#a0aec0', fontSize: '12px' }}>{i + 1}</span>,
                                        <span className="font-medium">{p.name}</span>,
                                        <span
                                            className="text-xs font-bold px-2.5 py-1 rounded-full"
                                            style={{ background: '#e8f0fb', color: '#1a3560' }}
                                        >
                                            {p.jenjang}
                                        </span>,
                                    ]} />
                                ))}
                            </DataTable>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB INDUSTRI */}
                <TabsContent value="industry">
                    <div className="grid gap-5 md:grid-cols-3">
                        <FormSection title="Tambah Sektor" onSubmit={submitIndustry} processing={industryForm.processing}>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: '#4a5568', letterSpacing: '0.08em' }}>
                                    Nama Sektor Industri
                                </label>
                                <input
                                    style={fieldStyle}
                                    placeholder="Contoh: Teknologi Informasi"
                                    value={industryForm.data.name}
                                    onChange={e => industryForm.setData('name', e.target.value)}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />
                                <InputError message={industryForm.errors.name} className="mt-1" />
                            </div>
                        </FormSection>

                        <div className="md:col-span-2">
                            <DataTable
                                headers={['No', 'Nama Sektor Industri']}
                                empty={
                                    industries.length === 0 && (
                                        <div className="text-center py-10 text-sm" style={{ color: '#a0aec0' }}>
                                            Belum ada data sektor industri.
                                        </div>
                                    )
                                }
                            >
                                {industries.map((ind, i) => (
                                    <TableTr key={ind.id} cells={[
                                        <span style={{ color: '#a0aec0', fontSize: '12px' }}>{i + 1}</span>,
                                        <span className="font-medium">{ind.name}</span>,
                                    ]} />
                                ))}
                            </DataTable>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </AuthenticatedLayout>
    );
}
