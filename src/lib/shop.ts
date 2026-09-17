// Реальные контакты сервисного центра RESET (Астана).
// Меняешь здесь — меняется на всём сайте.
export const SHOP = {
  name: 'RESET',
  tagline: 'Service Center · Astana',
  phone: '+7 700 090 2221',
  phoneRaw: '+77000902221',
  whatsapp: 'https://wa.me/77000902221',
  telegram: 'https://t.me/+77000902221',
  instagram: 'https://www.instagram.com/reset_service_ast/',
  email: 'reset.service.ast@gmail.com',
  map: 'https://2gis.kz/astana/firm/70000001044235021',
  rating: '4.8',
  reviews: '1267',
} as const;

// Марки, технику которых чиним. Список берётся отсюда — добавил строку,
// на сайте появилось само.
//
// Это НЕ партнёры и не авторизация. Мы просто чиним эти устройства, как
// мастерская чинит любую машину без разрешения автозавода. Писать
// «официальный сервис Apple» нельзя: это неправда и прямой повод для
// претензии правообладателя.
//
// Добавляй только то, что действительно берёте в ремонт: список на сайте —
// это обещание, которое придётся выполнять.
export const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Redmi', 'Huawei'] as const;
