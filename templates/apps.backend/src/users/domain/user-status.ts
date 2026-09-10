// Domain: business invariants as plain functions.
//
// No @nestjs/* import, no Prisma, no data-layer import -- enforced by
// no-restricted-imports and by dependency-cruiser, which also catches transitive
// reach. That is what makes this rule testable without HTTP and without a
// database; see user-status.spec.ts.

export const USER_STATUSES = ['suspended', 'active', 'idle', 'dormant'] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

/** A user seen within this many days counts as active. */
const ACTIVE_WITHIN_DAYS = 7;

/** Past this many days without being seen, a user is dormant rather than idle. */
const DORMANT_AFTER_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type UserActivity = {
  lastSeenAt: Date;
  suspended: boolean;
};

/**
 * Resolves the account status a user is in.
 *
 * Suspension wins over recency: a suspended account is suspended however
 * recently it was used. Boundaries are inclusive, so a user seen exactly
 * {@link ACTIVE_WITHIN_DAYS} days ago is still active.
 */
export const resolveUserStatus = (activity: UserActivity, now: Date): UserStatus => {
  if (activity.suspended) {
    return 'suspended';
  }

  const daysSinceSeen = (now.getTime() - activity.lastSeenAt.getTime()) / MS_PER_DAY;

  if (daysSinceSeen <= ACTIVE_WITHIN_DAYS) {
    return 'active';
  }

  if (daysSinceSeen <= DORMANT_AFTER_DAYS) {
    return 'idle';
  }

  return 'dormant';
};
