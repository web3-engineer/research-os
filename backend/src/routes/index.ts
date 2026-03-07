import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { chatWithZaeon } from '../controllers/ai.controller';
import { agentCommand, agentLog } from '../controllers/agent.controller';
import { syncUserSpace, getUserSpace } from "../controllers/user.controller";
const router = Router();
const prisma = new PrismaClient();

// Teste de conexão
router.get('/health', (req, res) => {
    res.json({ status: 'Zaeon OS Backend is alive' });
});

// Sincronização do Workspace
router.post('/system/sync', async (req, res) => {
    const userId = req.headers['x-user-id'] as string;
    const { layoutState, stickyNote, chatHistory } = req.body;

    try {
        const updatedSpace = await prisma.userSpaceData.upsert({
            where: { userId },
            update: { layoutState, stickyNote, chatHistory },
            create: { userId, layoutState, stickyNote, chatHistory }
        });
        res.json(updatedSpace);
    } catch (error: any) {
        console.error("❌ ERRO NO PRISMA:", error); // Isso vai imprimir no terminal do servidor
        res.status(500).json({
            error: "Erro ao sincronizar dados",
            message: error.message, // Isso vai aparecer no seu CURL
            code: error.code
        });
    }
});
// Feed de Notícias/Postagens
router.post('/feed/post', async (req, res) => {
    const userId = req.headers['x-user-id'] as string;
    const { content, room } = req.body;

    try {
        const post = await prisma.post.create({
            data: {
                content,
                room,
                userId,
                user: "Usuário Teste", // Simplificado para MVP
                userImage: ""
            }
        });
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar post" });
    }
});

router.get('/feed/:room', async (req, res) => {
    const { room } = req.params;
    const posts = await prisma.post.findMany({
        where: { room },
        orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
});

router.post('/ai/chat', chatWithZaeon);

router.post('/agent/command', agentCommand);

router.post('/agent/log', agentLog);

router.post("/sync", syncUserSpace);

router.get("/state/:userId", getUserSpace);

export default router;