import { Controller, Get, ParseEnumPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { USER_STATUSES, type UserStatus } from './domain/user-status';
import { UserSummaryDto } from './dto/user-summary.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // Route, status codes, response DTO, and EXACTLY ONE call into the feature.
  // The sequencing (fetch -> derive status -> filter) lives in UsersService.
  // A second collaborator call here would fail `architecture/thin-controller`.
  @Get()
  @ApiOperation({
    operationId: 'listUsers',
    summary: 'List example users',
    description:
      'Returns the seeded example users with a status derived from recent activity. Optionally narrows the list to a single status. Backed by fixed in-process data, not a database.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: USER_STATUSES,
    description: 'Return only users resolving to this status.',
  })
  @ApiOkResponse({
    description: 'Example users, newest activity first as seeded.',
    type: UserSummaryDto,
    isArray: true,
    example: [
      { id: 'u_1', name: 'Ada Lovelace', status: 'active' },
      { id: 'u_2', name: 'Grace Hopper', status: 'idle' },
      { id: 'u_3', name: 'Alan Turing', status: 'dormant' },
      { id: 'u_4', name: 'Katherine Johnson', status: 'suspended' },
    ],
  })
  listUsers(
    @Query('status', new ParseEnumPipe(USER_STATUSES, { optional: true }))
    status?: UserStatus,
  ): Promise<UserSummaryDto[]> {
    return this.users.listByStatus(status);
  }
}
