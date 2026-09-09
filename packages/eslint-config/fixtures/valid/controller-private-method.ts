// DOCUMENTED BLIND SPOT: the handler makes one call, but the private method it
// calls orchestrates three services. Catching this needs cross-method analysis,
// which the rule does not attempt. Review owns it.
@Controller('orders')
export class OrdersIndirectController {
  constructor(
    private orders: OrdersService,
    private payment: PaymentService,
    private notifications: NotificationService,
  ) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    return this.run(dto);
  }

  private async run(dto: CreateOrderDto) {
    const order = await this.orders.create(dto);
    await this.payment.charge(order);
    await this.notifications.sendOrderConfirmation(order);

    return order;
  }
}
