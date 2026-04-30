<?php
/**
 * 営業リストツール用 Google Places API (Text Search) プロキシ。
 *
 * 役割:
 *   検索キーワードを受け取り、Google Places API (New) の Text Search を
 *   呼んで結果を JSON で返す。API キーはサーバー側 .env から読み、
 *   ブラウザに露出しない。
 *
 * リクエスト:
 *   GET ?query={キーワード}&pageSize={1..20}&pageToken={...}
 *   GET ?query={キーワード}&total={1..60}        ← 自動ページング、最大60件
 *
 * レスポンス（成功）:
 *   {
 *     "places": [
 *       {
 *         "name": "...",                 // 施設名 (displayName.text)
 *         "address": "...",
 *         "phone": "...",
 *         "websiteUrl": "...",
 *         "gmapUrl": "https://maps.google.com/...",
 *         "types": ["..."],
 *         "lat": 35.x, "lng": 139.x
 *       }
 *     ],
 *     "nextPageToken": "..."  // ある場合のみ
 *   }
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

// ---- Load API key from Laravel .env ----
function _loadEnvKey($path, $name) {
    if (!is_readable($path)) return '';
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (preg_match('/^\s*' . preg_quote($name, '/') . '\s*=\s*"?([^"\r\n]*)"?\s*$/', $line, $m)) {
            return trim($m[1]);
        }
    }
    return '';
}

$apiKey = _loadEnvKey(__DIR__ . '/../../.env', 'GOOGLE_PLACES_API_KEY');
if ($apiKey === '') {
    http_response_code(500);
    echo json_encode(['error' => 'API key not configured (.env GOOGLE_PLACES_API_KEY)'], JSON_UNESCAPED_UNICODE);
    exit;
}

// ---- Validate input ----
$query = isset($_GET['query']) ? trim((string)$_GET['query']) : '';
if ($query === '') {
    http_response_code(400);
    echo json_encode(['error' => 'query is required'], JSON_UNESCAPED_UNICODE);
    exit;
}
if (mb_strlen($query) > 200) {
    http_response_code(400);
    echo json_encode(['error' => 'query too long'], JSON_UNESCAPED_UNICODE);
    exit;
}

$pageSize = isset($_GET['pageSize']) ? (int)$_GET['pageSize'] : 0;
$pageToken = isset($_GET['pageToken']) ? trim((string)$_GET['pageToken']) : '';
$total = isset($_GET['total']) ? (int)$_GET['total'] : 0;

if ($total > 0) {
    $total = max(1, min(60, $total));
} else {
    $pageSize = max(1, min(20, $pageSize ?: 20));
}

// ---- Helper: call Places Text Search once ----
function placesSearch($apiKey, $query, $pageSize, $pageToken = '') {
    $body = [
        'textQuery'    => $query,
        'languageCode' => 'ja',
        'regionCode'   => 'JP',
        'pageSize'     => $pageSize,
    ];
    if ($pageToken !== '') $body['pageToken'] = $pageToken;

    $fieldMask = implode(',', [
        'places.displayName',
        'places.formattedAddress',
        'places.internationalPhoneNumber',
        'places.nationalPhoneNumber',
        'places.websiteUri',
        'places.googleMapsUri',
        'places.types',
        'places.location',
        'nextPageToken',
    ]);

    $ch = curl_init('https://places.googleapis.com/v1/places:searchText');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($body, JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'X-Goog-Api-Key: ' . $apiKey,
            'X-Goog-FieldMask: ' . $fieldMask,
        ],
        CURLOPT_TIMEOUT        => 20,
        CURLOPT_CONNECTTIMEOUT => 6,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    $resp = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);

    return [$resp, $code, $err];
}

// ---- Normalize one place into our flat shape ----
function normalizePlace($p) {
    $name = isset($p['displayName']['text']) ? (string)$p['displayName']['text'] : '';
    $phone = $p['nationalPhoneNumber']
          ?? $p['internationalPhoneNumber']
          ?? '';
    return [
        'name'       => $name,
        'address'    => $p['formattedAddress'] ?? '',
        'phone'      => $phone,
        'websiteUrl' => $p['websiteUri'] ?? '',
        'gmapUrl'    => $p['googleMapsUri'] ?? '',
        'types'      => $p['types'] ?? [],
        'lat'        => $p['location']['latitude']  ?? null,
        'lng'        => $p['location']['longitude'] ?? null,
    ];
}

// ---- Run search (single page or paginate to total) ----
$collected = [];
$lastNextToken = '';

if ($total > 0) {
    $remaining = $total;
    $token = '';
    do {
        $thisPage = min(20, $remaining);
        list($resp, $code, $err) = placesSearch($apiKey, $query, $thisPage, $token);
        if ($resp === false || $code >= 400) {
            http_response_code(502);
            echo json_encode([
                'error' => 'places api failed',
                'status' => $code,
                'curl_error' => $err,
                'body' => $resp ? json_decode($resp, true) : null,
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $data = json_decode($resp, true);
        if (!is_array($data)) {
            http_response_code(502);
            echo json_encode(['error' => 'invalid json from places api'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        foreach (($data['places'] ?? []) as $p) {
            $collected[] = normalizePlace($p);
            if (count($collected) >= $total) break;
        }
        $token = $data['nextPageToken'] ?? '';
        $lastNextToken = $token;
        $remaining = $total - count($collected);

        // Per Google docs: short delay needed before using next_page_token
        if ($token !== '' && $remaining > 0) {
            usleep(1500000); // 1.5s
        }
    } while ($token !== '' && $remaining > 0);
} else {
    list($resp, $code, $err) = placesSearch($apiKey, $query, $pageSize, $pageToken);
    if ($resp === false || $code >= 400) {
        http_response_code(502);
        echo json_encode([
            'error' => 'places api failed',
            'status' => $code,
            'curl_error' => $err,
            'body' => $resp ? json_decode($resp, true) : null,
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $data = json_decode($resp, true);
    foreach (($data['places'] ?? []) as $p) {
        $collected[] = normalizePlace($p);
    }
    $lastNextToken = $data['nextPageToken'] ?? '';
}

echo json_encode([
    'places' => $collected,
    'nextPageToken' => $lastNextToken,
], JSON_UNESCAPED_UNICODE);
