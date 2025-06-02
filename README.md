# FitPull Overflow (FOF)

## 프로젝트 소개

FitPull Overflow는 "자신에게 꼭 맞는 모든 것을 대여한다"는 컨셉의 대여 서비스 플랫폼입니다.  
물건, 장소, 사람, 재능까지 — 당신이 가진 어떤 것이든 필요한 누군가에게 빌려줄 수 있어요.

-   `git pull`처럼 필요한 걸 당겨온다는 느낌 + 라임 맞추어서 `fit pull`
-   `Stack Overflow`처럼 차고 넘치는 느낌을 주고 싶어서 `overflow`

---

### 기획 배경

이 프로젝트는 **바쁜현대인 , 그중 에서도 저와 같은 .. I성향 + 반복 작업을 최소화하고 싶은 사람들을** 위해 만들어졌어요.

-   직접 만나는 것은 부담스럽고 어려운데 방에 이제는 사용하지 않는 물건이 놀고있는건 불편하고...
-   수익은 내고 싶지만, 사진 찍기/배송/관리 같은 건 직접하려니 너무 귀찮고...
-   중고거래 특유의 애매한 톤앤매너도 어색하고... 새로운 사람 만나기는 너무 무섭고 피곤해요 ...

그래서 **유저는 상품만 보내면**, 그 이후의 모든 과정은 어드민/운영진이 처리합니다.

-   상품 검수/촬영
-   보관 및 상태 기록
-   대여/반납 처리
-   문의 대응까지

**"No 직거래, No 피곤함"**

## FOF입니다.

## ERD

