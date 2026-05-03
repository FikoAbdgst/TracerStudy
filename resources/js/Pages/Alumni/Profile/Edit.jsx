import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';

export default function EditProfile({ profile, programStudis }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        nim: profile?.nim || '',
        major: profile?.major || '',
        graduation_year: profile?.graduation_year || '',
        skills: profile?.skills || '',
        phone_number: profile?.phone_number || '',
        address: profile?.address || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('alumni.profile.update'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Profil Alumni</h2>}>
            <Head title="Kelola Profil Alumni" />

            <div className="max-w-3xl mx-auto mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Data Informasi Akademik & Profesional</CardTitle>
                        <CardDescription>
                            Lengkapi profil Anda. Data ini sangat penting sebagai representasi diri Anda saat melamar pekerjaan di platform ini.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {flash?.message && (
                            <div className="mb-4 p-4 text-sm text-green-800 bg-green-50 rounded-lg border border-green-200">
                                {flash.message}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nim">NIM <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="nim"
                                        placeholder="Misal: 12345678"
                                        value={data.nim}
                                        onChange={e => setData('nim', e.target.value)}
                                    />
                                    <InputError message={errors.nim} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="graduation_year">Tahun Lulus <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="graduation_year"
                                        type="number"
                                        placeholder="Misal: 2024"
                                        value={data.graduation_year}
                                        onChange={e => setData('graduation_year', e.target.value)}
                                    />
                                    <InputError message={errors.graduation_year} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="major">Program Studi <span className="text-red-500">*</span></Label>
                                <Select
                                    value={data.major}
                                    onValueChange={(value) => setData('major', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Program Studi..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programStudis.map((prodi) => (
                                            <SelectItem key={prodi.id} value={prodi.name}>
                                                {prodi.name} ({prodi.jenjang})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.major} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone_number">Nomor WhatsApp / HP</Label>
                                <Input
                                    id="phone_number"
                                    placeholder="Misal: 08123456789"
                                    value={data.phone_number}
                                    onChange={e => setData('phone_number', e.target.value)}
                                />
                                <InputError message={errors.phone_number} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="skills">Keahlian Utama (Skills)</Label>
                                <Textarea
                                    id="skills"
                                    placeholder="Misal: Laravel, React, Kotlin, Android Studio..."
                                    rows={3}
                                    value={data.skills}
                                    onChange={e => setData('skills', e.target.value)}
                                />
                                <InputError message={errors.skills} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Domisili Saat Ini</Label>
                                <Textarea
                                    id="address"
                                    placeholder="Misal: Bandung, Jawa Barat"
                                    rows={2}
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                />
                                <InputError message={errors.address} />
                            </div>

                            <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                {processing ? 'Menyimpan...' : 'Simpan Profil'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
