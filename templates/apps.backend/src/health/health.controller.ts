import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HealthResponseDto } from './dto/health-response.dto';

// Deliberately NO health.service.ts.
//
// A layer appears when its responsibility appears. This endpoint returns a
// constant, so routing it through an injected service would be exactly the
// single-call-site wrapper that docs/repository/code-design.md forbids -- and
// shipping one in the canonical template would teach every agent to generate
// them. Compare with src/users/, which has a service because it has a use case.
@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    operationId: 'getHealth',
    summary: 'Check template health',
    description: 'Reports that the example process is responding. Does not check a database or external services.',
  })
  @ApiOkResponse({
    description: 'The example process is available.',
    type: HealthResponseDto,
    example: { status: 'ok' },
  })
  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
    };
  }
}
