import { animate, motion, useMotionValue, useTransform, type HTMLMotionProps } from 'motion/react';
import { useEffect, type ReactNode } from 'react';
import cellular from '../assets/status-cellular.svg';
import wifi from '../assets/status-wifi.svg';
import battery from '../assets/status-battery.svg';
import { formatTimeOfDay } from '../lib/format';

/* ---------------- iOS status bar ---------------- */

export function StatusBar({ now }: { now: number }) {
  return (
    <div className="status-bar" aria-hidden>
      <div className="status-bar__time">{formatTimeOfDay(now)}</div>
      <div className="status-bar__island" />
      <div className="status-bar__levels">
        <img src={cellular} width={19.2} height={12.226} alt="" />
        <img src={wifi} width={17.142} height={12.328} alt="" />
        <img src={battery} width={27.328} height={13} alt="" />
      </div>
    </div>
  );
}

export function HomeIndicator({ className = '' }: { className?: string }) {
  return (
    <div className={`home-indicator ${className}`} aria-hidden>
      <span />
    </div>
  );
}

/* ---------------- Buttons (Button/Main) ---------------- */

type Variant = 'primary' | 'tertiary';
type BtnProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: Variant;
  size?: 'large' | 'xsmall';
  icon?: string;
  children: ReactNode;
};

export function Button({ variant = 'primary', size = 'large', icon, children, className = '', disabled, ...rest }: BtnProps) {
  return (
    <motion.button
      type="button"
      className={`btn btn--${variant} btn--${size} ${className}`}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      disabled={disabled}
      {...rest}
    >
      {icon && <img className="btn__icon" src={icon} width={16} height={16} alt="" />}
      <span className="btn__label">{children}</span>
    </motion.button>
  );
}

/* ---------------- Animated number ---------------- */

export function AnimatedNumber({
  value,
  format,
  duration = 0.9,
  className,
}: {
  value: number;
  format: (v: number) => string;
  duration?: number;
  className?: string;
}) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => format(v));
  useEffect(() => {
    const controls = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [value, duration, mv]);
  return <motion.span className={className}>{text}</motion.span>;
}
