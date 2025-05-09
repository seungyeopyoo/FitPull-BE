import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm';
import { Account } from './accounts.entity';
import { Product } from './products.entity';
import { RentalRequest } from './rental_requests.entity';
import { CompletedRental } from './completed_rentals.entity';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column()
	name!: string;

	@Column()
	phone!: string;

	@Column({ type: 'text', nullable: true })
	profile_image?: string;

	@Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
	role!: 'user' | 'admin';

	@CreateDateColumn()
	created_at!: Date;

	@UpdateDateColumn()
	updated_at!: Date;

	@Column({ type: 'timestamp', nullable: true })
	deleted_at?: Date;

	@OneToMany(() => Account, (account) => account.user)
	accounts!: Account[];

	@OneToMany(() => Product, (product) => product.owner)
	products!: Product[];

	@OneToMany(() => RentalRequest, (request) => request.user)
	rental_requests!: RentalRequest[];

	@OneToMany(() => CompletedRental, (rental) => rental.user)
	completed_rentals!: CompletedRental[];
}
