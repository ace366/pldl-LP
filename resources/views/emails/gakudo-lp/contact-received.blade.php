@php
$labels = \App\Models\GakudoLpContact::statusLabels();
$purposeMap = [
    'document' => '資料がほしい',
    'demo'     => '15分デモを見たい',
    'price'    => '料金を相談したい',
    'consult'  => 'まずは話だけ聞きたい',
];
$purposeLabel = $purposeMap[$contact->purpose] ?? $contact->purpose;
@endphp
学童向けLPからお問い合わせを受け付けました。

------------------------------------
受付ID      : {{ $contact->id }}
施設名      : {{ $contact->facility }}
担当者名    : {{ $contact->name }}
メール      : {{ $contact->email }}
電話番号    : {{ $contact->tel ?: '-' }}
児童数      : {{ $contact->children_count !== null ? $contact->children_count.'名' : '-' }}
希望内容    : {{ $purposeLabel ?: '-' }}
ステータス  : {{ $labels[$contact->status] ?? $contact->status }}
受付日時    : {{ $contact->created_at?->format('Y-m-d H:i') }}

相談内容:
{{ $contact->message ?: '(なし)' }}
------------------------------------

UTM         : {{ trim(($contact->utm_source ?? '').' / '.($contact->utm_medium ?? '').' / '.($contact->utm_campaign ?? ''), ' /') ?: '-' }}
IP / UA     : {{ $contact->ip_address ?: '-' }} / {{ $contact->user_agent ?: '-' }}

NPO法人 Playful Learning Design Lab.（PLDL）
学童向け運営システム
