import { useLang, STEP_ORDER, type StepKey } from '../lib/i18n';

// Полоска для клиента: видно, сколько этапов ремонта уже пройдено.
// Заполняется сама, когда мастер отмечает галочки в админке.
export function RepairProgress({ steps }: { steps: StepKey[] }) {
  const { t } = useLang();
  const done = STEP_ORDER.filter((s) => steps.includes(s)).length;
  const pct = Math.round((done / STEP_ORDER.length) * 100);

  return (
    <div className="progress">
      <div className="progress__head">
        <span>{t.trackProgress}</span>
        <b>{pct}%</b>
      </div>
      <div className="progress__track">
        <i style={{ width: `${pct}%` }} />
      </div>
      <ol className="progress__steps">
        {STEP_ORDER.map((s, i) => (
          <li key={s} className={steps.includes(s) ? 'is-done' : i === done ? 'is-next' : ''}>
            {t.repairSteps[s]}
          </li>
        ))}
      </ol>
    </div>
  );
}
