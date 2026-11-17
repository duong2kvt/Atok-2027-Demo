import { motion } from 'motion/react';
import party1 from '../../assets/party-1.webp';
import party2 from '../../assets/party-2.webp';
import party3 from '../../assets/party-3.webp';
import sphereA from '../../assets/sphere-a.webp';
import sphereB from '../../assets/sphere-b.webp';
import sphereC from '../../assets/sphere-c.webp';
import sphereD from '../../assets/sphere-d.webp';
import sphereE from '../../assets/sphere-e.webp';
import { Button, HomeIndicator, StatusBar } from '../../components/primitives';
import { formatAtok } from '../../lib/format';
import { useDailyReward } from './store';

/**
 * "1st check-in reward" (Figma 2555:31595).
 * Motion: the amount enters word-by-word – from 60px below, 70% scale, 0% opacity –
 * on a spring (mass 1, stiffness 100, damping 10) after a 403ms delay.
 */
const NUMBER_DELAY = 0.403;

type Piece = {
  src: string;
  style: React.CSSProperties;
  inner?: React.CSSProperties;
  float: number;
};

// Positions are relative to the 350px-wide content container (same as Figma).
const PIECES: Piece[] = [
  // Party streamers
  {
    src: party1,
    style: { left: '62.79%', right: '30.6%', height: 19.487, top: 'calc(50% + 129.32px)', translate: '0 -50%' },
    inner: { width: '100%', height: '100%', transform: 'rotate(180deg) scaleX(-1)' },
    float: 6,
  },
  {
    src: party2,
    style: { left: '40.66%', right: '53.62%', height: 18.167, top: 'calc(50% - 129.92px)', translate: '0 -50%' },
    inner: { width: 16.29, height: 12.68, transform: 'rotate(-23.74deg)' },
    float: 5,
  },
  {
    src: party3,
    style: { left: '30.02%', right: '64.85%', height: 15.713, top: 'calc(50% + 79.13px)', translate: '0 -50%' },
    inner: { width: 16.36, height: 13.77, transform: 'rotate(-172.8deg)' },
    float: 7,
  },
  // Spheres
  { src: sphereA, style: { left: -72, top: 393.82, width: 15.427, height: 15.427 }, float: 8 },
  { src: sphereB, style: { left: 325.91, top: 441.61, width: 21.798, height: 21.798 }, float: 9 },
  { src: sphereC, style: { left: 409.93, top: 380.75, width: 12.073, height: 12.073 }, float: 6 },
  { src: sphereD, style: { left: 307.3, top: 332.45, width: 8.049, height: 8.049 }, float: 5 },
  { src: sphereD, style: { left: 29.11, top: 328.43, width: 8.049, height: 8.049 }, float: 5 },
  { src: sphereE, style: { left: 13.52, top: 451.68, width: 23.476, height: 23.476 }, float: 10 },
];

export function RewardScreen() {
  const { now, pendingReward, collect } = useDailyReward();
  const words = formatAtok(pendingReward).split(' ');

  return (
    <div className="reward-screen">
      <StatusBar now={now} />
      <div className="reward-screen__body">
        <div className="reward-screen__container">
          <motion.h1
            className="reward-screen__title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            You receive
            <br />
            ATOK rewards!
          </motion.h1>

          <p className="reward-screen__amount" aria-label={`${formatAtok(pendingReward)} ATOK`}>
            {words.map((w, i) => (
              <motion.span
                key={i}
                style={{ display: 'inline-block' }}
                initial={{ opacity: 0, y: 60, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', mass: 1, stiffness: 100, damping: 10, delay: NUMBER_DELAY + i * 0.054 }}
              >
                {w}
              </motion.span>
            ))}
          </p>

          <div className="reward-screen__confetti" aria-hidden>
            {PIECES.map((p, i) => (
              <motion.div
                key={i}
                className="reward-piece"
                style={p.style}
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 14, delay: NUMBER_DELAY + 0.15 + i * 0.035 }}
              >
                <motion.div
                  className="reward-piece__float"
                  animate={{ y: [0, -p.float, 0] }}
                  transition={{ duration: 2.4 + (i % 4) * 0.35, repeat: Infinity, ease: 'easeInOut', delay: 1 + i * 0.12 }}
                >
                  <img src={p.src} alt="" style={p.inner ?? { width: '100%', height: '100%' }} />
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="reward-screen__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            Mission completion reward
          </motion.p>
        </div>
      </div>
      <motion.footer
        className="reward-screen__footer"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
      >
        <Button onClick={collect}>Collect</Button>
      </motion.footer>
      <HomeIndicator />
    </div>
  );
}
