import React, { useEffect, useMemo, useState } from 'react';
import type { LpSettings } from './types';

type Props = { settings: LpSettings };

type Status = 'idle' | 'sending' | 'success' | 'error';

const purposes = [
    { value: 'demo',    label: '無料デモを予約したい' },
    { value: 'price',   label: '料金を相談したい' },
    { value: 'consult', label: 'まずは相談したい' },
];

const planLabels: Record<string, string> = {
    light:      'ライト（9,800円 / 月〜）',
    standard:   'スタンダード（29,800円 / 月〜）',
    enterprise: '法人・複数施設（49,800円 / 月〜）',
};

const csrfToken = (): string => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    return meta?.content ?? '';
};

const readUtm = (): { utm_source?: string; utm_medium?: string; utm_campaign?: string } => {
    if (typeof window === 'undefined') return {};
    const sp = new URLSearchParams(window.location.search);
    const out: Record<string, string> = {};
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign']) {
        const v = sp.get(k);
        if (v) out[k] = v.slice(0, 100);
    }
    return out;
};

const ContactForm: React.FC<Props> = ({ settings }) => {
    const [facility, setFacility] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [tel, setTel] = useState('');
    const [childrenCount, setChildrenCount] = useState('');
    const [purpose, setPurpose] = useState('');
    const [plan, setPlan] = useState('');
    const [message, setMessage] = useState('');
    const [agree, setAgree] = useState(false);
    const [website, setWebsite] = useState(''); // honeypot — keep hidden, must stay empty
    const [policyOpen, setPolicyOpen] = useState(false);

    const [status, setStatus] = useState<Status>('idle');
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [serverMessage, setServerMessage] = useState('');

    const utm = useMemo(() => readUtm(), []);

    useEffect(() => {
        const onSelectPlan = (e: Event) => {
            const detail = (e as CustomEvent<string>).detail;
            if (detail && planLabels[detail]) {
                setPlan(detail);
                if (!purpose) setPurpose('price');
            }
        };
        window.addEventListener('lp:select-plan', onSelectPlan);
        return () => window.removeEventListener('lp:select-plan', onSelectPlan);
    }, [purpose]);

    useEffect(() => {
        if (!policyOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setPolicyOpen(false);
        };
        document.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [policyOpen]);

    if (settings.receptionClosed) {
        return (
            <section className="lp-section" id="contact">
                <div className="lp-container">
                    <header className="lp-section__head">
                        <p className="lp-section__eyebrow">Contact</p>
                        <h2 className="lp-section__title">受付一時停止のお知らせ</h2>
                    </header>
                    <div className="lp-notice">
                        <p>{settings.receptionClosedMsg || '現在、新規のお問い合わせ受付を一時停止しております。'}</p>
                        {settings.lineConsultUrl && (
                            <p>
                                お急ぎの場合は{' '}
                                <a href={settings.lineConsultUrl} target="_blank" rel="noopener noreferrer">
                                    LINE相談
                                </a>{' '}
                                までご連絡ください。
                            </p>
                        )}
                    </div>
                </div>
            </section>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status === 'sending') return;
        if (!agree) {
            setServerMessage('プライバシーポリシーへの同意をお願いいたします。');
            setStatus('error');
            return;
        }
        setStatus('sending');
        setErrors({});
        setServerMessage('');

        try {
            const res = await fetch(settings.contactEndpoint, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    facility,
                    name,
                    email,
                    tel: tel || null,
                    children_count: childrenCount ? Number(childrenCount) : null,
                    purpose: purpose || null,
                    plan: plan || null,
                    message: message || null,
                    website, // honeypot
                    ...utm,
                }),
            });

            if (res.status === 422) {
                const data = await res.json();
                setErrors(data.errors || {});
                setStatus('error');
                setServerMessage('入力内容にエラーがあります。ご確認ください。');
                return;
            }

            const data = await res.json().catch(() => ({}));

            if (!res.ok || data.ok === false) {
                setStatus('error');
                setServerMessage(data.message || '送信に失敗しました。時間を置いて再度お試しください。');
                return;
            }

            setStatus('success');
            setServerMessage(data.message || 'お問い合わせありがとうございます。');
            setFacility(''); setName(''); setEmail(''); setTel('');
            setChildrenCount(''); setPurpose(''); setPlan(''); setMessage('');
            setAgree(false);
        } catch (err) {
            setStatus('error');
            setServerMessage('通信エラーが発生しました。時間を置いて再度お試しください。');
        }
    };

    const errorOf = (key: string) => errors[key]?.[0];

    return (
        <section className="lp-section" id="contact">
            <div className="lp-container lp-container--narrow">
                <header className="lp-section__head">
                    <p className="lp-section__eyebrow">Contact</p>
                    <h2 className="lp-section__title">無料デモ・資料請求のお問い合わせ</h2>
                    <p className="lp-section__lead">
                        営業会社ではありません。NPO法人 Playful Learning Design Lab.（PLDL）の開発者本人がご対応します。<br />
                        まずはお気軽にご相談ください。
                    </p>
                </header>

                {plan && planLabels[plan] && status !== 'success' && (
                    <div className="lp-plan-banner" role="status">
                        <span className="lp-plan-banner__label">選択中のプラン</span>
                        <span className="lp-plan-banner__value">{planLabels[plan]}</span>
                        <button
                            type="button"
                            className="lp-plan-banner__clear"
                            onClick={() => setPlan('')}
                            aria-label="プラン選択をクリア"
                        >
                            ×
                        </button>
                    </div>
                )}

                {status === 'success' && (
                    <div className="lp-alert lp-alert--success" role="status">
                        {serverMessage}
                    </div>
                )}
                {status === 'error' && serverMessage && (
                    <div className="lp-alert lp-alert--error" role="alert">
                        {serverMessage}
                    </div>
                )}

                <form className="lp-form" onSubmit={handleSubmit} noValidate>
                    {/* Honeypot — visually hidden + tab-skippable. Bots fill it; humans never see it. */}
                    <div
                        aria-hidden="true"
                        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
                    >
                        <label>
                            Website (do not fill in)
                            <input
                                type="text"
                                name="website"
                                tabIndex={-1}
                                autoComplete="off"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                            />
                        </label>
                    </div>

                    <div className="lp-form__row">
                        <label className="lp-field">
                            <span className="lp-field__label">
                                施設名<span className="lp-field__req">必須</span>
                            </span>
                            <input
                                type="text"
                                value={facility}
                                onChange={(e) => setFacility(e.target.value)}
                                maxLength={100}
                                required
                                autoComplete="organization"
                            />
                            {errorOf('facility') && <span className="lp-field__err">{errorOf('facility')}</span>}
                        </label>
                        <label className="lp-field">
                            <span className="lp-field__label">
                                担当者名<span className="lp-field__req">必須</span>
                            </span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={100}
                                required
                                autoComplete="name"
                            />
                            {errorOf('name') && <span className="lp-field__err">{errorOf('name')}</span>}
                        </label>
                    </div>

                    <div className="lp-form__row">
                        <label className="lp-field">
                            <span className="lp-field__label">
                                メールアドレス<span className="lp-field__req">必須</span>
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                maxLength={255}
                                required
                                autoComplete="email"
                            />
                            {errorOf('email') && <span className="lp-field__err">{errorOf('email')}</span>}
                        </label>
                        <label className="lp-field">
                            <span className="lp-field__label">電話番号 <span className="lp-field__opt">任意</span></span>
                            <input
                                type="tel"
                                value={tel}
                                onChange={(e) => setTel(e.target.value)}
                                maxLength={30}
                                autoComplete="tel"
                            />
                            {errorOf('tel') && <span className="lp-field__err">{errorOf('tel')}</span>}
                        </label>
                    </div>

                    <div className="lp-form__row">
                        <label className="lp-field">
                            <span className="lp-field__label">児童数 <span className="lp-field__opt">任意</span></span>
                            <input
                                type="number"
                                min={0}
                                max={9999}
                                value={childrenCount}
                                onChange={(e) => setChildrenCount(e.target.value)}
                            />
                            {errorOf('children_count') && <span className="lp-field__err">{errorOf('children_count')}</span>}
                        </label>
                        <label className="lp-field">
                            <span className="lp-field__label">希望内容</span>
                            <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                                <option value="">選択してください</option>
                                {purposes.map((p) => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                            {errorOf('purpose') && <span className="lp-field__err">{errorOf('purpose')}</span>}
                        </label>
                    </div>

                    <label className="lp-field lp-field--block">
                        <span className="lp-field__label">相談内容 <span className="lp-field__opt">任意</span></span>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                            maxLength={5000}
                            placeholder="例：来年度から導入を検討しています。まずは話を聞きたいです。"
                        />
                        {errorOf('message') && <span className="lp-field__err">{errorOf('message')}</span>}
                    </label>

                    <label className="lp-checkbox">
                        <input
                            type="checkbox"
                            checked={agree}
                            onChange={(e) => setAgree(e.target.checked)}
                        />
                        <span>
                            <button
                                type="button"
                                className="lp-checkbox__policy-link"
                                onClick={() => setPolicyOpen(true)}
                            >
                                プライバシーポリシー
                            </button>
                            に同意します。
                        </span>
                    </label>

                    <div className="lp-form__submit">
                        <button
                            type="submit"
                            className="lp-btn lp-btn--primary lp-btn--lg lp-btn--block"
                            disabled={status === 'sending' || !agree}
                        >
                            {status === 'sending' ? '送信中…' : '無料で相談する'}
                        </button>
                        <p className="lp-form__note">
                            送信後、PLDL より24時間以内にご連絡いたします（土日祝を除く）。
                        </p>
                    </div>
                </form>
            </div>

            {policyOpen && (
                <div
                    className="lp-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="lp-policy-title"
                    onClick={() => setPolicyOpen(false)}
                >
                    <div className="lp-modal__panel" onClick={(e) => e.stopPropagation()}>
                        <header className="lp-modal__head">
                            <h3 id="lp-policy-title" className="lp-modal__title">プライバシーポリシー</h3>
                            <button
                                type="button"
                                className="lp-modal__close"
                                aria-label="閉じる"
                                onClick={() => setPolicyOpen(false)}
                            >
                                ×
                            </button>
                        </header>
                        <div className="lp-modal__body">
                            {settings.privacyPolicy
                                ? settings.privacyPolicy.split(/\r?\n/).map((line, i) => (
                                    <p key={i} className="lp-modal__line">{line || ' '}</p>
                                ))
                                : <p>プライバシーポリシーが未設定です。管理画面から設定してください。</p>}
                        </div>
                        <footer className="lp-modal__foot">
                            <button
                                type="button"
                                className="lp-btn lp-btn--ghost"
                                onClick={() => setPolicyOpen(false)}
                            >
                                閉じる
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ContactForm;
