/**
 * Business rules for the Daily reward feature.
 * Source: Figma "Demo - 01" annotation (node 2555:29923).
 * Change values here to try alternative rules in front of stakeholders.
 */

export const HOUR = 60 * 60 * 1000;

export const DAILY_REWARD_CONFIG = {
  /** A reward day starts at 07:00 local time and resets at 07:00 the next morning. */
  dayStartHour: 7,

  /** Cooldown after the 1st and 2nd check-in before the next one unlocks. */
  cooldownMs: 4 * HOUR,

  /** ATOK paid for each check-in. The 3rd one is computed from the distance tiers. */
  rewards: {
    first: 0.1584, // Avatar bonus
    second: 1.98, // Basic daily reward (Digital Editions)
  },

  /**
   * 3rd check-in: distance tracked after the 2nd check-in.
   * Each tier unlocks a bonus = percent × `distanceBonusBase`.
   */
  distanceBonusBase: 1.98,
  distanceTiers: [
    { km: 4, percent: 1 },
    { km: 8, percent: 2 },
    { km: 12, percent: 3 },
  ],

  /**
   * Open question for stakeholders: the design unlocks the 3rd check-in as soon as the
   * user walks 4 km (frame "1% bonus complete" is only ~2.5h after the 2nd check-in).
   * Set to true to also require the 4h cooldown.
   */
  thirdCheckInRequiresCooldown: false,

  /** Starting wallet balance shown in the header. */
  initialBalance: 200_967_000.4658,
} as const;

export type BonusKind = 'avatar' | 'basic' | 'distance';
