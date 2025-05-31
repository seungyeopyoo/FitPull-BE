import { io } from "socket.io-client";

console.log("=== socketClient.js 시작 ===");
console.log("Node 버전:", process.version);
console.log("작업 디렉토리:", process.cwd());

const socket = io("http://127.0.0.1:3000", {
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("소켓 연결됨:", socket.id);
  socket.emit("register", "3c283e3b-84a9-4ac5-af5a-ed5e0d6696bc");
});

socket.on("connect_error", (err) => {
  console.error("❌ 연결 실패:", err.message);
});

socket.on("newNotification", (payload) => {
  console.log("알림 도착:", payload);
});

socket.on("disconnect", () => {
  console.log("소켓 연결 해제");
});

socket.onAny((event, ...args) => {
  console.log("수신된 이벤트:", event, args);
});
