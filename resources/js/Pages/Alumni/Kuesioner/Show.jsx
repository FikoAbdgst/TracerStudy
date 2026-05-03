import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

export default function KuesionerShow({ tracerForm, industries }) {
    // Inisialisasi state jawaban (object kosong)
    const { data, setData, post, processing } = useForm({
        answers: {},
    });

    const handleAnswerChange = (questionId, value) => {
        setData('answers', { ...data.answers, [questionId]: value });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('alumni.kuesioner.store', tracerForm.id));
    };

    // Fungsi Render Dinamis
    const renderQuestionInput = (q) => {
        const currentValue = data.answers[q.id] || '';

        switch (q.type) {
            case 'textarea':
                return (
                    <Textarea
                        rows={3}
                        value={currentValue}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        required
                    />
                );
            case 'radio':
                return (
                    <div className="space-y-2 mt-2">
                        {q.options.map((opt, idx) => (
                            <label key={idx} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`question_${q.id}`}
                                    value={opt}
                                    checked={currentValue === opt}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    className="h-4 w-4 text-blue-600 border-gray-300"
                                    required
                                />
                                <span className="text-sm font-medium">{opt}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'master_industry':
                return (
                    <Select value={currentValue} onValueChange={(val) => handleAnswerChange(q.id, val)} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih sektor industri..." />
                        </SelectTrigger>
                        <SelectContent>
                            {industries.map((ind) => (
                                <SelectItem key={ind.id} value={ind.name}>{ind.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case 'text':
            default:
                return (
                    <Input
                        type="text"
                        value={currentValue}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        required
                    />
                );
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800">Pengisian Kuesioner</h2>}>
            <Head title={`Kuesioner: ${tracerForm.title}`} />

            <div className="max-w-3xl mx-auto mt-6 mb-12">
                <Link href={route('alumni.kuesioner')} className="text-blue-600 hover:underline text-sm mb-4 inline-block">
                    &larr; Kembali ke daftar kuesioner
                </Link>

                <Card className="border-t-4 border-t-blue-600 shadow-md">
                    <CardHeader className="bg-gray-50/50 pb-6 border-b">
                        <CardTitle className="text-2xl">{tracerForm.title}</CardTitle>
                        <CardDescription className="text-base mt-2">{tracerForm.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <form onSubmit={submit} className="space-y-8">
                            {/* Iterasi JSON Questions */}
                            {tracerForm.questions && tracerForm.questions.map((q, index) => (
                                <div key={q.id} className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                                    <Label className="text-base font-semibold mb-3 block">
                                        {index + 1}. {q.question} <span className="text-red-500">*</span>
                                    </Label>

                                    {renderQuestionInput(q)}
                                </div>
                            ))}

                            <div className="flex justify-end gap-3 pt-6 border-t mt-8">
                                <Link href={route('alumni.kuesioner')}>
                                    <Button variant="ghost" type="button">Batal</Button>
                                </Link>
                                <Button type="submit" disabled={processing} className="px-8">
                                    {processing ? 'Menyimpan...' : 'Kirim Jawaban'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
