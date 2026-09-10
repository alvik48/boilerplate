// Only one branch runs, so this is not "two operations" -- but choosing a
// collaborator by request content is business branching, which a controller
// must not do. Reported deliberately, with its own message.
@Controller('reports')
export class ReportsController {
  constructor(
    private csv: CsvReportService,
    private pdf: PdfReportService,
  ) {}

  @Get()
  async build(@Query('format') format: string) {
    if (format === 'pdf') {
      return this.pdf.render();
    }

    return this.csv.render();
  }
}
