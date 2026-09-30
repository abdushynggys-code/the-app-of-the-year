import { useEffect, useRef, useState } from 'react';
import { useLang } from '../lib/i18n';
import { CUSTOMER_COPY } from '../lib/customerCopy';

// An interactive illustration, not a customer repair or a promised result.
export function RepairPreview() {
  const { lang } = useLang();
  const copy = CUSTOMER_COPY[lang];
  const [repaired, setRepaired] = useState(true);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const preview = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (preview.current) observer.observe(preview.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="repair-preview" ref={preview} data-motion={paused || !visible ? 'paused' : 'playing'}>
      <div className="repair-preview__heading">
        <span className="repair-preview__annotation">RESET / 01<br />REPAIR. RECONNECT.</span>
        <button className="preview-motion" type="button" aria-pressed={paused} aria-label={copy.pauseMotion} onClick={() => setPaused(value => !value)}>
          <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>{paused ? copy.playMotion : copy.pauseMotion}
        </button>
      </div>
      <div className="repair-preview__stage" aria-hidden="true" data-repaired={repaired}>
        <div className="repair-preview__atmosphere"><i /><i /><i /></div>
        <div className="repair-preview__devices">
          <div className="repair-preview__float">
            <div className="device-back"><i /><i /><i /><span>R.</span></div>
            <div className="device-front">
              <div className="device-screen">
                <div className="device-island" />
                <span className="device-time">09:41</span>
                <div className="device-wallpaper" />
                <span className="device-word">hello<span>again.</span></span>
                <svg className="device-crack" viewBox="0 0 210 420" preserveAspectRatio="none">
                  <path d="M0 65 84 150 120 185 210 238M84 150 112 76 95 0M120 185 79 275 90 420M120 185 161 120 210 100M79 275 0 304M84 150 0 169M161 120 176 0M120 185 193 335 210 350M112 76 160 44M79 275 20 224" />
                </svg>
                <span className="device-home" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="repair-preview__status" aria-hidden="true"><span className="status-dot" />RESET CARE<span>{repaired ? copy.after : copy.before}</span></div>
      <div className="repair-preview__caption">
        <p>{copy.preview}</p>
        <div className="preview-switch" role="group" aria-label={copy.preview}>
          <button type="button" aria-pressed={!repaired} onClick={() => setRepaired(false)}>{copy.before}</button>
          <button type="button" aria-pressed={repaired} onClick={() => setRepaired(true)}>{copy.after}</button>
        </div>
      </div>
      <p className="repair-preview__hint">{copy.previewHint}</p>
    </div>
  );
}
