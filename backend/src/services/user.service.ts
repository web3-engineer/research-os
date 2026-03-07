import { prisma } from '../lib/prisma';

export const UserService = {
    async getUserProfile(userId: string) {
        return await prisma.user.findUnique({
            where: { id: userId },
            include: { userSpaceData: true }
        });
    },

    async addXp(userId: string, amount: number) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");

        let newXp = user.xp + amount;
        let newLevel = user.level;

        // Lógica simples de Level Up (ex: cada 1000 XP sobe um nível)
        if (newXp >= 1000) {
            newLevel += Math.floor(newXp / 1000);
            newXp = newXp % 1000;
        }

        return await prisma.user.update({
            where: { id: userId },
            data: { xp: newXp, level: newLevel }
        });
    }
};