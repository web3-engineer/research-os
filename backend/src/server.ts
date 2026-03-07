import 'dotenv/config';
import express from "express";
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Redis from 'ioredis';
import { prisma } from './lib/prisma';
import { FeedService } from './services/feed.service';

// --- Configuração Redis ---
const redis = new Redis(process.env.REDIS_URL || "");

// --- Configuração IA (Padronizada) ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const aiModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash", 
    systemInstruction: "Você é o Zaeon OS, um sistema operacional inteligente e proativo. Sua interface é futurista e você ajuda o usuário a gerenciar projetos, ordens de serviço e pesquisas. Responda de forma clara e técnica.",
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL || "http://localhost:3000" }
});

app.use(cors());
app.use(express.json());

// --- Socket.io ---
io.on('connection', (socket) => {
    console.log('📡 Novo terminal conectado:', socket.id);
    
    socket.on('join-room', (userId) => socket.join(userId));

    socket.on('request-initial-feed', async () => {
        const feed = await FeedService.getFeed();
        socket.emit('feed-update', feed);
    });
});

// --- Rota /agent (Persistência Longa) ---
app.post("/agent", async (req, res) => {
    try {
        const { message, userId } = req.body;
        if (!message || !userId) return res.status(400).json({ error: "Missing fields" });

        // Recupera histórico do MongoDB
        const spaceData = await prisma.userSpaceData.findUnique({ where: { userId } });
        const history = Array.isArray(spaceData?.zaeonChat) ? (spaceData.zaeonChat as any[]) : [];

        // Formata para o SDK do Gemini
        const chat = aiModel.startChat({
            history: history.map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }]
            }))
        });

        const result = await chat.sendMessage(message);
        const replyText = result.response.text();

        // Atualiza MongoDB (Upsert)
        const newMessage = { role: 'user', content: message, timestamp: new Date() };
        const modelResponse = { role: 'model', content: replyText, timestamp: new Date() };

        await prisma.userSpaceData.upsert({
            where: { userId },
            update: { zaeonChat: { push: [newMessage, modelResponse] } }, 
            create: { userId, zaeonChat: [newMessage, modelResponse] }
        });

        return res.json({ ok: true, reply: replyText });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- Rota /api/chat (Streaming de Alta Performance) ---
app.post("/api/chat", async (req, res) => {
    try {
        const { message, userId } = req.body;
        
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.flushHeaders(); 

        const historyKey = `chat_history:${userId}`;
        const cachedHistory = await redis.get(historyKey);
        const history = cachedHistory ? JSON.parse(cachedHistory) : [];

        const chat = aiModel.startChat({ history });
        const result = await chat.sendMessageStream(message);

        let fullResponse = "";
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;
            res.write(`data: ${JSON.stringify({ part: chunkText })}\n\n`);
        }

        const updatedHistory = [
            ...history,
            { role: "user", parts: [{ text: message }] },
            { role: "model", parts: [{ text: fullResponse }] },
        ].slice(-6); 

        await redis.set(historyKey, JSON.stringify(updatedHistory), "EX", 7200);
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        res.status(500).end();
    }
});

// --- Rota de Feed (Logs do Sistema) ---
app.get("/api/feed", async (req, res) => {
    try {
        const feed = await FeedService.getFeed();
        return res.json(feed);
    } catch (err: any) {
        res.status(500).json({ error: "Erro ao buscar feed" });
    }
});

app.get("/ping", (req, res) => res.send("pong"));

// --- 1. Rota para recuperar o estado do Workspace (User Space) ---
app.get('/user-space/:userId', async (req, res) => {
    const { userId } = req.params;
    
    // Validação de segurança para o MongoDB ObjectId
    if (userId.length !== 24) {
        return res.status(400).json({ error: "Invalid User ID format (requires 24-char hex)" });
    }

    try {
        const data = await prisma.userSpaceData.findUnique({ 
            where: { userId } 
        });
        
        // Se não existir, retorna um estado inicial padrão para o frontend não quebrar
        return res.json(data || { 
            layout: {}, 
            settings: { theme: 'dark' }, 
            zaeonChat: [],
            layoutState: { showYearBoard: true, gadgetOn: false } 
        });
    } catch (error: any) {
        console.error("❌ Erro ao carregar UserSpace:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// --- 2. Rota para salvar o estado (Sync em tempo real) ---
app.post('/user-space/save', async (req, res) => {
    const { userId, layout, settings, layoutState, zaeonChat, stickyNote } = req.body;

    try {
        const now = new Date(); // Criamos a data aqui

        const updated = await prisma.userSpaceData.upsert({
            where: { userId },
            update: { 
                layout, 
                settings, 
                layoutState, 
                zaeonChat,
                stickyNote,
                updatedAt: now 
            },
            create: { 
                userId, 
                layout: layout || {}, 
                settings: settings || {},
                layoutState: layoutState || {},
                zaeonChat: zaeonChat || [],
                createdAt: now, // Garantia total
                updatedAt: now
            }
        });
        res.json(updated);
    } catch (error: any) {
        console.error("❌ Erro no Upsert:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- 3. Rota de Histórico de Chat (Específica) ---
app.get('/chat/history/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const data = await prisma.userSpaceData.findUnique({
            where: { userId },
            select: { zaeonChat: true } 
        });
        res.json(data?.zaeonChat || []);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar histórico" });
    }
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`  Backend do OS rodando em: http://localhost:3001`);
});