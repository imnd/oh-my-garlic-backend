import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RecipeComponent } from './recipe-component.entity';

@Entity()
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  category: string; // Kitchen, Bar, Desserts

  @Column('decimal', { precision: 12, scale: 2 })
  price: number;

  @OneToMany(() => RecipeComponent, (component) => component.menuItem, { cascade: true })
  recipeComponents: RecipeComponent[];
}
