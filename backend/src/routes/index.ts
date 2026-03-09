import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { chatWithZaeon } from '../controllers/ai.controller';
import { agentCommand, agentLog } from '../controllers/agent.controller';
import { syncUserSpace, getUserSpace } from "../controllers/user.controller";
import { createRoom, getRooms } from "../controllers/room.Controller";

const router = Router();
const prisma = new PrismaClient();

// Teste de conexão
router.get('/health', (req, res) => {
    res.json({ status: 'Zaeon OS Backend is alive' });
});

// --- FEED DE NOTÍCIAS / POSTAGENS ---
router.post('/feed/post', async (req, res) => {
    const userId = req.headers['x-user-id'] as string;
    const { content, roomId } = req.body; // Mudamos de room para roomId

    try {
        const post = await prisma.post.create({
            data: {
                content,
                roomId, // Agora aponta para o ID da coleção Room
                userId,
                user: "Usuário Teste",
                userImage: ""
            }
        });
        res.json(post);
    } catch (error) {
        console.error("Erro ao criar post:", error);
        res.status(500).json({ error: "Erro ao criar post. Verifique se o roomId é válido." });
    }
});

router.get('/feed/:roomId', async (req, res) => {
    const { roomId } = req.params;
    try {
        const posts = await prisma.post.findMany({
            where: { roomId }, // Busca pelo ID da sala
            orderBy: { createdAt: 'desc' }
        });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar posts" });
    }
});

// --- AI & AGENTS ---
router.post('/ai/chat', chatWithZaeon);
router.post('/agent/command', agentCommand);
router.post('/agent/log', agentLog);

// --- USER SPACE (Sincronização) ---
router.post("/sync", syncUserSpace);
router.get("/state/:userId", getUserSpace);

// --- ROOMS (Salas) ---
router.post("/rooms", createRoom);
router.get("/rooms", getRooms);

export default router;