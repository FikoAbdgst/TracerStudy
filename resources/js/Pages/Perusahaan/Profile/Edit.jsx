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

export default function EditProfile({ company, industries }) {
    const { flash } = usePage().props;

    // Inisialisasi form dengan data company jika sudah ada, atau kosong jika belum
    const { data, setData, post, processing, errors } = useForm({
        name: company?.name || '',
        industry: company?.industry || '',
        description: company?.description || '',
        address: company?.address || '',
        website: company?.website || '',
    });

    const submit = (e) => {
        e.preventDefault();
        // Kita menggunakan post karena updateOrCreate di controller bisa menangani form-data dengan mulus
        post(route('perusahaan.profile.update'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Profil Perusahaan</h2>}>
            <Head title="Kelola Profil Perusahaan" />

            <div className="max-w-3xl mx-auto mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Data Informasi Perusahaan</CardTitle>
                        <CardDescription>
                            Lengkapi profil perusahaan Anda agar alumni dapat mengenal perusahaan Anda lebih baik sebelum melamar pekerjaan.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {/* Menampilkan pesan sukses */}
                        {flash?.message && (
                            <div className="mb-4 p-4 text-sm text-green-800 bg-green-50 rounded-lg">
                                {flash.message}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            {/* Nama Perusahaan */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Perusahaan <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    placeholder="PT. Inovasi Dinamika Solusi"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Sektor Industri (Ambil dari Master Data) */}
                            <div className="space-y-2">
                                <Label htmlFor="industry">Sektor Industri <span className="text-red-500">*</span></Label>
                                <Select
                                    value={data.industry}
                                    onValueChange={(value) => setData('industry', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih sektor industri..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {industries.map((ind) => (
                                            <SelectItem key={ind.id} value={ind.name}>
                                                {ind.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.industry} />
                            </div>

                            {/* Website */}
                            <div className="space-y-2">
                                <Label htmlFor="website">Situs Web (Opsional)</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    placeholder="https://contohperusahaan.com"
                                    value={data.website}
                                    onChange={e => setData('website', e.target.value)}
                                />
                                <InputError message={errors.website} />
                            </div>

                            {/* Alamat */}
                            <div className="space-y-2">
                                <Label htmlFor="address">Alamat Lengkap</Label>
                                <Textarea
                                    id="address"
                                    placeholder="Jl. Raya Contoh No. 123..."
                                    rows={3}
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                />
                                <InputError message={errors.address} />
                            </div>

                            {/* Deskripsi */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi Perusahaan</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Ceritakan secara singkat mengenai visi, misi, atau budaya perusahaan Anda..."
                                    rows={5}
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                />
                                <InputError message={errors.description} />
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
