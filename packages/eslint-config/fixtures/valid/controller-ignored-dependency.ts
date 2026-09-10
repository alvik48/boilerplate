// An injected logger is cross-cutting, not orchestration.
@Controller('orders')
export class OrdersLoggedController {
  constructor(
    private orders: OrdersService,
    private logger: Logger,
  ) {}

  @Get()
  async list() {
    this.logger.log('listing orders');

    return this.orders.findAll();
  }
}
