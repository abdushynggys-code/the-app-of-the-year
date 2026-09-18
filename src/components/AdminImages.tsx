import { useRef, useState } from 'react';
import { useLang } from '../lib/i18n';
import { SLOTS, clearSlot, uploadSlot, type SiteImages, type Slot } from '../lib/siteImages';

type Props = {
  images: SiteImages;
  reload: () => void;
};

// Раздел «Картинки»: три места на сайте, куда владелец ставит свои фотографии
// вместо нарисованных сцен. Пока слот пустой — на сайте остаётся рисунок,
// поэтому загружать можно по одной и не спеша.
export function AdminImages({ images, reload }: Props) {
  const { t } = useLang();
  const [busy, setBusy] = useState<Slot | ''>('');
  const [error, setError] = useState('');
  // Одно скрытое поле выбора файла на весь раздел: какой слот меняем —
  // помним отдельно. Три отдельных поля в разметке ничего бы не дали.
  const fileInput = useRef<HTMLInputElement>(null);
  const target = useRef<Slot | null>(null);

  function pick(slot: Slot) {
    target.current = slot;
    fileInput.current?.click();
  }

  async function onPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const slot = target.current;
    // Значение сбрасываем сразу: без этого второй выбор того же файла
    // не вызовет событие, и кнопка будет выглядеть сломанной.
    e.target.value = '';
    if (!file || !slot) return;

    setBusy(slot);
    setError('');
    const failed = await uploadSlot(slot, file);
    setBusy('');
    if (failed) setError(failed);
    else reload();
  }

  async function drop(slot: Slot) {
    if (!confirm(t.admin.imageClearAsk)) return;
    setBusy(slot);
    const failed = await clearSlot(slot);
    setBusy('');
    if (failed) setError(failed);
    else reload();
  }

  return (
    <div className="block">
      <span className="block__label">{t.admin.tabImages}</span>
      <p className="form__hint" style={{ marginBottom: 24 }}>
        {t.admin.imagesHint}
      </p>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        hidden
        onChange={onPicked}
      />

      <div className="slots">
        {SLOTS.map((slot) => (
          <article key={slot} className="slot">
            <div className="slot__frame">
              {images[slot] ? (
                <img src={images[slot]} alt="" />
              ) : (
                <span className="slot__empty">{t.admin.imageEmpty}</span>
              )}
            </div>
            <h3 className="slot__name">{t.admin.slots[slot]}</h3>
            <p className="slot__where">{t.admin.slotWhere[slot]}</p>
            <div className="btn-row">
              <button
                className="btn btn--primary"
                type="button"
                disabled={busy === slot}
                onClick={() => pick(slot)}
              >
                {busy === slot ? t.admin.photoUploading : t.admin.imageSet}
              </button>
              {images[slot] && (
                <button
                  className="btn btn--secondary"
                  type="button"
                  disabled={busy === slot}
                  onClick={() => drop(slot)}
                >
                  {t.admin.imageClear}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {error && <p className="message message--error">{t.admin.imageNoBucket} ({error})</p>}
    </div>
  );
}
