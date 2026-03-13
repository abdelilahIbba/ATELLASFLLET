<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Http\UploadedFile;

/**
 * OcrService — backend OCR extraction via Google Cloud Vision REST API.
 *
 * Configuration (config/services.php  →  .env):
 *   OCR_DRIVER=google_vision          (default)
 *   GOOGLE_CLOUD_VISION_KEY=<key>
 *
 * Returns an array:
 *   [
 *     'first_name'      => string|null,
 *     'last_name'       => string|null,
 *     'document_number' => string|null,   // CIN or driver's-licence number
 *     'raw_text'        => string|null,   // full OCR dump (for debugging)
 *   ]
 *
 * Throws \RuntimeException when the API key is absent or the HTTP call fails.
 * Returns null values for unrecognised fields — not an error condition.
 */
class OcrService
{
    private Client $http;

    public function __construct()
    {
        $this->http = new Client(['timeout' => 30]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Extract identity fields from an uploaded document image or PDF.
     *
     * @throws \RuntimeException  If the API key is missing or the call fails.
     */
    public function extractFromDocument(UploadedFile $file): array
    {
        $driver = config('services.ocr.driver', 'google_vision');

        if ($driver !== 'google_vision') {
            return $this->emptyResult();
        }

        $apiKey = config('services.ocr.google_vision_key');

        if (empty($apiKey)) {
            throw new \RuntimeException(
                'Le service OCR n\'est pas configuré. ' .
                'Ajoutez GOOGLE_CLOUD_VISION_KEY à votre fichier .env.'
            );
        }

        return $this->callGoogleVision($file, $apiKey);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function callGoogleVision(UploadedFile $file, string $apiKey): array
    {
        $content = base64_encode((string) file_get_contents($file->getRealPath()));

        try {
            $response = $this->http->post(
                "https://vision.googleapis.com/v1/images:annotate?key={$apiKey}",
                [
                    'json' => [
                        'requests' => [[
                            'image'    => ['content' => $content],
                            'features' => [['type' => 'DOCUMENT_TEXT_DETECTION']],
                        ]],
                    ],
                ]
            );

            $body    = json_decode((string) $response->getBody(), true);
            $rawText = $body['responses'][0]['fullTextAnnotation']['text'] ?? '';

            return $this->parseDocumentText($rawText);

        } catch (RequestException $e) {
            throw new \RuntimeException(
                'Erreur lors de la communication avec le service OCR: ' . $e->getMessage()
            );
        }
    }

    /**
     * Parse raw OCR text to extract identity fields.
     * Handles Moroccan CIN and driver's-licence formats (French/Arabic labels).
     */
    private function parseDocumentText(string $text): array
    {
        $result = $this->emptyResult();
        $result['raw_text'] = $text;

        if (empty(trim($text))) {
            return $result;
        }

        $upper = mb_strtoupper(trim($text), 'UTF-8');
        $lines = preg_split('/\r?\n/', $upper);

        // ── Last name (NOM / SURNAME / النسب) ────────────────────────────────
        foreach ($lines as $idx => $line) {
            $line = trim($line);

            // "NOM: Dupont"  or  "NOM DUPONT"  on the same line
            if (preg_match('/^(?:NOM|SURNAME|LAST\s*NAME)\s*[:\-]?\s*(.+)$/u', $line, $m)) {
                $candidate = $this->cleanName($m[1]);
                if (!empty($candidate)) {
                    $result['last_name'] = $candidate;
                    break;
                }
            }

            // "NOM" alone — value is on the next line
            if (in_array($line, ['NOM', 'SURNAME', 'LAST NAME'], true) && isset($lines[$idx + 1])) {
                $candidate = $this->cleanName($lines[$idx + 1]);
                if (!empty($candidate)) {
                    $result['last_name'] = $candidate;
                    break;
                }
            }
        }

        // ── First name (PRENOM / GIVEN NAME / الاسم الشخصي) ─────────────────
        foreach ($lines as $idx => $line) {
            $line = trim($line);

            if (preg_match('/^(?:PRÉNOM|PRENOM|GIVEN\s*NAME|FIRST\s*NAME)\s*[:\-]?\s*(.+)$/u', $line, $m)) {
                $candidate = $this->cleanName($m[1]);
                if (!empty($candidate)) {
                    $result['first_name'] = $candidate;
                    break;
                }
            }

            if (in_array($line, ['PRÉNOM', 'PRENOM', 'GIVEN NAME', 'FIRST NAME'], true) && isset($lines[$idx + 1])) {
                $candidate = $this->cleanName($lines[$idx + 1]);
                if (!empty($candidate)) {
                    $result['first_name'] = $candidate;
                    break;
                }
            }
        }

        // ── Document number ──────────────────────────────────────────────────
        // Moroccan CIN: 1–2 uppercase letters + 5–9 digits  (e.g. AB123456, B234567)
        if (preg_match('/\b([A-Z]{1,2}\d{5,9})\b/', $upper, $m)) {
            $result['document_number'] = $m[1];
        }

        // Driver's licence fallback: alpha prefix (0–3 chars) optionally hyphenated + 6–10 digits
        if ($result['document_number'] === null
            && preg_match('/\b([A-Z]{0,3}-?\d{6,10})\b/', $upper, $m)
        ) {
            $result['document_number'] = $m[1];
        }

        return $result;
    }

    /** Strip non-letter characters and return uppercase trimmed name. */
    private function cleanName(string $raw): string
    {
        // Allow Unicode letters, spaces and hyphens
        $clean = preg_replace('/[^\p{L}\s\-]/u', '', $raw);
        return mb_strtoupper(trim((string) $clean), 'UTF-8');
    }

    private function emptyResult(): array
    {
        return [
            'first_name'      => null,
            'last_name'       => null,
            'document_number' => null,
            'raw_text'        => null,
        ];
    }
}
