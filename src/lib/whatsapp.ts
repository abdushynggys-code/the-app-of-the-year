// Ссылка «написать клиенту в WhatsApp» с уже готовым текстом.
//
// Почему WhatsApp, а не письмо: в Астане его читают в тот же час, а письмо
// может пролежать сутки. Мастер нажимает кнопку, видит готовое сообщение
// и отправляет — печатать одно и то же по двадцать раз в день не нужно.

// Номер в базе лежит так, как его ввёл человек: «+7 700 090 2221»,
// «8 700 090 2221», «87000902221» — это всё один и тот же номер.
// WhatsApp принимает только цифры с кодом страны и без плюса.
export function waPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  // 8 700 … — местная запись того же номера, что и +7 700 …
  if (digits.length === 11 && digits.startsWith('8')) return `7${digits.slice(1)}`;
  // 700 … — записан без кода страны
  if (digits.length === 10) return `7${digits}`;
  return digits;
}

// Номер короче 11 цифр — это опечатка, ссылку лучше не показывать вовсе,
// чем отправить мастера в чат с несуществующим человеком.
export function canWhatsApp(raw: string): boolean {
  return waPhone(raw).length >= 11;
}

// Подставляет значения в шаблон из словаря: «Ваш {device} готов» → «Ваш iPhone готов».
export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => values[key] ?? '');
}

export function waLink(phone: string, text: string): string {
  return `https://wa.me/${waPhone(phone)}?text=${encodeURIComponent(text)}`;
}
