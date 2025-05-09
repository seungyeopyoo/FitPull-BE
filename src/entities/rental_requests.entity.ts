import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './products.entity';
import { CompletedRental } from './completed_rentals.entity';

@Entity('rental_requests')
export class RentalRequest {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column({ type: 'date' })
	start_date!: Date;

	@Column({ type: 'date' })
	end_date!: Date;

	@Column({
		type: 'enum',
		enum: ['pending', 'approved', 'rejected'],
		default: 'pending',
	})
	status!: 'pending' | 'approved' | 'rejected';

	@CreateDateColumn()
	created_at!: Date;

	@UpdateDateColumn()
	updated_at!: Date;

	@Column({ type: 'timestamp', nullable: true })
	deleted_at?: Date;

	@ManyToOne(() => User, (user) => user.rental_requests)
	@JoinColumn({ name: 'user_id' })
	user!: User;

	@ManyToOne(() => Product, (product) => product.rental_requests)
	@JoinColumn({ name: 'product_id' })
	product!: Product;

	@OneToOne(() => CompletedRental, (rental) => rental.rental_request)
	completed_rental?: CompletedRental;
}
