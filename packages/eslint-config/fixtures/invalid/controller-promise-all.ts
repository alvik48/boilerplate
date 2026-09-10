// One `await`, two operations. Counting awaits would miss this.
@Controller('dashboard')
export class DashboardController {
  constructor(
    private orders: OrdersService,
    private users: UsersService,
  ) {}

  @Get()
  async load() {
    const [orders, users] = await Promise.all([this.orders.recent(), this.users.active()]);

    return { orders, users };
  }
}
