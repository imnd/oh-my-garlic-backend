import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Sale } from './sale.entity';
import { MenuItem } from './menu-item.entity';

@Entity()
export class SaleItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  saleId: number;

  @ManyToOne(() => Sale, (sale) => sale.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'saleId' })
  sale: Sale;

  @Column()
  menuItemId: number;

  @ManyToOne(() => MenuItem, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'menuItemId' })
  menuItem: MenuItem;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 12, scale: 4, default: 0 })
  cogs: number; // Cost of Goods Sold for this item at sale time
}
