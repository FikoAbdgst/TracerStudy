<?php
// database/seeders/DatabaseSeeder.php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions bawaan Spatie
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Buat 4 Role utama sesuai Use Case
        $roles = ['Super Admin', 'Admin Kampus', 'Admin PT', 'Alumni'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        // Buat User Super Admin
        $superAdmin = User::factory()->create([
            'name' => 'Super Admin SITAMI',
            'email' => 'superadmin@sitami.com',
            'password' => bcrypt('password123') // Sesuaikan password
        ]);
        // Assign role ke user tersebut
        $superAdmin->assignRole('Super Admin');

        // Buat User Admin Kampus
        $adminKampus = User::factory()->create([
            'name' => 'Admin Kampus SITAMI',
            'email' => 'adminkampus@sitami.com',
            'password' => bcrypt('password123') // Sesuaikan password
        ]);
        $adminKampus->assignRole('Admin Kampus');

        // Buat User Admin PT
        $adminPT = User::factory()->create([
            'name' => 'Admin PT SITAMI',
            'email' => 'perusahaan@sitami.com',
            'password' => bcrypt('password123') // Sesuaikan password
        ]);
        $adminPT->assignRole('Admin PT');

        // Buat User Alumni
        $alumni = User::factory()->create([
            'name' => 'Alumni SITAMI',
            'email' => 'alumni@sitami.com',
            'password' => bcrypt('password123') // Sesuaikan password
        ]);
        $alumni->assignRole('Alumni');
    }
}
