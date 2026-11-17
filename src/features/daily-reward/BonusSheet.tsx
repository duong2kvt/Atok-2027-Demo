import { AnimatePresence, motion, useDragControls, type PanInfo } from 'motion/react';
import { useEffect } from 'react';
import avatar1 from '../../assets/sheet-avatar-1.webp';
import avatar2 from '../../assets/sheet-avatar-2.webp';
import avatar3 from '../../assets/sheet-avatar-3.webp';
import glassBox from '../../assets/nft-glass-box.webp';
import distanceSymbol from '../../assets/distance-symbol.svg';
import runner from '../../assets/distance-runner.webp';
import { Button, HomeIndicator } from '../../components/primitives';
import type { BonusKind } from './config';
import { useDailyReward } from './store';

type SheetContent = {
  title: string;
  description: string;
  primary: string;
  secondary?: string;
  illustration: JSX.Element;
  toast?: string;
};

const CONTENT: Record<BonusKind, SheetContent> = {
  avatar: {
    title: 'Avatar bonus',
    description: 'Answer daily questions to level up your Avatar and unlock bonuses at every tier',
    primary: 'Go to avatar',
    secondary: 'Cancel',
    illustration: <AvatarIllustration />,
    toast: 'Opening Avatar… (out of demo scope)',
  },
  basic: {
    title: 'Basic daily reward',
    description: 'More assets, higher payout. Stack more Digital Editions to earn more Atok',
    primary: 'Go to store',
    secondary: 'Cancel',
    illustration: <NftGlassBox />,
    toast: 'Opening Store… (out of demo scope)',
  },
  distance: {
    title: 'Distance bonus',
    description: 'Travel at least 4 km today to unlock a bonus. Reach 12 km for the maximum 3%',
    primary: 'Got it',
    illustration: <DistanceIllustration />,
  },
};

/** Bottom-Sheet/Modal for the "Bonus" button – one variant per check-in. */
export function BonusSheet() {
  const { sheet, closeSheet, showToast } = useDailyReward();
  const drag = useDragControls();

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeSheet();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet, closeSheet]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 600) closeSheet();
  };

  const c = sheet ? CONTENT[sheet] : null;

  return (
    <AnimatePresence>
      {c && (
        <motion.div
          className="sheet-overlay"
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={closeSheet}
        >
          <motion.div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={c.title}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            drag="y"
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.9 }}
            onDragEnd={onDragEnd}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet__grabber" onPointerDown={(e) => drag.start(e)}>
              <span />
            </div>
            <div className="sheet__body" onPointerDown={(e) => drag.start(e)}>
              <div className="sheet__illustration">{c.illustration}</div>
              <div className="sheet__heading">
                <h3>{c.title}</h3>
                <p>{c.description}</p>
              </div>
            </div>
            <div className="sheet__footer">
              <Button
                onClick={() => {
                  closeSheet();
                  if (c.toast) showToast(c.toast);
                }}
              >
                {c.primary}
              </Button>
              {c.secondary && (
                <Button variant="tertiary" onClick={closeSheet}>
                  {c.secondary}
                </Button>
              )}
            </div>
            <HomeIndicator />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Illustrations (built from the Figma layers) ---------------- */

function AvatarIllustration() {
  // Three tilted avatar cards (Figma 2293:70172).
  const cards = [
    { src: avatar1, box: { left: 7.52, top: 74.58, width: 55.5, height: 61.68 }, w: 47.33, h: 54.71, r: -9.34 },
    { src: avatar2, box: { left: 18.88, top: 10.74, width: 65.41, height: 74.5 }, w: 61.59, h: 71.19, r: -3.19 },
    { src: avatar3, box: { left: 55.86, top: 40.14, width: 98.08, height: 110.67 }, w: 88.88, h: 102.71, r: 5.43 },
  ];
  return (
    <div className="ill-avatar">
      {cards.map((c, i) => (
        <motion.div
          key={i}
          className="ill-avatar__slot"
          style={c.box}
          initial={{ opacity: 0, y: 14, rotate: c.r * 2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.12 + i * 0.07 }}
        >
          <img src={c.src} alt="" style={{ width: c.w, height: c.h, transform: `rotate(${c.r}deg)` }} />
        </motion.div>
      ))}
    </div>
  );
}

function NftGlassBox() {
  // NFT/Glass Box – single exported render of the Figma layer (2293:71036).
  return (
    <motion.img
      src={glassBox}
      alt=""
      className="ill-nft"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: [0, -4, 0] }}
      transition={{
        opacity: { duration: 0.3, delay: 0.12 },
        y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 },
      }}
    />
  );
}

function DistanceIllustration() {
  return (
    <div className="ill-distance">
      <img src={distanceSymbol} alt="" className="ill-distance__symbol" />
      <motion.img
        src={runner}
        alt=""
        className="ill-distance__runner"
        initial={{ opacity: 0, scale: 0.8, x: -12 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.12 }}
      />
    </div>
  );
}
