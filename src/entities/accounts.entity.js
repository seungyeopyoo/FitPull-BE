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

@Entity("accounts")
export class Account {
	@PrimaryGeneratedColumn("uuid")
	id;

	@Column({ type: "enum", enum: ["local", "kakao", "google"] })
	provider;

	@Column()
	email;

	@Column({ nullable: true })
	password_hash;

	@CreateDateColumn()
	created_at;

	@UpdateDateColumn()
	updated_at;

	@Column({ type: "timestamp", nullable: true })
	deleted_at;

	@ManyToOne(
		() => User,
		(user) => user.accounts,
	)
	@JoinColumn({ name: "user_id" })
	user;
}
