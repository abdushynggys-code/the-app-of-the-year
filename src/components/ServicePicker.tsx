import { Link } from 'wouter';
import { useLang } from '../lib/i18n';
import { CUSTOMER_COPY } from '../lib/customerCopy';
import { Icon } from './Art';

export function ServicePicker() {
  const { t, lang } = useLang();
  const copy = CUSTOMER_COPY[lang];
  return (
    <section className="band service-picker" id="services">
      <div className="wrap">
        <div className="section-heading" data-reveal>
          <div><p className="eyebrow">{copy.servicesLabel}</p><h2>{t.servicesTitle}</h2></div>
          <p>{t.servicesText}</p>
        </div>
        <div className="service-picker__grid" data-reveal="stagger">
          {t.services.map((service, index) => (
            <Link key={service.icon} href={`/request?${index < 3 ? 'device' : 'problem'}=${encodeURIComponent(service.t)}`} className="service-choice">
              <div className="service-choice__top"><span className="service__icon"><Icon name={service.icon} /></span><span className="service-choice__number">{String(index + 1).padStart(2, '0')}</span></div>
              <h3>{service.t}</h3><p>{service.d}</p>
              <span className="service-choice__cta">{copy.serviceCta}<span aria-hidden="true">↗</span></span>
            </Link>
          ))}
        </div>
        <div className="popular-repairs"><p>{t.chipsTitle}</p><div className="chips">{t.chips.map(chip => <Link key={chip} className="chip" href={`/request?problem=${encodeURIComponent(chip)}`}>{chip}<span aria-hidden="true"> ↗</span></Link>)}</div></div>
      </div>
    </section>
  );
}
