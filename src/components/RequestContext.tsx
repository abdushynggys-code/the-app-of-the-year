import { useLang } from '../lib/i18n';
import { CUSTOMER_COPY } from '../lib/customerCopy';
import { SHOP } from '../lib/shop';

export function RequestContext({ device, problem }: { device: string; problem: string }) {
  const { t, lang } = useLang();
  const copy = CUSTOMER_COPY[lang];
  const selection = [device.trim(), problem.trim()].filter(Boolean).join(' · ');
  const message = [t.formTitle, selection].filter(Boolean).join(': ');
  return (
    <aside className="request-context">
      <div className="request-context__next">
        {selection && <p className="request-context__selection"><span>{copy.selected}</span><b>{selection}</b></p>}
        <h2>{copy.nextTitle}</h2><p>{copy.nextText}</p>
      </div>
      <div className="request-context__direct">
        <h2>{copy.directTitle}</h2><p>{copy.directText}</p>
        <a className="textlink" href={`${SHOP.whatsapp}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">{t.writeUs} ↗</a>
      </div>
    </aside>
  );
}
