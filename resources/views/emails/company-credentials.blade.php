<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Akses Sistem SITAMI</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
            <tr><td style="padding:32px 36px 8px;">
                <div style="font-size:13px;font-weight:800;color:#1a3560;letter-spacing:0.06em;margin-bottom:20px;">SITAMI</div>
                <h1 style="font-size:20px;font-weight:800;color:#0f1f3d;margin:0 0 6px;letter-spacing:-0.02em;">
                    Selamat Datang, {{ $companyName }}
                </h1>
                <p style="font-size:14px;color:#64748b;margin:0 0 20px;line-height:1.6;">
                    Perusahaan Anda telah terdaftar sebagai mitra resmi <strong>SITAMI</strong> — Sistem Informasi Tracer Study & Alumni. Silakan gunakan kredensial di bawah untuk mengakses portal perusahaan.
                </p>
            </td></tr>
            <tr><td style="padding:0 36px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;border:1px solid #e8edf5;">
                    <tr><td style="padding:18px 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="font-size:12px;font-weight:600;color:#64748b;padding:4px 0;">Link Login</td>
                                <td style="text-align:right;padding:4px 0;">
                                    <a href="{{ $loginUrl }}" style="color:#f97316;font-size:13px;font-weight:700;text-decoration:none;">{{ $loginUrl }}</a>
                                </td>
                            </tr>
                            <tr><td colspan="2" style="height:1px;background:#e8edf5;"></td></tr>
                            <tr>
                                <td style="font-size:12px;font-weight:600;color:#64748b;padding:4px 0;">Email</td>
                                <td style="text-align:right;font-size:13px;font-weight:600;color:#0f1f3d;padding:4px 0;">{{ $email }}</td>
                            </tr>
                            <tr><td colspan="2" style="height:1px;background:#e8edf5;"></td></tr>
                            <tr>
                                <td style="font-size:12px;font-weight:600;color:#64748b;padding:4px 0;">Password Sementara</td>
                                <td style="text-align:right;font-size:13px;font-weight:700;color:#0f1f3d;padding:4px 0;font-family:monospace;">{{ $password }}</td>
                            </tr>
                        </table>
                    </td></tr>
                </table>
            </td></tr>
            <tr><td style="padding:20px 36px 32px;">
                <p style="font-size:13px;color:#94a3b8;margin:0 0 6px;line-height:1.5;">
                    Demi keamanan, segera ganti password setelah login pertama Anda.
                </p>
                <p style="font-size:13px;color:#94a3b8;margin:0;line-height:1.5;">
                    Hormat kami,<br><strong style="color:#1a3560;">Tim SITAMI</strong>
                </p>
            </td></tr>
        </table>
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr><td style="padding:16px 16px 0;text-align:center;font-size:11px;color:#c8d6e3;">
                &copy; {{ date('Y') }} SITAMI. Sistem Informasi Tracer Study & Alumni.
            </td></tr>
        </table>
    </td></tr></table>
</body>
</html>
