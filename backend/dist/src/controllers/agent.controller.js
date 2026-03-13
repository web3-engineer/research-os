var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// 1. Substitui o agentCommand: Agora salva a interação no zaeonChat
export const agentCommand = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { command, userId } = req.body;
    if (!userId || userId.length !== 24) {
        return res.status(400).json({ error: "ID de usuário inválido (ObjectId de 24 caracteres necessário)" });
    }
    try {
        const updated = yield prisma.userSpaceData.update({
            where: { userId },
            data: {
                zaeonChat: {
                    push: {
                        role: "system_action",
                        content: command,
                        timestamp: new Date()
                    }
                },
                updatedAt: new Date()
            }
        });
        res.json({
            status: "Action recorded",
            timestamp: updated.updatedAt
        });
    }
    catch (error) {
        console.error("❌ ERRO AO EXECUTAR COMANDO:", error);
        res.status(500).json({ error: "Failed to record agent action", details: error.message });
    }
});
// 2. Substitui o getPendingCommands: Agora busca o histórico de interações ou estado do layout
export const getAgentState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const data = yield prisma.userSpaceData.findUnique({
            where: { userId },
            select: {
                zaeonChat: true,
                layoutState: true
            }
        });
        res.json(data || { zaeonChat: [], layoutState: {} });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch agent state" });
    }
});
// 3. Mantém o agentLog: Crucial para o FeedService que configuramos antes
export const agentLog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, agentId, message } = req.body;
    try {
        const log = yield prisma.systemLog.create({
            data: {
                userId,
                action: `AGENT_${agentId || 'SYSTEM'}`,
                details: message
            }
        });
        res.json({ status: "Log stored", id: log.id });
    }
    catch (error) {
        console.error("❌ ERRO AO SALVAR LOG:", error);
        res.status(500).json({ error: "Failed to store agent log", details: error.message });
    }
});
