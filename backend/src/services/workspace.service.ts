import { prisma } from '../lib/prisma';

export class WorkspaceService {
    static async saveWorkspace(userId: string, data: any) {
        const { layout, settings, layoutState, zaeonChat, stickyNote } = data;

        // Usando a lógica que evita erro de transação no MongoDB Free
        const existing = await prisma.userSpaceData.findUnique({ where: { userId } });

        if (existing) {
            return await prisma.userSpaceData.update({
                where: { userId },
                data: { layout, settings, layoutState, zaeonChat, stickyNote, updatedAt: new Date() }
            });
        } else {
            return await prisma.userSpaceData.create({
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
    }

    static async getWorkspace(userId: string) {
        return await prisma.userSpaceData.findUnique({
            where: { userId }
        });
    }
}