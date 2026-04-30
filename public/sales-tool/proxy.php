<?php
/**
 * 営業リストツール用 簡易 CORS プロキシ。
 *
 * 役割:
 *   外部サイトの HTML を取得して JSON で返す。allorigins.win 等の
 *   公共プロキシが不安定だったため自前で持つ。
 *
 * 配置:
 *   public/sales-tool/proxy.php (Laravel のルーティングを通らない静的ファイル)
 *
 * SSRF 対策:
 *   - http/https のみ受け付け
 *   - 解決後の IP がプライベート / 予約レンジなら拒否
 *   - 最大 2MB / 15秒タイムアウト
 *   - リダイレクト追跡は最大 5 回
 *
 * 認証はかけていない（sales-tool 自体が認証なし公開のため、整合）。
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$url = isset($_GET['url']) ? trim((string)$_GET['url']) : '';

if ($url === '' || !preg_match('#^https?://#i', $url)) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid url'], JSON_UNESCAPED_UNICODE);
    exit;
}

$parsed = parse_url($url);
if (!$parsed || empty($parsed['host'])) {
    http_response_code(400);
    echo json_encode(['error' => 'unparsable url'], JSON_UNESCAPED_UNICODE);
    exit;
}

$host = $parsed['host'];
$resolvedIps = @gethostbynamel($host) ?: [];
if (!$resolvedIps) {
    // try IPv6 / fall back
    $ip = @gethostbyname($host);
    if ($ip && $ip !== $host) $resolvedIps = [$ip];
}
if (!$resolvedIps) {
    http_response_code(502);
    echo json_encode(['error' => 'dns failed'], JSON_UNESCAPED_UNICODE);
    exit;
}
foreach ($resolvedIps as $ip) {
    if (
        filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false
    ) {
        http_response_code(400);
        echo json_encode(['error' => 'host not allowed (private/reserved)'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS      => 5,
    CURLOPT_PROTOCOLS      => CURLPROTO_HTTP | CURLPROTO_HTTPS,
    CURLOPT_REDIR_PROTOCOLS=> CURLPROTO_HTTP | CURLPROTO_HTTPS,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_CONNECTTIMEOUT => 6,
    CURLOPT_USERAGENT      => 'Mozilla/5.0 (compatible; PLDL-SalesTool/1.0)',
    CURLOPT_ACCEPT_ENCODING=> '',
    CURLOPT_HTTPHEADER     => [
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language: ja,en;q=0.5',
    ],
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_BUFFERSIZE     => 65536,
]);

$body = curl_exec($ch);
$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$finalUrl = (string) curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
$err = curl_error($ch);
curl_close($ch);

if ($body === false) {
    http_response_code(502);
    echo json_encode([
        'error' => 'fetch failed: ' . $err,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Cap response size (~2MB)
$maxBytes = 2 * 1024 * 1024;
$truncated = false;
if (strlen($body) > $maxBytes) {
    $body = substr($body, 0, $maxBytes);
    $truncated = true;
}

echo json_encode([
    'contents'  => $body,
    'truncated' => $truncated,
    'status'    => [
        'url'       => $finalUrl,
        'http_code' => $httpCode,
    ],
], JSON_UNESCAPED_UNICODE);
