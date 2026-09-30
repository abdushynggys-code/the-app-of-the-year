import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useLang } from '../lib/i18n';
import { CUSTOMER_COPY } from '../lib/customerCopy';
import { SHOP } from '../lib/shop';
import { Icon } from './Art';
import { RepairPreview } from './RepairPreview';

export function RepairHero({ image }: { image?: string }) {
  const { t, lang } = useLang();
  const copy = CUSTOMER_COPY[lang];
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<'repair' | 'track'>('repair');
  const [device, setDevice] = useState('');
  const [problem, setProblem] = useState('');
  const [code, setCode] = useState('');

  function go(event: React.FormEvent) {
    event.preventDefault();
    if (tab === 'track') {
      if (code.trim()) navigate(`/track?code=${encodeURIComponent(code.trim().toUpperCase())}`);
      return;
    }
    const query = new URLSearchParams();
    if (device.trim()) query.set('device', device.trim());
    if (problem.trim()) query.set('problem', problem.trim());
    navigate(`/request${query.size ? `?${query}` : ''}`);
  }

  return (
    <section className="repair-hero">
      <div className="wrap">
        <div className="repair-hero__grid">
          <div className="repair-hero__body">
            <p className="eyebrow"><span className="status-dot" />{copy.eyebrow}</p>
            <h1>{copy.title}<span>{copy.accent}</span></h1>
            <p className="repair-hero__intro">{copy.intro}</p>
            <div className="btn-row">
              <Link href="/request" className="btn btn--primary btn--lg">{t.barRequest}<span aria-hidden="true">↗</span></Link>
              <a href="#services" className="btn btn--secondary btn--lg">{copy.explore}</a>
            </div>
            <div className="repair-hero__assurances">
              <span><Icon name="chip" />{t.trustFree}</span>
              <span><Icon name="lock" />{t.trustWarranty}</span>
            </div>
            <a className="hero-rating" href={SHOP.map} target="_blank" rel="noreferrer">
              <span className="hero-rating__stars" aria-hidden="true">★★★★★</span>
              <b>{SHOP.rating}</b><span>{t.trustRating} · {SHOP.reviews} {t.proofReviews}</span><span aria-hidden="true">↗</span>
            </a>
          </div>
          {image ? <div className="repair-hero__photo"><img src={image} alt={t.workTitle} fetchPriority="high" /></div> : <RepairPreview />}
        </div>
        <form className="booking-bar" onSubmit={go}>
          <div className="booking-bar__top">
            <div><h2>{copy.bookingTitle}</h2><p>{tab === 'repair' ? copy.bookingHint : copy.trackHint}</p></div>
            <div className="tabs" data-tab={tab} role="group" aria-label={copy.bookingTitle}>
              <span className="tabs__pill" aria-hidden="true" />
              <button type="button" aria-pressed={tab === 'repair'} className={tab === 'repair' ? 'is-active' : ''} onClick={() => setTab('repair')}>{t.cardTabRepair}</button>
              <button type="button" aria-pressed={tab === 'track'} className={tab === 'track' ? 'is-active' : ''} onClick={() => setTab('track')}>{t.cardTabTrack}</button>
            </div>
          </div>
          <div className={`booking-bar__fields ${tab === 'track' ? 'booking-bar__fields--track' : ''}`}>
            {tab === 'repair' ? <>
              <label className="booking-field"><span>{t.cardDevice}</span><input value={device} onChange={e => setDevice(e.target.value)} placeholder={t.cardDevicePh} maxLength={80} /></label>
              <label className="booking-field"><span>{t.cardProblem}</span><input value={problem} onChange={e => setProblem(e.target.value)} placeholder={t.cardProblemPh} maxLength={120} /></label>
            </> : <label className="booking-field"><span>{t.trackTitle}</span><input value={code} onChange={e => setCode(e.target.value)} placeholder={t.cardTrackPh} required pattern=".*\S.*" maxLength={12} autoCapitalize="characters" autoComplete="off" spellCheck={false} /></label>}
            <button type="submit" className="btn btn--primary">{tab === 'repair' ? copy.continue : t.cardTrackGo}<span aria-hidden="true">↗</span></button>
          </div>
          <p className="booking-bar__note">{t.cardNote}</p>
        </form>
      </div>
    </section>
  );
}
