import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ProductionExpense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 12, scale: 2 })
  cost: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateTime: Date;
}
