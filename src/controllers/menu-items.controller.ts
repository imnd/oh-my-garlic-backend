import { Controller, Get, Post, Body } from '@nestjs/common';
import { ErpService } from '../services/erp.service';
import { MenuItem } from '../entities/menu-item.entity';

@Controller('api/menu-items')
export class MenuItemsController {
  constructor(private readonly erpService: ErpService) {}

  @Get()
  async getMenuItems(): Promise<MenuItem[]> {
    return this.erpService.getMenuItems();
  }

  @Post()
  async createMenuItem(
    @Body()
    body: {
      name: string;
      category: string;
      price: number;
      recipeComponents: Array<{
        ingredientId: number;
        grossWeight: number;
        netWeight: number;
        wastePercentage?: number;
      }>;
    },
  ): Promise<MenuItem> {
    return this.erpService.createMenuItem(body);
  }
}
