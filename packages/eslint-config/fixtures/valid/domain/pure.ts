// Plain business rule: no framework, no ORM, no data layer.
export const applyDiscount = (cents: number, percent: number): number =>
  Math.round(cents * (1 - percent / 100));
