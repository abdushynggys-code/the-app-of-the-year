// Письмо владельцу, когда кто-то просит доступ в админку.
//
// На сайте владелец и так видит счётчик в разделе «Доступ», но заходить туда
// каждый день никто не будет. Письмо приходит само.
//
// Запуск (один раз):
//   1) Заведи бесплатный ключ на resend.com и положи в .env строку
//      RESEND_API_KEY=...   (без префикса VITE_ — ключ серверный)
//   2) Загрузи секрет:  npx supabase secrets set --env-file .env
//   3) Задеплой:        npx supabase functions deploy notify-access

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

// Кому писать. Это почта мастерской из src/lib/shop.ts.
const OWNER_EMAIL = 'reset.service.ast@gmail.com';
// Пока свой домен не подключён, Resend разрешает слать только с этого адреса
// и только на свою же почту. Подключишь домен — поменяй здесь.
const FROM = 'RESET <onboarding@resend.dev>';

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Используй POST-запрос' }, 405);

  try {
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return json({ error: 'Почта пока не настроена' }, 503);
    }

    // Проверяем, кто зовёт. Без этого любой мог бы дёргать функцию
    // и слать владельцу письма пачками.
    const auth = req.headers.get('Authorization') ?? '';
    if (!auth.startsWith('Bearer ')) return json({ error: 'Нужен вход' }, 401);

    const who = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: auth, apikey: SUPABASE_ANON_KEY ?? '' },
    });
    if (!who.ok) return json({ error: 'Нужен вход' }, 401);

    const user = (await who.json()) as { email?: string };
    const email = typeof user.email === 'string' ? user.email : '';
    if (!email) return json({ error: 'Нужен вход' }, 401);

    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [OWNER_EMAIL],
        subject: `Запрос доступа в админку: ${email}`,
        text: [
          `${email} просит доступ в админку RESET.`,
          '',
          'Одобрить или отклонить — на сайте, раздел «Доступ»:',
          'https://reset-service.vercel.app/admin',
          '',
          'Если вы этого человека не знаете — просто откажите.',
        ].join('\n'),
      }),
    });

    if (!sent.ok) {
      console.error('resend failed', sent.status, await sent.text());
      return json({ error: 'Письмо не ушло' }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ error: 'Что-то пошло не так' }, 500);
  }
});
