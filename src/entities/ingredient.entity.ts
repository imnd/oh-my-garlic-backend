import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Ingredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  unit: string; // kg, L, pcs, pack

  @Column()
  category: string;

  @Column('decimal', { precision: 12, scale: 4, default: 0 })
  stock: number;

  @Column('decimal', { precision: 12, scale: 4, default: 0 })
  averagePrice: number;
}
