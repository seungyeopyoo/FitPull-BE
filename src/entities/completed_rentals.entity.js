import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { User } from "./user.entity.js";
import { Product } from "./products.entity.js";
import { RentalRequest } from "./rental_requests.entity.js";

@Entity("completed_rentals")
export class CompletedRental {
	@PrimaryGeneratedColumn("uuid")
	id;

	@Column({ type: "date" })
	start_date;

	@Column({ type: "date" })
	end_date;

	@Column({ type: "int" })
	total_price;

	@CreateDateColumn()
	created_at;

	@UpdateDateColumn()
	updated_at;

	@Column({ type: "timestamp", nullable: true })
	deleted_at;

	@ManyToOne(
		() => User,
		(user) => user.completed_rentals,
	)
	@JoinColumn({ name: "user_id" })
	user;

	@ManyToOne(
		() => Product,
		(product) => product.completed_rentals,
	)
	@JoinColumn({ name: "product_id" })
	product;

	@ManyToOne(
		() => RentalRequest,
		(request) => request.completed_rental,
	)
	@JoinColumn({ name: "rental_request_id" })
	rental_request;
}
