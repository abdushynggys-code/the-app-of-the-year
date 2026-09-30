import { useLang } from '../lib/i18n';
import { WORK_SLOTS, type SiteImages } from '../lib/siteImages';

// Полоса с фотографиями настоящих ремонтов. Единственное место на сайте,
// где видно саму работу, а не слова о ней, — поэтому рисунков-заглушек
// здесь нет: нарисованный «ремонт» доверия не прибавляет.
//
// Картинки приходят сверху: главная и так их грузит для обложки и промо,
// и второй запрос за тем же списком был бы лишним. Ни одной фотографии —
// полосы нет.
export function WorkStrip({ images }: { images: SiteImages }) {
  const { t } = useLang();
  const shots = WORK_SLOTS.filter((slot) => images[slot]);

  if (shots.length === 0) return null;

  return (
    <section className="band band--tight band--soft">
      <div className="wrap">
        <div className="band__head" data-reveal>
          <p className="eyebrow">{t.workEyebrow}</p>
          <h2>{t.workTitle}</h2>
          <p>{t.workText}</p>
        </div>

        <ul className="works" data-reveal="stagger">
          {shots.map((slot) => (
            <li key={slot} className="work">
              {/* alt пустой намеренно: подписать чужое устройство можно
                  только выдумкой, а выдумка в alt — это ложь для того,
                  кто слушает страницу, а не смотрит. Полоса уже описана
                  заголовком над ней. */}
              <img src={images[slot]} alt="" loading="lazy" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
