import { ApiProperty } from '@nestjs/swagger';

import { USER_STATUSES, type UserStatus } from '../domain/user-status';

export class UserSummaryDto {
  @ApiProperty({ description: 'Stable identifier for the example user.', example: 'u_1' })
  id!: string;

  @ApiProperty({ description: 'Display name of the example user.', example: 'Ada Lovelace' })
  name!: string;

  @ApiProperty({
    description: 'Account status derived from recent activity and suspension.',
    enum: USER_STATUSES,
    example: 'active',
  })
  status!: UserStatus;
}
