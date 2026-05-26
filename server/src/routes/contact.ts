import { Router } from 'express';
import { ZodError } from 'zod';
import { contactSchema } from '../validation.js';
import { sendContactEmails } from '../services/mail.js';

export const contactRouter = Router();

contactRouter.post('/', async (req, res) => {
  try {
    const data = contactSchema.parse(req.body);
    await sendContactEmails(data);

    res.status(200).json({
      ok: true,
      message: 'Сообщение отправлено. Копия придёт на ваш email.',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        ok: false,
        message: 'Проверьте поля формы',
        errors: error.flatten().fieldErrors,
      });
      return;
    }

    console.error('[contact]', error);

    const smtpMessage =
      error instanceof Error && 'response' in error
        ? String((error as { response?: string }).response ?? '')
        : '';
    const authFailed =
      smtpMessage.includes('authentication failed') ||
      smtpMessage.includes('access rights') ||
      (error instanceof Error &&
        ('code' in error) &&
        (error as { code?: string }).code === 'EAUTH');

    if (authFailed) {
      res.status(500).json({
        ok: false,
        message:
          'Ошибка входа в SMTP (Яндекс): включите «Почтовые программы» в настройках почты и создайте пароль приложения именно для «Почта».',
      });
      return;
    }

    const rateLimited =
      smtpMessage.includes('Too many emails') ||
      (error instanceof Error && error.message.includes('Too many emails'));

    if (rateLimited) {
      res.status(429).json({
        ok: false,
        message:
          'Слишком частые отправки. Подождите 5–10 секунд и попробуйте снова.',
      });
      return;
    }

    const errCode =
      error instanceof Error && 'code' in error
        ? String((error as { code?: string }).code)
        : '';
    const networkError = ['ECONNREFUSED', 'ETIMEDOUT', 'ESOCKET', 'ENOTFOUND'].includes(
      errCode,
    );

    if (networkError) {
      res.status(500).json({
        ok: false,
        message:
          'Почтовый сервер недоступен с хостинга (таймаут). Яндекс SMTP с Render не работает — укажите Brevo (smtp-relay.brevo.com) в Environment.',
      });
      return;
    }

    res.status(500).json({
      ok: false,
      message:
        'Не удалось отправить сообщение. Попробуйте позже или напишите на alexvolodko1504@mail.ru',
    });
  }
});
