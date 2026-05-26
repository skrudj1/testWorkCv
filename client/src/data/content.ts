export const profile = {
  name: 'Алексей Володько',
  role: 'Fullstack-разработчик (Frontend-heavy)',
  location: 'Санкт-Петербург',
  remote: true,
  experience: '4 года 3 месяца',
  email: 'alexvolodko1504@mail.ru',
  phone: '+7 (931) 998-98-93',
  hh: 'https://hh.ru/',
};

export const stack = [
  'TypeScript',
  'React',
  'Next.js',
  'Vue.js',
  'Node.js',
  'Express',
  'MongoDB',
  'Web3',
  'Redux Toolkit',
  'React Query',
  'Tailwind CSS',
  'Jest',
  'Docker',
  'GitLab CI/CD',
  'MCP / Cursor',
];

export const directions = [
  {
    title: 'Frontend',
    text: 'SPA и SSR на React/Next.js, FSD-архитектура, дизайн-системы, a11y, perf (LCP < 1.5s).',
  },
  {
    title: 'Backend',
    text: 'REST API, JWT, Stripe/crypto-платежи, WebSocket, интеграции с блокчейн-нодами.',
  },
  {
    title: 'Web3 & продукт',
    text: 'Мосты EVM ↔ Cellframe, кошельки MetaMask/Ledger, релизы и CI/CD.',
  },
];

export const approach = [
  {
    title: 'Декомпозиция и прозрачность',
    text: 'Разбиваю задачу на шаги, фиксирую риски и критерии готовности до кода. На стыке UI/API/Web3 — сначала воспроизведение и диагностика.',
  },
  {
    title: 'Качество и тесты',
    text: 'Jest, RTL, code review, строгая обработка ошибок в UI и API. Не ослабляю проверки ради «зелёного» билда.',
  },
  {
    title: 'AI как усилитель, не замена',
    text: 'Cursor + MCP + SLC для контекста и рутины; участвовал в MCP-сервере для внутренней AI-экосистемы. Итоговое решение и ответственность — за разработчиком.',
  },
];

export const aiBanner =
  'Практикую вайбкодинг: глобальный контекст через MCP, быстрые локальные действия через SLC, кастомные rules под стиль проекта. На этом лендинге AI помогает улучшить текст сообщения в форме (OpenAI API).';

export const cases = [
  {
    company: 'ДЕМЛАБС',
    period: 'Июнь 2025 — настоящее время',
    role: 'Fullstack-разработчик',
    stack: ['React', 'Next.js', 'Node.js', 'Web3', 'Docker'],
    highlights: [
      'Cellframe Bridge 2.0: API мостовых операций, фиксы Ledger/MetaMask, CI/CD.',
      'KelVPN Website: Stripe/crypto-платежи, Express, unit-тесты, SEO и a11y.',
      'Two Carrots: редизайн, Dashboard, переиспользуемые UI-компоненты.',
    ],
    personal:
      'Лично: архитектура фич, fullstack по платежам, стабилизация транзакционного флоу, MCP/SLC в процессе разработки.',
  },
  {
    company: 'Zerosum / genome',
    period: 'Февраль 2024 — Февраль 2025',
    role: 'Frontend-разработчик',
    stack: ['Next.js', 'Tailwind', 'SWR', 'NextAuth', 'MongoDB'],
    highlights: [
      'Криптоплатформа: динамические маршруты, CoinGecko/CoinMarketCap, 2 редизайна.',
      'NextAuth + MongoDB, деплой на Vercel, CI/CD.',
    ],
    personal: 'Лично: UI, интеграции API, оптимизация загрузки, мобильная адаптивность.',
  },
  {
    company: 'Entangle',
    period: 'Февраль 2024 — Февраль 2025',
    role: 'Frontend dev Web3',
    stack: ['Web3.js', 'MetaMask', 'Mobile-First'],
    highlights: [
      'Лендинг с подключением кошелька, mint NFT, staking.',
      'Конверсия кошельков +30%, PageSpeed ~1.5s.',
    ],
    personal: 'Лично: UI, смарт-контракты на клиенте, UX подключения кошелька.',
  },
  {
    company: 'LandTal · Ghosted',
    period: '2020 — 2022',
    role: 'Frontend / React Native',
    stack: ['React', 'React Native', 'Tailwind', 'Redux'],
    highlights: [
      'Компоненты Tailwind Rocks, приложение Ghosted (книги, offline, App Store).',
    ],
    personal: 'Лично: компоненты, API-интеграции, тестирование, публикация.',
  },
];

export const contacts = [
  { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
  { label: 'Телефон', value: profile.phone, href: `tel:${profile.phone.replace(/\D/g, '')}` },
  { label: 'Город', value: profile.location, href: null },
  { label: 'Формат', value: 'Удалённо / офис', href: null },
];
