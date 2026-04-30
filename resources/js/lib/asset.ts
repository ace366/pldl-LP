/**
 * Build a URL from a path, prepending the app's base URL.
 * Supports sub-path deployments (e.g. https://example.com/pldl-lp).
 *
 * The base is read from `window.__APP_URL__`, which is injected by the
 * Blade view (gakudo-lp/index.blade.php) and bootstrapped in
 * `resources/js/gakudo-lp.tsx`.
 *
 * Usage:
 *   <img src={asset('/images/parents.png')} />
 *   fetch(asset('/gakudo/contact'))
 */
declare global {
    interface Window {
        __APP_URL__?: string;
    }
}

export function asset(path: string): string {
    if (/^https?:\/\//i.test(path)) {
        return path;
    }
    const base = (typeof window !== 'undefined' && window.__APP_URL__) || '';
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return base.replace(/\/$/, '') + normalized;
}
