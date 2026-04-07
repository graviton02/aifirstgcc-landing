export function getUtcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function dailyShuffle<T>(
  items: readonly T[],
  dayKey = getUtcDayKey()
): T[] {
  const shuffled = [...items];
  let seed = hashDayKey(dayKey);

  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function hashDayKey(dayKey: string): number {
  let hash = 0;

  for (const char of dayKey) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 0x45d9f3b);
    hash |= 0;
  }

  return hash;
}
