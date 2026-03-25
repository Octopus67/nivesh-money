export const EASE = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  spring: { type: 'spring' as const, stiffness: 300, damping: 20 },
  springSnappy: { type: 'spring' as const, duration: 0.25, bounce: 0.1 },
  springHover: { type: 'spring' as const, stiffness: 400, damping: 17 },
};
