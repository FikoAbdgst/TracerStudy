import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

export default function Dashboard({ stats }) {
    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Dashboard Admin Kampus</h2>}>
            <Head title="Dashboard Admin Kampus" />

            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ringkasan Sistem SITAMI</h3>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Alumni Terdaftar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalAlumni}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Verifikasi PT Tertunda</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.pendingCompanies}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Response Rate Kuesioner</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.responseRate}%</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
