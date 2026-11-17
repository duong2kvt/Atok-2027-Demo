import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DAILY_REWARD_CONFIG as C, type BonusKind } from './config';
import {
  createDay,
  dayStartFor,
  nextResetAt,
  normalize,
  phaseOf,
  round4,
  upcomingReward,
  type DailyRewardState,
  type Phase,
} from './engine';
import { formatAtok, formatKm } from '../../lib/format';

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'atok.daily-reward.demo.v1';

type Persisted = { offsetMs: number; state: DailyRewardState; log: LogEntry[] };

function load(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Persisted) : null;
  } catch {
    return null;
  }
}

function save(p: Persisted) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable (private mode / file://) – demo still works in memory */
  }
}

/** Simulated clock offset so the demo always opens on "today, 07:00:00". */
function initialOffset(): number {
  const real = Date.now();
  const d = new Date(real);
  d.setHours(C.dayStartHour, 0, 0, 0);
  return d.getTime() - real;
}

function freshPersisted(): Persisted {
  const offsetMs = initialOffset();
  return { offsetMs, state: createDay(Date.now() + offsetMs, C.initialBalance), log: [] };
}

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Screen = 'home' | 'reward';
export type LogEntry = { at: number; text: string };
export type Preset = 'first' | 'second' | 'third' | 'done';

type Ctx = {
  now: number;
  state: DailyRewardState;
  phase: Phase;
  upcoming: number;
  screen: Screen;
  pendingReward: number;
  sheet: BonusKind | null;
  toast: string | null;
  balanceBump: number;
  autoWalk: boolean;
  log: LogEntry[];
  checkIn: () => void;
  collect: () => void;
  openSheet: (k: BonusKind) => void;
  closeSheet: () => void;
  showToast: (t: string) => void;
  // demo controls
  skipWait: () => void;
  skipToNextDay: () => void;
  addDistance: (km: number) => void;
  setAutoWalk: (v: boolean) => void;
  jumpTo: (p: Preset) => void;
  reset: () => void;
};

const DailyRewardContext = createContext<Ctx | null>(null);

