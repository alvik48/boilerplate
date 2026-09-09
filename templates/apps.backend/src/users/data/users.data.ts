import { Injectable } from '@nestjs/common';

// Data access: query construction and row -> domain mapping. No business
// decisions here.
//
// A real service injects a packages/db-* client and builds queries. This
// template has no database, so a fixed set stands in for that. Replace the body,
// not the boundary. See docs/repository/databases.md.
//
// Note there is deliberately no UsersRepository INTERFACE. One implementation
// and one caller is a wrapper chain, not a boundary; introduce an interface when
// a second implementation or a database-free test of business logic needs one.
// See docs/repository/backend.md, "Repository Interfaces Only When Justified".

export type UserRecord = {
  id: string;
  name: string;
  lastSeenAt: Date;
  suspended: boolean;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Seeded as offsets rather than absolute dates so the example keeps producing
// one user per status however long after this template was written it is run.
// Absolute dates would silently collapse to all-dormant and make the documented
// example wrong.
const SEEDED_USERS = [
  { id: 'u_1', name: 'Ada Lovelace', lastSeenDaysAgo: 1, suspended: false },
  { id: 'u_2', name: 'Grace Hopper', lastSeenDaysAgo: 14, suspended: false },
  { id: 'u_3', name: 'Alan Turing', lastSeenDaysAgo: 90, suspended: false },
  { id: 'u_4', name: 'Katherine Johnson', lastSeenDaysAgo: 2, suspended: true },
] as const;

@Injectable()
export class UsersData {
  findAll(): Promise<UserRecord[]> {
    const now = Date.now();

    return Promise.resolve(
      SEEDED_USERS.map(({ id, name, lastSeenDaysAgo, suspended }) => ({
        id,
        name,
        suspended,
        lastSeenAt: new Date(now - lastSeenDaysAgo * MS_PER_DAY),
      })),
    );
  }
}
