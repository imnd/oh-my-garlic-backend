import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Ingredient } from './ingredient.entity';

@Entity()
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ingredientId: number;

  @ManyToOne(() => Ingredient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateTime: Date;

  @Column('decimal', { precision: 12, scale: 4 })
  quantity: number;

  @Column('int')
  unitPrice: number;

  @Column('int')
  totalCost: number;

  @Column()
  paymentMethod: string; // Cash, Transfer, Advance, etc.

  @Column({ nullable: true })
  comments: string;
}
