import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Sakura Rental Server wraps cookies (Set-Cookie: ENC_*=...) so the
// XSRF-TOKEN cookie value the browser stores is sakura-encrypted and can't
// be sent back as X-XSRF-TOKEN — Laravel can't decrypt it. Bypass cookie
// CSRF by reading the raw token from the meta tag rendered server-side.
const csrfMeta = document.head.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
if (csrfMeta?.content) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfMeta.content;
}
