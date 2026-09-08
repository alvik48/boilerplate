import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ description: 'The template process is responding.', enum: ['ok'], example: 'ok' })
  status!: 'ok';
}
