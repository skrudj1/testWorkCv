import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
dotenv.config({ path: path.join(rootDir, '.env') });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

export type MailProvider = 'smtp' | 'resend' | 'sendgrid' | 'web3forms';

function resolveMailProvider(): MailProvider {
  const raw = process.env.MAIL_PROVIDER?.toLowerCase();
  if (
    raw === 'resend' ||
    raw === 'sendgrid' ||
    raw === 'smtp' ||
    raw === 'web3forms'
  ) {
    return raw;
  }
  if (process.env.WEB3FORMS_ACCESS_KEY) return 'web3forms';
  if (process.env.RESEND_API_KEY) return 'resend';
  if (process.env.SENDGRID_API_KEY) return 'sendgrid';
  return 'smtp';
}

const mailProvider = resolveMailProvider();

export const config = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  mail: {
    provider: mailProvider,
    from: required('MAIL_FROM', '"Portfolio" <noreply@localhost>'),
    owner: required('MAIL_OWNER', 'volodko065@mail.ru'),
    resendApiKey:
      mailProvider === 'resend'
        ? required('RESEND_API_KEY')
        : (process.env.RESEND_API_KEY ?? ''),
    sendgridApiKey:
      mailProvider === 'sendgrid'
        ? required('SENDGRID_API_KEY')
        : (process.env.SENDGRID_API_KEY ?? ''),
    web3formsAccessKey:
      mailProvider === 'web3forms'
        ? required('WEB3FORMS_ACCESS_KEY')
        : (process.env.WEB3FORMS_ACCESS_KEY ?? ''),
    smtp:
      mailProvider === 'smtp'
        ? {
            host: required('SMTP_HOST', 'smtp.mailtrap.io'),
            port: Number(process.env.SMTP_PORT ?? 2525),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: required('SMTP_USER', 'user'),
              pass: required('SMTP_PASS', 'pass'),
            },
          }
        : {
            host: process.env.SMTP_HOST ?? '',
            port: Number(process.env.SMTP_PORT ?? 587),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER ?? '',
              pass: process.env.SMTP_PASS ?? '',
            },
          },
  },
  ai: (() => {
    const apiKey =
      process.env.AI_API_KEY ??
      process.env.DEEPSEEK_API_KEY ??
      process.env.OPENAI_API_KEY ??
      '';
    const defaultBase = process.env.OPENAI_API_KEY && !process.env.AI_BASE_URL
      ? 'https://api.openai.com'
      : 'https://api.deepseek.com';
    return {
      apiKey,
      baseUrl: (process.env.AI_BASE_URL ?? defaultBase).replace(/\/$/, ''),
      model:
        process.env.AI_MODEL ??
        process.env.OPENAI_MODEL ??
        (defaultBase.includes('deepseek') ? 'deepseek-chat' : 'gpt-4o-mini'),
      enabled: Boolean(apiKey),
    };
  })(),
  isProduction: process.env.NODE_ENV === 'production',
};
