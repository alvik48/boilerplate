import { resolveUserStatus } from './user-status';

// The business rule is tested directly: no Nest testing module, no HTTP, no
// database. That is the point of keeping it in domain/.
describe('resolveUserStatus', () => {
  const now = new Date('2026-03-01T00:00:00.000Z');

  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  it('treats a suspended user as suspended however recently they were seen', () => {
    expect(resolveUserStatus({ lastSeenAt: now, suspended: true }, now)).toBe('suspended');
  });

  it('treats a recently seen user as active', () => {
    expect(resolveUserStatus({ lastSeenAt: daysAgo(1), suspended: false }, now)).toBe('active');
  });

  it('keeps the active boundary inclusive', () => {
    expect(resolveUserStatus({ lastSeenAt: daysAgo(7), suspended: false }, now)).toBe('active');
    expect(resolveUserStatus({ lastSeenAt: daysAgo(8), suspended: false }, now)).toBe('idle');
  });

  it('keeps the dormancy boundary inclusive', () => {
    expect(resolveUserStatus({ lastSeenAt: daysAgo(30), suspended: false }, now)).toBe('idle');
    expect(resolveUserStatus({ lastSeenAt: daysAgo(31), suspended: false }, now)).toBe('dormant');
  });
});
