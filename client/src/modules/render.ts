import {
  approach,
  aiBanner,
  cases,
  contacts,
  directions,
  stack,
} from '../data/content';

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  html?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

export function renderStack(): void {
  const root = document.getElementById('stack-tags');
  if (!root) return;
  root.innerHTML = stack.map((item) => `<li>${item}</li>`).join('');
}

export function renderAbout(): void {
  const root = document.getElementById('about-cards');
  if (!root) return;

  root.innerHTML = directions
    .map(
      (card) => `
      <article class="card">
        <h3>${card.title}</h3>
        <p>${card.text}</p>
      </article>
    `,
    )
    .join('');
}

export function renderApproach(): void {
  const list = document.getElementById('approach-list');
  const bannerText = document.getElementById('ai-banner-text');
  if (!list) return;

  list.innerHTML = approach
    .map(
      (item, index) => `
      <article class="timeline__item">
        <span class="timeline__index">${String(index + 1).padStart(2, '0')}</span>
        <div>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </div>
      </article>
    `,
    )
    .join('');

  if (bannerText) bannerText.textContent = aiBanner;
}

export function renderCases(): void {
  const root = document.getElementById('cases-list');
  if (!root) return;

  root.innerHTML = cases
    .map(
      (item) => `
      <article class="case">
        <header class="case__header">
          <div>
            <h3>${item.company}</h3>
            <p class="case__meta">${item.role} · ${item.period}</p>
          </div>
          <ul class="case__stack">
            ${item.stack.map((t) => `<li>${t}</li>`).join('')}
          </ul>
        </header>
        <ul class="case__list">
          ${item.highlights.map((h) => `<li>${h}</li>`).join('')}
        </ul>
        <p class="case__personal"><strong>Мой вклад:</strong> ${item.personal}</p>
      </article>
    `,
    )
    .join('');
}

export function renderContacts(): void {
  const root = document.getElementById('contact-links');
  if (!root) return;

  contacts.forEach((item) => {
    const li = el('li', 'contact-links__item');
    const label = el('span', 'contact-links__label', item.label);
    li.appendChild(label);

    if (item.href) {
      const link = el('a');
      link.href = item.href;
      link.textContent = item.value;
      if (item.href.startsWith('mailto:') || item.href.startsWith('tel:')) {
        link.setAttribute('rel', 'noopener');
      }
      li.appendChild(link);
    } else {
      const span = el('span');
      span.textContent = item.value;
      li.appendChild(span);
    }

    root.appendChild(li);
  });
}

export function renderYear(): void {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
}
