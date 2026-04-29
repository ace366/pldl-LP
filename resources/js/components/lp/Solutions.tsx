import React from 'react';

const features = [
    {
        icon: '/images/press.png',
        title: '欠席・遅刻連絡',
        body: '保護者がスマホから数タップで送信。電話を取らずとも一覧で把握できます。',
    },
    {
        icon: '/images/car.png',
        title: 'お迎え変更管理',
        body: '誰が、何時に、どの方法で迎えに来るかをスタッフ全員に共有。引継ぎ漏れを防ぎます。',
    },
    {
        icon: '/images/QR.png',
        title: 'QR出席確認',
        body: 'QRをかざすだけで出席を記録。紙の出席簿への二重記入をなくせます。',
    },
    {
        icon: '/images/send.png',
        title: '保護者通知',
        body: 'お知らせ・献立・写真などを一斉通知。確認状況も把握できます。',
    },
    {
        icon: '/images/save.png',
        title: '月次CSV',
        body: '出席日数・延長時間などをワンクリックで集計し、CSV出力。請求業務を短縮します。',
    },
    {
        icon: '/images/info.png',
        title: '履歴保存',
        body: '欠席連絡や変更のやり取りはすべて履歴として残るため、属人化を解消できます。',
    },
];

const Solutions: React.FC = () => {
    return (
        <section className="lp-section" id="features">
            <div className="lp-container">
                <header className="lp-section__head">
                    <p className="lp-section__eyebrow">Solutions</p>
                    <h2 className="lp-section__title">
                        電話・紙・口頭をやめ、スマホで一元管理。
                    </h2>
                    <p className="lp-section__lead">
                        現場の声で改善を続けてきた、学童に必要な機能だけをシンプルに。
                    </p>
                </header>

                <div className="lp-grid lp-grid--3">
                    {features.map((f) => (
                        <article key={f.title} className="lp-feature">
                            <img className="lp-feature__icon" src={f.icon} alt="" width="56" height="56" />
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
