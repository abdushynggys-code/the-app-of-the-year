// Письма мастерской: новая заявка и запрос доступа в админку.
//
// Отправляем через саму почту мастерской (Gmail), а не через сторонний сервис.
// Так письмо приходит с настоящего адреса, и не нужен свой домен — бесплатные
// почтовые сервисы без домена умеют писать только на твой же адрес.
//
// Запуск (один раз):
//   1) Впиши в локальный .env три строки (без префикса VITE_ — они серверные):
//        GMAIL_USER=адрес_почты@gmail.com
//        GMAIL_APP_PASSWORD=пароль_приложения_из_google
//        NOTIFY_TO=кому@gmail.com,ещё_кому@gmail.com
//   2) Загрузи секреты:  npm run mail:secret
//   3) Задеплой:         npm run mail:deploy
//
// GMAIL_APP_PASSWORD — это НЕ пароль от почты. Это отдельный код из
// myaccount.google.com/apppasswords, его можно отозвать, не трогая аккаунт.
// В git он не попадает никогда: .env в .gitignore.

import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

const GMAIL_USER = Deno.env.get('GMAIL_USER');
const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD');
const NOTIFY_TO = Deno.env.get('NOTIFY_TO') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

// Код заявки — единственное, что приходит с фронта в текст письма.
// Проверяем формат: иначе туда можно было бы вписать что угодно.
function safeCode(value: unknown): string {
  return typeof value === 'string' && /^RS-\d{4,8}$/.test(value) ? value : '';
}

function letter(kind: string, who: string, code: string) {
  if (kind === 'request') {
    return {
      subject: `Новая заявка на ремонт${code ? `: ${code}` : ''}`,
      text: [
        `Пришла новая заявка${code ? ` — ${code}` : ''}.`,
        `Оставил: ${who}`,
        '',
        'Открыть в админке: /admin',
      ].join('\n'),
    };
  }

  return {
    subject: `Запрос доступа в админку: ${who}`,
    text: [
      `${who} просит доступ в админку RESET.`,
      '',
      'Одобрить или отклонить — в админке, раздел «Доступ».',
      'Если вы этого человека не знаете, просто откажите.',
    ].join('\n'),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Используй POST-запрос' }, 405);

  try {
    const to = NOTIFY_TO.split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD || to.length === 0) {
      console.error('mail secrets are not configured');
      return json({ error: 'Почта пока не настроена' }, 503);
    }

    // Проверяем, кто зовёт. Без этого любой мог бы слать письма пачками.
    const auth = req.headers.get('Authorization') ?? '';
    if (!auth.startsWith('Bearer ')) return json({ error: 'Нужен вход' }, 401);

    const who = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: auth, apikey: SUPABASE_ANON_KEY ?? '' },
    });
    if (!who.ok) return json({ error: 'Нужен вход' }, 401);

    const user = (await who.json()) as { email?: string };
    const from = typeof user.email === 'string' ? user.email : '';
    if (!from) return json({ error: 'Нужен вход' }, 401);

    const body = (await req.json().catch(() => ({}))) as { kind?: unknown; code?: unknown };
    const kind = body.kind === 'request' ? 'request' : 'access';
    const mail = letter(kind, from, safeCode(body.code));

    const client = new SMTPClient({
      connection: {
        hostname: 'smtp.gmail.com',
        port: 465,
        tls: true,
        auth: { username: GMAIL_USER, password: GMAIL_APP_PASSWORD },
      },
    });

    await client.send({
      from: `RESET <${GMAIL_USER}>`,
      to,
      subject: mail.subject,
      content: mail.text,
    });
    await client.close();

    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ error: 'Письмо не ушло' }, 500);
  }
});
