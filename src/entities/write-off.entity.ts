import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Ingredient } from './ingredient.entity';

@Entity()
export class WriteOff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ingredientId: number;

  @ManyToOne(() => Ingredient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;

  @Column('decimal', { precision: 12, scale: 4 })
  quantity: number;

  @Column()
  type: string; // Sales, Spoilage, StaffMeals, Tasting

  @Column({ nullable: true })
  reason: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateTime: Date;

  @Column('decimal', { precision: 12, scale: 4, default: 0 })
  cost: number; // cost calculated at write-off time
}
