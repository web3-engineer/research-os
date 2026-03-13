var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
router.post('/system/sync', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.headers['x-user-id'];
    const { layoutState, stickyNote, chatHistory } = req.body;
    try {
        const updatedSpace = yield prisma.userSpaceData.upsert({
            where: { userId },
            update: { layoutState, stickyNote, chatHistory },
            create: { userId, layoutState, stickyNote, chatHistory }
        });
        res.json(updatedSpace);
    }
    catch (error) {
        console.error("❌ ERRO NO PRISMA:", error); // Isso vai imprimir no terminal do servidor
        res.status(500).json({
            error: "Erro ao sincronizar dados",
            message: error.message, // Isso vai aparecer no seu CURL
            code: error.code
        });
    }
}));
// Feed de Notícias/Postagens
router.post('/feed/post', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.headers['x-user-id'];
    const { content, room } = req.body;
    try {
        const post = yield prisma.post.create({
            data: {
                content,
                room,
                userId,
                user: "Usuário Teste", // Simplificado para MVP
                userImage: ""
            }
        });
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao criar post" });
    }
}));
router.get('/feed/:room', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { room } = req.params;
    const posts = yield prisma.post.findMany({
        where: { room },
        orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
}));
router.post('/ai/chat', chatWithZaeon);
router.post('/agent/command', agentCommand);
router.post('/agent/log', agentLog);
router.post("/sync", syncUserSpace);
router.get("/state/:userId", getUserSpace);
export default router;
