<!doctype html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>学童の電話・紙管理を、スマホでやさしく効率化 | NPO法人 Playful Learning Design Lab.（PLDL）</title>
    <meta name="description" content="教育現場で実際に子どもたちの居場所づくり・学びの場づくりに取り組む NPO法人 Playful Learning Design Lab.（PLDL）が、現場課題から開発した学童向け運営システム。欠席連絡・お迎え変更・出席確認・保護者通知をスマホで一元管理。">

    <meta property="og:title" content="学童の電話・紙管理を、スマホでやさしく効率化 | NPO法人 Playful Learning Design Lab.（PLDL）">
    <meta property="og:description" content="現場課題から生まれた、学童向け運営システム。">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="ja_JP">

    @if(!empty($lpSettings['gscVerification']))
        <meta name="google-site-verification" content="{{ $lpSettings['gscVerification'] }}">
    @endif

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=noto-sans-jp:400,500,700&display=swap" rel="stylesheet">

    @vite(['resources/css/app.css', 'resources/js/gakudo-lp.tsx'])

    @if(!empty($lpSettings['gaMeasurementId']))
        <script async src="https://www.googletagmanager.com/gtag/js?id={{ $lpSettings['gaMeasurementId'] }}"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '{{ $lpSettings['gaMeasurementId'] }}');
        </script>
    @endif
</head>
<body>
    <div id="gakudo-lp-root"
         data-settings='@json($lpSettings)'
         data-app-url="{{ rtrim(config('app.url'), '/') }}"></div>
</body>
</html>
