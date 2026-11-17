import { AnimatePresence, motion } from 'motion/react';
import clockIcon from '../../assets/icon-clock.svg';
import bonusIcon from '../../assets/icon-bonus-arrow.svg';
import checkIcon from '../../assets/icon-check-circle.svg';
import chest from '../../assets/chest.webp';
import { AnimatedNumber, Button } from '../../components/primitives';
import { formatAtok, formatClock, formatDuration, formatKm } from '../../lib/format';
import { DAILY_REWARD_CONFIG as C } from './config';
import { bonusKindFor, nextResetAt, todayTotal } from './engine';
import { useDailyReward } from './store';

const spring = { type: 'spring' as const, stiffness: 420, damping: 36 };

/** "Inset quest tile" – Daily reward card on Home (Figma 2290:48598). */
export function DailyRewardCard() {
  const { now, state, phase, upcoming, checkIn, openSheet } = useDailyReward();
  const remainingToday = nextResetAt(state) - now;
  const showDistance = state.checkIns.length >= 2;

  const caption =
    phase.kind === 'ready' && phase.index < 2 ? 'You’ll receive' : phase.kind === 'done' ? 'Today you received' : 'Reward receive';
  const amount = phase.kind === 'done' ? todayTotal(state) : upcoming;

  let label: string;
  let enabled = false;
  if (phase.kind === 'ready') {
    label = 'Check-in';
    enabled = true;
  } else if (phase.kind === 'cooldown') {
    label = `Next Check-in: ${formatDuration(phase.unlockAt - now)}`;
  } else if (phase.kind === 'distance') {
    label = phase.unlockAt ? `Next Check-in: ${formatDuration(phase.unlockAt - now)}` : `Reach ${C.distanceTiers[0].km} Km to check-in`;
  } else {
    label = `New rewards in ${formatDuration(phase.resetAt - now)}`;
  }
  // Only the leading part changes when ticking, so key on it for the crossfade.
  const labelKey = label.startsWith('Next') ? 'next' : label.startsWith('New') ? 'new' : label;

  return (
    <motion.section className="quest-tile" layout transition={spring} aria-label="Daily reward">
      <motion.header className="quest-tile__head" layout="position">
        <h2>Daily reward</h2>
        <div className="quest-tile__time" title="Time until daily reward resets (07:00)">
          <img src={clockIcon} width={16} height={16} alt="" />
          <span>{formatClock(remainingToday)}</span>
        </div>
      </motion.header>

      <motion.div className="quest-details" layout transition={spring}>
        <motion.div layout="position" className={`quest-details__top ${showDistance ? 'is-compact' : ''}`}>
          <div className="quest-details__reward">
            <img src={chest} width={40} height={40} alt="" />
            <div>
              <p className="caption">{caption}</p>
              <p className="amount">
                <AnimatedNumber value={amount} format={formatAtok} /> ATOK
              </p>
            </div>
          </div>
          <Button variant="tertiary" size="xsmall" icon={bonusIcon} onClick={() => openSheet(bonusKindFor(state))}>
            Bonus
          </Button>
        </motion.div>

        <AnimatePresence initial={false}>
          {showDistance && (
            <motion.div
              key="distance"
              className="distance-wrap"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ ...spring, opacity: { duration: 0.25 } }}
            >
              <DistanceTracker km={state.distanceKm} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout="position" className="quest-details__cta">
          <Button className={`cta ${enabled ? '' : 'is-disabled'}`} disabled={!enabled} onClick={checkIn} aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={labelKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: 'inline-block' }}
              >
                {label}
              </motion.span>
            </AnimatePresence>
          </Button>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

/** Distance bonus tracker (Figma 2357:68482). */
function DistanceTracker({ km }: { km: number }) {
  const tiers = C.distanceTiers;
  return (
    <div className="distance">
      <div className="distance__head">
        <span>Total distance:</span>
        <strong>{formatKm(km)} Km</strong>
      </div>
      <div className="distance__body">
        <div className="distance__progress">
          {tiers.map((t, i) => {
            const from = i === 0 ? 0 : tiers[i - 1].km;
            const pct = Math.max(0, Math.min(1, (km - from) / (t.km - from)));
            return (
              <div className="distance__track" key={t.km}>
                <motion.div
                  className="distance__fill"
                  initial={false}
                  animate={{ scaleX: pct }}
                  transition={{ type: 'spring', stiffness: 160, damping: 26 }}
                />
              </div>
            );
          })}
        </div>
        <div className="distance__tiers">
          {tiers.map((t) => {
            const done = km >= t.km;
            return (
              <div className="distance__tier" key={t.km}>
                <p className="distance__tier-label">{t.percent}% Bonus</p>
                <p className="distance__tier-km">
                  {t.km} Km
                  <AnimatePresence>
                    {done && (
                      <motion.img
                        src={checkIcon}
                        width={12}
                        height={12}
                        alt="completed"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                      />
                    )}
                  </AnimatePresence>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
