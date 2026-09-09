import { Injectable } from '@nestjs/common';

import { UsersData } from './data/users.data';
import { resolveUserStatus, type UserStatus } from './domain/user-status';
import { UserSummaryDto } from './dto/user-summary.dto';

// Use-case service: step order and cross-collaborator sequencing live here, not
// in the controller. It builds no queries itself (that is data/) and holds no
// business invariant itself (that is domain/).
@Injectable()
export class UsersService {
  constructor(private readonly users: UsersData) {}

  /**
   * Lists example users, optionally narrowed to one derived status.
   *
   * `now` is a parameter rather than a `new Date()` call inside the body so the
   * use case stays deterministic under test.
   */
  async listByStatus(status?: UserStatus, now: Date = new Date()): Promise<UserSummaryDto[]> {
    const records = await this.users.findAll();

    const summaries = records.map((record) => ({
      id: record.id,
      name: record.name,
      status: resolveUserStatus(record, now),
    }));

    return status === undefined ? summaries : summaries.filter((summary) => summary.status === status);
  }
}
