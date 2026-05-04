import React from 'react';
import { asset } from '../../lib/asset';

const issues = [
    {
        icon: '/images/press.png',
        title: '朝の欠席連絡の電話ラッシュ',
        body: '8〜9時に電話が集中し、対応しきれない。受けながら別の電話を取り損ねる。',
    },
    {
        icon: '/images/car.png',
        title: 'お迎え変更の共有漏れ',
        body: '今日は祖父が迎え、急な習い事へ直行など、変更情報がスタッフ間で共有しきれない。',
    },
    {
        icon: '/images/attendance.png',
        title: '紙の出席簿管理',
        body: '紙にチェック→事務処理→転記、と二重三重の手作業になりがち。',
    },
    {
        icon: '/images/save.png',
        title: '月末集計の負担',
        body: '出席日数・延長時間・キャンセルの集計に毎月数日かかる。',
    },
    {
        icon: '/images/parents.png',
        title: '保護者対応の属人化',
        body: '「いつもの先生」しか経緯を知らないため、休みや異動時に引き継ぎができない。',
    },
];

const FieldIssues: React.FC = () => {
    return (
        <section className="lp-section lp-section--soft" id="issues">
            <div className="lp-container">
                <header className="lp-section__head">
                    <p className="lp-section__eyebrow">Field Issues</p>
                    <h2 className="lp-section__title">学童でよく起きている、現場のリアル。</h2>
                    <p className="lp-section__lead">
                        実際の学童運営で日常的に挙がっている課題です。<br className="lp-hide-sp" />
                        どれも、忙しい毎日の中で「仕方ない」と諦められがちなものばかり。
                    </p>
                </header>

                <ul className="lp-issues">
                    {issues.map((i) => (
                        <li key={i.title} className="lp-issue">
                            <span className="lp-issue__icon" aria-hidden="true">
                                <img src={asset(i.icon)} alt="" width="36" height="36" />
                            </span>
                            <div>
                                <h3 className="lp-issue__title">{i.title}</h3>
                                <p className="lp-issue__body">{i.body}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default FieldIssues;
