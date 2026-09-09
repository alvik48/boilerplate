// A collaborator call inside a callback is the same problem as a loop.
@Controller('orders')
export class OrdersMapController {
  constructor(private orders: OrdersService) {}

  @Post('map')
  async createMany(@Body() items: CreateOrderDto[]) {
    return Promise.all(items.map((item) => this.orders.create(item)));
  }
}
