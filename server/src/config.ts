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

export const config = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  mail: {
    from: required('MAIL_FROM', '"Portfolio" <noreply@localhost>'),
    owner: required('MAIL_OWNER', 'volodko065@mail.ru'),
    smtp: {
      host: required('SMTP_HOST', 'smtp.mailtrap.io'),
      port: Number(process.env.SMTP_PORT ?? 2525),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: required('SMTP_USER', 'user'),
        pass: required('SMTP_PASS', 'pass'),
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
