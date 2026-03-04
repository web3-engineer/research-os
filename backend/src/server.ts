import 'dotenv/config'; 
import express from "express";
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { z } from 'zod';
import { FeedService } from './services/feed.service';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Redis from 'ioredis';
import { prisma } from './lib/prisma';

const redis = new Redis(process.env.REDIS_URL || "");

redis.on('connect', () => console.log('✅ Redis: Conectado com sucesso!'));
redis.on('error', (err) => console.error('❌ Redis Erro:', err));

// 2. Configuração do Gemini (Simplificada para evitar o erro 404)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const aiModel = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash" // Use apenas o nome, sem o prefixo 'models/'
});

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// --- Socket.io Logic ---
io.on('connection', (socket) => {
    console.log('🌐 Cliente conectado:', socket.id);
    socket.on('join-room', (userId) => {
        socket.join(userId);
        console.log(`👤 Usuário ${userId} monitorando notificações.`);
    });
    socket.on('disconnect', () => {
        console.log('❌ Cliente desconectado');
    });
});

export { io };

// --- Rotas ---

app.post("/agent", async (req, res) => {
    try {
        const { message, userId } = req.body as { message?: string, userId?: string };
        if (!message || !userId) return res.status(400).json({ error: "message and userId are required" });

        // 1. Buscar memória no MongoDB
        const spaceData = await prisma.userSpaceData.findUnique({ where: { userId } });
        const history = Array.isArray(spaceData?.zaeonChat) ? (spaceData.zaeonChat as any[]) : [];

        // 2. Formatar contents para a API
        const contents = [
            ...history.map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }]
            })),
            { role: 'user', parts: [{ text: message }] }
        ];

        // 3. Chamada de IA - USANDO A URL V1 (MAIS ESTÁVEL)
        const apiKey = process.env.GEMINI_API_KEY;

        // Mude para o Lite, que costuma ter cota livre quando o normal está zerado
        const modelName = "models/gemini-2.0-flash-lite"; 

        const response = await fetch(`https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        const data: any = await response.json();

        if (!response.ok) {
            console.error("❌ Resposta do Google não foi OK:", JSON.stringify(data, null, 2));
            throw new Error(data.error?.message || "Erro na API do Google");
        }

        const replyText = data.candidates[0].content.parts[0].text;

        // 4. Salvar no MongoDB
        const updatedChat = [
            ...history,
            { role: 'user', content: message, timestamp: new Date() },
            { role: 'model', content: replyText, timestamp: new Date() }
        ];

        await prisma.userSpaceData.upsert({
            where: { userId },
            update: { zaeonChat: updatedChat },
            create: { userId, zaeonChat: updatedChat }
        });

        return res.json({ ok: true, reply: replyText });

    } catch (err: any) {
        console.error("❌ ERRO NO AGENTE:", err.message);
        return res.status(500).json({ error: "internal_error", details: err.message });
    }
});

// --- Outras Rotas do Feed ---
app.get("/api/feed", async (req, res) => {
    try {
        const feed = await FeedService.getFeed();
        res.json(feed);
    } catch (error) {
        res.status(500).json({ error: "Falha ao carregar feed" });
    }
});

app.post("/api/feed/post", async (req, res) => {
    await FeedService.invalidateCache();
    io.emit('feed-updated', { message: "Novas postagens no Lounge!" });
    res.status(201).json({ success: true });
});

// Middleware de Erro Global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Erro de validação", details: err.issues });
    }
    console.error(err.stack);
    res.status(500).json({ error: "Erro interno no servidor" });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`🚀 Zaeon Agent Service ativo na porta ${PORT}`);
});

async function checkAvailableModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        const data: any = await res.json();
        console.log("📋 Modelos que sua chave enxerga:", data.models?.map((m: any) => m.name));
    } catch (e) {
        console.error("Falha ao listar modelos.");
    }
}
checkAvailableModels();