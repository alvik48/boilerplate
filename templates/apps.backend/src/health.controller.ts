import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HealthResponseDto } from './health-response.dto';

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
