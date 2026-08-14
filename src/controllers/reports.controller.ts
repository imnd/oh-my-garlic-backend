import { Controller, Get, Query, Post } from '@nestjs/common';
import { ErpService } from '../services/erp.service';

@Controller('api')
export class ReportsController {
  constructor(private readonly erpService: ErpService) {}

  @Get('reports/ledger')
  async getLedger(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.erpService.getLedgerReport(startDate, endDate);
  }

  @Get('reports/pl')
  async getProfitLoss(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.erpService.getProfitLossReport(startDate, endDate);
  }

  @Get('reports/procurement-analytics')
  async getProcurementAnalytics() {
    return this.erpService.getProcurementAnalytics();
  }

  @Get('alerts')
  async getAlerts() {
    return this.erpService.getSystemAlerts();
  }

  @Post('alerts/clear')
  async clearAlerts() {
    return this.erpService.clearSystemAlerts();
  }
}
