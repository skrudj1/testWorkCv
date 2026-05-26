import { config } from '../config.js';

type ImproveResult = {
  improved: string;
  model: string;
};

const SYSTEM_PROMPTS = {
  comment:
    'Ты помощник на сайте-портфолио разработчика. Перепиши текст сообщения пользователя: сделай его вежливым, грамотным и структурированным, сохрани смысл. Отвечай только улучшенным текстом на русском, без пояснений.',
  greeting:
    'Сгенерируй короткое вежливое приветствие для письма разработчику (1–2 предложения) на русском. Только текст приветствия.',
} as const;

export async function improveText(
  text: string,
  context: 'comment' | 'greeting' = 'comment',
): Promise<ImproveResult> {
  if (!config.ai.enabled) {
    throw new Error('AI_API_KEY не настроен на сервере');
  }

  const url = `${config.ai.baseUrl}/v1/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.ai.apiKey}`,
  };

  if (config.ai.baseUrl.includes('openrouter')) {
    headers['HTTP-Referer'] = config.clientOrigin;
    headers['X-Title'] = 'Alexey Volodko Portfolio';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.ai.model,
      temperature: 0.6,
      max_tokens: 500,
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS[context] },
        { role: 'user', content: text },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    if (
      response.status === 402 ||
      body.includes('Insufficient Balance') ||
      body.includes('insufficient credits')
    ) {
      throw new Error('AI_BALANCE: пополните баланс у провайдера AI');
    }
    throw new Error(`AI API error: ${response.status} ${body}`);
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const improved = json.choices?.[0]?.message?.content?.trim();
  if (!improved) {
    throw new Error('Пустой ответ от AI');
  }

  return { improved, model: config.ai.model };
}
