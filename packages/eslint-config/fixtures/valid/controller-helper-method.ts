// A non-route helper method may do as it likes; only route handlers are in scope.
@Controller('health')
export class HealthController {
  constructor(private probes: ProbeService) {}

  @Get()
  check() {
    return this.describe();
  }

  private describe() {
    return { status: 'ok' };
  }
}
