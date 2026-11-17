import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { DemoPanel } from './demo/DemoPanel';
import { BonusSheet } from './features/daily-reward/BonusSheet';
import { RewardScreen } from './features/daily-reward/RewardScreen';
import { DailyRewardProvider, useDailyReward } from './features/daily-reward/store';
import { HomeScreen } from './screens/HomeScreen';

export default function App() {
  return (
    <DailyRewardProvider>
      <Stage />
    </DailyRewardProvider>
  );
}

const DEVICE_W = 390;
const DEVICE_H = 844;

/** Presentation stage: the phone on the left, demo controls on the right. */
function Stage() {
  const scale = useDeviceScale();
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="stage">
      <div className="stage__device-area">
        <div className="device" style={{ width: DEVICE_W * scale, height: DEVICE_H * scale }}>
          <div className="device__screen" style={{ transform: `scale(${scale})` }}>
            <PhoneApp />
          </div>
        </div>
      </div>
      <div className={`stage__panel ${panelOpen ? 'is-open' : ''}`}>
        <DemoPanel />
      </div>
      <button className="stage__panel-toggle" onClick={() => setPanelOpen((v) => !v)}>
        {panelOpen ? 'Đóng' : 'Demo controls'}
      </button>
    </div>
  );
}

function PhoneApp() {
  const { screen, toast } = useDailyReward();
  return (
    <div className="phone">
      <HomeScreen />
      <AnimatePresence>
        {screen === 'reward' && (
          <motion.div
            key="reward"
            className="phone__layer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 34 }}
          >
            <RewardScreen />
          </motion.div>
        )}
      </AnimatePresence>
      <BonusSheet />
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: -16, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -16, x: '-50%' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Fit the 390×844 device into the viewport (full-bleed on real phones). */
function useDeviceScale() {
  const compute = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w < 720) return Math.min(w / DEVICE_W, h / DEVICE_H);
    return Math.min(1, (h - 48) / DEVICE_H, (w - 460) / DEVICE_W);
  };
  const [scale, setScale] = useState(compute);
  useEffect(() => {
    const onResize = () => setScale(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return scale;
}
