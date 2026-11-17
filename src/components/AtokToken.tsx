import { motion } from 'motion/react';
import edge from '../assets/token-edge.svg';
import bg from '../assets/token-bg.svg';
import stroke from '../assets/token-stroke.svg';
import v0 from '../assets/token-v0.svg';
import v1 from '../assets/token-v1.svg';
import v2 from '../assets/token-v2.svg';
import v3 from '../assets/token-v3.svg';

/**
 * "Motion for token" (Figma 2290:48584) – a 2s loop where the coin flips around its
 * vertical axis (scaleX = cos) while its shaded edge squashes to fake thickness.
 */
const STEPS = 64;
const times = Array.from({ length: STEPS + 1 }, (_, i) => i / STEPS);
// ATOK token: scaleX follows cos(2πt) – passes through 0 at ¼ and ¾ of the loop.
const tokenScaleX = times.map((t) => {
  const v = Math.cos(2 * Math.PI * t);
  return Math.abs(v) < 1e-4 ? 0.0001 : v;
});
// Edge keyframes copied from the Figma motion track (node 2290:48585): one half-cycle,
// mirrored, played twice per loop.
const EDGE_X_HALF = [
  1, 1.010867, 1.012, 1.003386, 0.985109, 0.957345, 0.920361, 0.874513, 0.820244, 0.758075, 0.688605, 0.612504,
  0.530504, 0.443395, 0.352016, 0.257247, 0.16,
];
const EDGE_Y_HALF = [
  1, 1.000336, 1.001332, 1.002949, 1.005126, 1.007778, 1.010803, 1.014086, 1.0175, 1.020914, 1.024197, 1.027223,
  1.029874, 1.032051, 1.033668, 1.034664, 1.035,
];
const cycle = (half: number[]) => {
  const one = [...half, ...half.slice(0, -1).reverse()]; // 33 values: 0 → ½
  return [...one, ...one.slice(1)]; // 65 values: 0 → 1
};
const edgeScaleX = cycle(EDGE_X_HALF);
const edgeScaleY = cycle(EDGE_Y_HALF);

const loop = { duration: 2, ease: 'linear' as const, repeat: Infinity, times };

export function AtokToken({ size = 28, spinning = true }: { size?: number; spinning?: boolean }) {
  const s = size / 28;
  return (
    <div className="atok-token" style={{ width: size, height: size }} aria-hidden>
      <motion.img
        src={edge}
        alt=""
        className="atok-token__edge"
        style={{ left: 3.09 * s, top: 3.09 * s, width: 21.829 * s, height: 21.829 * s }}
        animate={spinning ? { scaleX: edgeScaleX, scaleY: edgeScaleY } : undefined}
        transition={loop}
      />
      <motion.div
        className="atok-token__face"
        animate={spinning ? { scaleX: tokenScaleX } : undefined}
        transition={loop}
      >
        <Layer src={bg} inset='7.12%' />
        <Layer src={stroke} inset='7.12%' />
        <Layer src={v0} inset='42.21% 38.05% 44.39% 48.79%' />
        <Layer src={v1} inset='43.49% 39.34% 45.67% 50.08%' />
        <Layer src={v2} inset='28.56% 39.06% 28.58% 28.56%' />
        <Layer src={v3} inset='46.48% 28.56% 28.56% 52.86%' />
      </motion.div>
    </div>
  );
}

function Layer({ src, inset }: { src: string; inset: string }) {
  return (
    <span className="atok-token__layer" style={{ inset }}>
      <img src={src} alt="" />
    </span>
  );
}
