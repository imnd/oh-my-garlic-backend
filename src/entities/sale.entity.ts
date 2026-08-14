import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { SaleItem } from './sale-item.entity';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateTime: Date;

  @Column()
  paymentType: string; // Cash, Terminal, QR Code

  @Column({ default: 'Paid' })
  status: string; // Paid, Cancelled

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items: SaleItem[];
}
