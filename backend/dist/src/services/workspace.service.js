var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { prisma } from '../lib/prisma';
export class WorkspaceService {
    static saveWorkspace(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { layout, settings, layoutState, zaeonChat, stickyNote } = data;
            // Usando a lógica que evita erro de transação no MongoDB Free
            const existing = yield prisma.userSpaceData.findUnique({ where: { userId } });
            if (existing) {
                return yield prisma.userSpaceData.update({
                    where: { userId },
                    data: { layout, settings, layoutState, zaeonChat, stickyNote, updatedAt: new Date() }
                });
            }
            else {
                return yield prisma.userSpaceData.create({
                    data: {
                        userId,
                        layout: layout || {},
                        settings: settings || {},
                        layoutState: layoutState || {},
                        zaeonChat: zaeonChat || [],
                        stickyNote: stickyNote || "",
                    }
                });
            }
        });
    }
    static getWorkspace(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.userSpaceData.findUnique({
                where: { userId }
            });
        });
    }
}
