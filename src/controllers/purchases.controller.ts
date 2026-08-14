import { Controller, Get, Post, Body } from '@nestjs/common';
import { ErpService } from '../services/erp.service';
import { Purchase } from '../entities/purchase.entity';

@Controller('api/purchases')
export class PurchasesController {
  constructor(private readonly erpService: ErpService) {}

  @Get()
  async getPurchases(): Promise<Purchase[]> {
    return this.erpService.getPurchases();
  }

  @Post()
  async createPurchase(
    @Body()
    body: {
      ingredientId: number;
      dateTime?: Date;
      quantity: number;
      unitPrice: number;
      paymentMethod: string;
      comments?: string;
    },
  ): Promise<Purchase> {
    return this.erpService.createPurchase(body);
  }
}
