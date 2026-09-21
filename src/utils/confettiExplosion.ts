import confetti from 'canvas-confetti';

/**
 * Triggers a multi-stage celebratory confetti explosion.
 * Uses the lab's curated palette:
 * - Scholarly Teal (#2B6282)
 * - Deep Emerald Attestation (#24452E, #2E683D)
 * - Gold / Academic Foil (#FFD700, #F59E0B)
 * - Lavender / Synaptic Violet (#6842C2, #8B5CF6)
 * - Crisp Ice / Diamond (#E7F2FA, #FFFFFF)
 */
export function triggerConfettiExplosion() {
  // Check if reduced motion is preferred
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return;
  }

  const sharedConfig = {
    zIndex: 100000,
    disableForReducedMotion: true,
  };

  const academicPalette = [
    '#2B6282',
    '#24452E',
    '#2E683D',
    '#FFD700',
    '#F59E0B',
    '#6842C2',
    '#8B5CF6',
    '#E7F2FA',
    '#FFFFFF',
  ];

  // Stage 1: Central fountain blast
  confetti({
    ...sharedConfig,
    particleCount: 70,
    spread: 90,
    origin: { x: 0.5, y: 0.45 },
    colors: academicPalette,
    startVelocity: 45,
    scalar: 1.1,
  });

  // Stage 2: Left side cannon
  const timer1 = setTimeout(() => {
    confetti({
      ...sharedConfig,
      particleCount: 50,
      angle: 55,
      spread: 65,
      origin: { x: 0.15, y: 0.65 },
      colors: ['#2B6282', '#FFD700', '#24452E', '#E7F2FA'],
      startVelocity: 50,
    });
  }, 180);

  // Stage 3: Right side cannon
  const timer2 = setTimeout(() => {
    confetti({
      ...sharedConfig,
      particleCount: 50,
      angle: 125,
      spread: 65,
      origin: { x: 0.85, y: 0.65 },
      colors: ['#6842C2', '#FFD700', '#2E683D', '#F59E0B'],
      startVelocity: 50,
    });
  }, 360);

  // Stage 4: Gentle star and circle cascade from top
  const timer3 = setTimeout(() => {
    confetti({
      ...sharedConfig,
      particleCount: 45,
      spread: 120,
      origin: { x: 0.5, y: 0.25 },
      shapes: ['star', 'circle'],
      colors: ['#FFD700', '#F59E0B', '#FFFFFF', '#6842C2', '#2B6282'],
      gravity: 0.8,
      scalar: 1.2,
      ticks: 250,
    });
  }, 650);

  return () => {
    clearTimeout(timer1);
    clearTimeout(timer2);
    clearTimeout(timer3);
  };
}
