<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <title>Laporan Tracer Study - {{ $form->title }}</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Times New Roman', 'DejaVu Serif', serif;
            font-size: 10pt;
            color: #1e293b;
            line-height: 1.5;
            background: #fff;
        }

        .wrapper { margin: 0 20px; }

        /* ── Cover / Header ──────────────────────────────────────── */
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

        .cover-subtitle {
            font-size: 10.5pt;
            color: #475569;
            font-style: italic;
            margin-bottom: 3px;
        }

        .cover-meta {
            font-size: 8.5pt;
            color: #94a3b8;
            margin-top: 8px;
        }

        /* ── Section Headings ────────────────────────────────────── */
        .section-heading {
            font-size: 11pt;
            font-weight: bold;
            color: #0f1f3d;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding-bottom: 4px;
            border-bottom: 1.5px solid #0f1f3d;
            margin: 14px 0 8px;
        }

        /* ── Summary Table (replaces flex summary-row) ───────────── */
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }

        .summary-table td {
            padding: 8px 10px;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            vertical-align: top;
        }

        .summary-label {
            font-size: 7.5pt;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #64748b;
            font-weight: bold;
            margin-bottom: 2px;
        }

        .summary-value {
            font-size: 16pt;
            font-weight: bold;
            color: #0f1f3d;
            line-height: 1.1;
        }

        .summary-sub {
            font-size: 7.5pt;
            color: #94a3b8;
            margin-top: 2px;
        }

        /* ── Prose ───────────────────────────────────────────────── */
        .prose {
            font-size: 9.5pt;
            color: #334155;
            line-height: 1.6;
            margin-bottom: 10px;
            text-align: justify;
        }

        .prose strong {
            color: #0f1f3d;
        }

        /* ── Respondent Card ─────────────────────────────────────── */
        .resp-card {
            border: 1px solid #dbe2ea;
            margin-bottom: 10px;
            page-break-inside: avoid;
        }

        .resp-header {
            background: #0f1f3d;
            color: #fff;
            padding: 6px 10px;
            font-size: 9pt;
        }

        .resp-header .resp-num {
            display: inline-block;
            width: 18px;
            height: 18px;
            line-height: 18px;
            text-align: center;
            font-size: 8pt;
            font-weight: bold;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 50%;
            margin-right: 6px;
        }

        .resp-header .resp-name {
            font-weight: bold;
            font-size: 10pt;
        }

        .resp-header .resp-meta {
            font-weight: normal;
            font-size: 8pt;
            color: #cbd5e1;
            margin-left: 4px;
        }

        .resp-header .resp-date {
            float: right;
            font-size: 7.5pt;
            color: #cbd5e1;
            line-height: 18px;
        }

        /* ── Field Grid (table-based, DomPDF safe) ───────────────── */
        .field-table {
            width: 100%;
            border-collapse: collapse;
        }

        .field-table td {
            padding: 5px 8px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
            width: 33.33%;
        }

        .field-table tr:nth-child(odd) td {
            background: #f8fafc;
        }

        .field-label {
            font-size: 6.8pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #94a3b8;
            font-weight: bold;
            margin-bottom: 1px;
        }

        .field-value {
            font-size: 8.5pt;
            color: #1e293b;
        }

        .field-value.empty {
            color: #cbd5e1;
            font-style: italic;
        }

        /* ── Status Badges ───────────────────────────────────────── */
        .badge {
            display: inline-block;
            padding: 1px 7px;
            font-size: 7.5pt;
            font-weight: bold;
        }

        .badge-bekerja {
            background: #dbeafe;
            color: #1e40af;
        }

        .badge-mencari {
            background: #ffedd5;
            color: #c2410c;
        }

        .badge-wiraswasta {
            background: #dcfce7;
            color: #15803d;
        }

        .badge-lainnya {
            background: #f1f5f9;
            color: #475569;
        }

        .empty-state {
            text-align: center;
            padding: 30px 0;
            color: #94a3b8;
            font-style: italic;
            font-size: 9.5pt;
        }

        /* ── Footer ──────────────────────────────────────────────── */
        .doc-footer {
            margin-top: 20px;
            padding-top: 8px;
            border-top: 1px solid #e2e8f0;
            font-size: 7.5pt;
            color: #94a3b8;
        }

        .doc-footer .left {
            float: left;
        }

        .doc-footer .right {
            float: right;
        }
    </style>
</head>

<body>

