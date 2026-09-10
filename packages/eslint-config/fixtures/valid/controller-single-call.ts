// One call plus local argument and response mapping is exactly the shape we want.
@Controller('orders')
export class OrdersCreateController {
  constructor(private createOrder: CreateOrderUseCase) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
    const order = await this.createOrder.execute(user.id, { ...dto, source: 'api' });

    return { id: order.id, total: order.total };
  }
}
