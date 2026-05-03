import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import InputError from '@/Components/InputError';

export default function LokerIndex({ jobs, appliedJobIds }) {
    const { flash } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        cv_file: null,
    });

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const openApplyModal = (job) => {
        reset(); clearErrors();
        setSelectedJob(job);
        setIsModalOpen(true);
    };

    const handleApply = (e) => {
        e.preventDefault();
        post(route('alumni.loker.apply', selectedJob.id), {
            onSuccess: () => setIsModalOpen(false)
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Bursa Kerja (Job Portal)</h2>}>
            <Head title="Bursa Kerja" />

            <div className="max-w-6xl mx-auto mt-6">
                {(flash?.message || flash?.error) && (
                    <div className={`mb-4 p-4 text-sm rounded-lg border ${flash.error ? 'text-red-800 bg-red-50 border-red-200' : 'text-green-800 bg-green-50 border-green-200'}`}>
                        {flash.message || flash.error}
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                    <p className="text-gray-600">Temukan karir impian Anda dari berbagai perusahaan mitra kami.</p>
                    <Input
                        placeholder="Cari posisi, nama perusahaan, atau lokasi..."
                        className="w-full md:w-80"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Grid Lowongan */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map(job => {
                        const isApplied = appliedJobIds.includes(job.id);
                        return (
                            <Card key={job.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <CardTitle className="text-lg text-blue-700">{job.title}</CardTitle>
                                        {isApplied && <Badge className="bg-green-500">Telah Dilamar</Badge>}
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">{job.company?.name}</div>
                                </CardHeader>
                                <CardContent className="flex-1 text-sm text-gray-600 space-y-2">
                                    <div className="flex items-center gap-2">📍 {job.location || 'Tidak disebutkan'}</div>
                                    <div className="flex items-center gap-2">💰 {job.salary_range || 'Gaji dirahasiakan'}</div>
                                    <p className="line-clamp-3 mt-3">{job.description}</p>
                                </CardContent>
                                <CardFooter className="pt-4 border-t border-gray-100">
                                    <Button
                                        className="w-full"
                                        disabled={isApplied}
                                        onClick={() => openApplyModal(job)}
                                        variant={isApplied ? 'secondary' : 'default'}
                                    >
                                        {isApplied ? 'Menunggu Review HRD' : 'Lamar Pekerjaan'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                {filteredJobs.length === 0 && (
                    <div className="p-12 text-center text-gray-500 bg-white border border-dashed rounded-lg">
                        Tidak ada lowongan pekerjaan yang ditemukan.
                    </div>
                )}
            </div>

            {/* MODAL MELAMAR KERJA */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Lamar Posisi: {selectedJob?.title}</DialogTitle>
                        <DialogDescription>
                            Perusahaan {selectedJob?.company?.name} akan meninjau dokumen yang Anda lampirkan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleApply} className="space-y-6 mt-2">
                        <div className="space-y-2">
                            <Label>Unggah Curriculum Vitae (CV) <span className="text-red-500">*</span></Label>
                            <Input
                                type="file"
                                accept=".pdf"
                                onChange={e => setData('cv_file', e.target.files[0])}
                            />
                            <p className="text-xs text-gray-500">Format wajib PDF, maksimal ukuran 5MB.</p>
                            <InputError message={errors.cv_file} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing || !data.cv_file}>
                                {processing ? 'Mengirim...' : 'Kirim Lamaran'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AuthenticatedLayout>
    );
}