export function useDailyReward() {
  const ctx = useContext(DailyRewardContext);
  if (!ctx) throw new Error('useDailyReward must be used inside <DailyRewardProvider>');
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function DailyRewardProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<Persisted>(() => load() ?? freshPersisted());
  const [realNow, setRealNow] = useState(() => Date.now());
  const [screen, setScreen] = useState<Screen>('home');
  const [pendingReward, setPendingReward] = useState(0);
  const [sheet, setSheet] = useState<BonusKind | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [balanceBump, setBalanceBump] = useState(0);
  const [autoWalk, setAutoWalk] = useState(false);

  const now = realNow + persisted.offsetMs;
  const state = useMemo(() => normalize(persisted.state, now), [persisted.state, now]);
  const phase = phaseOf(state, now);
  const upcoming = upcomingReward(state);

  // Tick the clock.
  useEffect(() => {
    const id = window.setInterval(() => setRealNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  // Persist the day roll-over and every change.
  useEffect(() => {
    if (state !== persisted.state) setPersisted((p) => ({ ...p, state }));
  }, [state, persisted.state]);
  useEffect(() => save(persisted), [persisted]);

  const nowRef = useRef(now);
  nowRef.current = now;

  const update = useCallback(
    (fn: (p: Persisted, now: number) => Persisted, logText?: string) =>
      setPersisted((p) => {
        const next = fn({ ...p, state: normalize(p.state, nowRef.current) }, nowRef.current);
        const at = Date.now() + next.offsetMs;
        return logText ? { ...next, log: [{ at, text: logText }, ...next.log].slice(0, 40) } : next;
      }),
    [],
  );

  const toastTimer = useRef<number>();
  const showToast = useCallback((t: string) => {
    setToast(t);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  /* ---------------- user actions ---------------- */

  const checkIn = useCallback(() => {
    const p = phaseOf(state, now);
    if (p.kind !== 'ready') return;
    const amount = upcomingReward(state);
    const label = ['1st', '2nd', '3rd'][p.index];
    update(
      (pp, t) => ({ ...pp, state: { ...pp.state, checkIns: [...pp.state.checkIns, { at: t, amount }] } }),
      `${label} check-in · +${formatAtok(amount)} ATOK`,
    );
    setPendingReward(amount);
    setSheet(null);
    setScreen('reward');
  }, [state, now, update]);

  const collect = useCallback(() => {
    const amount = pendingReward;
    update((pp) => ({ ...pp, state: { ...pp.state, balance: round4(pp.state.balance + amount) } }));
    setScreen('home');
    setBalanceBump((b) => b + 1);
  }, [pendingReward, update]);

  /* ---------------- demo controls ---------------- */

  const skipWait = useCallback(() => {
    const p = phaseOf(state, now);
    let target: number | null = null;
    if (p.kind === 'cooldown') target = p.unlockAt;
    else if (p.kind === 'done') target = p.resetAt;
    if (target === null) return;
    const delta = target - now + 50;
    update((pp) => ({ ...pp, offsetMs: pp.offsetMs + delta }), `⏩ Tua nhanh ${Math.round(delta / 60000)} phút`);
  }, [state, now, update]);

  const skipToNextDay = useCallback(() => {
    const delta = nextResetAt(state) - now + 50;
    update((pp) => ({ ...pp, offsetMs: pp.offsetMs + delta }), '⏩ Sang ngày mới (07:00) – reset daily reward');
  }, [state, now, update]);

  const addDistance = useCallback(
    (km: number) => {
      if (state.checkIns.length !== 2) return;
      update(
        (pp) => ({ ...pp, state: { ...pp.state, distanceKm: round4(Math.min(99, pp.state.distanceKm + km)) } }),
        km >= 1 ? `🏃 +${formatKm(km)} km` : undefined,
      );
    },
    [state.checkIns.length, update],
  );

  // Auto-walk simulation: 0.1 km every 250ms (≈ 0.4 km/s).
  useEffect(() => {
    if (!autoWalk) return;
    if (state.checkIns.length !== 2 || state.distanceKm >= 12.4) {
      setAutoWalk(false);
      return;
    }
    const id = window.setInterval(() => addDistance(0.1), 250);
    return () => window.clearInterval(id);
  }, [autoWalk, state.checkIns.length, state.distanceKm, addDistance]);

  const jumpTo = useCallback(
    (preset: Preset) => {
      setScreen('home');
      setSheet(null);
      setAutoWalk(false);
      update((pp, t) => {
        const ds = dayStartFor(t);
        const at = (h: number) => ds + h * 3_600_000;
        let checkIns: DailyRewardState['checkIns'] = [];
        let simNow = at(0);
        if (preset === 'second') {
          checkIns = [{ at: at(0), amount: C.rewards.first }];
          simNow = at(4);
        } else if (preset === 'third') {
          checkIns = [
            { at: at(0), amount: C.rewards.first },
            { at: at(11), amount: C.rewards.second },
          ];
          simNow = at(11);
        } else if (preset === 'done') {
          checkIns = [
            { at: at(0), amount: C.rewards.first },
            { at: at(11), amount: C.rewards.second },
            { at: at(13.5), amount: 0.0198 },
          ];
          simNow = at(13.5);
        }
        const offsetMs = simNow - Date.now();
        return { ...pp, offsetMs, state: { dayStart: ds, checkIns, distanceKm: preset === 'done' ? 4.2 : 0, balance: pp.state.balance } };
      }, `↪ Nhảy tới: ${{ first: '1st check-in', second: '2nd check-in', third: '3rd check-in', done: 'Hoàn thành ngày' }[preset]}`);
    },
    [update],
  );

  const reset = useCallback(() => {
    setScreen('home');
    setSheet(null);
    setAutoWalk(false);
    setPersisted(freshPersisted());
  }, []);

  const value: Ctx = {
    now,
    state,
    phase,
    upcoming,
    screen,
    pendingReward,
    sheet,
    toast,
    balanceBump,
    autoWalk,
    log: persisted.log,
    checkIn,
    collect,
    openSheet: setSheet,
    closeSheet: () => setSheet(null),
    showToast,
    skipWait,
    skipToNextDay,
    addDistance,
    setAutoWalk,
    jumpTo,
    reset,
  };

  return <DailyRewardContext.Provider value={value}>{children}</DailyRewardContext.Provider>;
}
