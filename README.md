# Лендинг-портфолио — Алексей Володько

Тестовое задание: одностраничный сайт о себе как о разработчике, с рабочей формой и AI-интеграцией.

**Репозиторий:** https://github.com/skrudj1/testWorkCv  
**Демо:** https://testworkcv.onrender.com  
**Контакты:** alexvolodko1504@mail.ru · +7 (931) 998-98-93

---

## Что на сайте

1. **Обо мне** — стек, опыт, направления (frontend / backend / Web3)
2. **Как работаю** — подход к задачам и использование AI в работе
3. **Кейсы** — проекты из резюме и личный вклад
4. **Контакты** — форма обратной связи

**Форма:** имя, телефон, email, комментарий. Состояния loading / success / error, валидация на клиенте и на сервере (для API-режима).

**Почта после отправки:**
- **Локально (SMTP в `.env`):** письмо владельцу (`MAIL_OWNER`) + копия на email из формы
- **На деплое (Render + Web3Forms):** письмо на почту владельца; email отправителя указан в теле письма (копия гостю на бесплатном тарифе Web3Forms недоступна)

**AI:** кнопка «Улучшить текст» — запрос к `POST /api/ai/improve-text` (OpenRouter).

---

## Стек

| Часть | Технологии |
|--------|------------|
| Frontend | HTML, TypeScript, SCSS, Vite |
| Backend | Node.js, Express, Zod |
| Почта | Nodemailer (SMTP локально) / Web3Forms API (продакшен на Render) |
| AI | OpenRouter (`openrouter/free`), ключ только на сервере |

Монорепозиторий: `client/` (сайт), `server/` (API).

---

## Как запустить локально

Нужен **Node.js 18+**.

```bash
git clone https://github.com/skrudj1/testWorkCv.git
cd testWorkCv
cp .env.example .env
```

Заполните `.env` (см. `.env.example`):

- **SMTP_*** — для отправки формы через backend (Mailtrap, Gmail и т.д.)
- **MAIL_OWNER** — куда приходят заявки
- **AI_API_KEY**, **AI_BASE_URL**, **AI_MODEL** — для AI (опционально)
- **CLIENT_ORIGIN** — `http://localhost:5173`

```bash
npm install
npm run dev
```

- Сайт: http://localhost:5173  
- API: http://localhost:3001  

Сборка и запуск как на сервере:

```bash
npm run build
NODE_ENV=production npm start
```

---

## Как устроена форма

**Локально / без Web3Forms**

1. Браузер → `POST /api/contact` (JSON)
2. Express + Zod проверяют поля
3. Nodemailer отправляет 2 письма (владелец + копия пользователю)
4. Ответ `{ ok, message }` → UI показывает success / error

**Продакшен (Render)**

Render Free **блокирует исходящий SMTP** (порты 587/465). Поэтому на деплое форма шлёт заявку через **Web3Forms** из браузера (`VITE_WEB3FORMS_ACCESS_KEY` в переменных окружения при сборке).

Цепочка на демо: **frontend → HTTPS (Web3Forms) → почта владельца**.  
AI по-прежнему идёт через backend: **frontend → `/api/ai/improve-text` → OpenRouter**.

Обработка ошибок: сообщения в UI, логи на сервере, rate limit на API.

---

## Как устроен AI

Кнопка у поля «Комментарий» → `POST /api/ai/improve-text` → OpenRouter переписывает текст → результат подставляется в поле.

`AI_API_KEY` хранится только в `.env` на сервере, в клиентский бандл не попадает.

---

## Деплой (Render)

- **Build:** `npm install && npm run build`
- **Start:** `npm start`
- **Environment (минимум для демо):**

```env
NODE_ENV=production
CLIENT_ORIGIN=https://testworkcv.onrender.com
VITE_WEB3FORMS_ACCESS_KEY=ваш_ключ_с_web3forms.com
AI_API_KEY=sk-or-...
AI_BASE_URL=https://openrouter.ai/api
AI_MODEL=openrouter/free
```

После добавления `VITE_*` — пересобрать деплой (Clear build cache).

Подробнее про SMTP на Render и альтернативы — в комментариях к `.env.example`.

---

## AI при разработке

**Инструменты:** Cursor (агент, автодополнение), OpenRouter для runtime AI на сайте.

**С помощью ИИ:** каркас monorepo, Express API, стили, черновик README, интеграция OpenRouter.

**Вручную / доработано:** контент из резюме, валидация формы, настройка реальной почты, деплой на Render, обход блокировки SMTP (Web3Forms), CSP для внешнего API, якорная навигация и отступы под sticky-header, правки после тестов на проде.

---

## Структура проекта

```
client/          — HTML, SCSS, TS (Vite)
  src/modules/   — форма, навигация, рендер секций
  src/api/       — клиент API
server/          — Express, маршруты /api/contact и /api/ai
.env             — секреты (не в git)
.env.example     — шаблон переменных
```

---

## Автор

**Алексей Володько** — Fullstack (упор на frontend)  
Санкт-Петербург, готов к удалёнке
