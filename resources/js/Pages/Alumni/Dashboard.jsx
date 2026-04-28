import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard Alumni</h2>}
        >
            <Head title="Dashboard Alumni" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Status Kuesioner</CardTitle>
                        <CardDescription>Tracer Study 2026</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">Belum diisi. Silakan lengkapi data Anda.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lamaran Aktif</CardTitle>
                        <CardDescription>Bursa Kerja SITAMI</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">0</p>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
