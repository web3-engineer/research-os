var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { prisma } from "../lib/prisma";
export const syncUserSpace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.headers["x-user-id"];
    const data = req.body;
    try {
        const updatedSpace = yield prisma.userSpaceData.upsert({
            where: { userId: userId },
            update: {
                layoutState: data.layoutState,
                stickyNote: data.stickyNote,
                chatHistory: data.chatHistory,
                zaeonChat: data.zaeonChat,
                library: data.library,
                schedule: data.schedule,
                updatedAt: new Date(),
            },
            create: {
                userId: userId,
                layoutState: data.layoutState,
                stickyNote: data.stickyNote,
            },
        });
        res.json(updatedSpace);
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao sincronizar dados" });
    }
});
export const getUserSpace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    try {
        const space = yield prisma.userSpaceData.findUnique({
            where: { userId: userId },
        });
        res.json(space || {});
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao buscar dados" });
    }
});
