import { prisma } from '../lib/prisma';

export class UserService {
    static async createUser(id: string, name: string, email: string) {
        return await prisma.user.create({
            data: {
                id,
                name,
                email,
                level: 1,
                xp: 0
            }
        });
    }

    // Busca o perfil completo do usuário
    static async getUserProfile(id: string) {
        return await prisma.user.findUnique({
            where: { id },
            include: { userSpaceData: true }
        });
    }

    // Atualiza dados de bio, curso, etc.
    static async updateProfile(id: string, data: any) {
        return await prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                bio: data.bio,
                course: data.course,
                age: data.age,
                gender: data.gender,
                torsoImage: data.torsoImage,
                phone: data.phone
            }
        });
    }

    // Lógica de Gamificação: Adicionar XP e subir de nível
    static async addExperience(id: string, xpAmount: number) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) throw new Error("Usuário não encontrado");

        let newXp = user.xp + xpAmount;
        let newLevel = user.level;

        // Lógica simples: cada 100 XP sobe um nível
        if (newXp >= 100) {
            newLevel += Math.floor(newXp / 100);
            newXp = newXp % 100;
        }

        return await prisma.user.update({
            where: { id },
            data: {
                xp: newXp,
                level: newLevel
            }
        });
    }
}