import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

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

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Manajemen Master Data</h2>}>
            <Head title="Master Data" />

            <Tabs defaultValue="prodi" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
                    <TabsTrigger value="prodi">Program Studi</TabsTrigger>
                    <TabsTrigger value="industry">Sektor Industri</TabsTrigger>
                </TabsList>

                {/* TAB PROGRAM STUDI */}
                <TabsContent value="prodi">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-1">
                            <CardHeader><CardTitle>Tambah Prodi</CardTitle></CardHeader>
                            <CardContent>
                                <form onSubmit={submitProdi} className="space-y-4">
                                    <Input placeholder="Nama Prodi (TI, MI, dll)" value={prodiForm.data.name} onChange={e => prodiForm.setData('name', e.target.value)} />
                                    <Input placeholder="Jenjang (D3/S1)" value={prodiForm.data.jenjang} onChange={e => prodiForm.setData('jenjang', e.target.value)} />
                                    <Button className="w-full" disabled={prodiForm.processing}>Simpan</Button>
                                </form>
                            </CardContent>
                        </Card>
                        <Card className="md:col-span-2">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Program Studi</TableHead>
                                        <TableHead>Jenjang</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {prodis.map(p => (
                                        <TableRow key={p.id}>
                                            <TableCell>{p.name}</TableCell>
                                            <TableCell>{p.jenjang}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB INDUSTRI */}
                <TabsContent value="industry">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-1">
                            <CardHeader><CardTitle>Tambah Sektor</CardTitle></CardHeader>
                            <CardContent>
                                <form onSubmit={submitIndustry} className="space-y-4">
                                    <Input placeholder="Nama Sektor Industri" value={industryForm.data.name} onChange={e => industryForm.setData('name', e.target.value)} />
                                    <Button className="w-full" disabled={industryForm.processing}>Simpan</Button>
                                </form>
                            </CardContent>
                        </Card>
                        <Card className="md:col-span-2">
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Nama Sektor Industri</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {industries.map(i => (
                                        <TableRow key={i.id}><TableCell>{i.name}</TableCell></TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </AuthenticatedLayout>
    );
}