![FOF ERD 전체](./docs/erd/FOFFOURTHERD.png)
[ERD 원본 보기 (ERDCloud)](https://www.erdcloud.com/d/waj7NZ2NAPBamqBPM)

## 파일구조
```
📦 FitPull-BE
 ┣ 📂docs                  
 ┣ 📂prisma         
 ┣ 📂scripts             
 ┣ 📂tasks                
📦src
 ┣ 📂configs
 ┃ ┗ 📜passport.js
 ┣ 📂constants
 ┃ ┣ 📜category.js
 ┃ ┣ 📜index.js
 ┃ ┣ 📜limits.js
 ┃ ┣ 📜messages.js
 ┃ ┣ 📜s3.js
 ┃ ┗ 📜status.js
 ┣ 📂controllers
 ┃ ┣ 📜ai.controller.js
 ┃ ┣ 📜auth.controller.js
 ┃ ┣ 📜category.controller.js
 ┃ ┣ 📜completedRental.controller.js
 ┃ ┣ 📜message.controller.js
 ┃ ┣ 📜notification.controller.js
 ┃ ┣ 📜product.controller.js
 ┃ ┣ 📜productStatusLog.controller.js
 ┃ ┣ 📜rentalRequest.controller.js
 ┃ ┣ 📜reviewController.js
 ┃ ┗ 📜user.controller.js
 ┣ 📂docs
 ┃ ┗ 📜swagger.js
 ┣ 📂middlewares
 ┃ ┣ 📜adminOnly.js
 ┃ ┣ 📜auth.js
 ┃ ┣ 📜errorHandler.js
 ┃ ┣ 📜s3ImageUpload.js
 ┃ ┗ 📜upload.js
 ┣ 📂repositories
 ┃ ┣ 📜ai.repository.js
 ┃ ┣ 📜auth.repository.js
 ┃ ┣ 📜category.repository.js
 ┃ ┣ 📜completedRental.repository.js
 ┃ ┣ 📜message.repository.js
 ┃ ┣ 📜notification.repository.js
 ┃ ┣ 📜product.repository.js
 ┃ ┣ 📜productStatusLog.repository.js
 ┃ ┣ 📜rentalRequest.repository.js
 ┃ ┣ 📜review.repository.js
 ┃ ┗ 📜user.repository.js
 ┣ 📂routes
 ┃ ┣ 📜ai.routes.js
 ┃ ┣ 📜auth.routes.js
 ┃ ┣ 📜category.router.js
 ┃ ┣ 📜completedRental.routes.js
 ┃ ┣ 📜message.router.js
 ┃ ┣ 📜notification.router.js
 ┃ ┣ 📜product.routes.js
 ┃ ┣ 📜productStatusLog.routes.js
 ┃ ┣ 📜rentalRequest.routes.js
 ┃ ┣ 📜review.router.js
 ┃ ┗ 📜user.router.js
 ┣ 📂services
 ┃ ┣ 📜ai.service.js
 ┃ ┣ 📜auth.service.js
 ┃ ┣ 📜category.service.js
 ┃ ┣ 📜completedRental.service.js
 ┃ ┣ 📜message.service.js
 ┃ ┣ 📜notification.service.js
 ┃ ┣ 📜product.service.js
 ┃ ┣ 📜productStatusLog.service.js
 ┃ ┣ 📜rentalRequest.service.js
 ┃ ┣ 📜review.service.js
 ┃ ┗ 📜user.service.js
 ┣ 📂sockets
 ┃ ┗ 📜socket.js
 ┣ 📂utils
 ┃ ┣ 📜customError.js
 ┃ ┣ 📜jwt.js
 ┃ ┣ 📜nodemailer.js
 ┃ ┣ 📜notify.js
 ┃ ┣ 📜redis.js
 ┃ ┣ 📜responseHandler.js
 ┃ ┗ 📜s3.js
 ┣ 📜app.js
 ┗ 📜data-source.js              
 ┣ 📜.biome.json          
 ┣ 📜.dockerignore       
 ┣ 📜.env.example         
 ┣ 📜.env.docker          
 ┣ 📜.gitignore          
 ┣ 📜docker-compose.yml  
 ┣ 📜Dockerfile           
 ┣ 📜package.json        
 ┣ 📜README.md            
 ┣ 📜socketClient.js      
 ┣ 📜socketTest.html     
 ┣ 📜todo.md             
 ┣ 📜yarn.lock           
```
## 기술 스택

<h3>Programming Languages & Frameworks</h3>
<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
  <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" height="32"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" height="32"/>
  <img src="https://img.shields.io/badge/Express-000000?logo=express&logoColor=white" height="32"/>
  <img src="https://img.shields.io/badge/Yarn-2C8EBB?logo=yarn&logoColor=white" height="32"/>
  <img src="https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white" height="32"/>
</div>

<h3>Infrastructure / Database / AI</h3>  
<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" height="32"/>
<img src="https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white" height="32"/>
<img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" height="32"/>
<img src="https://img.shields.io/badge/PM2-2B037A?logo=pm2&logoColor=white" height="32"/>
<img src="https://img.shields.io/badge/Amazon%20S3-569A31?logo=amazonaws&logoColor=white" height="32"/>
<img src="https://img.shields.io/badge/Socket.IO-010101?logo=socket.io&logoColor=white" height="32"/>
<img src="https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white" height="32"/>
<img src="https://img.shields.io/badge/Anthropic-000000?logo=Anthropic&logoColor=white" height="32"/>
</div>

<h3>인증 / 문서화</h3>  
<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
<img src="https://img.shields.io/badge/Passport-34E27A?logo=passport&logoColor=white" height="32"/>
<img src="https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=black" height="32"/>
</div>

<h3>Dev Tools</h3>  
<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
<img src="https://img.shields.io/badge/Git-F05032?logo=git&logoColor=white" height="32"/>
<img src="https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white" height="32"/>
<img src="https://img.shields.io/badge/VSCode-007ACC?logo=visualstudiocode&logoColor=white" height="32"/>
<img src="https://img.shields.io/badge/Insomnia-4000BF?logo=insomnia&logoColor=white" height="32"/>
<img src="https://img.shields.io/badge/GitHub%20Actions-2088FF?logo=githubactions&logoColor=white" height="32"/>
</div>

## 핵심 기능

### 1. 상품 등록 및 관리

-   사용자 상품 등록 (사진, 소개글)
-   관리자 검수 시스템
-   AI 기반 가격 적정성 검사
-   상품 상태 인증 시스템

### 2. AI 기반 서비스

-   상품 가격 적정성 검사 상품명을 통해 중고나라, 당근마켓, 쿠팡에서 적절한 가격응답
-   상황별 맞춤 상품 추천
-   상품평 요약 기능

### 3. 대여 시스템

-   예약 시스템
-   기간별 가격 할인
-   패키지 대여 기능
-   장기 대여 시 구매 옵션

### 4. 보안 및 인증

-   전화번호 인증
-   상품 상태 로그 관리 

## 주요 카테고리

-   전자제품
-   의류
-   장소
-   시계
-   가방
-   책/도서류
-   사람 (재능)

## 비즈니스 모델

-   대여 수수료: 대여가격의 일정 % 혹은 건당 가격
-   판매 수수료: 별도 책정 
-   보관료: 장기 미대여 상품 보관료 징수

## 향후 계획

-   인플루언서 홍보관
-   전문가 시스템 (변호사, 제품평가사 등)
-   패키지 상품 대여 등

### 필수 조건

-   Node.js
-   Docker
-   PostgreSQL (AWS RDS)

### 시작 하기 

-  프로젝트 클론
git clone https://github.com/P-FitPull/FitPull-BE.git
-  docker 컨테이너 빌드 및 실행
docker-compose up --build