<div class="wrapper">

    {{-- ════════════════════════ HEADER ════════════════════════ --}}
    <div class="cover">
        <div class="cover-institution">Sistem Informasi Tracer Study &amp; Alumni</div>
        <div class="cover-sub">SITAMI &mdash; Laporan Hasil Pengisian Kuesioner</div>
        <div class="cover-divider"></div>
        <div class="cover-title">{{ $form->title }}</div>
        @if ($form->description)
            <div class="cover-subtitle">{{ $form->description }}</div>
        @endif
        <div class="cover-meta">
            Dicetak pada {{ now()->format('d F Y') }}, pukul {{ now()->format('H:i') }} WIB &mdash; Sebanyak
            {{ $responses->count() }} Respons Terkumpul
        </div>
    </div>

    {{-- ════════════════════════ RINGKASAN ════════════════════════ --}}
    @php
        $total = $responses->count();
        $bekerja = $responses->where('status_pekerjaan', 'Bekerja')->count();
        $mencari = $responses->where('status_pekerjaan', 'Mencari Kerja')->count();
        $wira = $responses->where('status_pekerjaan', 'Wiraswasta')->count();
        $lainnya = $total - $bekerja - $mencari - $wira;
        $pctBekerja = $total > 0 ? round(($bekerja / $total) * 100, 1) : 0;
        $pctMencari = $total > 0 ? round(($mencari / $total) * 100, 1) : 0;
        $pctWira = $total > 0 ? round(($wira / $total) * 100, 1) : 0;
    @endphp



    <table class="summary-table">
        <tr>
            <td style="width: 25%;">
                <div class="summary-label">Total Responden</div>
                <div class="summary-value">{{ $total }}</div>
                <div class="summary-sub">Alumni yang telah mengisi</div>
            </td>
            <td style="width: 25%;">
                <div class="summary-label">Bekerja</div>
                <div class="summary-value">{{ $bekerja }}</div>
                <div class="summary-sub">{{ $pctBekerja }}% dari total responden</div>
            </td>
            <td style="width: 25%;">
                <div class="summary-label">Mencari Kerja</div>
                <div class="summary-value">{{ $mencari }}</div>
                <div class="summary-sub">{{ $pctMencari }}% dari total responden</div>
            </td>
            <td style="width: 25%;">
                <div class="summary-label">Wiraswasta</div>
                <div class="summary-value">{{ $wira }}</div>
                <div class="summary-sub">{{ $pctWira }}% dari total responden</div>
            </td>
        </tr>
    </table>

    {{-- ════════════════════════ DATA RESPONDEN ════════════════════════ --}}

    @forelse($responses as $i => $resp)
        @php
            $answers = is_string($resp->answers) ? json_decode($resp->answers, true) : $resp->answers ?? [];
            $statusClass = match ($resp->status_pekerjaan ?? null) {
                'Bekerja' => 'badge-bekerja',
                'Mencari Kerja' => 'badge-mencari',
                'Wiraswasta' => 'badge-wiraswasta',
                default => 'badge-lainnya',
            };
        @endphp
        <div class="resp-card">
            <div class="resp-header">
                <span class="resp-num">{{ $i + 1 }}</span>
                <span class="resp-name">
                    {{ $resp->alumni->user->name ?? '-' }}
                    <span class="resp-meta">{{ $resp->alumni->nim ?? '-' }} &middot;
                        {{ $resp->alumni->major ?? '-' }}</span>
                </span>
                <span class="badge {{ $statusClass }}">{{ $resp->status_pekerjaan ?? '-' }}</span>
                <span class="resp-date">{{ $resp->created_at ? $resp->created_at->format('d/m/Y') : '-' }}</span>
            </div>
            @php
                $fields = [];
                $fields[] = ['label' => 'Perusahaan / Instansi', 'value' => $resp->nama_perusahaan ?? ''];
                $fields[] = ['label' => 'Jabatan / Posisi', 'value' => $resp->jabatan ?? ''];
                foreach ($questions as $q) {
                    $qId = $q['id'] ?? null;
                    $answer = $answers[$qId] ?? ($answers[$q['question']] ?? null);
                    $fields[] = [
                        'label' => $q['question'] ?? ($q['pertanyaan'] ?? 'Pertanyaan'),
                        'value' => $answer ?? '',
                    ];
                }
                $rows = array_chunk($fields, 3);
            @endphp
            @foreach ($rows as $row)
                <table class="field-table">
                    <tr>
                        @foreach ($row as $f)
                            <td>
                                <div class="field-label">{{ $f['label'] }}</div>
                                <div class="field-value{{ empty($f['value']) ? ' empty' : '' }}">
                                    {{ $f['value'] ?: 'Belum diisi' }}</div>
                            </td>
                        @endforeach
                        @for ($c = count($row); $c < 3; $c++)
                            <td>&nbsp;</td>
                        @endfor
                    </tr>
                </table>
            @endforeach
        </div>
    @empty
        <div class="empty-state">Belum ada data respons yang tercatat untuk kuesioner ini.</div>
    @endforelse

    {{-- ════════════════════════ FOOTER ════════════════════════ --}}
    <div class="doc-footer">
        <span class="left">Dokumen ini digenerate secara otomatis oleh Sistem Informasi Tracer Study &amp; Alumni
            (SITAMI)</span>
        <span class="right">{{ now()->format('d F Y') }}</span>
    </div>

</div>

</body>

</html>
