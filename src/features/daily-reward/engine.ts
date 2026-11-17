import { DAILY_REWARD_CONFIG as C, HOUR, type BonusKind } from './config';

export type CheckIn = { at: number; amount: number };

export type DailyRewardState = {
  /** Epoch ms of 07:00 that opened the current reward day. */
  dayStart: number;
  checkIns: CheckIn[];
  /** Km travelled since the 2nd check-in (only counted while waiting for the 3rd). */
  distanceKm: number;
  balance: number;
};

export type Phase =
  | { kind: 'ready'; index: 0 | 1 | 2 }
  | { kind: 'cooldown'; index: 1; unlockAt: number }
  | { kind: 'distance'; index: 2; unlockAt: number | null }
  | { kind: 'done'; resetAt: number };

/** 07:00 that opened the reward day containing `now`. */
export function dayStartFor(now: number): number {
  const d = new Date(now);
  d.setHours(C.dayStartHour, 0, 0, 0);
  if (d.getTime() > now) d.setDate(d.getDate() - 1);
  return d.getTime();
}

export function nextResetAt(state: DailyRewardState): number {
  const d = new Date(state.dayStart);
  d.setDate(d.getDate() + 1);
  return d.getTime();
}

export function createDay(now: number, balance: number): DailyRewardState {
  return { dayStart: dayStartFor(now), checkIns: [], distanceKm: 0, balance };
}

/** Roll over to a fresh reward day at 07:00 (balance is kept). */
export function normalize(state: DailyRewardState, now: number): DailyRewardState {
  return now >= nextResetAt(state) ? createDay(now, state.balance) : state;
}

export function distanceTierIndex(km: number): number {
  let idx = -1;
  C.distanceTiers.forEach((t, i) => {
    if (km >= t.km) idx = i;
  });
  return idx;
}

export function distanceReward(km: number): number {
  const idx = distanceTierIndex(km);
  if (idx < 0) return 0;
  return round4((C.distanceBonusBase * C.distanceTiers[idx].percent) / 100);
}

export function phaseOf(state: DailyRewardState, now: number): Phase {
  const n = state.checkIns.length;
  if (n === 0) return { kind: 'ready', index: 0 };
  if (n === 1) {
    const unlockAt = state.checkIns[0].at + C.cooldownMs;
    return now >= unlockAt ? { kind: 'ready', index: 1 } : { kind: 'cooldown', index: 1, unlockAt };
  }
  if (n === 2) {
    const cooldownEnd = state.checkIns[1].at + C.cooldownMs;
    const distanceOk = state.distanceKm >= C.distanceTiers[0].km;
    const timeOk = !C.thirdCheckInRequiresCooldown || now >= cooldownEnd;
    if (distanceOk && timeOk) return { kind: 'ready', index: 2 };
    return { kind: 'distance', index: 2, unlockAt: now < cooldownEnd ? cooldownEnd : null };
  }
  return { kind: 'done', resetAt: nextResetAt(state) };
}

/** Amount the user will get from the next check-in (0 when nothing is pending). */
export function upcomingReward(state: DailyRewardState): number {
  switch (state.checkIns.length) {
    case 0:
      return C.rewards.first;
    case 1:
      return C.rewards.second;
    case 2:
      return distanceReward(state.distanceKm);
    default:
      return 0;
  }
}

export function bonusKindFor(state: DailyRewardState): BonusKind {
  const n = state.checkIns.length;
  if (n === 0) return 'avatar';
  if (n === 1) return 'basic';
  return 'distance';
}

export function todayTotal(state: DailyRewardState): number {
  return round4(state.checkIns.reduce((s, c) => s + c.amount, 0));
}

export const round4 = (v: number) => Math.round(v * 10_000) / 10_000;

export { HOUR };
