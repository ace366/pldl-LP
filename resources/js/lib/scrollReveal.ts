/**
 * Scroll-triggered reveal: when [data-reveal] elements enter the viewport,
 * add the .is-inview class so CSS can transition them from a hidden state
 * to a visible one. One-shot: each element is unobserved after first reveal.
 *
 * Stagger via inline `data-reveal-delay="<ms>"`.
 *
 * Honors `prefers-reduced-motion`: if the user prefers reduced motion,
 * we mark every target as already in view (no animation).
 */
export function initScrollReveal(): () => void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return () => {};
    }

    const targets = Array.from(
        document.querySelectorAll<HTMLElement>('[data-reveal]'),
    );
    if (targets.length === 0) return () => {};

    const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
        targets.forEach((el) => el.classList.add('is-inview'));
        return () => {};
    }

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target as HTMLElement;
                const delay = el.dataset.revealDelay;
                if (delay) {
                    el.style.transitionDelay = `${delay}ms`;
                }
                el.classList.add('is-inview');
                obs.unobserve(el);
            });
        },
        {
            // 下から 12% 入った時点で発火（早すぎず遅すぎず）
            rootMargin: '0px 0px -12% 0px',
            threshold: 0.05,
        },
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
}
