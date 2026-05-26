import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { contactRouter } from './routes/contact.js';
import { aiRouter } from './routes/ai.js';
import { verifyMailConnection } from './services/mail.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.isProduction ? config.clientOrigin : true,
    methods: ['GET', 'POST'],
  }),
);
app.use(express.json({ limit: '32kb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: 'Слишком много запросов. Подождите минуту.' },
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: config.nodeEnv });
});

app.use('/api/contact', contactRouter);
app.use('/api/ai', apiLimiter, aiRouter);
app.use('/api', apiLimiter);

if (config.isProduction) {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  const indexHtml = path.join(clientDist, 'index.html');

  app.use(express.static(clientDist));

  // Express 5 не поддержает app.get('*') — SPA fallback через middleware
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next();
      return;
    }
    if (req.path.startsWith('/api')) {
      next();
      return;
    }
    res.sendFile(indexHtml, (err) => {
      if (err) next(err);
    });
  });
}

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error('[unhandled]', err);
    res.status(500).json({ ok: false, message: 'Внутренняя ошибка сервера' });
  },
);

app.listen(config.port, async () => {
  const mailOk = await verifyMailConnection();
  console.log(`Server: http://localhost:${config.port}`);
  console.log(`SMTP: ${mailOk ? 'connected' : 'check credentials'}`);
  console.log(
    `AI: ${config.ai.enabled ? `${config.ai.model} (${config.ai.baseUrl})` : 'disabled'}`,
  );
});
