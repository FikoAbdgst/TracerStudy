import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';

export default function VerifyPTIndex({ companies }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);

    const { data, setData, patch, processing } = useForm({
        verification_status: '',
    });

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.industry && c.industry.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified': return <Badge className="bg-green-600">Terverifikasi</Badge>;
            case 'rejected': return <Badge variant="destructive">Ditolak</Badge>;
            default: return <Badge variant="secondary">Menunggu</Badge>;
        }
    };

    const openVerifyModal = (company) => {
        setSelectedCompany(company);
        setData('verification_status', company.verification_status);
        setIsModalOpen(true);
    };

    const submitStatus = (e) => {
        e.preventDefault();
        patch(route('adminkampus.verify-pt.status', selectedCompany.id), {
            onSuccess: () => setIsModalOpen(false)
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Verifikasi Perusahaan Mitra</h2>}>
            <Head title="Verifikasi PT" />

            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                    <div>
                        <p className="text-gray-500 text-sm">Tinjau legalitas dan data perusahaan sebelum mereka dapat memposting lowongan.</p>
                    </div>
                    <Input
                        placeholder="Cari nama perusahaan..."
                        className="w-full md:w-72"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Perusahaan</TableHead>
                                <TableHead>Sektor Industri</TableHead>
                                <TableHead>Website</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCompanies.map(company => (
                                <TableRow key={company.id}>
                                    <TableCell className="font-medium">
                                        {company.name}
                                        <div className="text-xs text-gray-400 mt-1">Akun: {company.user?.email}</div>
                                    </TableCell>
                                    <TableCell>{company.industry || '-'}</TableCell>
                                    <TableCell>
                                        {company.website ? <a href={company.website} target="_blank" className="text-blue-600 hover:underline">{company.website}</a> : '-'}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(company.verification_status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => openVerifyModal(company)}>Tinjau</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredCompanies.length === 0 && (
                                <TableRow><TableCell colSpan={5} className="text-center py-6 text-gray-500">Tidak ada perusahaan yang ditemukan.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* MODAL VERIFIKASI */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tinjau Perusahaan</DialogTitle>
                    </DialogHeader>
                    {selectedCompany && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-md border text-sm">
                                <p><strong>Perusahaan:</strong> {selectedCompany.name}</p>
                                <p><strong>Alamat:</strong> {selectedCompany.address || '-'}</p>
                                <p><strong>Deskripsi:</strong> {selectedCompany.description || '-'}</p>
                            </div>

                            <form onSubmit={submitStatus} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Ubah Status Verifikasi</Label>
                                    <Select value={data.verification_status} onValueChange={v => setData('verification_status', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Menunggu Peninjauan</SelectItem>
                                            <SelectItem value="verified">Terverifikasi (Izinkan Posting)</SelectItem>
                                            <SelectItem value="rejected">Tolak Perusahaan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
                                    <Button type="submit" disabled={processing}>Simpan Status</Button>
                                </DialogFooter>
                            </form>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
