import { Controller, Get, Post, Body } from '@nestjs/common';
import { ErpService } from '../services/erp.service';
import { WriteOff } from '../entities/write-off.entity';

@Controller('api/write-offs')
export class WriteOffsController {
  constructor(private readonly erpService: ErpService) {}

  @Get()
  async getWriteOffs(): Promise<WriteOff[]> {
    return this.erpService.getWriteOffs();
  }

  @Post()
  async createWriteOff(
    @Body()
    body: {
      ingredientId: number;
      quantity: number;
      type: string;
      reason?: string;
      dateTime?: Date;
    },
  ): Promise<WriteOff> {
    return this.erpService.createWriteOff(body);
  }
}
