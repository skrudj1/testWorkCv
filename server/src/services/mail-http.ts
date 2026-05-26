interface OutboundEmail {
  from: string;
  to: string | string[];
  cc?: string | string[];
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

function normalizeRecipients(value: string | string[]): string[] {
  return Array.isArray(value) ? value : [value];
}

export async function sendResendEmail(
  apiKey: string,
  message: OutboundEmail,
): Promise<void> {
  const body: Record<string, unknown> = {
    from: message.from,
    to: normalizeRecipients(message.to),
    subject: message.subject,
    html: message.html,
    text: message.text,
  };

  if (message.cc) {
    body.cc = normalizeRecipients(message.cc);
  }
  if (message.replyTo) {
    body.reply_to = message.replyTo;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Resend API ${res.status}: ${detail}`);
  }
}

export async function verifyResendConnection(apiKey: string): Promise<boolean> {
  const res = await fetch('https://api.resend.com/domains', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  return res.ok;
}

export async function sendSendGridEmail(
  apiKey: string,
  message: OutboundEmail,
): Promise<void> {
  const toList = normalizeRecipients(message.to).map((email) => ({ email }));
  const ccList = message.cc
    ? normalizeRecipients(message.cc).map((email) => ({ email }))
    : undefined;

  const personalization: Record<string, unknown> = { to: toList };
  if (ccList?.length) {
    personalization.cc = ccList;
  }

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [personalization],
      from: parseFromAddress(message.from),
      reply_to: message.replyTo ? { email: message.replyTo } : undefined,
      subject: message.subject,
      content: [
        { type: 'text/plain', value: message.text },
        { type: 'text/html', value: message.html },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`SendGrid API ${res.status}: ${detail}`);
  }
}

export async function verifySendGridConnection(apiKey: string): Promise<boolean> {
  const res = await fetch('https://api.sendgrid.com/v3/scopes', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  return res.ok;
}

/** `"Name" <email@host>` → SendGrid { email, name? } */
function parseFromAddress(from: string): { email: string; name?: string } {
  const match = from.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return { name: match[1]!.replace(/^["']|["']$/g, '').trim(), email: match[2]!.trim() };
  }
  return { email: from.trim() };
}

interface Web3FormsContact {
  name: string;
  phone: string;
  email: string;
  comment: string;
}

/** https://web3forms.com — регистрация только по email, работает с Render (HTTPS) */
export async function sendWeb3FormsContact(
  accessKey: string,
  data: Web3FormsContact,
): Promise<void> {
  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      access_key: accessKey,
      subject: `[Портфолио] Сообщение от ${data.name}`,
      from_name: 'Портфолио — Алексей Володько',
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.comment,
    }),
  });

  const payload = (await res.json()) as { success?: boolean; message?: string };
  if (!res.ok || !payload.success) {
    throw new Error(`Web3Forms: ${payload.message ?? res.status}`);
  }
}

export function verifyWeb3FormsConnection(accessKey: string): boolean {
  return accessKey.trim().length >= 8;
}
