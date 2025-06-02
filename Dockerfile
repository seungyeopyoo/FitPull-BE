# 1. Node 20 기반 이미지 사용
FROM node:20

# 2. 컨테이너 내부 작업 디렉토리 설정
WORKDIR /app

# 3. 종속성 설치 (캐시 유리하게 먼저 복사)
COPY package.json yarn.lock ./
RUN yarn install

# 4. 전체 소스 복사
COPY . .

# 5. Prisma client 생성
RUN yarn prisma generate

# 6. 컨테이너 포트 오픈 (현재 3000 포트 사용)
EXPOSE 3000

# 7. 서버 실행 명령어
CMD ["yarn", "start"]