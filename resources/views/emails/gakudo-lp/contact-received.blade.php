@php
$labels = \App\Models\GakudoLpContact::statusLabels();
$purposeMap = [
    'demo'     => '無料デモを予約したい',
    'price'    => '料金を相談したい',
    'consult'  => 'まずは相談したい',
    'document' => '資料がほしい',
];
$purposeLabel = $purposeMap[$contact->purpose] ?? $contact->purpose;
$planLabel = $contact->planLabel();
@endphp
Gakudoor（ガクドア）LPからお問い合わせを受け付けました。
@if($planLabel)

★ 料金プランからの申し込み: {{ $planLabel }}
@endif

------------------------------------
受付ID      : {{ $contact->id }}
施設名      : {{ $contact->facility }}
担当者名    : {{ $contact->name }}
メール      : {{ $contact->email }}
電話番号    : {{ $contact->tel ?: '-' }}
児童数      : {{ $contact->children_count !== null ? $contact->children_count.'名' : '-' }}
希望内容    : {{ $purposeLabel ?: '-' }}
料金プラン  : {{ $planLabel ?: '-' }}
ステータス  : {{ $labels[$contact->status] ?? $contact->status }}
受付日時    : {{ $contact->created_at?->format('Y-m-d H:i') }}

相談内容:
{{ $contact->message ?: '(なし)' }}
------------------------------------

UTM         : {{ trim(($contact->utm_source ?? '').' / '.($contact->utm_medium ?? '').' / '.($contact->utm_campaign ?? ''), ' /') ?: '-' }}
IP / UA     : {{ $contact->ip_address ?: '-' }} / {{ $contact->user_agent ?: '-' }}

------------------------------------
サービス名   : Gakudoor（ガクドア）
開発・提供   : 株式会社Rezon
導入実績     : NPO法人 Playful Learning Design Lab.（PLDL）様
