import { prisma } from '../lib/prisma';

export class RoomService {
    static async createRoom(name: string, slug: string, ownerId: string, description?: string) {
        return await prisma.room.upsert({
            where: { slug },
            update: {},
            create: {
                name,
                slug,
                description: description || "",
                ownerId
            }
        });
    }

    static async getAllRooms() {
        // Removido o 'include' pois a relação não está mapeada no seu schema.prisma
        return await prisma.room.findMany();
    }
}