import { motion, useAnimationControls } from 'motion/react';
import { useEffect } from 'react';
import chevron from '../assets/icon-chevron-right.svg';
import bell from '../assets/icon-bell.svg';
import chat from '../assets/icon-chat.svg';
import eye from '../assets/icon-eye.svg';
import tokenSmall from '../assets/token-small.svg';
import discoveryDE from '../assets/discovery-digital-edition.webp';
import discoveryAvatar from '../assets/discovery-avatar.webp';
import discoveryReferral from '../assets/discovery-referral.webp';
import discoveryLucky from '../assets/discovery-lucky-spin.webp';
import banner from '../assets/banner-personal-mission.webp';
import rayban from '../assets/mission-rayban.webp';
import pepsi from '../assets/mission-pepsi.webp';
import tabHome from '../assets/tab-home.svg';
import tabGame from '../assets/tab-game.svg';
import tabPlay from '../assets/tab-play.svg';
import tabAnnounce from '../assets/tab-announce.svg';
import tabProfile from '../assets/tab-profile.svg';
import { AtokToken } from '../components/AtokToken';
import { AnimatedNumber, HomeIndicator, StatusBar } from '../components/primitives';
import { DailyRewardCard } from '../features/daily-reward/DailyRewardCard';
import { useDailyReward } from '../features/daily-reward/store';
import { formatBalance } from '../lib/format';

export function HomeScreen() {
  const { now, showToast } = useDailyReward();
  const soon = (what: string) => () => showToast(`${what} – out of demo scope`);

  return (
    <div className="home">
      <div className="home__scroll">
        <div className="home__top">
          <StatusBar now={now} />
          <BalanceBar onOpen={soon('Wallet')} onBell={soon('Notifications')} onChat={soon('Messages')} />
        </div>

        <main className="home__body">
          <div className="home__section">
            <DailyRewardCard />
          </div>

          <section className="home__section">
            <h2 className="section-title">Discovery</h2>
            <div className="discovery">
              {[
                { img: discoveryDE, label: 'Digital Edition' },
                { img: discoveryAvatar, label: 'Avatar' },
                { img: discoveryReferral, label: 'Referral' },
                { img: discoveryLucky, label: 'Lucky Spin' },
              ].map((d) => (
                <motion.button key={d.label} className="discovery__item" whileTap={{ scale: 0.94 }} onClick={soon(d.label)}>
                  <img src={d.img} width={56} height={56} alt="" />
                  <span>{d.label}</span>
                </motion.button>
              ))}
            </div>
          </section>

          <section className="home__section">
            <motion.button className="promo" whileTap={{ scale: 0.98 }} onClick={soon('Personal mission')}>
              <img src={banner} width={350} height={88} alt="Personal mission" />
            </motion.button>
          </section>

          <section className="home__section home__section--last">
            <h2 className="section-title">Latest mission</h2>
            <div className="missions">
              {[
                { img: rayban, name: 'Rayban' },
                { img: pepsi, name: 'Pepsi' },
                { img: rayban, name: 'Rayban' },
              ].map((m, i) => (
                <motion.button key={i} className="ad-card" whileTap={{ scale: 0.97 }} onClick={soon(m.name)}>
                  <div className="ad-card__thumb">
                    <img src={m.img} alt="" />
                    <span className="ad-card__badge">
                      <span className="ad-card__token">
                        <img src={tokenSmall} width={13.72} height={13.72} alt="" />
                      </span>
                      <span>1.37</span>
                    </span>
                  </div>
                  <div className="ad-card__content">
                    <p className="ad-card__title">{m.name}</p>
                    <p className="ad-card__views">
                      <img src={eye} width={16} height={16} alt="" />
                      24,312 / 400,000
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>
        </main>
      </div>
      <TabBar />
    </div>
  );
}

function BalanceBar({ onOpen, onBell, onChat }: { onOpen: () => void; onBell: () => void; onChat: () => void }) {
  const { state, balanceBump } = useDailyReward();
  const controls = useAnimationControls();

  useEffect(() => {
    if (balanceBump === 0) return;
    controls.start({ scale: [1, 1.06, 1], transition: { duration: 0.6, ease: 'easeOut', delay: 0.35 } });
  }, [balanceBump, controls]);

  return (
    <div className="balance-bar">
      <button className="balance-bar__balance" onClick={onOpen}>
        <AtokToken />
        <motion.span className="balance-bar__value" animate={controls}>
          <AnimatedNumber value={state.balance} format={formatBalance} duration={1.4} />
        </motion.span>
        <img src={chevron} width={24} height={24} alt="" />
      </button>
      <div className="balance-bar__actions">
        <button className="icon-btn" aria-label="Notifications" onClick={onBell}>
          <img src={bell} width={24} height={24} alt="" />
          <span className="badge">1</span>
        </button>
        <button className="icon-btn" aria-label="Messages" onClick={onChat}>
          <img src={chat} width={24} height={24} alt="" />
        </button>
      </div>
    </div>
  );
}

function TabBar() {
  const items: { icon: string; label: string; active?: boolean; badge?: number; w?: number; h?: number }[] = [
    { icon: tabHome, label: 'Home', active: true },
    { icon: tabGame, label: 'Games' },
    { icon: tabPlay, label: 'Watch' },
    { icon: tabAnnounce, label: 'Announcements', badge: 1, w: 20, h: 18.896 },
    { icon: tabProfile, label: 'Profile' },
  ];
  return (
    <nav className="tabbar" aria-label="Main">
      <div className="tabbar__pill">
        {items.map((it) => (
          <button key={it.label} className={`tabbar__item ${it.active ? 'is-active' : ''}`} aria-label={it.label}>
            <span className="tabbar__icon">
              <img src={it.icon} width={it.w ?? 24} height={it.h ?? 24} alt="" className={it.w ? 'tabbar__icon--union' : ''} />
              {it.badge && <span className="badge tabbar__badge">{it.badge}</span>}
            </span>
          </button>
        ))}
      </div>
      <HomeIndicator className="home-indicator--tabbar" />
    </nav>
  );
}
