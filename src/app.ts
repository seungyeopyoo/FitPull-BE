import express, { Request, Response } from 'express';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (_: Request, res: Response) => {
	res.send('백엔드 서버 정상 작동 중.');
});

const PORT: number = parseInt(process.env.PORT || '3000', 10);

AppDataSource.initialize()
	.then(() => {
		console.log('DB 연결 성공');
		app.listen(PORT, () => {
			console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
		});
	})
	.catch((err: Error) => {
		console.error('DB 연결 실패:', err);
	});
