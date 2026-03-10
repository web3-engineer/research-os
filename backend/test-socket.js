const { io } = require("socket.io-client");

const socket = io("http://localhost:3001", {
  query: { userId: "65f1a2b3c4d5e6f7a8b9c0d1" } // Seu ID de teste
});

socket.on("connect", () => {
  console.log("✅ CONECTADO AO ZAEON OS!");
  console.log("Deveria aparecer 'ONLINE' no log do servidor agora.");
  
  // Espera 2 segundos para dar tempo do banco atualizar e depois fecha
  setTimeout(() => {
    console.log("🔌 Desconectando...");
    socket.disconnect();
    process.exit();
  }, 2000);
});

socket.on("connect_error", (err) => {
  console.log("❌ Erro ao conectar:", err.message);
});