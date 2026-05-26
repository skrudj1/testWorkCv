import { ApiError, fetchAiStatus, improveCommentText, postContact } from '../api/client';

type FieldName = 'name' | 'phone' | 'email' | 'comment';

const fieldIds: Record<FieldName, string> = {
  name: 'name',
  phone: 'phone',
  email: 'email',
  comment: 'comment',
};

function getField(name: FieldName): HTMLInputElement | HTMLTextAreaElement | null {
  return document.getElementById(fieldIds[name]) as HTMLInputElement | HTMLTextAreaElement | null;
}

function setFieldError(name: FieldName, message: string): void {
  const errorEl = document.getElementById(`error-${name}`);
  const input = getField(name);
  if (errorEl) errorEl.textContent = message;
  if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function clearErrors(): void {
  (Object.keys(fieldIds) as FieldName[]).forEach((name) => setFieldError(name, ''));
}

function validateClient(): boolean {
  clearErrors();
  let valid = true;

  const name = getField('name')?.value.trim() ?? '';
  const phone = getField('phone')?.value.trim() ?? '';
  const email = getField('email')?.value.trim() ?? '';
  const comment = getField('comment')?.value.trim() ?? '';

  if (name.length < 2) {
    setFieldError('name', 'Минимум 2 символа');
    valid = false;
  }
  if (phone.length < 10 || !/^[\d\s+()-]+$/.test(phone)) {
    setFieldError('phone', 'Укажите корректный телефон');
    valid = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError('email', 'Некорректный email');
    valid = false;
  }
  if (comment.length < 10) {
    setFieldError('comment', 'Комментарий — минимум 10 символов');
    valid = false;
  }

  return valid;
}

function setFormStatus(type: 'idle' | 'loading' | 'success' | 'error', message = ''): void {
  const status = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement | null;
  if (!status) return;

  status.className = 'form__status';
  status.textContent = '';

  if (type === 'idle') return;

  status.classList.add(`form__status--${type}`);
  status.textContent = message;

  if (submitBtn) {
    submitBtn.disabled = type === 'loading';
    const label = submitBtn.querySelector('.btn__label');
    const spinner = submitBtn.querySelector('.btn__spinner');
    if (label instanceof HTMLElement) {
      label.hidden = type === 'loading';
    }
    if (spinner instanceof HTMLElement) {
      spinner.hidden = type !== 'loading';
    }
  }
}

function setAiLoading(loading: boolean): void {
  const btn = document.getElementById('ai-improve-btn') as HTMLButtonElement | null;
  if (!btn) return;
  btn.disabled = loading;
  const label = btn.querySelector('.btn__label');
  const spinner = btn.querySelector('.btn__spinner');
  if (label instanceof HTMLElement) label.hidden = loading;
  if (spinner instanceof HTMLElement) spinner.hidden = !loading;
}

export function initContactForm(): void {
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  const aiBtn = document.getElementById('ai-improve-btn');
  const aiHint = document.getElementById('ai-hint');

  if (!form) return;

  fetchAiStatus()
    .then((status) => {
      if (aiHint) {
        aiHint.textContent = status.enabled
          ? `AI доступен (${status.model}) — можно улучшить текст перед отправкой`
          : 'AI-помощник на демо отключён без OPENAI_API_KEY на сервере';
      }
    })
    .catch(() => {
      if (aiHint) aiHint.textContent = '';
    });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateClient()) {
      setFormStatus('error', 'Исправьте ошибки в форме');
      return;
    }

    setFormStatus('loading', 'Отправляем сообщение… (до 5 сек)');

    const payload = {
      name: getField('name')!.value.trim(),
      phone: getField('phone')!.value.trim(),
      email: getField('email')!.value.trim(),
      comment: getField('comment')!.value.trim(),
    };

    try {
      const result = await postContact(payload);
      setFormStatus('success', result.message);
      form.reset();
      clearErrors();
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        (Object.entries(error.errors) as [FieldName, string[] | undefined][]).forEach(
          ([field, messages]) => {
            if (messages?.[0]) setFieldError(field, messages[0]);
          },
        );
      }
      setFormStatus(
        'error',
        error instanceof ApiError ? error.message : 'Не удалось отправить. Попробуйте позже.',
      );
    }
  });

  aiBtn?.addEventListener('click', async () => {
    const commentField = getField('comment');
    const text = commentField?.value.trim() ?? '';

    if (text.length < 5) {
      setFieldError('comment', 'Введите хотя бы несколько слов для улучшения');
      return;
    }

    setFieldError('comment', '');
    setAiLoading(true);

    try {
      const improved = await improveCommentText(text);
      if (commentField) commentField.value = improved;
      setFormStatus('idle');
      if (aiHint) aiHint.textContent = 'Текст улучшен AI — проверьте перед отправкой';
    } catch (error) {
      setFormStatus(
        'error',
        error instanceof ApiError ? error.message : 'AI-помощник временно недоступен',
      );
    } finally {
      setAiLoading(false);
    }
  });
}
