<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AlumniImportTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        Role::firstOrCreate(['name' => 'Alumni']);
        $admin = User::factory()->create();
        $admin->assignRole(Role::firstOrCreate(['name' => 'Admin Kampus']));

        return $admin;
    }

    public function test_template_roundtrip_imports_successfully(): void
    {
        $admin = $this->admin();

        $templateCsv = $this->actingAs($admin)->get(route('adminkampus.alumni.template'))->streamedContent();
        $nim = '99990001';
        $templateCsv = str_replace('23010044', $nim, $templateCsv);

        $file = UploadedFile::fake()->createWithContent('import.csv', $templateCsv);

        $this->actingAs($admin)->post(route('adminkampus.alumni.import'), ['file' => $file]);

        $this->assertDatabaseHas('alumni_profiles', ['nim' => $nim]);
        $this->assertSame(['inserted' => 1, 'duplicates' => []], session('import_result'));
    }

    public function test_csv_with_partial_headers_is_rejected(): void
    {
        $admin = $this->admin();

        $csv = "NIM,Nama Lengkap,Jenjang,Program Studi,Asal Kota\n99990002,Budi,Bogor\n";
        $file = UploadedFile::fake()->createWithContent('salah.csv', $csv);

        $this->actingAs($admin)->post(route('adminkampus.alumni.import'), ['file' => $file]);

        $error = session('import_error');
        $this->assertStringContainsString('Kolom yang tidak ditemukan', $error);
        $this->assertStringContainsString('Tanggal Lahir', $error);
        $this->assertStringContainsString('Tahun Lulus', $error);
        $this->assertDatabaseMissing('alumni_profiles', ['nim' => '99990002']);
    }
}
