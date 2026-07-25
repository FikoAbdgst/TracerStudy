<?php

namespace Database\Seeders;

use App\Models\AlumniProfile;
use App\Models\Company;
use App\Models\ForumReply;
use App\Models\ForumTopic;
use App\Models\JobPosting;
use App\Models\MasterCategory;
use App\Models\MasterItem;
use App\Models\MouDocument;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str; // <-- Tambahkan Str
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 0. Bersihkan cache Spatie (Wajib saat seeding)
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Buat Role di sistem Spatie
        Role::firstOrCreate(['name' => 'Super Admin']);
        Role::firstOrCreate(['name' => 'Admin Kampus']);
        Role::firstOrCreate(['name' => 'Admin PT']);
        Role::firstOrCreate(['name' => 'Alumni']);

        // 2. Buat Akun Super Admin & Admin Kampus
        $superAdmin = new User;
        $superAdmin->name = 'Super Administrator';
        $superAdmin->email = 'superadmin@sitami.ac.id';
        $superAdmin->password = Hash::make('password123');
        $superAdmin->role = 'Super Admin';
        $superAdmin->save();
        $superAdmin->assignRole('Super Admin');

        $adminKampus = new User;
        $adminKampus->name = 'Biro Kemahasiswaan (Admin)';
        $adminKampus->email = 'adminkampus@sitami.ac.id';
        $adminKampus->password = Hash::make('password123');
        $adminKampus->role = 'Admin Kampus';
        $adminKampus->save();
        $adminKampus->assignRole('Admin Kampus');

        // 3. Buat MASTER DATA DINAMIS (Sektor Industri & Program Studi)

        $catKeahlian = MasterCategory::create([
            'name' => 'Keahlian',
            'slug' => Str::slug('Keahlian'),
            'use_parameter' => false,
        ]);

        // Keahlian diperluas mencakup bidang IT, Akuntansi, Administrasi, dan Kreatif
        $skills = [
            'PHP',
            'Laravel',
            'React.js',
            'Vue.js',
            'Inertia.js',
            'Tailwind CSS',
            'System Analysis',
            'ERP Development',
            'Mobile App',
            'UI/UX Design',
            'Financial Accounting',
            'Tax Reporting',
            'MYOB',
            'Microsoft Excel Advanced',
            'Data Entry',
            'Administrative Skills',
            'Digital Marketing',
            'Content Creation',
            'Inventory Management',
            'Customer Service',
        ];
        foreach ($skills as $s) {
            MasterItem::create([
                'master_category_id' => $catKeahlian->id,
                'name' => $s,
                'is_active' => true,
            ]);
        }

        // Buat Kategori (Tab) Industri (Diperluas agar bervariasi)
        $catIndustri = MasterCategory::create([
            'name' => 'Sektor Industri',
            'slug' => Str::slug('Sektor Industri'),
            'use_parameter' => false,
            'parameter_label' => null,
        ]);

        $industries = ['Teknologi Informasi', 'Perbankan & Keuangan', 'Manufaktur', 'Pendidikan', 'Kesehatan', 'Retail & FMCG', 'Media & Kreatif'];
        foreach ($industries as $ind) {
            MasterItem::create([
                'master_category_id' => $catIndustri->id,
                'name' => $ind,
                'parameter_value' => null,
                'is_active' => true,
            ]);
        }

        // Buat Kategori (Tab) Program Studi
        $catProdi = MasterCategory::create([
            'name' => 'Program Studi',
            'slug' => Str::slug('Program Studi'),
            'use_parameter' => true,
            'parameter_label' => 'Jenjang',
        ]);

        $prodis = [
            ['name' => 'Teknik Informatika', 'jenjang' => 'S1'],
            ['name' => 'Sistem Informasi', 'jenjang' => 'S1'],
            ['name' => 'Manajemen Informatika', 'jenjang' => 'D3'],
            ['name' => 'Komputerisasi Akuntansi', 'jenjang' => 'D3'],
        ];
        foreach ($prodis as $prodi) {
            MasterItem::create([
                'master_category_id' => $catProdi->id,
                'name' => $prodi['name'],
                'parameter_value' => $prodi['jenjang'],
                'is_active' => true,
            ]);
        }

        // 4. Buat Akun Perusahaan (Admin PT) & Lowongan Pekerjaan Bervariasi

        // --- PERUSAHAAN 1: Sektor IT ---
        $hrdUser1 = new User;
        $hrdUser1->name = 'HRD PT Inovasi Dinamika Solusi';
        $hrdUser1->email = 'hrd@inovasidinamika.com';
        $hrdUser1->password = Hash::make('password123');
        $hrdUser1->role = 'Admin PT';
        $hrdUser1->save();
        $hrdUser1->assignRole('Admin PT');

        $company1 = Company::create([
            'user_id' => $hrdUser1->id,
            'name' => 'PT Inovasi Dinamika Solusi',
            'address' => 'Gedung Cyber, Jakarta Selatan',
            'description' => 'Perusahaan IT Consultant yang berfokus pada pengembangan ERP dan Sistem Informasi Enterprise.',
            'industry' => 'Teknologi Informasi',
            'website' => 'https://inovasidinamika.com',
            'latitude' => -6.229728,
            'longitude' => 106.829430,
            'verification_status' => 'verified',
        ]);

        JobPosting::create([
            'company_id' => $company1->id,
            'title' => 'Full-Stack Web Developer (Laravel & React)',
            'description' => 'Kami mencari developer berpengalaman yang menguasai ekosistem Laravel dan React/Inertia.js untuk berkontribusi dalam pengembangan modul ERP.',
            'requirements' => ['PHP', 'Laravel', 'React.js', 'Inertia.js'],
            'location' => 'Jakarta Selatan (Hybrid)',
            'salary_range' => 'Rp 7.000.000 - Rp 10.000.000',
            'is_active' => true,
        ]);

        // --- PERUSAHAAN 2: Sektor Perbankan & Keuangan (Non-IT) ---
        $hrdUser2 = new User;
        $hrdUser2->name = 'HRD Bank Mandiri Sejahtera';
        $hrdUser2->email = 'recruitment@mandirisejahtera.co.id';
        $hrdUser2->password = Hash::make('password123');
        $hrdUser2->role = 'Admin PT';
        $hrdUser2->save();
        $hrdUser2->assignRole('Admin PT');

        $company2 = Company::create([
            'user_id' => $hrdUser2->id,
            'name' => 'PT Bank Mandiri Sejahtera Tbk',
            'address' => 'Jl. Jendral Sudirman Kav. 21, Jakarta Pusat',
            'description' => 'Lembaga keuangan perbankan terkemuka di Indonesia yang menyediakan berbagai solusi finansial nasabah.',
            'industry' => 'Perbankan & Keuangan',
            'website' => 'https://mandirisejahtera.co.id',
            'latitude' => -6.224309,
            'longitude' => 106.815782,
            'verification_status' => 'verified',
        ]);

        JobPosting::create([
            'company_id' => $company2->id,
            'title' => 'Staff Accounting & Pajak',
            'description' => 'Membuat laporan keuangan bulanan, melakukan rekonsiliasi bank, dan menyusun pelaporan pajak berkala (PPh 21/23/25) perusahaan.',
            'requirements' => ['Financial Accounting', 'Tax Reporting', 'Microsoft Excel Advanced'],
            'location' => 'Jakarta Pusat (On-site)',
            'salary_range' => 'Rp 5.500.000 - Rp 7.500.000',
            'is_active' => true,
        ]);

        // --- PERUSAHAAN 3: Sektor Manufaktur / FMCG (Non-IT) ---
        $hrdUser3 = new User;
        $hrdUser3->name = 'HRD PT Nusantara Food Industri';
        $hrdUser3->email = 'career@nusantarafood.com';
        $hrdUser3->password = Hash::make('password123');
        $hrdUser3->role = 'Admin PT';
        $hrdUser3->save();
        $hrdUser3->assignRole('Admin PT');

        $company3 = Company::create([
            'user_id' => $hrdUser3->id,
            'name' => 'PT Nusantara Food Industri',
            'address' => 'Kawasan Industri Jababeka, Cikarang',
            'description' => 'Perusahaan manufaktur berskala nasional yang bergerak di bidang pengolahan makanan ringan dan minuman kemasan.',
            'industry' => 'Manufaktur',
            'website' => 'https://nusantarafood.com',
            'latitude' => -6.331131,
            'longitude' => 107.143531,
            'verification_status' => 'verified',
        ]);

        JobPosting::create([
            'company_id' => $company3->id,
            'title' => 'Admin Gudang & Inventory Control',
            'description' => 'Bertanggung jawab atas pencatatan arus masuk-keluar barang di gudang, pelaksanaan opname stock bulanan, serta menyusun laporan inventaris menggunakan sistem gudang terintegrasi.',
            'requirements' => ['Inventory Management', 'Data Entry', 'Microsoft Excel Advanced'],
            'location' => 'Cikarang, Bekasi',
            'salary_range' => 'Rp 4.800.000 - Rp 6.000.000',
            'is_active' => true,
        ]);

        // --- PERUSAHAAN 4: Sektor Media & Kreatif (Non-IT) ---
        $hrdUser4 = new User;
        $hrdUser4->name = 'HRD Circle Media Group';
        $hrdUser4->email = 'hr@circlemedia.id';
        $hrdUser4->password = Hash::make('password123');
        $hrdUser4->role = 'Admin PT';
        $hrdUser4->save();
        $hrdUser4->assignRole('Admin PT');

        $company4 = Company::create([
            'user_id' => $hrdUser4->id,
            'name' => 'Circle Media Group',
            'address' => 'Jl. Dipatiukur No. 45, Bandung',
            'description' => 'Creative agency yang bergerak di bidang pengelolaan brand digital, social media management, dan content production.',
            'industry' => 'Media & Kreatif',
            'website' => 'https://circlemedia.id',
            'latitude' => -6.895456,
            'longitude' => 107.610772,
            'verification_status' => 'verified',
        ]);

        JobPosting::create([
            'company_id' => $company4->id,
            'title' => 'Social Media Specialist & Content Creator',
            'description' => 'Mengembangkan ide konten kreatif harian untuk Instagram dan TikTok klien, mengelola interaksi (engagement), serta menganalisis performa insight mingguan.',
            'requirements' => ['Digital Marketing', 'Content Creation', 'Customer Service'],
            'location' => 'Bandung (Remote / WFH Allowed)',
            'salary_range' => 'Rp 4.000.000 - Rp 5.500.000',
            'is_active' => true,
        ]);

        // --- DOKUMEN MoU UNTUK MITRA AKTIF ---
        MouDocument::create([
            'company_id' => $company1->id,
            'file_url' => 'mou/pt_inovasi_dinamika_solusi.pdf',
            'status' => 'active',
            'signed_at' => '2025-09-01',
            'expires_at' => '2027-08-31',
        ]);

        MouDocument::create([
            'company_id' => $company2->id,
            'file_url' => 'mou/bank_mandiri_sejahtera.pdf',
            'status' => 'active',
            'signed_at' => '2025-10-15',
            'expires_at' => '2027-10-14',
        ]);

        MouDocument::create([
            'company_id' => $company3->id,
            'file_url' => 'mou/nusantara_food_industri.pdf',
            'status' => 'active',
            'signed_at' => '2026-01-10',
            'expires_at' => '2028-01-09',
        ]);

        MouDocument::create([
            'company_id' => $company4->id,
            'file_url' => 'mou/circle_media_group.pdf',
            'status' => 'active',
            'signed_at' => '2026-03-20',
            'expires_at' => '2028-03-19',
        ]);

        // 5. Buat Akun & Profil Alumni
        $alumni1 = new User;
        $alumni1->name = 'Fiko Abdigusti';
        $alumni1->email = 'fiko@alumni.sitami.ac.id';
        $alumni1->password = Hash::make('password123');
        $alumni1->role = 'Alumni';
        $alumni1->save();
        $alumni1->assignRole('Alumni');

        AlumniProfile::create([
            'user_id' => $alumni1->id,
            'nim' => '23010044',
            'major' => 'Manajemen Informatika',
            'jenjang_pendidikan' => 'D3',
            'tanggal_lahir' => '2004-05-14',
            'experience' => 1,
            'graduation_year' => 2026,
            'skills' => ['Laravel', 'React.js', 'Inertia.js', 'Tailwind CSS'],
            'phone_number' => '081234567890',
            'address' => 'Bandung, Jawa Barat',
            'employment_status' => 'Bekerja',
            'position' => 'Full Stack Developer',
            'company_name' => 'PT Inovasi Dinamika',
            'judul_skripsi' => 'Sistem Informasi Tracer Study Berbasis Web Menggunakan Laravel dan Inertia.js',
            'portofolio_proyek' => [
                ['nama_proyek' => 'SITAMI - Tracer Study Alumni', 'deskripsi_singkat' => 'Platform tracer study dan bursa kerja untuk alumni STMIK Mardira Indonesia. Dibangun dengan Laravel, React, Inertia.js.', 'tautan' => 'https://github.com/fikoo5/sitami'],
                ['nama_proyek' => 'E-Commerce UMKM', 'deskripsi_singkat' => 'Aplikasi e-commerce untuk produk UMKM lokal dengan fitur manajemen stok, keranjang, dan pembayaran.', 'tautan' => 'https://github.com/fikoo5/ecommerce-umkm'],
            ],
        ]);

        $alumni2 = new User;
        $alumni2->name = 'Zaky Hanif Testandy';
        $alumni2->email = 'zaky@alumni.sitami.ac.id';
        $alumni2->password = Hash::make('password123');
        $alumni2->role = 'Alumni';
        $alumni2->save();
        $alumni2->assignRole('Alumni');

        AlumniProfile::create([
            'user_id' => $alumni2->id,
            'nim' => '22010111',
            'major' => 'Teknik Informatika',
            'jenjang_pendidikan' => 'S1',
            'tanggal_lahir' => '2003-08-20',
            'experience' => 2,
            'graduation_year' => 2025,
            'skills' => ['System Analysis', 'ERP Development', 'PHP'],
            'phone_number' => '089876543210',
            'address' => 'Jakarta Selatan',
            'employment_status' => 'Bekerja',
            'position' => 'System Analyst',
            'company_name' => 'PT Solusi Teknologi Nusantara',
            'judul_skripsi' => 'Pengembangan Sistem ERP Modul Inventory Pada Perusahaan Manufaktur Menggunakan Metode Waterfall',
            'portofolio_proyek' => [
                ['nama_proyek' => 'ERP Inventory System', 'deskripsi_singkat' => 'Sistem manajemen inventori untuk perusahaan manufaktur menengah. Meliputi barang masuk/keluar, stok opname, dan laporan.', 'tautan' => 'https://github.com/zakyhanif/erp-inventory'],
                ['nama_proyek' => 'Aplikasi Penggajian Karyawan', 'deskripsi_singkat' => 'Sistem penggajian terintegrasi dengan absensi dan perhitungan PPh 21.', 'tautan' => 'https://github.com/zakyhanif/payroll-app'],
                ['nama_proyek' => 'Company Profile Website', 'deskripsi_singkat' => 'Website company profile interaktif dengan animasi dan optimasi SEO.', 'tautan' => 'https://zakyhanif.my.id'],
            ],
        ]);

        $alumni3 = new User;
        $alumni3->name = 'Rina Amalia';
        $alumni3->email = 'rina@alumni.sitami.ac.id';
        $alumni3->password = Hash::make('password123');
        $alumni3->role = 'Alumni';
        $alumni3->save();
        $alumni3->assignRole('Alumni');

        AlumniProfile::create([
            'user_id' => $alumni3->id,
            'nim' => '22020233',
            'major' => 'Komputerisasi Akuntansi',
            'jenjang_pendidikan' => 'D3',
            'tanggal_lahir' => '2003-11-02',
            'experience' => 1,
            'graduation_year' => 2025,
            'skills' => ['Microsoft Excel Advanced', 'Data Entry', 'Administrative Skills', 'MYOB'],
            'phone_number' => '082145678901',
            'address' => 'Bandung, Jawa Barat',
            'employment_status' => 'Bekerja',
            'position' => 'Staff Akuntansi',
            'company_name' => 'PT Koperasi Mardira Sejahtera',
            'judul_skripsi' => 'Perancangan Sistem Informasi Akuntansi Penerimaan dan Pengeluaran Kas Pada Koperasi Simpan Pinjam',
            'portofolio_proyek' => [
                ['nama_proyek' => 'Aplikasi Pembukuan Koperasi', 'deskripsi_singkat' => 'Aplikasi pembukuan untuk koperasi simpan pinjam dengan fitur jurnal, buku besar, dan laporan keuangan.', 'tautan' => 'https://docs.google.com/spreadsheets/d/example-koperasi'],
                ['nama_proyek' => 'Dashboard Keuangan UMKM', 'deskripsi_singkat' => 'Dashboard interaktif untuk monitoring arus kas dan laba rugi UMKM menggunakan Excel VBA.', 'tautan' => 'https://drive.google.com/file/d/example-finance'],
            ],
        ]);

        $alumni4 = new User;
        $alumni4->name = 'Dimas Pratama';
        $alumni4->email = 'dimas@alumni.sitami.ac.id';
        $alumni4->password = Hash::make('password123');
        $alumni4->role = 'Alumni';
        $alumni4->save();
        $alumni4->assignRole('Alumni');

        AlumniProfile::create([
            'user_id' => $alumni4->id,
            'nim' => '21030078',
            'major' => 'Teknik Informatika',
            'jenjang_pendidikan' => 'S1',
            'tanggal_lahir' => '2002-07-15',
            'experience' => 3,
            'graduation_year' => 2024,
            'skills' => ['PHP', 'Laravel', 'System Analysis', 'ERP Development', 'React.js'],
            'phone_number' => '085678901234',
            'address' => 'Jakarta Selatan',
            'employment_status' => 'Lanjutkan Pendidikan',
            'judul_skripsi' => 'Implementasi Algoritma AHP Untuk Sistem Pendukung Keputusan Seleksi Penerimaan Karyawan',
            'portofolio_proyek' => [
                ['nama_proyek' => 'SPK Penerimaan Karyawan', 'deskripsi_singkat' => 'Sistem pendukung keputusan berbasis web menggunakan metode AHP untuk membantu HRD melakukan seleksi kandidat.', 'tautan' => 'https://github.com/dimaspratama/spk-ahp'],
                ['nama_proyek' => 'Aplikasi Pengelolaan Proyek', 'deskripsi_singkat' => 'Project management tool dengan fitur Gantt chart, task assignment, dan tracking progress.', 'tautan' => 'https://dimaspratama.dev/projects'],
                ['nama_proyek' => 'Rest API Layanan Publik', 'deskripsi_singkat' => 'RESTful API untuk layanan publik dengan dokumentasi Swagger dan autentikasi JWT.', 'tautan' => 'https://github.com/dimaspratama/public-api'],
            ],
        ]);

        $alumni5 = new User;
        $alumni5->name = 'Siti Nurhaliza';
        $alumni5->email = 'siti@alumni.sitami.ac.id';
        $alumni5->password = Hash::make('password123');
        $alumni5->role = 'Alumni';
        $alumni5->save();
        $alumni5->assignRole('Alumni');

        AlumniProfile::create([
            'user_id' => $alumni5->id,
            'nim' => '22040102',
            'major' => 'Manajemen Informatika',
            'jenjang_pendidikan' => 'D3',
            'tanggal_lahir' => '2004-01-20',
            'experience' => 1,
            'graduation_year' => 2026,
            'skills' => ['UI/UX Design', 'Digital Marketing', 'Content Creation', 'Tailwind CSS'],
            'phone_number' => '081398765432',
            'address' => 'Bandung, Jawa Barat',
            'employment_status' => 'Mencari Kerja',
            'judul_skripsi' => 'Perancangan UI/UX Aplikasi Mobile E-Learning Menggunakan Metode Design Thinking',
            'portofolio_proyek' => [
                ['nama_proyek' => 'Desain Aplikasi E-Learning', 'deskripsi_singkat' => 'Perancangan UI/UX aplikasi mobile pembelajaran interaktif menggunakan Figma, mencakup wireframe, prototype, dan user testing.', 'tautan' => 'https://figma.com/file/example-elearning'],
                ['nama_proyek' => 'Brand Identity UMKM Makanan', 'deskripsi_singkat' => 'Perancangan brand identity lengkap untuk UMKM makanan ringan, termasuk logo, kemasan, dan media sosial.', 'tautan' => 'https://drive.google.com/drive/folders/example-branding'],
            ],
        ]);

        // ==========================================
        // 6. SEED DATA: RUANG DISKUSI (FORUM)
        // ==========================================

        // Diskusi 1: Seputar Tips Interview (Dibuat oleh Alumni 1)
        $topic1 = ForumTopic::create([
            'user_id' => $alumni1->id,
            'title' => 'Tips Lolos Interview Kerja untuk Fresh Graduate D3/S1',
            'slug' => Str::slug('Tips Lolos Interview Kerja untuk Fresh Graduate D3 S1'), // Diaktifkan kembali untuk memenuhi Not-Null Constraint PostgreSQL
            'content' => 'Halo rekan-rekan alumni! Di sini ada yang punya tips atau pengalaman menarik saat menghadapi interview kerja pertama kali tidak? Terutama cara menjawab pertanyaan "Ceritakan tentang diri Anda" agar HRD tertarik dengan portofolio project kuliah kita. Bagikan pengalamannya dong!',
        ]);

        // Balasan untuk Diskusi 1
        ForumReply::create([
            'forum_topic_id' => $topic1->id,
            'user_id' => $alumni2->id,
            'content' => 'Bantu jawab berdasarkan pengalaman kemarin ya. Kuncinya pakai metode STAR (Situation, Task, Action, Result) saat menceritakan project KP atau tugas akhir. Ceritakan kendala teknis apa yang dihadapi dan cara kita menyelesaikannya. HRD paling suka tipe problem solver!',
        ]);

        ForumReply::create([
            'forum_topic_id' => $topic1->id,
            'user_id' => $adminKampus->id,
            'content' => 'Kombinasi yang bagus! Dari pihak kampus juga menyarankan untuk tetap melatih komunikasi verbal (mock interview) dan pastikan CV yang dikirimkan sinkron dengan apa yang diucapkan saat wawancara berlangsung. Semangat untuk para lulusan baru!',
        ]);

        // Diskusi 2: Topik Karier & Industri (Dibuat oleh Alumni 2)
        $topic2 = ForumTopic::create([
            'user_id' => $alumni2->id,
            'title' => 'Peluang Kerja Full-stack Developer Menggunakan React + Inertia.js di Tahun Ini',
            'slug' => Str::slug('Peluang Kerja Full-stack Developer Menggunakan React Inertia js di Tahun Ini'),
            'content' => 'Melihat tren sekarang, ekosistem Laravel modern banyak yang pakai Inertia.js digabung dengan React atau Vue. Menurut teman-teman di sini, apakah efisiensinya di industri skala corporate sudah cukup bersaing dibandingkan dengan memisahkan pure REST API (Laravel) dan standalone SPA (React)? Yuk diskusi kelebihannya!',
        ]);

        // Balasan untuk Diskusi 2
        ForumReply::create([
            'forum_topic_id' => $topic2->id,
            'user_id' => $alumni1->id,
            'content' => 'Kalau untuk tim kecil-menengah atau kejar target MVP (Minimum Viable Product), kombinasi Laravel + Inertia + React juara banget sih bang. Soalnya kita ga perlu pusing routing ganda dan handling state authentication yang ribet. Tapi kalau buat aplikasi mobile-ready ke depannya, emang mau ga mau harus dipisah ke pure REST API.',
        ]);

        // Diskusi 3: Informasi Umum tentang Sertifikasi (Dibuat oleh Admin Kampus)
        $topic3 = ForumTopic::create([
            'user_id' => $adminKampus->id,
            'title' => 'Pentingnya Sertifikasi Kompetensi (BNSP) Saat Melamar Kerja',
            'slug' => Str::slug('Pentingnya Sertifikasi Kompetensi BNSP Saat Melamar Kerja'),
            'content' => 'Halo semuanya, sekadar mengingatkan bagi rekan-rekan lulusan baru, jangan lupa untuk melampirkan sertifikat kompetensi BNSP yang pernah diikuti di kampus saat wisuda kemarin. Beberapa mitra perusahaan PT yang bekerja sama dengan SITAMI sering kali menjadikan sertifikasi tersebut sebagai nilai tambah utama.',
        ]);

        ForumReply::create([
            'forum_topic_id' => $topic3->id,
            'user_id' => $alumni2->id,
            'content' => 'Betul sekali Pak/Bu, waktu saya melamar di Tech Company kemarin, sertifikat kompetensi Sistem Analis sangat membantu memvalidasi keahlian saya di mata user.',
        ]);

        echo "Selesai! Database, Master Data, Lowongan Multi-Industri, dan Ruang Diskusi berhasil dipasang! \n";
    }
}
