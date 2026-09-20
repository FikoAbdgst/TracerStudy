<?php

namespace Database\Seeders;

use App\Models\AlumniProfile;
use App\Models\JobApplication;
use App\Models\JobPosting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class JobApplicationSeeder extends Seeder
{
    public function run(): void
    {
        $jobs = JobPosting::pluck('id', 'title');
        $profiles = AlumniProfile::pluck('id', 'nim');

        $seedData = [
            [
                'job' => 'Full-Stack Web Developer (Laravel & React)',
                'nim' => '23010044',
                'status' => 'diterima',
                'source_type' => 'manual',
                'invitation_status' => 'none',
                'notes' => 'Saya tertarik bergabung karena ingin mendalami pengembangan ERP memakai ekosistem Laravel dan React yang sesuai dengan proyek-proyek saya.',
                'hr_notes' => 'Kandidat lolos tahap wawancara teknik dan langsung direkrut menjadi Full Stack Developer. Portofolio dan pemahaman Inertia.js sangat baik.',
                'interview_details' => [
                    'scheduled_at' => '2026-01-20T10:00:00',
                    'location' => 'Gedung Cyber, Jakarta Selatan',
                    'latitude' => -6.229728,
                    'longitude' => 106.829430,
                    'duration' => '60',
                    'notes' => 'Wawancara teknis bersama tim engineering.',
                    'interview_mode' => 'offline',
                ],
                'created_at' => '-40 days',
            ],
            [
                'job' => 'Full-Stack Web Developer (Laravel & React)',
                'nim' => '22010111',
                'status' => 'ditolak',
                'source_type' => 'manual',
                'invitation_status' => 'none',
                'notes' => 'Melamar posisi developer untuk mengembangkan keahlian full-stack setelah pengalaman sebagai peserta magang di perusahaan software.',
                'hr_notes' => 'Kandidat lolos administrasi namun akhirnya menerima tawaran posisi System Analyst di perusahaan lain dan tidak dapat melanjutkan proses.',
                'created_at' => '-60 days',
            ],
            [
                'job' => 'Full-Stack Web Developer (Laravel & React)',
                'nim' => '21030078',
                'status' => 'ditolak',
                'source_type' => 'manual',
                'invitation_status' => 'none',
                'notes' => 'Mendaftar untuk menguji kesempatan karier sebelum memutuskan melanjutkan studi.',
                'hr_notes' => 'Kandidat sangat potensial, namun memutuskan untuk tidak melanjutkan proses karena meneruskan pendidikan ke jenjang S2.',
                'created_at' => '-75 days',
            ],
            [
                'job' => 'Staff Accounting & Pajak',
                'nim' => '22020233',
                'status' => 'diterima',
                'source_type' => 'manual',
                'invitation_status' => 'none',
                'notes' => 'Berpengalaman menggunakan MYOB dan menyusun laporan keuangan untuk koperasi, serta mampu menangani rekonsiliasi bank dan pelaporan pajak.',
                'hr_notes' => 'Kandidat diterima sebagai Staff Accounting setelah melalui tes tertulis akuntansi dan wawancara. Penguasaan MYOB dan ketelitian dinilai sangat baik.',
                'interview_details' => [
                    'scheduled_at' => '2025-11-05T09:30:00',
                    'location' => 'Jl. Jendral Sudirman Kav. 21, Jakarta Pusat',
                    'latitude' => -6.224309,
                    'longitude' => 106.815782,
                    'duration' => '45',
                    'notes' => 'Interview user dengan tim finance.',
                    'interview_mode' => 'offline',
                ],
                'created_at' => '-120 days',
            ],
            [
                'job' => 'Admin Gudang & Inventory Control',
                'nim' => '22020233',
                'status' => 'ditolak',
                'source_type' => 'manual',
                'invitation_status' => 'none',
                'notes' => 'Mencari pengalaman tambahan di bidang administrasi gudang sambil menunggu proses di posisi akuntansi.',
                'hr_notes' => 'Kandidat dipanggil wawancara, namun memilih melanjutkan proses pada posisi lain yang lebih sesuai dengan bidang akuntansinya.',
                'created_at' => '-100 days',
            ],
            [
                'job' => 'Social Media Specialist & Content Creator',
                'nim' => '22040102',
                'status' => 'wawancara',
                'source_type' => 'manual',
                'invitation_status' => 'none',
                'notes' => 'Memiliki pengalaman membuat konten kreatif untuk UMKM dan memahami tren Instagram/TikTok, siap beradaptasi dengan kebutuhan klien.',
                'interview_details' => [
                    'scheduled_at' => '2026-09-28T13:30:00',
                    'location' => 'Online (Google Meet)',
                    'latitude' => null,
                    'longitude' => null,
                    'duration' => '45',
                    'notes' => 'Wawancara daring bersama tim creative.',
                    'interview_mode' => 'online',
                ],
                'created_at' => '-5 days',
            ],
        ];

        $count = 0;
        foreach ($seedData as $row) {
            $alumniId = $profiles->get($row['nim']);
            $postingId = $jobs->get($row['job']);

            if (! $alumniId || ! $postingId) {
                continue;
            }

            JobApplication::updateOrCreate(
                [
                    'job_posting_id' => $postingId,
                    'alumni_id' => $alumniId,
                ],
                [
                    'status' => $row['status'],
                    'notes' => $row['notes'] ?? null,
                    'hr_notes' => $row['hr_notes'] ?? null,
                    'interview_details' => $row['interview_details'] ?? null,
                    'source_type' => $row['source_type'] ?? 'manual',
                    'invitation_status' => $row['invitation_status'] ?? 'none',
                    'created_at' => Carbon::parse($row['created_at']),
                    'updated_at' => Carbon::parse($row['created_at']),
                ]
            );

            $count++;
        }

        $this->command->info("Job Application berhasil disimpan: {$count} lamaran untuk lowongan yang ada.");
    }
}