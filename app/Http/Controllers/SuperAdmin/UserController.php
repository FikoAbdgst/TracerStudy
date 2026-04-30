<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    // Menampilkan daftar pengguna (Read)
    public function index(Request $request)
    {
        $users = User::with('roles')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        $roles = Role::all();

        return Inertia::render('SuperAdmin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search'])
        ]);
    }

    // Menyimpan pengguna baru (Create)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|exists:roles,name'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['role']);

        return back()->with('message', 'Pengguna berhasil ditambahkan.');
    }

    // Memperbarui data pengguna & hak akses (Update)
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|exists:roles,name'
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        // Sinkronisasi ulang role
        $user->syncRoles([$validated['role']]);

        return back()->with('message', 'Data pengguna berhasil diperbarui.');
    }

    // Menghapus pengguna (Delete)
    public function destroy(User $user)
    {
        if ($user->hasRole('Super Admin') && User::role('Super Admin')->count() === 1) {
            return back()->with('error', 'Tidak dapat menghapus satu-satunya Super Admin.');
        }

        $user->delete();

        return back()->with('message', 'Pengguna berhasil dihapus.');
    }
}
