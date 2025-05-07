import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: process.env.DB_HOST,
	port: parseInt(process.env.DB_PORT),
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
	synchronize: process.env.NODE_ENV === 'development',
	logging: process.env.NODE_ENV === 'development',
	entities: ['src/entities/**/*.js'],
	migrations: ['src/migrations/**/*.js'],
	subscribers: ['src/subscribers/**/*.js'],
});
