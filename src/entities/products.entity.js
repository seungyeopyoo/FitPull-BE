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
import { Category } from "./categories.entity.js";

@Entity("products")
export class Product {
	@PrimaryGeneratedColumn("uuid")
	id;

	@Column()
	title;

	@Column({ type: "text", nullable: true })
	description;

	@Column({ type: "int" })
	price;

	@Column({
		type: "enum",
		enum: ["pending", "approved", "rejected", "canceled"], // 대기중 , 승인, 거절, 취소상태(유저가 취소했을 시)
		default: "pending",
	})
	status;

	@Column({ type: "boolean", default: false })
	allow_purchase;

	@Column({ type: "text", array: true, nullable: true })
	image_urls;

	@CreateDateColumn()
	created_at;

	@UpdateDateColumn()
	updated_at;

	@Column({ type: "timestamp", nullable: true })
	deleted_at;

	@ManyToOne(
		() => User,
		(user) => user.products,
	)
	@JoinColumn({ name: "owner_id" })
	owner;

	@ManyToOne(
		() => Category,
		(category) => category.products,
	)
	@JoinColumn({ name: "category_id" })
	category;
}
