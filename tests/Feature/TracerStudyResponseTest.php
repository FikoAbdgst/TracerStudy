<?php

namespace Tests\Feature;

use App\Models\AlumniProfile;
use App\Models\TracerStudyForm;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class TracerStudyResponseTest extends TestCase
{
    use RefreshDatabase;

    private function alumniProfile(string $nim = '23010099'): AlumniProfile
    {
        $user = User::factory()->create();
        $user->assignRole(Role::firstOrCreate(['name' => 'Alumni']));

        return AlumniProfile::create([
            'user_id' => $user->id,
            'nim' => $nim,
            'major' => 'Manajemen Informatika',
            'jenjang_pendidikan' => 'D3',
            'graduation_year' => (int) date('Y'),
        ]);
    }

    private function activeForm(): TracerStudyForm
    {
        return TracerStudyForm::create([
            'title' => 'Tracer Study Test',
            'questions' => [
                ['id' => 1, 'type' => 'text', 'question' => 'Kantor tempat bekerja?', 'target_statuses' => ['Bekerja']],
                ['id' => 2, 'type' => 'text', 'question' => 'Kampus tujuan?', 'target_statuses' => ['Lanjutkan Pendidikan']],
                ['id' => 3, 'type' => 'text', 'question' => 'Saluran cari kerja?', 'target_statuses' => ['Mencari Kerja']],
            ],
            'status' => 'active',
        ]);
    }

    public function test_working_student_keeps_company_and_education_data(): void
    {
        $alumni = $this->alumniProfile();
        $form = $this->activeForm();

        $this->actingAs($alumni->user)->post(route('alumni.kuesioner.store', $form->id), [
            'status_pekerjaan' => 'Bekerja',
            'melanjutkan_pendidikan' => true,
            'pendidikan_institusi' => 'ITB (S2)',
            'nama_perusahaan' => 'PT Maju',
            'jabatan' => 'Analyst',
            'answers' => [1 => 'Jakarta', 2 => 'ITB', 3 => 'double'],
        ]);

        $this->assertDatabaseHas('tracer_study_responses', [
            'alumni_id' => $alumni->id,
            'status_pekerjaan' => 'Bekerja',
            'melanjutkan_pendidikan' => true,
            'pendidikan_institusi' => 'ITB (S2)',
            'nama_perusahaan' => 'PT Maju',
            'jabatan' => 'Analyst',
            'answers' => json_encode([1 => 'Jakarta', 2 => 'ITB']),
        ]);

        $this->assertDatabaseHas('alumni_profiles', [
            'id' => $alumni->id,
            'employment_status' => 'Bekerja',
            'melanjutkan_pendidikan' => true,
            'pendidikan_institusi' => 'ITB (S2)',
            'company_name' => 'PT Maju',
            'position' => 'Analyst',
        ]);
    }

    public function test_looking_for_work_student_clears_company_and_keeps_education_answers(): void
    {
        $alumni = $this->alumniProfile();
        $form = $this->activeForm();

        $this->actingAs($alumni->user)->post(route('alumni.kuesioner.store', $form->id), [
            'status_pekerjaan' => 'Mencari Kerja',
            'melanjutkan_pendidikan' => true,
            'pendidikan_institusi' => 'UGM (S2)',
            'nama_perusahaan' => 'PT Tidak Sah',
            'jabatan' => 'CTO',
            'answers' => [1 => 'Jakarta', 2 => 'UGM', 3 => 'Job portal'],
        ]);

        $this->assertDatabaseHas('tracer_study_responses', [
            'alumni_id' => $alumni->id,
            'status_pekerjaan' => 'Mencari Kerja',
            'melanjutkan_pendidikan' => true,
            'pendidikan_institusi' => 'UGM (S2)',
            'nama_perusahaan' => null,
            'jabatan' => null,
            'answers' => json_encode([2 => 'UGM', 3 => 'Job portal']),
        ]);

        $this->assertDatabaseHas('alumni_profiles', [
            'id' => $alumni->id,
            'employment_status' => 'Mencari Kerja',
            'melanjutkan_pendidikan' => true,
            'pendidikan_institusi' => 'UGM (S2)',
            'company_name' => null,
            'position' => null,
        ]);
    }

    public function test_response_not_stored_when_form_inactive(): void
    {
        $alumni = $this->alumniProfile();
        $form = $this->activeForm();
        $form->update(['status' => 'closed']);

        $this->actingAs($alumni->user)
            ->post(route('alumni.kuesioner.store', $form->id), ['status_pekerjaan' => 'Bekerja']);

        $this->assertDatabaseMissing('tracer_study_responses', ['alumni_id' => $alumni->id]);
    }

    public function test_profile_update_syncs_education_and_company_to_response(): void
    {
        $alumni = $this->alumniProfile();
        $form = $this->activeForm();

        $this->actingAs($alumni->user)->post(route('alumni.kuesioner.store', $form->id), [
            'status_pekerjaan' => 'Mencari Kerja',
            'melanjutkan_pendidikan' => false,
            'answers' => [3 => 'Job portal'],
        ]);

        $this->actingAs($alumni->user)->post(route('alumni.profile.update'), [
            'nim' => $alumni->nim,
            'major' => $alumni->major,
            'graduation_year' => (int) date('Y'),
            'jenjang_pendidikan' => $alumni->jenjang_pendidikan,
            'tanggal_lahir' => '2004-05-14',
            'address' => 'Jakarta',
            'experience' => 1,
            'skills' => [],
            'employment_status' => 'Bekerja',
            'melanjutkan_pendidikan' => true,
            'pendidikan_institusi' => 'ITB (S2)',
            'company_name' => 'PT Maju',
            'position' => 'Analyst',
        ]);

        $this->assertDatabaseHas('alumni_profiles', [
            'id' => $alumni->id,
            'employment_status' => 'Bekerja',
            'melanjutkan_pendidikan' => true,
            'pendidikan_institusi' => 'ITB (S2)',
        ]);

        $this->assertDatabaseHas('tracer_study_responses', [
            'alumni_id' => $alumni->id,
            'status_pekerjaan' => 'Bekerja',
            'melanjutkan_pendidikan' => true,
            'pendidikan_institusi' => 'ITB (S2)',
            'nama_perusahaan' => 'PT Maju',
            'jabatan' => 'Analyst',
        ]);
    }
}
