{{--
    DM letter — A4 1 ページ分のひな形。
    変数: $entry (App\Models\SalesEntry), $today ('2026-05-07' 形式の文字列)
    本文中のプレースホルダ:
      {{facility_name}} / {{address}} / {{prefecture}} / {{city}} / {{date}}
    将来 dm_templates テーブル等で本文を編集可能にする際は、ここを動的に呼び出す。
--}}
<style>
    body {
        font-family: sun-exta, sans-serif;
        font-size: 10.5pt;
        line-height: 1.75;
        color: #1f2937;
    }
    .dm-date {
        text-align: right;
        font-size: 10pt;
        margin-bottom: 18pt;
    }
    .dm-to {
        font-size: 11.5pt;
        font-weight: bold;
        margin-bottom: 24pt;
    }
    .dm-body {
        text-align: justify;
    }
    .dm-body p {
        margin: 0 0 10pt 0;
    }
    .dm-sig {
        text-align: right;
        margin-top: 14pt;
    }
    .dm-contact {
        margin-top: 22pt;
        padding: 10pt 12pt;
        border-top: 1pt solid #94a3b8;
        border-bottom: 1pt solid #94a3b8;
        font-size: 9.5pt;
        line-height: 1.55;
    }
    .dm-contact .biz {
        font-weight: bold;
        font-size: 10.5pt;
        margin-bottom: 3pt;
    }
    .dm-window {
        margin-top: 28pt;
        padding: 10pt 12pt;
        background: #f3f4f6;
        font-size: 10.5pt;
        line-height: 1.7;
    }
    .dm-window .label {
        color: #64748b;
        display: inline-block;
        width: 40pt;
    }
</style>

<div class="dm-date">{{ $today }}</div>

<div class="dm-to">{{ $entry->facility ?? '' }}<br>ご担当者様</div>

<div class="dm-body">
<p>拝啓　時下ますますご清栄のこととお慶び申し上げます。<br>
突然のご連絡を差し上げます失礼を、何卒お許しくださいませ。</p>

<p>このたびは、学童クラブ・放課後児童クラブ様向けの運営支援システム「Gakudoor（ガクドア）」のご案内のため、書面を差し上げました。</p>

<p>弊社 株式会社Rezon では、保護者からの欠席連絡やお迎え変更の受付、出欠の記録、保護者への一斉連絡、毎月の利用集計といった日々の運営業務を、スマートフォン・PC からまとめて管理できる仕組みを開発・提供しております。</p>

<p>学童の現場では、朝の電話対応、紙の出席簿、口頭での共有事項、月末の集計作業などが、運営の皆様の大きなご負担となっておられるとお伺いしております。Gakudoor は、それらの業務を保護者・指導員・施設管理者の三者でリアルタイムに共有することで、業務時間とミスの両方を減らすことを目指した仕組みです。</p>

<p>本システムは、NPO法人 Playful Learning Design Lab.（PLDL）様の学童運営にて日々ご利用いただいており、同法人での運用を通じて見えてきた現場の声をもとに、学童特有の業務に合うかたちへ継続的に改良を重ねております。</p>

<p>まずは下記 Web ページの資料および 5 分程度の紹介動画をご覧いただくだけでも、お役に立てそうかどうかをご判断いただけるかと存じます。ご関心をお寄せいただける場合は、後日改めてお問合せ窓口を別途ご案内いたします。</p>

<p>ご多用のところ恐縮ではございますが、何卒よろしくお願い申し上げます。</p>
</div>

<div class="dm-sig">敬具</div>

<div class="dm-contact">
    <div class="biz">株式会社Rezon ／ 学童運営支援システム Gakudoor（ガクドア）</div>
    <div>Web : https://top-ace-picard.sakura.ne.jp/pldl-lp/gakudo</div>
    <div>お問合せ窓口は本書面送付後、別途ご案内いたします。</div>
</div>

<div class="dm-window">
    <div><span class="label">宛先：</span>{{ $entry->facility ?? '' }}</div>
    @if($entry->prefecture || $entry->city)
    <div><span class="label">エリア：</span>{{ $entry->prefecture ?? '' }}{{ $entry->city ?? '' }}</div>
    @endif
    <div><span class="label">住所：</span>{{ $entry->address ?? '' }}</div>
</div>
