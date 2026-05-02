import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';

export default function AlumniIndex({ alumni }) {
    const [searchQuery, setSearchQuery] = useState('');

    // Logika Filtering Client-Side berdasarkan Nama atau NIM
    const filteredAlumni = alumni.filter((item) => {
        const nameMatch = item.user?.name.toLowerCase().includes(searchQuery.toLowerCase());
        const nimMatch = item.nim?.toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatch || nimMatch;
    });

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Manajemen Data Alumni</h2>}>
            <Head title="Data Alumni" />

            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                    <div className="w-full md:w-auto">
                        <h3 className="text-lg font-medium text-gray-900">Total Alumni Terdaftar: {filteredAlumni.length}</h3>
                        <p className="text-gray-500 text-sm">Kelola dan tinjau data alumni STMIK Mardira Indonesia.</p>
                    </div>

                    {/* Filter Section */}
                    <div className="w-full md:w-72">
                        <Input
                            placeholder="Cari berdasarkan Nama atau NIM..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table Section */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Alumni</TableHead>
                                <TableHead>NIM</TableHead>
                                <TableHead>Program Studi</TableHead>
                                <TableHead>Tahun Lulus</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAlumni.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        {item.user?.name || 'User Tidak Ditemukan'}
                                        <div className="text-xs text-gray-400 mt-1">{item.user?.email}</div>
                                    </TableCell>
                                    <TableCell>{item.nim || '-'}</TableCell>
                                    <TableCell>{item.major || '-'}</TableCell> {/* Sesuaikan jika kamu pakai relasi programStudi */}
                                    <TableCell>{item.graduation_year || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm">Detail Profil</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredAlumni.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                        Tidak ada data alumni yang cocok dengan pencarian.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
