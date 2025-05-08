import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from "typeorm";
import { Account } from "./accounts.entity.js";
import { Product } from "./products.entity.js";

@Entity("users")
export class User {
	@PrimaryGeneratedColumn("uuid")
	id;

	@Column()
	name;

	@Column()
	phone;

	@Column({ type: "text", nullable: true })
	profile_image;

	@Column({ type: "enum", enum: ["user", "admin"], default: "user" })
	role;

	@CreateDateColumn()
	created_at;

	@UpdateDateColumn()
	updated_at;

	@Column({ type: "timestamp", nullable: true })
	deleted_at;

	@OneToMany(
		() => Account,
		(account) => account.user,
	)
	accounts;

	@OneToMany(
		() => Product,
		(product) => product.owner,
	)
	products;
}
