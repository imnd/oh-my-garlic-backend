import { Controller, Get, Post, Body } from '@nestjs/common';
import { ErpService } from '../services/erp.service';
import { Sale } from '../entities/sale.entity';

@Controller('api/sales')
export class SalesController {
  constructor(private readonly erpService: ErpService) {}

  @Get()
  async getSales(): Promise<Sale[]> {
    return this.erpService.getSales();
  }

  @Post()
  async createSale(
    @Body()
    body: {
      paymentType: string;
      dateTime?: Date;
      items: Array<{ menuItemId: number; quantity: number }>;
    },
  ): Promise<Sale> {
    return this.erpService.createSale(body);
  }
}
