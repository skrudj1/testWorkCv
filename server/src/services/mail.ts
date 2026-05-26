import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from '../config.js';
import type { ContactPayload } from '../validation.js';

let transporter: Transporter | null = null;

/** Пауза между двумя отдельными письмами (лимит Mailtrap Sandbox) */
const SMTP_SEND_GAP_MS = 3500;
const SMTP_RETRY_DELAYS_MS = [2000, 4000, 6000];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const withResponse = error as Error & { response?: string };
  const text = `${error.message} ${withResponse.response ?? ''}`;
  return text.includes('Too many emails');
}

async function sendWithRetry<T>(action: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= SMTP_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (!isRateLimitError(error) || attempt >= SMTP_RETRY_DELAYS_MS.length) {
        throw error;
      }
      await delay(SMTP_RETRY_DELAYS_MS[attempt]!);
    }
  }
  throw lastError;
}

function getTransporter(): Transporter {
  if (!transporter) {
    const { host, port, secure, auth } = config.mail.smtp;

    const transportOptions = {
      host: host.includes('yandex') ? 'smtp.yandex.ru' : host,
      port,
      secure,
      auth,
      connectionTimeout: 20_000,
      greetingTimeout: 20_000,
      socketTimeout: 30_000,
      tls: host.includes('yandex') ? { rejectUnauthorized: true } : undefined,
    };

    transporter = nodemailer.createTransport(transportOptions);
  }
  return transporter;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildOwnerHtml(data: ContactPayload): string {
  return `
    <h2>Новое сообщение с портфолио</h2>
    <p><strong>Имя:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>Телефон:</strong> ${escapeHtml(data.phone)}</p>
    <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Комментарий:</strong></p>
    <p>${escapeHtml(data.comment).replace(/\n/g, '<br>')}</p>
  `;
}

function buildUserCopyHtml(data: ContactPayload): string {
  return `
    <h2>Спасибо за обращение, ${escapeHtml(data.name)}!</h2>
    <p>Я получил ваше сообщение и отвечу в ближайшее время.</p>
    <hr>
    <p><strong>Ваше сообщение:</strong></p>
    <p>${escapeHtml(data.comment).replace(/\n/g, '<br>')}</p>
    <p style="color:#666;font-size:14px;">Контакты: ${escapeHtml(config.mail.owner)} · +7 (931) 998-98-93</p>
  `;
}

export async function sendContactEmails(data: ContactPayload): Promise<void> {
  const transport = getTransporter();

  // Одно SMTP-сообщение: владелец + копия (CC) на email из формы
  await sendWithRetry(() =>
    transport.sendMail({
      from: config.mail.from,
      to: config.mail.owner,
      cc: data.email,
      replyTo: data.email,
      subject: `[Портфолио] Сообщение от ${data.name}`,
      text: [
        `Имя: ${data.name}`,
        `Телефон: ${data.phone}`,
        `Email: ${data.email}`,
        '',
        'Комментарий:',
        data.comment,
      ].join('\n'),
      html: buildOwnerHtml(data),
    }),
  );

  await delay(SMTP_SEND_GAP_MS);

  // Отдельное «спасибо» пользователю (если лимит — не роняем всю отправку)
  try {
    await sendWithRetry(() =>
      transport.sendMail({
        from: config.mail.from,
        to: data.email,
        subject: 'Копия вашего сообщения — Алексей Володько',
        text: [
          `Здравствуйте, ${data.name}!`,
          '',
          'Спасибо за обращение. Ниже копия вашего сообщения:',
          '',
          data.comment,
          '',
          'С уважением,',
          'Алексей Володько',
          config.mail.owner,
        ].join('\n'),
        html: buildUserCopyHtml(data),
      }),
    );
  } catch (error) {
    if (!isRateLimitError(error)) {
      throw error;
    }
    console.warn(
      '[mail] Лимит Mailtrap: письмо «спасибо» не отправлено, но владелец и CC уже получили заявку.',
    );
  }
}

export async function verifyMailConnection(): Promise<boolean> {
  try {
    await getTransporter().verify();
    return true;
  } catch {
    return false;
  }
}
