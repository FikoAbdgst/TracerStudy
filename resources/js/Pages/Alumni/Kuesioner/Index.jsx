import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

export default function KuesionerIndex({ forms, respondedFormIds, flash }) {
    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Tracer Study</h2>}>
            <Head title="Kuesioner Tracer Study" />

            <div className="max-w-4xl mx-auto mt-6">
                {flash?.message && (
                    <div className="mb-4 p-4 text-sm text-green-800 bg-green-50 rounded-lg border border-green-200">
                        {flash.message}
                    </div>
                )}

                <div className="mb-6">
                    <p className="text-gray-600">
                        Partisipasi Anda dalam mengisi kuesioner ini sangat berarti bagi pengembangan kampus dan evaluasi program studi.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {forms.map((form) => {
                        const isResponded = respondedFormIds.includes(form.id);
                        return (
                            <Card key={form.id} className={isResponded ? "bg-gray-50 opacity-75" : ""}>
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <CardTitle className="text-lg">{form.title}</CardTitle>
                                        {isResponded && <Badge variant="secondary">Selesai Diisi</Badge>}
                                    </div>
                                    <CardDescription>{form.description}</CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    {isResponded ? (
                                        <Button variant="outline" className="w-full" disabled>
                                            Sudah Berpartisipasi
                                        </Button>
                                    ) : (
                                        <Link href={route('alumni.kuesioner.show', form.id)} className="w-full">
                                            <Button className="w-full">Isi Kuesioner</Button>
                                        </Link>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                    {forms.length === 0 && (
                        <div className="col-span-full p-8 text-center text-gray-500 bg-white border border-dashed rounded-lg">
                            Belum ada kuesioner Tracer Study yang aktif saat ini.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
