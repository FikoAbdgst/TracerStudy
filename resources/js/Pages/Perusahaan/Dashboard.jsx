import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

export default function Dashboard() {
    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Dashboard Perusahaan</h2>}>
            <Head title="Dashboard Perusahaan" />

            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Selamat Datang di Portal Mitra SITAMI!</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Lowongan Aktif</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Pelamar Masuk</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
