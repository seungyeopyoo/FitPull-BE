import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity("categories")
export class Category {
	@PrimaryGeneratedColumn("uuid")
	id;

	@Column()
	name;

	@Column({ type: "text", nullable: true })
	description;

	@CreateDateColumn()
	created_at;

	@UpdateDateColumn()
	updated_at;

	@Column({ type: "timestamp", nullable: true })
	deleted_at;
}
