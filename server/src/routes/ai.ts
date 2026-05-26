import { Router } from 'express';
import { ZodError } from 'zod';
import { improveTextSchema } from '../validation.js';
import { improveText } from '../services/openai.js';
import { config } from '../config.js';

export const aiRouter = Router();

aiRouter.get('/status', (_req, res) => {
  res.json({
    enabled: config.ai.enabled,
    model: config.ai.enabled ? config.ai.model : null,
    provider: config.ai.baseUrl.includes('openrouter')
      ? 'openrouter'
      : config.ai.baseUrl.includes('deepseek')
        ? 'deepseek'
        : 'openai',
  });
});

aiRouter.post('/improve-text', async (req, res) => {
  if (!config.ai.enabled) {
    res.status(503).json({
      ok: false,
      message: 'AI-помощник недоступен: не задан AI_API_KEY на сервере',
    });
    return;
  }

  try {
    const { text, context } = improveTextSchema.parse(req.body);
    const result = await improveText(text, context);

    res.json({
      ok: true,
      improved: result.improved,
      model: result.model,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        ok: false,
        message: 'Некорректные данные',
        errors: error.flatten().fieldErrors,
      });
      return;
    }

    console.error('[ai]', error);

    if (error instanceof Error && error.message.startsWith('AI_BALANCE')) {
      res.status(402).json({
        ok: false,
        message:
          'Недостаточно средств у AI-провайдера. Пополните баланс (OpenRouter Credits) или выберите free-модель.',
      });
      return;
    }

    res.status(502).json({
      ok: false,
      message: 'Не удалось улучшить текст. Попробуйте ещё раз или отправьте как есть.',
    });
  }
});
