export type ApiErrorBody = {
  ok: false;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export type ContactPayload = {
  name: string;
  phone: string;
  email: string;
  comment: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[] | undefined>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError('Некорректный ответ сервера', response.status);
  }
}

export async function postContact(data: ContactPayload): Promise<{ message: string }> {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = await parseJson<{ ok: boolean; message: string } & ApiErrorBody>(response);

  if (!response.ok || !body.ok) {
    throw new ApiError(body.message ?? 'Ошибка отправки', response.status, body.errors);
  }

  return { message: body.message };
}

export async function improveCommentText(text: string): Promise<string> {
  const response = await fetch('/api/ai/improve-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, context: 'comment' }),
  });

  const body = await parseJson<{ ok: boolean; improved?: string; message: string }>(
    response,
  );

  if (!response.ok || !body.ok || !body.improved) {
    throw new ApiError(body.message ?? 'AI недоступен', response.status);
  }

  return body.improved;
}

export async function fetchAiStatus(): Promise<{ enabled: boolean; model: string | null }> {
  const response = await fetch('/api/ai/status');
  return parseJson(response);
}
