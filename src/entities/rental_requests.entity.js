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

@Entity("rental_requests")
export class RentalRequest {
	@PrimaryGeneratedColumn("uuid")
	id;

	@Column({ type: "date" })
	start_date;

	@Column({ type: "date" })
	end_date;

	@Column({
		type: "enum",
		enum: ["pending", "approved", "rejected"],
		default: "pending",
	})
	status;

	@CreateDateColumn()
	created_at;

	@UpdateDateColumn()
	updated_at;

	@Column({ type: "timestamp", nullable: true })
	deleted_at;

	@ManyToOne(
		() => User,
		(user) => user.rental_requests,
	)
	@JoinColumn({ name: "user_id" })
	user;

	@ManyToOne(
		() => Product,
		(product) => product.rental_requests,
	)
	@JoinColumn({ name: "product_id" })
	product;
}
