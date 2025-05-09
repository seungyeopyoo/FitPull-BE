import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './products.entity';
import { RentalRequest } from './rental_requests.entity';

@Entity('completed_rentals')
export class CompletedRental {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column({ type: 'date' })
	start_date!: Date;

	@Column({ type: 'date' })
	end_date!: Date;

	@Column({ type: 'int' })
	total_price!: number;

	@CreateDateColumn()
	created_at!: Date;

	@UpdateDateColumn()
	updated_at!: Date;

	@Column({ type: 'timestamp', nullable: true })
	deleted_at?: Date;

	@ManyToOne(() => User, (user) => user.completed_rentals)
	@JoinColumn({ name: 'user_id' })
	user!: User;

	@ManyToOne(() => Product, (product) => product.completed_rentals)
	@JoinColumn({ name: 'product_id' })
	product!: Product;

	@ManyToOne(() => RentalRequest, (request) => request.completed_rental)
	@JoinColumn({ name: 'rental_request_id' })
	rental_request!: RentalRequest;
}
