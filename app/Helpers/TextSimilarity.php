<?php

namespace App\Helpers;

class TextSimilarity
{
    /**
     * Menghitung Cosine Similarity menggunakan TF-IDF
     *
     * @param string $text1 (Misal: Deskripsi Lowongan)
     * @param string $text2 (Misal: Profil Kandidat)
     * @return float Skor similarity (0.0 sampai 1.0)
     */
    public static function calculate(string $text1, string $text2): float
    {
        // 1. Membersihkan teks (Huruf kecil, hapus karakter selain huruf/angka)
        $text1 = self::cleanText($text1);
        $text2 = self::cleanText($text2);

        // 2. Tokenisasi (Memecah teks menjadi array kata)
        $words1 = explode(' ', $text1);
        $words2 = explode(' ', $text2);

        // 3. Gabungkan semua kata unik dari kedua teks (Corpus)
        $allWords = array_unique(array_merge($words1, $words2));

        // 4. Hitung Term Frequency (TF) untuk masing-masing teks
        $tf1 = self::getTermFrequency($words1, $allWords);
        $tf2 = self::getTermFrequency($words2, $allWords);

        // 5. Hitung Inverse Document Frequency (IDF)
        // Karena kita hanya membandingkan 2 dokumen saat ini, IDF menjadi lebih sederhana.
        $idf = self::getInverseDocumentFrequency([$words1, $words2], $allWords);

        // 6. Hitung Vektor TF-IDF
        $vector1 = self::calculateTfIdfVector($tf1, $idf);
        $vector2 = self::calculateTfIdfVector($tf2, $idf);

        // 7. Hitung Cosine Similarity
        return self::cosineSimilarity($vector1, $vector2);
    }

    private static function cleanText(string $text): string
    {
        // Ubah ke huruf kecil
        $text = strtolower($text);
        // Hapus karakter selain huruf dan spasi
        $text = preg_replace('/[^a-z\s]/', '', $text);
        // Hapus spasi berlebih
        return trim(preg_replace('/\s+/', ' ', $text));
    }

    private static function getTermFrequency(array $words, array $allWords): array
    {
        $tf = [];
        $totalWords = count($words);

        if ($totalWords === 0) {
            return array_fill_keys($allWords, 0);
        }

        $wordCounts = array_count_values($words);

        foreach ($allWords as $word) {
            $tf[$word] = isset($wordCounts[$word]) ? ($wordCounts[$word] / $totalWords) : 0;
        }

        return $tf;
    }

    private static function getInverseDocumentFrequency(array $documents, array $allWords): array
    {
        $idf = [];
        $totalDocuments = count($documents);

        foreach ($allWords as $word) {
            $docCount = 0;
            foreach ($documents as $docWords) {
                if (in_array($word, $docWords)) {
                    $docCount++;
                }
            }
            // Formula IDF: log(Total Dokumen / Jumlah Dokumen yang mengandung kata tersebut)
            // Ditambah 1 agar tidak error division by zero atau nilai negatif.
            $idf[$word] = log($totalDocuments / ($docCount > 0 ? $docCount : 1)) + 1;
        }

        return $idf;
    }

    private static function calculateTfIdfVector(array $tf, array $idf): array
    {
        $vector = [];
        foreach ($tf as $word => $value) {
            $vector[$word] = $value * $idf[$word];
        }
        return $vector;
    }

    private static function cosineSimilarity(array $vec1, array $vec2): float
    {
        $dotProduct = 0;
        $magnitude1 = 0;
        $magnitude2 = 0;

        foreach ($vec1 as $word => $value1) {
            $value2 = $vec2[$word] ?? 0;
            $dotProduct += ($value1 * $value2);
            $magnitude1 += ($value1 * $value1);
            $magnitude2 += ($value2 * $value2);
        }

        $magnitude1 = sqrt($magnitude1);
        $magnitude2 = sqrt($magnitude2);

        if ($magnitude1 * $magnitude2 == 0) {
            return 0; // Hindari pembagian dengan nol
        }

        return $dotProduct / ($magnitude1 * $magnitude2);
    }
}
