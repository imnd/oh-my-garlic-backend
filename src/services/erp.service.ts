import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

// Entities
import { Ingredient } from '../entities/ingredient.entity';
import { Purchase } from '../entities/purchase.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { RecipeComponent } from '../entities/recipe-component.entity';
import { Sale } from '../entities/sale.entity';
import { SaleItem } from '../entities/sale-item.entity';
import { WriteOff } from '../entities/write-off.entity';
import { ProductionExpense } from '../entities/production-expense.entity';

@Injectable()
export class ErpService {
  private readonly logger = new Logger(ErpService.name);

  // Simple alert log system for insufficient stock
  public alerts: Array<{ message: string; timestamp: Date }> = [];

  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepo: Repository<Ingredient>,
    @InjectRepository(Purchase)
    private purchaseRepo: Repository<Purchase>,
    @InjectRepository(MenuItem)
    private menuItemRepo: Repository<MenuItem>,
    @InjectRepository(RecipeComponent)
    private recipeComponentRepo: Repository<RecipeComponent>,
    @InjectRepository(Sale)
    private saleRepo: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepo: Repository<SaleItem>,
    @InjectRepository(WriteOff)
    private writeOffRepo: Repository<WriteOff>,
    @InjectRepository(ProductionExpense)
    private expenseRepo: Repository<ProductionExpense>,
  ) {}

  // ----------------------------------------------------
  // INGREDIENTS
  // ----------------------------------------------------
  async getIngredients(): Promise<Ingredient[]> {
    return this.ingredientRepo.find({ order: { name: 'ASC' } });
  }

  async createIngredient(data: Partial<Ingredient>): Promise<Ingredient> {
    const item = this.ingredientRepo.create({
      name: data.name,
      unit: data.unit,
      category: data.category,
      stock: Number(data.stock || 0),
      averagePrice: Number(data.averagePrice || 0),
    });
    return this.ingredientRepo.save(item);
  }

  async updateIngredient(id: number, data: Partial<Ingredient>): Promise<Ingredient> {
    const ingredient = await this.ingredientRepo.findOneBy({ id });
    if (!ingredient) {
      throw new Error(`Ingredient with ID ${id} not found`);
    }
    if (data.name !== undefined) ingredient.name = data.name;
    if (data.unit !== undefined) ingredient.unit = data.unit;
    if (data.category !== undefined) ingredient.category = data.category;
    if (data.stock !== undefined) ingredient.stock = Number(data.stock);
    if (data.averagePrice !== undefined) ingredient.averagePrice = Number(data.averagePrice);
    return this.ingredientRepo.save(ingredient);
  }

  async deleteIngredient(id: number): Promise<void> {
    const ingredient = await this.ingredientRepo.findOneBy({ id });
    if (!ingredient) {
      throw new Error(`Ingredient with ID ${id} not found`);
    }
    await this.ingredientRepo.remove(ingredient);
  }

  // ----------------------------------------------------
  // PURCHASES
  // ----------------------------------------------------
  async getPurchases(): Promise<Purchase[]> {
    return this.purchaseRepo.find({
      relations: ['ingredient'],
      order: { dateTime: 'DESC' },
    });
  }

  async createPurchase(data: {
    ingredientId: number;
    dateTime?: Date;
    quantity: number;
    unitPrice: number;
    paymentMethod: string;
    comments?: string;
  }): Promise<Purchase> {
    const ingredient = await this.ingredientRepo.findOneBy({ id: data.ingredientId });
    if (!ingredient) {
      throw new Error(`Ingredient with ID ${data.ingredientId} not found`);
    }

    const qty = Number(data.quantity);
    const price = Math.round(Number(data.unitPrice));
    const total = Math.round(qty * price);

    const oldStock = Number(ingredient.stock);
    const oldAvg = Number(ingredient.averagePrice);

    // Calculate weighted average cost
    let newAvg = oldAvg;
    const totalQty = oldStock + qty;
    if (totalQty > 0) {
      newAvg = (oldStock * oldAvg + qty * price) / totalQty;
    } else {
      newAvg = price;
    }

    // Update ingredient stock and average price
    ingredient.stock = Number((oldStock + qty).toFixed(4));
    ingredient.averagePrice = Number(newAvg.toFixed(4));
    await this.ingredientRepo.save(ingredient);

    // Create purchase entry
    const purchase = this.purchaseRepo.create({
      ingredientId: data.ingredientId,
      dateTime: data.dateTime ? new Date(data.dateTime) : new Date(),
      quantity: qty,
      unitPrice: price,
      totalCost: total,
      paymentMethod: data.paymentMethod,
      comments: data.comments,
    });

    return this.purchaseRepo.save(purchase);
  }

  // ----------------------------------------------------
  // MENU ITEMS & RECIPES
  // ----------------------------------------------------
  async getMenuItems(): Promise<MenuItem[]> {
    return this.menuItemRepo.find({
      relations: ['recipeComponents', 'recipeComponents.ingredient'],
      order: { name: 'ASC' },
    });
  }

  async getMenuItemCost(menuItemId: number): Promise<number> {
    const components = await this.recipeComponentRepo.find({
      where: { menuItemId },
      relations: ['ingredient'],
    });

    let totalCost = 0;
    for (const comp of components) {
      const avgPrice = comp.ingredient ? Number(comp.ingredient.averagePrice) : 0;
      totalCost += Number(comp.grossWeight) * avgPrice;
    }
    return Number(totalCost.toFixed(4));
  }

  async createMenuItem(data: {
    name: string;
    category: string;
    price: number;
    recipeComponents: Array<{
      ingredientId: number;
      grossWeight: number;
      netWeight: number;
      wastePercentage?: number;
    }>;
  }): Promise<MenuItem> {
    // Create MenuItem
    const menuItem = this.menuItemRepo.create({
      name: data.name,
      category: data.category,
      price: Number(data.price),
    });
    const savedMenu = await this.menuItemRepo.save(menuItem);

    // Save recipe components
    if (data.recipeComponents && data.recipeComponents.length > 0) {
      const comps = data.recipeComponents.map((rc) => {
        const gross = Number(rc.grossWeight);
        const net = Number(rc.netWeight);
        const waste = rc.wastePercentage !== undefined
          ? rc.wastePercentage
          : gross > 0 ? ((gross - net) / gross) * 100 : 0;

        return this.recipeComponentRepo.create({
          menuItemId: savedMenu.id,
          ingredientId: rc.ingredientId,
          grossWeight: gross,
          netWeight: net,
          wastePercentage: Number(waste.toFixed(2)),
        });
      });
      await this.recipeComponentRepo.save(comps);
    }

    return this.menuItemRepo.findOne({
      where: { id: savedMenu.id },
      relations: ['recipeComponents', 'recipeComponents.ingredient'],
    });
  }

  // ----------------------------------------------------
  // WRITE-OFFS (MANUAL DEDUCTIONS)
  // ----------------------------------------------------
  async getWriteOffs(): Promise<WriteOff[]> {
    return this.writeOffRepo.find({
      relations: ['ingredient'],
      order: { dateTime: 'DESC' },
    });
  }

  async createWriteOff(data: {
    ingredientId: number;
    quantity: number;
    type: string; // Spoilage, StaffMeals, Tasting, etc.
    reason?: string;
    dateTime?: Date;
  }): Promise<WriteOff> {
    const ingredient = await this.ingredientRepo.findOneBy({ id: data.ingredientId });
    if (!ingredient) {
      throw new Error(`Ingredient ${data.ingredientId} not found`);
    }

    const qty = Number(data.quantity);
    const avgPrice = Number(ingredient.averagePrice);
    const cost = qty * avgPrice;

    // Deduct from stock (can go negative)
    ingredient.stock = Number((Number(ingredient.stock) - qty).toFixed(4));
    await this.ingredientRepo.save(ingredient);

    const writeOff = this.writeOffRepo.create({
      ingredientId: data.ingredientId,
      quantity: qty,
      type: data.type,
      reason: data.reason,
      dateTime: data.dateTime ? new Date(data.dateTime) : new Date(),
      cost: Number(cost.toFixed(4)),
    });

    return this.writeOffRepo.save(writeOff);
  }

  // ----------------------------------------------------
  // PRODUCTION EXPENSES
  // ----------------------------------------------------
  async getExpenses(): Promise<ProductionExpense[]> {
    return this.expenseRepo.find({ order: { dateTime: 'DESC' } });
  }

  async createExpense(data: { name: string; cost: number; dateTime?: Date }): Promise<ProductionExpense> {
    const exp = this.expenseRepo.create({
      name: data.name,
      cost: Number(data.cost),
      dateTime: data.dateTime ? new Date(data.dateTime) : new Date(),
    });
    return this.expenseRepo.save(exp);
  }

  // ----------------------------------------------------
  // SALES (POS)
  // ----------------------------------------------------
  async getSales(): Promise<Sale[]> {
    return this.saleRepo.find({
      relations: ['items', 'items.menuItem'],
      order: { dateTime: 'DESC' },
    });
  }

  async createSale(data: {
    paymentType: string; // Cash, Terminal, QR Code
    dateTime?: Date;
    items: Array<{ menuItemId: number; quantity: number }>;
  }): Promise<Sale> {
    const sale = this.saleRepo.create({
      paymentType: data.paymentType,
      dateTime: data.dateTime ? new Date(data.dateTime) : new Date(),
      status: 'Paid',
    });
    const savedSale = await this.saleRepo.save(sale);

    const saleItems: SaleItem[] = [];
    for (const it of data.items) {
      // Calculate COGS at the time of sale
      const costPerItem = await this.getMenuItemCost(it.menuItemId);
      const saleItem = this.saleItemRepo.create({
        saleId: savedSale.id,
        menuItemId: it.menuItemId,
        quantity: Number(it.quantity),
        cogs: Number((costPerItem * Number(it.quantity)).toFixed(4)),
      });
      saleItems.push(await this.saleItemRepo.save(saleItem));
    }

    savedSale.items = saleItems;

    // Trigger async stock deduction
    this.deductInventoryForSale(savedSale.id).catch((err) => {
      this.logger.error(`Failed async stock deduction for Sale ${savedSale.id}: ${err.message}`);
    });

    return savedSale;
  }

  // Asynchronous stock deduction
  private async deductInventoryForSale(saleId: number) {
    const sale = await this.saleRepo.findOne({
      where: { id: saleId },
      relations: ['items', 'items.menuItem', 'items.menuItem.recipeComponents', 'items.menuItem.recipeComponents.ingredient'],
    });
    if (!sale) return;

    for (const item of sale.items) {
      if (!item.menuItem || !item.menuItem.recipeComponents) continue;
      for (const component of item.menuItem.recipeComponents) {
        const ingredient = component.ingredient;
        if (!ingredient) continue;

        const deductionQty = Number(component.grossWeight) * Number(item.quantity);
        const oldStock = Number(ingredient.stock);
        const newStock = Number((oldStock - deductionQty).toFixed(4));

        // Alert management on negative stock
        if (newStock < 0) {
          const alertMsg = `Low/Negative stock for ingredient "${ingredient.name}": requested ${deductionQty}${ingredient.unit}, stock became ${newStock}${ingredient.unit}.`;
          this.logger.warn(alertMsg);
          this.alerts.push({ message: alertMsg, timestamp: new Date() });
        }

        ingredient.stock = newStock;
        await this.ingredientRepo.save(ingredient);

        // Also record a silent write-off entry for tracking movement of type "Sales"
        await this.writeOffRepo.save(
          this.writeOffRepo.create({
            ingredientId: ingredient.id,
            quantity: deductionQty,
            type: 'Sales',
            reason: `Sale #${sale.id} - ${item.menuItem.name} (x${item.quantity})`,
            dateTime: sale.dateTime,
            cost: Number((deductionQty * Number(ingredient.averagePrice)).toFixed(4)),
          })
        );
      }
    }
  }

  // ----------------------------------------------------
  // REPORTS & ANALYTICS
  // ----------------------------------------------------
  async getSystemAlerts() {
    return this.alerts;
  }

  async clearSystemAlerts() {
    this.alerts = [];
    return { success: true };
  }

  // Ledger: Starting Balance + Intake - Outflow = Ending Balance
  async getLedgerReport(startDateStr?: string, endDateStr?: string) {
    const ingredients = await this.ingredientRepo.find({ order: { name: 'ASC' } });
    
    const start = startDateStr ? new Date(startDateStr) : new Date(0);
    const end = endDateStr ? new Date(endDateStr) : new Date();

    const ledger = [];
    for (const ing of ingredients) {
      // 1. Get purchases before start date for starting stock calculations, or just get all activity
      // Let's compute actual flows within the window [start, end]
      const purchasesInPeriod = await this.purchaseRepo.find({
        where: {
          ingredientId: ing.id,
          dateTime: Between(start, end),
        },
      });

      const writeOffsInPeriod = await this.writeOffRepo.find({
        where: {
          ingredientId: ing.id,
          dateTime: Between(start, end),
        },
      });

      const totalIntake = purchasesInPeriod.reduce((sum, p) => sum + Number(p.quantity), 0);
      const totalOutflow = writeOffsInPeriod.reduce((sum, w) => sum + Number(w.quantity), 0);

      // Starting Balance = Current Stock - Intake in period + Outflow in period
      const currentStock = Number(ing.stock);
      const startingStock = Number((currentStock - totalIntake + totalOutflow).toFixed(4));

      ledger.push({
        ingredientId: ing.id,
        name: ing.name,
        unit: ing.unit,
        category: ing.category,
        startingBalance: startingStock,
        intake: totalIntake,
        outflow: totalOutflow,
        endingBalance: currentStock,
        averagePrice: Number(ing.averagePrice),
      });
    }

    return ledger;
  }

  // P&L Statement
  async getProfitLossReport(startDateStr?: string, endDateStr?: string) {
    const start = startDateStr ? new Date(startDateStr) : new Date(0);
    const end = endDateStr ? new Date(endDateStr) : new Date();

    // Gross Sales Revenue & COGS from Paid sales
    const sales = await this.saleRepo.find({
      where: {
        status: 'Paid',
        dateTime: Between(start, end),
      },
      relations: ['items', 'items.menuItem'],
    });

    let grossSalesRevenue = 0;
    let cogs = 0;

    for (const sale of sales) {
      for (const item of sale.items) {
        if (item.menuItem) {
          grossSalesRevenue += Number(item.menuItem.price) * Number(item.quantity);
        }
        cogs += Number(item.cogs);
      }
    }

    // Operational Loss (manual write offs like spoilage, staff meals, tasting)
    const writeOffs = await this.writeOffRepo.find({
      where: {
        dateTime: Between(start, end),
      },
    });

    // Filter out 'Sales' write-offs since they are already counted under COGS
    const opWriteOffs = writeOffs.filter((w) => w.type !== 'Sales');
    const operationalLoss = opWriteOffs.reduce((sum, w) => sum + Number(w.cost), 0);

    // Direct Expenses (gas, cutlery, gas)
    const expenses = await this.expenseRepo.find({
      where: {
        dateTime: Between(start, end),
      },
    });
    const directExpenses = expenses.reduce((sum, e) => sum + Number(e.cost), 0);

    const grossProfit = grossSalesRevenue - cogs;
    const netProfit = grossProfit - operationalLoss - directExpenses;

    // Margins per item
    const menuItems = await this.menuItemRepo.find();
    const itemMargins = [];
    for (const item of menuItems) {
      const cost = await this.getMenuItemCost(item.id);
      const price = Number(item.price);
      const marginVal = price - cost;
      const marginPercent = price > 0 ? (marginVal / price) * 100 : 0;
      itemMargins.push({
        id: item.id,
        name: item.name,
        category: item.category,
        price,
        cost,
        margin: Number(marginVal.toFixed(2)),
        marginPercent: Number(marginPercent.toFixed(2)),
      });
    }

    return {
      grossSalesRevenue: Number(grossSalesRevenue.toFixed(2)),
      cogs: Number(cogs.toFixed(2)),
      grossProfit: Number(grossProfit.toFixed(2)),
      operationalLoss: Number(operationalLoss.toFixed(2)),
      directExpenses: Number(directExpenses.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      itemMargins,
    };
  }

  // Procurement Analytics: Track market price fluctuations for core ingredients over time
  async getProcurementAnalytics() {
    const purchases = await this.purchaseRepo.find({
      relations: ['ingredient'],
      order: { dateTime: 'ASC' },
    });

    // Group purchases by ingredient
    const analytics = {};
    for (const p of purchases) {
      if (!p.ingredient) continue;
      if (!analytics[p.ingredient.id]) {
        analytics[p.ingredient.id] = {
          ingredientId: p.ingredient.id,
          name: p.ingredient.name,
          unit: p.ingredient.unit,
          history: [],
        };
      }
      analytics[p.ingredient.id].history.push({
        dateTime: p.dateTime,
        unitPrice: Number(p.unitPrice),
        quantity: Number(p.quantity),
      });
    }

    return Object.values(analytics);
  }
}
