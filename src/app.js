const express = require('express');
require('reflect-metadata');
require('dotenv').config();

const app = express();
app.use(express.json());

app.get('/', (_, res) => {
	res.send(`백엔드 서버 정상 작동 중.`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
