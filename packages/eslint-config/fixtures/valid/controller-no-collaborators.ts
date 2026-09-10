// A health endpoint returning a constant needs no service at all.
@Controller('health')
export class HealthConstantController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}
