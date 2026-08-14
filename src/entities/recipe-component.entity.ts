import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MenuItem } from './menu-item.entity';
import { Ingredient } from './ingredient.entity';

@Entity()
export class RecipeComponent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  menuItemId: number;

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.recipeComponents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menuItemId' })
  menuItem: MenuItem;

  @Column()
  ingredientId: number;

  @ManyToOne(() => Ingredient, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;

  @Column('decimal', { precision: 12, scale: 4 })
  grossWeight: number;

  @Column('decimal', { precision: 12, scale: 4 })
  netWeight: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  wastePercentage: number;
}
