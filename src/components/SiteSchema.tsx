import { useEffect } from 'react';
import { SHOP } from '../lib/shop';

// Карточка организации для поисковиков. Google читает такой блок и может
// показать в выдаче адрес, часы работы и кнопку «позвонить» — для местной
// мастерской это самое дешёвое, что можно сделать для поиска.
//
// Данные берём из shop.ts, а не переписываем руками: иначе адрес на сайте
// и адрес в поиске однажды разъедутся.
//
// Оценку (4.8) сюда намеренно НЕ кладём. Google не любит, когда бизнес сам
// себе выставляет рейтинг в разметке, и за это можно получить санкцию.
// На странице оценка есть — со ссылкой на 2ГИС, где её может проверить любой.
function buildSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SHOP.name,
    description: SHOP.tagline,
    telephone: SHOP.phoneRaw,
    email: SHOP.email,
    url: window.location.origin,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ул. Динмухамед Конаев, 35/1',
      addressLocality: 'Астана',
      addressCountry: 'KZ',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '10:00',
      closes: '20:00',
    },
    // Ссылки на страницы, где этот же бизнес можно найти: так поисковик
    // понимает, что 2ГИС и Instagram — про нас, а не про кого-то другого.
    sameAs: [SHOP.map, SHOP.instagram],
  };
}

// Ничего не рисует — только кладёт блок в <head>.
export function SiteSchema() {
  useEffect(() => {
    const tag = document.createElement('script');
    tag.type = 'application/ld+json';
    tag.textContent = JSON.stringify(buildSchema());
    document.head.appendChild(tag);
    return () => tag.remove();
  }, []);

  return null;
}
