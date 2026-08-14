import { Controller, Get, Post, Body } from '@nestjs/common';
import { ErpService } from '../services/erp.service';
import { ProductionExpense } from '../entities/production-expense.entity';

@Controller('api/production-expenses')
export class ExpensesController {
  constructor(private readonly erpService: ErpService) {}

  @Get()
  async getExpenses(): Promise<ProductionExpense[]> {
    return this.erpService.getExpenses();
  }

  @Post()
  async createExpense(
    @Body() body: { name: string; cost: number; dateTime?: Date },
  ): Promise<ProductionExpense> {
    return this.erpService.createExpense(body);
  }
}
