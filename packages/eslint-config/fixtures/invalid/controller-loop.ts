// One call site, N operations. Pure counting misses this.
@Controller('orders')
export class OrdersBulkController {
  constructor(private orders: OrdersService) {}

  @Post('bulk')
  async createMany(@Body() items: CreateOrderDto[]) {
    for (const item of items) {
      await this.orders.create(item);
    }

    return { count: items.length };
  }
}
