<?php

namespace Database\Seeders;

use App\Models\AlumniProfile;
use App\Models\TracerStudyForm;
use App\Models\TracerStudyResponse;
use Illuminate\Database\Seeder;

class TracerStudySeeder extends Seeder
{
    public function run(): void
    {
        $questions = [
            ['id' => 1, 'type' => 'radio', 'question' => 'Apakah bidang pekerjaan Anda saat ini sesuai dengan bidang ilmu yang dipelajari saat kuliah?', 'options' => ['Sangat Sesuai', 'Sesuai', 'Cukup Sesuai', 'Kurang Sesuai', 'Tidak Sesuai'], 'target_statuses' => ['Bekerja']],
            ['id' => 2, 'type' => 'radio', 'question' => 'Berapa lama waktu yang Anda butuhkan untuk mendapatkan pekerjaan pertama setelah lulus?', 'options' => ['Kurang dari 3 bulan', '3 - 6 bulan', '6 - 12 bulan', 'Lebih dari 1 tahun'], 'target_statuses' => ['Bekerja']],
            ['id' => 3, 'type' => 'textarea', 'question' => 'Ceritakan pengalaman Anda saat proses mencari pekerjaan pertama.', 'target_statuses' => ['Bekerja']],
            ['id' => 4, 'type' => 'text', 'question' => 'Lokasi / wilayah tempat Anda bekerja saat ini.', 'target_statuses' => ['Bekerja']],
            ['id' => 5, 'type' => 'radio', 'question' => 'Apa bidang usaha yang Anda jalankan saat ini?', 'options' => ['Kuliner / F&B', 'Teknologi / Digital', 'Jasa & Konsultasi', 'Retail / Toko Online', 'Lainnya'], 'target_statuses' => ['Wiraswasta']],
            ['id' => 6, 'type' => 'radio', 'question' => 'Apa alasan utama Anda memilih berwirausaha?', 'options' => ['Ingin mandiri & fleksibel waktu', 'Peluang pasar yang luas', 'Belum mendapatkan pekerjaan', 'Meneruskan usaha keluarga', 'Lainnya'], 'target_statuses' => ['Wiraswasta']],
            ['id' => 7, 'type' => 'text', 'question' => 'Sebutkan nama perguruan tinggi tempat Anda melanjutkan studi.', 'target_statuses' => ['Lanjutkan Pendidikan']],
            ['id' => 8, 'type' => 'radio', 'question' => 'Apa alasan utama Anda melanjutkan pendidikan?', 'options' => ['Memperdalam bidang keilmuan', 'Tuntutan dunia kerja', 'Peningkatan karier', 'Lainnya'], 'target_statuses' => ['Lanjutkan Pendidikan']],
            ['id' => 9, 'type' => 'radio', 'question' => 'Saluran apa yang paling efektif menurut Anda dalam mencari pekerjaan?', 'options' => ['Job portal online', 'Referensi teman / keluarga', 'Bursa kerja kampus', 'Media sosial (LinkedIn, dll)', 'Lamaran langsung ke perusahaan'], 'target_statuses' => ['Mencari Kerja']],
            ['id' => 10, 'type' => 'radio', 'question' => 'Seberapa puas Anda terhadap layanan akademik selama menempuh studi di kampus?', 'options' => ['Sangat Puas', 'Puas', 'Cukup Puas', 'Kurang Puas', 'Tidak Puas']],
            ['id' => 11, 'type' => 'textarea', 'question' => 'Apa saran / kritik yang ingin Anda sampaikan untuk kemajuan kampus?'],
        ];

        $form = TracerStudyForm::firstOrCreate(
            ['title' => 'Tracer Study Tahun 2026'],
            [
                'description' => 'Kuesioner penelusuran lulusan (Tracer Study) untuk mengetahui transisi lulusan dari dunia pendidikan ke dunia kerja. Mohon diisi dengan jujur dan sesuai kondisi Anda saat ini.',
                'questions' => $questions,
                'status' => 'active',
                'period_start' => now()->subMonth(),
                'period_end' => now()->addMonths(2),
            ]
        );

        $responses = [
            '23010044' => [
                'status_pekerjaan' => 'Bekerja',
                'nama_perusahaan' => 'PT Inovasi Dinamika',
                'jabatan' => 'Full Stack Developer',
                'answers' => [
                    1 => 'Sesuai',
                    2 => '3 - 6 bulan',
                    3 => 'Setelah lulus saya aktif melamar melalui job portal dan bursa kerja kampus, sekitar dua bulan kemudian mendapat panggilan wawancara hingga akhirnya diterima sebagai developer.',
                    4 => 'Bandung, Jawa Barat',
                    10 => 'Puas',
                    11 => 'Semoga kampus semakin sering mengadakan workshop bersertifikat untuk alumni.',
                ],
            ],
            '22010111' => [
                'status_pekerjaan' => 'Bekerja',
                'nama_perusahaan' => 'PT Solusi Teknologi Nusantara',
                'jabatan' => 'System Analyst',
                'answers' => [
                    1 => 'Sangat Sesuai',
                    2 => 'Kurang dari 3 bulan',
                    3 => 'Saya mendapatkan pekerjaan melalui referensi teman satu angkatan yang sudah bekerja lebih dulu, prosesnya cukup cepat.',
                    4 => 'Jakarta Selatan',
                    10 => 'Sangat Puas',
                    11 => 'Perbanyak kolaborasi kampus dengan industri agar lulusan mudah terserap pasar kerja.',
                ],
            ],
            '22020233' => [
                'status_pekerjaan' => 'Bekerja',
                'nama_perusahaan' => 'PT Koperasi Mardira Sejahtera',
                'jabatan' => 'Staff Akuntansi',
                'answers' => [
                    1 => 'Cukup Sesuai',
                    2 => '6 - 12 bulan',
                    3 => 'Saya mengirimkan lamaran langsung ke beberapa kantor di sekitar Bandung sebelum akhirnya diterima sebagai staff akuntansi.',
                    4 => 'Bandung, Jawa Barat',
                    10 => 'Cukup Puas',
                    11 => 'Tambah materi praktik akuntansi dengan aplikasi terbaru agar mahasiswa siap kerja.',
                ],
            ],
            '21030078' => [
                'status_pekerjaan' => 'Bekerja',
                'melanjutkan_pendidikan' => true,
                'pendidikan_institusi' => 'Institut Teknologi Bandung (S2 Teknik Informatika)',
                'nama_perusahaan' => 'PT Solusi Teknologi Nusantara',
                'jabatan' => 'System Analyst',
                'answers' => [
                    1 => 'Sangat Sesuai',
                    2 => 'Kurang dari 3 bulan',
                    4 => 'Jakarta Selatan',
                    7 => 'Institut Teknologi Bandung (S2 Teknik Informatika)',
                    8 => 'Peningkatan karier',
                    10 => 'Puas',
                    11 => 'Fasilitas laboratorium dan referensi jurnal perlu diperbarui secara berkala.',
                ],
            ],
            '22040102' => [
                'status_pekerjaan' => 'Mencari Kerja',
                'nama_perusahaan' => null,
                'jabatan' => null,
                'answers' => [
                    9 => 'Job portal online',
                    10 => 'Puas',
                    11 => 'Fasilitas karier center dan bimbingan karier untuk fresh graduate mohon lebih digencarkan.',
                ],
            ],
        ];

        $alumniById = AlumniProfile::with('user')->get()->keyBy('nim');

        foreach ($responses as $nim => $resp) {
            $alumni = $alumniById->get($nim);

            if (! $alumni) {
                continue;
            }

            TracerStudyResponse::updateOrCreate(
                [
                    'tracer_study_form_id' => $form->id,
                    'alumni_id' => $alumni->id,
                ],
                [
                    'status_pekerjaan' => $resp['status_pekerjaan'],
                    'melanjutkan_pendidikan' => $resp['melanjutkan_pendidikan'] ?? false,
                    'pendidikan_institusi' => $resp['pendidikan_institusi'] ?? null,
                    'nama_perusahaan' => $resp['nama_perusahaan'],
                    'jabatan' => $resp['jabatan'],
                    'answers' => $resp['answers'],
                ]
            );
        }

        $this->command->info('Tracer Study berhasil disimpan: '.$form->title.' dengan '.count($responses).' respons alumni.');
    }
}
