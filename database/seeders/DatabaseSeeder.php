<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Company;
use App\Models\JobPosting;
use App\Models\AlumniProfile;
use App\Models\IndustrySektor;
use App\Models\ProgramStudi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role; // <-- IMPORT SPATIE ROLE

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 0. Bersihkan cache Spatie (Wajib saat seeding)
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Buat Role di sistem Spatie
        Role::firstOrCreate(['name' => 'Super Admin']);
        Role::firstOrCreate(['name' => 'Admin Kampus']);
        Role::firstOrCreate(['name' => 'Admin PT']);
        Role::firstOrCreate(['name' => 'Alumni']);

        // 2. Buat Akun Super Admin & Admin Kampus
        $superAdmin = User::create([
            'name' => 'Super Administrator',
            'email' => 'superadmin@sitami.ac.id',
            'password' => Hash::make('password123'),
            'role' => 'Super Admin',
        ]);
        $superAdmin->assignRole('Super Admin'); // <-- Pasangkan Role Spatie

        $adminKampus = User::create([
            'name' => 'Biro Kemahasiswaan (Admin)',
            'email' => 'adminkampus@sitami.ac.id',
            'password' => Hash::make('password123'),
            'role' => 'Admin Kampus',
        ]);
        $adminKampus->assignRole('Admin Kampus'); // <-- Pasangkan Role Spatie

        // 3. Buat Master Data (Industri & Prodi)
        $industries = ['Teknologi Informasi', 'Perbankan & Keuangan', 'Manufaktur', 'Pendidikan', 'Kesehatan'];
        foreach ($industries as $ind) {
            IndustrySektor::create(['name' => $ind]);
        }

        $prodis = [
            ['name' => 'Teknik Informatika', 'jenjang' => 'S1'],
            ['name' => 'Sistem Informasi', 'jenjang' => 'S1'],
            ['name' => 'Manajemen Informatika', 'jenjang' => 'D3'],
            ['name' => 'Komputerisasi Akuntansi', 'jenjang' => 'D3'],
        ];
        foreach ($prodis as $prodi) {
            ProgramStudi::create($prodi);
        }

        // 4. Buat Akun Perusahaan (Admin PT) yang sudah terverifikasi
        $hrdUser = User::create([
            'name' => 'HRD PT Inovasi Dinamika Solusi',
            'email' => 'hrd@inovasidinamika.com',
            'password' => Hash::make('password123'),
            'role' => 'Admin PT',
        ]);
        $hrdUser->assignRole('Admin PT'); // <-- Pasangkan Role Spatie

        $company = Company::create([
            'user_id' => $hrdUser->id,
            'name' => 'PT Inovasi Dinamika Solusi',
            'address' => 'Gedung Cyber, Jakarta Selatan',
            'description' => 'Perusahaan IT Consultant yang berfokus pada pengembangan ERP dan Sistem Informasi Enterprise.',
            'industry' => 'Teknologi Informasi',
            'website' => 'https://inovasidinamika.com',
            'verification_status' => 'verified',
        ]);

        JobPosting::create([
            'company_id' => $company->id,
            'title' => 'Full-Stack Web Developer (Laravel & React)',
            'description' => 'Kami mencari developer berpengalaman yang menguasai ekosistem Laravel dan React/Inertia.js.',
            'requirements' => '1. Lulusan S1/D3 IT. 2. Menguasai PHP dan JavaScript. 3. Paham Git dan Docker.',
            'location' => 'Jakarta Selatan (Hybrid)',
            'salary_range' => 'Rp 7.000.000 - Rp 10.000.000',
            'is_active' => true,
        ]);

        // 5. Buat Akun Alumni beserta Profilnya
        $alumni1 = User::create([
            'name' => 'Fiko Abdigusti',
            'email' => 'fiko@alumni.sitami.ac.id',
            'password' => Hash::make('password123'),
            'role' => 'Alumni',
        ]);
        $alumni1->assignRole('Alumni'); // <-- Pasangkan Role Spatie

        AlumniProfile::create([
            'user_id' => $alumni1->id,
            'nim' => '23010044',
            'major' => 'Manajemen Informatika',
            'graduation_year' => 2026,
            'skills' => 'Laravel, React.js, Inertia.js, Tailwind CSS',
            'phone_number' => '081234567890',
            'address' => 'Bandung, Jawa Barat',
        ]);

        $alumni2 = User::create([
            'name' => 'Zaky Hanif Testandy',
            'email' => 'zaky@alumni.sitami.ac.id',
            'password' => Hash::make('password123'),
            'role' => 'Alumni',
        ]);
        $alumni2->assignRole('Alumni'); // <-- Pasangkan Role Spatie

        AlumniProfile::create([
            'user_id' => $alumni2->id,
            'nim' => '22010111',
            'major' => 'Teknik Informatika',
            'graduation_year' => 2025,
            'skills' => 'System Analysis, ERP Development, PHP',
            'phone_number' => '089876543210',
            'address' => 'Jakarta Selatan',
        ]);

        echo "Selesai! Database dan Spatie Permission Role berhasil dipasang! \n";
    }
}
