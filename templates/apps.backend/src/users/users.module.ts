import { Module } from '@nestjs/common';

import { UsersData } from './data/users.data';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// Provider exports are explicit. Another feature that needs UsersService imports
// UsersModule and relies on this `exports` list -- it never re-registers
// UsersService in its own `providers`, which would create a second instance and
// silently break request and transaction scope.
// See docs/repository/backend.md, "Cross-Feature Access".
@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersData],
  exports: [UsersService],
})
export class UsersModule {}
