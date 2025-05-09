import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm';
import { Product } from './products.entity';

@Entity('categories')
export class Category {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column()
	name!: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@CreateDateColumn()
	created_at!: Date;

	@UpdateDateColumn()
	updated_at!: Date;

	@Column({ type: 'timestamp', nullable: true })
	deleted_at?: Date;

	@OneToMany(() => Product, (product) => product.category)
	products!: Product[];
}
