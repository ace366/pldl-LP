import React from 'react';
import { asset } from '../../lib/asset';

const features = [
    {
        icon: '/images/press.png',
        title: '欠席・遅刻連絡',
        body: '保護者がスマホから数タップで送信。電話を取らずとも一覧で把握できます。',
    },
    {
        icon: '/images/car.png',
        title: 'お迎え変更・送迎管理',
        body: '誰が、何時に、どの方法で迎えに来るかをスタッフ全員で共有。乗車済みもタップで記録。',
    },
    {
        icon: '/images/QR.png',
        title: 'QR出席確認・手入力対応',
        body: 'QRをかざすだけで受付。カード忘れには手入力フォールバックも用意しています。',
    },
    {
        icon: '/images/send.png',
        title: '保護者通知・お知らせ',
        body: 'お知らせ・献立・写真などを一斉通知。確認状況や既読の有無もまとめて把握。',
    },
    {
        icon: '/images/save.png',
        title: '月次CSV／PDF出力',
        body: '出席日数・延長時間などをワンクリックで集計し、CSVまたはPDFで出力。請求業務を短縮します。',
    },
    {
        icon: '/images/info.png',
        title: 'TEL票・履歴保存',
        body: '電話／面談／メール等のやり取りを履歴として記録。誰でも経緯を確認でき、属人化を解消します。',
    },
    {
        icon: '/images/guardian.png',
        title: 'きょうだい・複数保護者管理',
        body: 'きょうだい児童の関連付け、続柄ごとの保護者複数登録に対応。家族単位で運用できます。',
    },
    {
        icon: '/images/parents.png',
        title: 'アレルギー・緊急情報',
        body: 'アレルギー有無・緊急連絡先・特記事項を一画面で把握。必要なときに素早く確認できます。',
    },
    {
        icon: '/images/login.png',
        title: '権限管理・スタッフ勤怠',
        body: 'スタッフごとに編集／閲覧権限を制御。出勤QR・シフト・給与までまとめて運用できます。',
    },
];

const Solutions: React.FC = () => {
    return (
        <section className="lp-section" id="features">
            <div className="lp-container">
                <header className="lp-section__head" data-reveal="">
                    <p className="lp-section__eyebrow">What Gakudoor does</p>
                    <h2 className="lp-section__title">
                        Gakudoorでできること。
                    </h2>
                    <p className="lp-section__lead">
                        電話・紙・口頭に頼っていた業務を、スマホで一元管理。<br className="lp-hide-sp" />
                        学童運営に必要な機能をひと通り揃え、施設に合わせて段階的に拡張できます。
                    </p>
                </header>

                <div className="lp-grid lp-grid--3">
                    {features.map((f, i) => (
                        <article
                            key={f.title}
                            className="lp-feature"
                            data-reveal=""
                            data-reveal-delay={(i % 3) * 80 + Math.floor(i / 3) * 60}
                        >
                            <img className="lp-feature__icon" src={asset(f.icon)} alt="" width="56" height="56" />
                            <h3 className="lp-feature__title">{f.title}</h3>
                            <p className="lp-feature__body">{f.body}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Solutions;
