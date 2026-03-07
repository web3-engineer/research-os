import { prisma } from '../lib/prisma';

export const WorkspaceService = {
    async syncState(userId: string, payload: any) {
        return await prisma.userSpaceData.upsert({
            where: { userId },
            update: {
                layoutState: payload.layoutState,
                stickyNote: payload.stickyNote,
                chatHistory: payload.chatHistory,
                zaeonChat: payload.zaeonChat,
                library: payload.library,
                updatedAt: new Date()
            },
            create: {
                userId,
                layoutState: payload.layoutState,
                stickyNote: payload.stickyNote,
                chatHistory: payload.chatHistory
            }
        });
    }
};