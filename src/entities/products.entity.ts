import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './categories.entity';
import { RentalRequest } from './rental_requests.entity';
import { CompletedRental } from './completed_rentals.entity';

@Entity('products')
export class Product {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column()
	title!: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column({ type: 'int' })
	price!: number;

	@Column({
		type: 'enum',
		enum: ['pending', 'approved', 'rejected', 'canceled'],
		default: 'pending',
	})
	status!: 'pending' | 'approved' | 'rejected' | 'canceled';

	@Column({ type: 'boolean', default: false })
	allow_purchase!: boolean;

	@Column({ type: 'text', array: true, nullable: true })
	image_urls?: string[];

	@CreateDateColumn()
	created_at!: Date;

	@UpdateDateColumn()
	updated_at!: Date;

	@Column({ type: 'timestamp', nullable: true })
	deleted_at?: Date;

	@ManyToOne(() => User, (user) => user.products)
	@JoinColumn({ name: 'owner_id' })
	owner!: User;

	@ManyToOne(() => Category, (category) => category.products)
	@JoinColumn({ name: 'category_id' })
	category!: Category;

	@OneToMany(() => RentalRequest, (request) => request.product)
	rental_requests!: RentalRequest[];

	@OneToMany(() => CompletedRental, (rental) => rental.product)
	completed_rentals!: CompletedRental[];
}
