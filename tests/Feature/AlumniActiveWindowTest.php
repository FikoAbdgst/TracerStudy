<?php

namespace Tests\Feature;

use App\Models\AlumniProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AlumniActiveWindowTest extends TestCase
{
    use RefreshDatabase;

    private function alumni(int $yearsSinceGraduation): User
    {
        $user = User::factory()->create();
        $user->assignRole(Role::firstOrCreate(['name' => 'Alumni']));

        AlumniProfile::create([
            'user_id' => $user->id,
            'nim' => '23010099',
            'major' => 'Manajemen Informatika',
            'jenjang_pendidikan' => 'D3',
            'graduation_year' => (int) date('Y') - $yearsSinceGraduation,
        ]);

        return $user;
    }

    public function test_alumni_within_five_years_can_access_dashboard(): void
    {
        $user = $this->alumni(yearsSinceGraduation: 2);

        $this->actingAs($user)->get(route('alumni.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Alumni/Dashboard'));
    }

    public function test_alumni_graduated_more_than_five_years_ago_is_locked_out(): void
    {
        $user = $this->alumni(yearsSinceGraduation: 6);

        $this->actingAs($user)->get(route('alumni.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Alumni/AccountLocked'));
    }

    public function test_expired_alumni_is_blocked_from_forum(): void
    {
        $user = $this->alumni(yearsSinceGraduation: 7);

        $this->actingAs($user)->get(route('alumni.forum.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Alumni/AccountLocked'));
    }

    public function test_admin_campus_is_not_affected(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(Role::firstOrCreate(['name' => 'Admin Kampus']));

        $this->actingAs($admin)->get(route('adminkampus.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('AdminKampus/Dashboard'));
    }
}