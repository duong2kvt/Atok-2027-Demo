import { motion } from 'motion/react';
import { useEffect } from 'react';
import atokSymbol from '../assets/atok-symbol.svg';
import { DAILY_REWARD_CONFIG as C } from '../features/daily-reward/config';
import { distanceReward, nextResetAt } from '../features/daily-reward/engine';
import { useDailyReward, type Preset } from '../features/daily-reward/store';
import { formatAtok, formatClock, formatDateTime, formatDuration, formatKm } from '../lib/format';

type StepStatus = 'done' | 'ready' | 'waiting' | 'locked';

export function DemoPanel() {
  const d = useDailyReward();
  const { now, state, phase } = d;
  const n = state.checkIns.length;

  // Keyboard shortcuts for presenting: N = skip wait, D = +1 km, R = reset
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey) return;
      const k = e.key.toLowerCase();
      if (k === 'n') d.skipWait();
      if (k === 'd') d.addDistance(1);
      if (k === 'r') d.reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [d]);

  const steps: { title: string; reward: string; status: StepStatus; note: string }[] = [0, 1, 2].map((i) => {
    const done = n > i;
    const isCurrent = n === i;
    let status: StepStatus = done ? 'done' : 'locked';
    let note = done ? `Đã nhận +${formatAtok(state.checkIns[i].amount)} ATOK` : 'Chưa mở';
    if (isCurrent && phase.kind === 'ready') {
      status = 'ready';
      note = 'Sẵn sàng – bấm Check-in trên app';
    } else if (isCurrent && phase.kind === 'cooldown') {
      status = 'waiting';
      note = `Mở sau ${formatDuration(phase.unlockAt - now)}`;
    } else if (isCurrent && phase.kind === 'distance') {
      status = 'waiting';
      note = `Đã đi ${formatKm(state.distanceKm)} / ${C.distanceTiers[0].km} km`;
    }
    const meta = [
      { title: '1st check-in · Avatar bonus', reward: `${formatAtok(C.rewards.first)} ATOK` },
      { title: '2nd check-in · Basic daily reward', reward: `${formatAtok(C.rewards.second)} ATOK` },
      { title: '3rd check-in · Distance bonus', reward: '1% / 2% / 3%' },
    ][i];
    return { ...meta, status, note };
  });

  let skipLabel = 'Không có thời gian chờ';
  let skipHint = 'Check-in đang mở trên app.';
  let canSkip = false;
  if (phase.kind === 'cooldown') {
    skipLabel = 'Bỏ qua thời gian chờ 4 tiếng';
    skipHint = `Tua nhanh ${formatDuration(phase.unlockAt - now)} tới lần check-in tiếp theo.`;
    canSkip = true;
  } else if (phase.kind === 'distance') {
    skipHint = 'Lần 3 không cần chờ – mở ngay khi đi đủ 4 km. Dùng mô phỏng di chuyển bên dưới.';
  } else if (phase.kind === 'done') {
    skipLabel = 'Sang ngày mới (07:00)';
    skipHint = `Đã nhận đủ 3 lần. Daily reward reset sau ${formatDuration(phase.resetAt - now)}.`;
    canSkip = true;
  }

  const distanceActive = n === 2;

  return (
    <aside className="panel" aria-label="Demo controls">
      <header className="panel__head">
        <img src={atokSymbol} width={36} height={36} alt="" />
        <div>
          <p className="panel__eyebrow">Atok App 2027 · Feature demo</p>
          <h1>Daily reward</h1>
        </div>
      </header>

      <div className="panel__clock">
        <div>
          <span className="panel__label">Giờ giả lập</span>
          <strong>{formatDateTime(now)}</strong>
        </div>
        <div>
          <span className="panel__label">Reset lúc 07:00 sau</span>
          <strong>{formatClock(nextResetAt(state) - now)}</strong>
        </div>
      </div>

      <section className="panel__section">
        <h2>Tiến trình trong ngày</h2>
        <ol className="steps">
          {steps.map((s, i) => (
            <li key={i} className={`step step--${s.status}`}>
              <span className="step__dot">{s.status === 'done' ? '✓' : i + 1}</span>
              <div className="step__text">
                <p className="step__title">
                  {s.title}
                  <span className="step__reward">{s.reward}</span>
                </p>
                <p className="step__note">{s.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel__section">
        <h2>Điều khiển demo</h2>
        <motion.button
          className="panel-btn panel-btn--primary"
          disabled={!canSkip}
          onClick={d.skipWait}
          whileTap={canSkip ? { scale: 0.97 } : undefined}
        >
          <span className="panel-btn__icon">⏩</span>
          {skipLabel}
          <kbd>N</kbd>
        </motion.button>
        <p className="panel__hint">{skipHint}</p>

        <div className={`walk ${distanceActive ? '' : 'is-disabled'}`}>
          <div className="walk__head">
            <span className="panel__label">Mô phỏng di chuyển (sau lần 2)</span>
            <strong>{formatKm(state.distanceKm)} km</strong>
          </div>
          <div className="walk__meter">
            {C.distanceTiers.map((t) => (
              <span key={t.km} className={state.distanceKm >= t.km ? 'is-on' : ''}>
                {t.km} km · {t.percent}% = {formatAtok(distanceReward(t.km))}
              </span>
            ))}
          </div>
          <div className="walk__actions">
            <button className="panel-btn" disabled={!distanceActive} onClick={() => d.addDistance(1)}>
              +1 km <kbd>D</kbd>
            </button>
            <button className="panel-btn" disabled={!distanceActive} onClick={() => d.addDistance(4)}>
              +4 km
            </button>
            <button
              className={`panel-btn ${d.autoWalk ? 'is-on' : ''}`}
              disabled={!distanceActive}
              onClick={() => d.setAutoWalk(!d.autoWalk)}
            >
              {d.autoWalk ? '⏸ Dừng' : '🏃 Tự động đi'}
            </button>
          </div>
        </div>
      </section>

      <section className="panel__section">
        <h2>Nhảy nhanh tới trạng thái</h2>
        <div className="chips">
          {(
            [
              ['first', '1st check-in'],
              ['second', '2nd check-in'],
              ['third', '3rd check-in'],
              ['done', 'Hoàn thành'],
            ] as [Preset, string][]
          ).map(([p, label]) => (
            <button key={p} className="chip" onClick={() => d.jumpTo(p)}>
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel__section">
        <h2>Logic (theo note Figma)</h2>
        <ul className="rules">
          <li>Daily reward bắt đầu lúc 07:00 và reset lúc 07:00 sáng hôm sau.</li>
          <li>3 lần check-in mỗi ngày. Sau lần 1 phải đợi 4 tiếng mới tới lần 2.</li>
          <li>Lần 3 không cần chờ 4 tiếng – mở ngay khi đi đủ 4 km sau lần 2: 4 km = 1%, 8 km = 2%, 12 km = 3%.</li>
          <li>Nút Bonus mở bottom sheet tương ứng với lần check-in hiện tại.</li>
        </ul>
      </section>


      <button className="panel__reset" onClick={d.reset}>
        ↺ Reset demo <kbd>R</kbd>
      </button>
    </aside>
  );
}
