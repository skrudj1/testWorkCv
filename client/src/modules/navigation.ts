export function initNavigation(): void {
  const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  const close = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Открыть меню');
  };

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });

  const header = document.querySelector('.header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('header--scrolled', window.scrollY > 8);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const scrollOffset = (): number => {
    const styles = getComputedStyle(document.documentElement);
    const headerH = parseFloat(styles.getPropertyValue('--header-h')) || 72;
    const gap = parseFloat(styles.getPropertyValue('--scroll-anchor-gap')) || 28;
    return headerH + gap;
  };

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;

      if (hash === '#top') {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const target = document.querySelector(hash);
      if (!(target instanceof HTMLElement)) return;

      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - scrollOffset();
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });
}
