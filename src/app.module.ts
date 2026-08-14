import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

// Load env variables
dotenv.config();

// Entities
import { Ingredient } from './entities/ingredient.entity';
import { Purchase } from './entities/purchase.entity';
import { MenuItem } from './entities/menu-item.entity';
import { RecipeComponent } from './entities/recipe-component.entity';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { WriteOff } from './entities/write-off.entity';
import { ProductionExpense } from './entities/production-expense.entity';

// Service & Controllers
import { ErpService } from './services/erp.service';
import { IngredientsController } from './controllers/ingredients.controller';
import { PurchasesController } from './controllers/purchases.controller';
import { MenuItemsController } from './controllers/menu-items.controller';
import { SalesController } from './controllers/sales.controller';
import { WriteOffsController } from './controllers/write-offs.controller';
import { ExpensesController } from './controllers/expenses.controller';
import { ReportsController } from './controllers/reports.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'restaurant_erp',
      entities: [
        Ingredient,
        Purchase,
        MenuItem,
        RecipeComponent,
        Sale,
        SaleItem,
        WriteOff,
        ProductionExpense,
      ],
      synchronize: true, // For development ease
    }),
    TypeOrmModule.forFeature([
      Ingredient,
      Purchase,
      MenuItem,
      RecipeComponent,
      Sale,
      SaleItem,
      WriteOff,
      ProductionExpense,
    ]),
  ],
  controllers: [
    IngredientsController,
    PurchasesController,
    MenuItemsController,
    SalesController,
    WriteOffsController,
    ExpensesController,
    ReportsController,
  ],
  providers: [ErpService],
})
export class AppModule {}
