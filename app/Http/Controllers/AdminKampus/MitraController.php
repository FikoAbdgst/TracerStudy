<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Mail\CompanyCredentialsMail;
use App\Models\Company;
use App\Models\MouDocument;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MitraController extends Controller
{
    public function index()
    {
        $companies = Company::with(['user', 'mouDocuments' => function ($q) {
            $q->latest();
        }])->latest()->get();

        return Inertia::render('AdminKampus/Mitra/Index', [
            'companies' => $companies,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'hr_email' => 'required|string|email|max:255|unique:users,email',
            'mou_document' => 'required|file|mimes:pdf|max:5120',
        ]);

        $password = Str::random(8);

        $user = new User;
        $user->name = $validated['company_name'];
        $user->email = $validated['hr_email'];
        $user->password = Hash::make($password);
        $user->role = 'Admin PT';
        $user->save();
        $user->assignRole('Admin PT');

        $company = Company::create([
            'user_id' => $user->id,
            'name' => $validated['company_name'],
            'verification_status' => 'verified',
            'verified_at' => now(),
        ]);

        $path = $request->file('mou_document')->store('mou_documents', 'local');

        MouDocument::create([
            'company_id' => $company->id,
            'file_url' => $path,
            'status' => 'active',
            'signed_at' => now(),
            'expires_at' => now()->addYear(),
        ]);

        Mail::to($validated['hr_email'])
            ->send(new CompanyCredentialsMail(
                companyName: $validated['company_name'],
                email: $validated['hr_email'],
                password: $password,
            ));

        return back()->with('message', 'Mitra berhasil ditambahkan. Email login telah dikirim.');
    }

    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'hr_email' => 'required|string|email|max:255|unique:users,email,' . $company->user_id,
            'mou_document' => 'nullable|file|mimes:pdf|max:5120',
        ]);

        $company->update(['name' => $validated['company_name']]);

        $user = $company->user;
        $user->name = $validated['company_name'];
        $user->email = $validated['hr_email'];
        $user->save();

        if ($request->hasFile('mou_document')) {
            $path = $request->file('mou_document')->store('mou_documents', 'local');
            MouDocument::create([
                'company_id' => $company->id,
                'file_url' => $path,
                'status' => 'active',
                'signed_at' => now(),
                'expires_at' => now()->addYear(),
            ]);
        }

        return back()->with('message', 'Data mitra berhasil diperbarui.');
    }

    public function destroy(Company $company)
    {
        $user = $company->user;
        $company->delete();
        $user->delete();

        return back()->with('message', 'Mitra berhasil dihapus.');
    }

    public function terminate(MouDocument $mou)
    {
        $mou->update(['status' => 'terminated']);
        $mou->company->update(['verification_status' => 'rejected']);

        return back()->with('message', 'Kerja sama (MoU) berhasil diakhiri. Akun perusahaan telah dinonaktifkan.');
    }
}
