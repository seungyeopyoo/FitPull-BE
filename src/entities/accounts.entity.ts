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

@Entity('accounts')
export class Account {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column({ type: 'enum', enum: ['local', 'kakao', 'google'] })
	provider!: 'local' | 'kakao' | 'google';

	@Column()
	email!: string;

	@Column({ nullable: true })
	password_hash?: string;

	@CreateDateColumn()
	created_at!: Date;

	@UpdateDateColumn()
	updated_at!: Date;

	@Column({ type: 'timestamp', nullable: true })
	deleted_at?: Date;

	@ManyToOne(() => User, (user) => user.accounts)
	@JoinColumn({ name: 'user_id' })
	user!: User;
}
