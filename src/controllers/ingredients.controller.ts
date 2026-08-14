import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ErpService } from '../services/erp.service';
import { Ingredient } from '../entities/ingredient.entity';

@Controller('api/ingredients')
export class IngredientsController {
  constructor(private readonly erpService: ErpService) {}

  @Get()
  async getIngredients(): Promise<Ingredient[]> {
    return this.erpService.getIngredients();
  }

  @Post()
  async createIngredient(@Body() body: Partial<Ingredient>): Promise<Ingredient> {
    return this.erpService.createIngredient(body);
  }

  @Put(':id')
  async updateIngredient(
    @Param('id') id: string,
    @Body() body: Partial<Ingredient>,
  ): Promise<Ingredient> {
    return this.erpService.updateIngredient(Number(id), body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteIngredient(@Param('id') id: string): Promise<void> {
    await this.erpService.deleteIngredient(Number(id));
  }
}
