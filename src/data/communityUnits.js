export const TOWER_COUNT = 100;
export const FLOORS = 15;
export const FLATS_PER_FLOOR = 6;

export const TOWERS = Array.from({ length: TOWER_COUNT }, (_, i) => {
  const n = i + 1;
  return { value: String(n), label: `Tower ${n}` };
});

/** Flats 101–106 … 1501–1506 (floor × 100 + flat 1–6) */
export const FLATS = Array.from({ length: FLOORS * FLATS_PER_FLOOR }, (_, i) => {
  const floor = Math.floor(i / FLATS_PER_FLOOR) + 1;
  const flat = (i % FLATS_PER_FLOOR) + 1;
  const value = String(floor * 100 + flat);
  return { value, label: `Flat ${value}` };
});

export const HOME_DELIVERY_FEE = 10;
