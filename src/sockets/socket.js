import { Server } from "socket.io";

let io;

console.log("🔥 socket.js 파일 로드됨");

export const initSocket = (server) => {
  console.log("🚀 initSocket() 함수 호출됨");

  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
  });

  io.on("connection", (socket) => {
    console.log("클라이언트 소켓 연결됨:", socket.id);
    socket.onAny((event, ...args) => {
      console.log("서버가 받은 이벤트:", event, args);
    });
  
    socket.on("register", (userId) => {
      console.log("📌 register:", userId);
      socket.join(userId);
    });
  
    socket.on("disconnect", () => {
      console.log("❌ 연결 종료:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO 초기화 안됨");
  return io;
};