// Aliasing would otherwise defeat the whole check.
@Controller('orders')
export class OrdersAliasController {
  constructor(private orders: OrdersService) {}

  @Get()
  async list() {
    const svc = this.orders;

    return svc.findAll();
  }
}
