import { useEffect, useState } from 'react';
import { Logo } from './Logo';

type LoadingScreenProps = {
  onFinish: () => void;
};

const DISPLAY_TIME_MS = 900;
const EXIT_TIME_MS = 350;

export function LoadingScreen({ onFinish }: LoadingScreenProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setIsLeaving(true), DISPLAY_TIME_MS);
    const finishTimer = window.setTimeout(onFinish, DISPLAY_TIME_MS + EXIT_TIME_MS);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`loading-screen${isLeaving ? ' loading-screen--leaving' : ''}`}
      role="status"
      aria-label="Loading RESET Repair Shop"
    >
      <div className="loading-screen__brand">
        <span className="loading-screen__logo">
          <Logo />
        </span>
        <div>
          <p className="loading-screen__name">RESET</p>
          <p className="loading-screen__tagline">Repair Shop</p>
        </div>
      </div>
      <span className="loading-screen__track" aria-hidden="true">
        <span className="loading-screen__progress" />
      </span>
    </div>
  );
}
