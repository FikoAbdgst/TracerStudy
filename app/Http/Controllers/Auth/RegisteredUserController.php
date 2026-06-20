<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'company_name' => 'nullable|string|max:255',
        ]);

        $user = new User();
        $user->name = $request->name;
        $user->email = $request->email;
        $user->password = Hash::make($request->password);

        if ($request->filled('company_name')) {
            $user->role = 'Admin PT';
        } else {
            $user->role = 'Alumni';
        }

        $user->save();

        if ($request->filled('company_name')) {
            $user->assignRole('Admin PT');

            Company::create([
                'user_id' => $user->id,
                'name' => $request->company_name,
                'verification_status' => 'pending',
            ]);
        } else {
            $user->assignRole('Alumni');
        }

        event(new Registered($user));

        Auth::login($user);

        if ($request->filled('company_name')) {
            return redirect(route('perusahaan.dashboard'));
        }

        return redirect(route('alumni.dashboard'));
    }
}
