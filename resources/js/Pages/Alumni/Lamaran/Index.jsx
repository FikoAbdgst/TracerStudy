import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';

export default function LamaranIndex({ applications }) {

    // Sinkronkan badge ini dengan tampilan di Admin PT
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <Badge variant="secondary">Terkirim</Badge>;
            case 'direview': return <Badge variant="default" className="bg-blue-500">Sedang Direview</Badge>;
            case 'wawancara': return <Badge variant="default" className="bg-purple-500">Panggilan Wawancara</Badge>;
            case 'diterima': return <Badge variant="default" className="bg-green-600">Diterima</Badge>;
            case 'ditolak': return <Badge variant="destructive">Mohon Maaf, Ditolak</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Status Lamaran</h2>}>
            <Head title="Status Lamaran Pekerjaan" />

            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <p className="text-gray-500 text-sm mb-6">Pantau riwayat lamaran kerja Anda dan lihat respon dari pihak HRD perusahaan.</p>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal Melamar</TableHead>
                                <TableHead>Posisi</TableHead>
                                <TableHead>Perusahaan</TableHead>
                                <TableHead>Catatan HRD</TableHead>
                                <TableHead className="text-right">Status Saat Ini</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.map(app => (
                                <TableRow key={app.id}>
                                    <TableCell className="whitespace-nowrap">{formatDate(app.created_at)}</TableCell>
                                    <TableCell className="font-medium">{app.job_posting?.title || 'Lowongan Dihapus'}</TableCell>
                                    <TableCell>{app.job_posting?.company?.name || '-'}</TableCell>
                                    <TableCell>
                                        <span className="text-sm text-gray-600 italic">
                                            {app.notes ? `"${app.notes}"` : '-'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {getStatusBadge(app.status)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {applications.length === 0 && (
                                <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Anda belum melamar ke pekerjaan apapun.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
