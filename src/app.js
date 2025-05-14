import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import prisma from "./data-source.js";
import authRouter from "./routes/auth.routes.js";
import productRouter from "./routes/product.routes.js";
import userRouter from "./routes/user.router.js";
import categoryRouter from "./routes/category.router.js";

dotenv.config();

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 라우트 설정
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/categories", categoryRouter);

// 기본 라우트
app.get("/", (_, res) => {
	res.send("백엔드 서버 정상 작동 중.");
});

const PORT = Number(process.env.PORT || "3000", 10);

// 서버 시작
app.listen(PORT, "0.0.0.0", () => {
	console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});

// Prisma 연결 테스트
prisma
	.$connect()
	.then(() => {
		console.log("DB 연결 성공");
	})
	.catch((err) => {
		console.error("DB 연결 실패:", err);
	});

// 서버 종료 시 Prisma 연결 해제
process.on("SIGINT", async () => {
	await prisma.$disconnect();
	process.exit(0);
});
