<!doctype html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Gakudoor（ガクドア）｜学童の連絡・出欠・お迎え管理を、スマホでやさしく一本化。</title>
    <meta name="description" content="Gakudoor（ガクドア）は、学童クラブ・放課後児童クラブ向けの運営支援システムです。欠席連絡、出欠確認、お迎え予定、保護者連絡、施設側の管理業務をスマホ・PCからまとめて。開発・提供：株式会社Rezon／導入実績：NPO法人 Playful Learning Design Lab.（PLDL）様。">

    <meta property="og:title" content="Gakudoor（ガクドア）｜学童運営支援システム">
    <meta property="og:description" content="電話・紙・口頭連絡に頼りがちな学童運営を、保護者・施設・自治体がつながる安心の仕組みに変える学童運営支援システム。">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="ja_JP">
    <meta property="og:image" content="{{ rtrim(config('app.url'), '/') }}/images/gakudoor-logo.png">
    <link rel="icon" type="image/png" href="{{ rtrim(config('app.url'), '/') }}/images/gakudoor-logo.png">

    @if(!empty($lpSettings['noindex']))
        <meta name="robots" content="noindex,nofollow">
    @endif

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
