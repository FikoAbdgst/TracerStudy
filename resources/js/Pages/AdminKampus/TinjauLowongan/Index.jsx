import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';

export default function TinjauLowonganIndex({ jobs }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleForceClose = (id) => {
        if (confirm('Anda yakin ingin menutup paksa lowongan ini? Lowongan tidak akan tampil lagi di portal alumni.')) {
            router.patch(route('adminkampus.tinjau-lowongan.force-close', id), {}, { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Tinjau Lowongan Kerja Aktif</h2>}>
            <Head title="Tinjau Lowongan" />

            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                    <p className="text-gray-500 text-sm">Pantau semua lowongan kerja yang sedang aktif. Anda dapat menutup paksa lowongan yang melanggar aturan.</p>
                    <Input
                        placeholder="Cari posisi atau nama perusahaan..."
                        className="w-full md:w-72"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Posisi Pekerjaan</TableHead>
                                <TableHead>Perusahaan</TableHead>
                                <TableHead>Lokasi</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredJobs.map(job => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium">
                                        {job.title}
                                        <div className="text-xs text-gray-400 mt-1">{job.salary_range}</div>
                                    </TableCell>
                                    <TableCell>{job.company?.name}</TableCell>
                                    <TableCell>{job.location || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="destructive" size="sm" onClick={() => handleForceClose(job.id)}>
                                            Tutup Paksa
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredJobs.length === 0 && (
                                <TableRow><TableCell colSpan={4} className="text-center py-6 text-gray-500">Tidak ada lowongan aktif yang ditemukan.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
