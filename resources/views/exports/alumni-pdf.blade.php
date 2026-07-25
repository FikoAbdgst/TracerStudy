<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <title>Data Alumni - {{ now()->format('d F Y') }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Times New Roman', 'DejaVu Serif', serif;
            font-size: 10pt;
            color: #1e293b;
            line-height: 1.5;
            background: #fff;
        }

        .wrapper { margin: 0 20px; }

        .cover {
            text-align: center;
            padding: 14px 0 14px;
            margin-bottom: 14px;
            border-bottom: 3px double #0f1f3d;
        }

        .cover-institution {
            font-size: 11pt;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #0f1f3d;
            margin-bottom: 2px;
        }

        .cover-sub {
            font-size: 8.5pt;
            color: #64748b;
            letter-spacing: 1px;
            margin-bottom: 14px;
        }

        .cover-divider {
            width: 60px;
            height: 2px;
            background: #0f1f3d;
            margin: 0 auto 12px;
        }

        .cover-title {
            font-size: 16pt;
            font-weight: bold;
            color: #0f1f3d;
            margin-bottom: 4px;
            line-height: 1.3;
        }

        .cover-meta {
            font-size: 8.5pt;
            color: #94a3b8;
            margin-top: 8px;
        }

        .filter-info {
            font-size: 8.5pt;
            color: #475569;
            margin-bottom: 10px;
            padding: 6px 10px;
            background: #f1f5f9;
            border-left: 3px solid #0f1f3d;
        }

        .filter-info strong {
            color: #0f1f3d;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
            font-size: 8.5pt;
        }

        .data-table th {
            background: #0f1f3d;
            color: #fff;
            padding: 6px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 7.5pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .data-table td {
            padding: 5px 8px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
        }

        .data-table tr:nth-child(even) td {
            background: #f8fafc;
        }

        .data-table .num-col {
            width: 30px;
            text-align: center;
        }

        .data-table .nim-col {
            width: 80px;
        }

        .badge {
            display: inline-block;
            padding: 1px 6px;
            font-size: 7pt;
            font-weight: bold;
        }

        .badge-bekerja { background: #dbeafe; color: #1e40af; }
        .badge-mencari { background: #ffedd5; color: #c2410c; }
        .badge-wiraswasta { background: #dcfce7; color: #15803d; }
        .badge-lanjutkan { background: #f5f3ff; color: #7c3aed; }
        .badge-tidak { background: #f1f5f9; color: #475569; }

        .summary-line {
            font-size: 8.5pt;
            color: #475569;
            margin-bottom: 10px;
        }

        .summary-line strong {
            color: #0f1f3d;
        }

        .empty-state {
            text-align: center;
            padding: 30px 0;
            color: #94a3b8;
            font-style: italic;
            font-size: 9.5pt;
        }

        .doc-footer {
            margin-top: 20px;
            padding-top: 8px;
            border-top: 1px solid #e2e8f0;
            font-size: 7.5pt;
            color: #94a3b8;
        }

        .doc-footer .left { float: left; }
        .doc-footer .right { float: right; }
    </style>
</head>

<body>
<div class="wrapper">

    <div class="cover">
        <div class="cover-institution">Sistem Informasi Tracer Study &amp; Alumni</div>
        <div class="cover-sub">SITAMI &mdash; Data Alumni</div>
        <div class="cover-divider"></div>
        <div class="cover-title">Daftar Alumni</div>
        <div class="cover-meta">
            Dicetak pada {{ now()->format('d F Y') }}, pukul {{ now()->format('H:i') }} WIB
        </div>
    </div>

    @if (count($filters) > 0)
        <div class="filter-info">
            <strong>Filter:</strong>
            {{ implode(' | ', $filters) }}
        </div>
    @endif

    <div class="filter-info">
        <strong>Total Data:</strong> {{ $total }} Alumni
    </div>

    @if ($total > 0)
    <table class="data-table">
        <thead>
            <tr>
                <th class="num-col">No</th>
                <th class="nim-col">NIM</th>
                <th>Nama Lengkap</th>
                <th>Program Studi</th>
                <th>Tahun Lulus</th>
                <th>Status Kepegawaian</th>
                <th>Total Lamaran</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($alumnis as $i => $al)
                @php
                    $statusClass = match ($al->employment_status ?? null) {
                        'Bekerja' => 'badge-bekerja',
                        'Mencari Kerja' => 'badge-mencari',
                        'Wiraswasta' => 'badge-wiraswasta',
                        'Lanjutkan Pendidikan' => 'badge-lanjutkan',
                        default => 'badge-tidak',
                    };
                @endphp
                <tr>
                    <td class="num-col">{{ $i + 1 }}</td>
                    <td class="nim-col">{{ $al->nim ?? '-' }}</td>
                    <td>{{ $al->user->name ?? '-' }}</td>
                    <td>{{ $al->major ?? '-' }}</td>
                    <td>{{ $al->graduation_year ?? '-' }}</td>
                    <td>
                        <span class="badge {{ $statusClass }}">
                            {{ $al->employment_status ?? '-' }}
                        </span>
                    </td>
                    <td style="text-align: center;">{{ $al->total_applications }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    @else
        <div class="empty-state">Tidak ada data alumni yang cocok dengan filter yang dipilih.</div>
    @endif

    <div class="doc-footer">
        <span class="left">Dokumen ini digenerate secara otomatis oleh Sistem Informasi Tracer Study &amp; Alumni (SITAMI)</span>
        <span class="right">{{ now()->format('d F Y') }}</span>
    </div>

</div>
</body>

</html>
