import redis from '../lib/redis';
import { prisma } from '../lib/prisma'; 

export class FeedService {
    private static CACHE_KEY = 'zaeon:feed:latest';

    // Implementação real da invalidação
    static async invalidateCache() {
        await redis.del(this.CACHE_KEY);
        console.log('🧹 Cache do Feed limpo.');
    }

    static async getFeed() {
        // 1. Tenta o Cache
        const cached = await redis.get(this.CACHE_KEY);
        if (cached) return JSON.parse(cached);

        // 2. Busca no MongoDB via Prisma
        // Aqui estou a assumir que tem um modelo 'Post' ou 'Feed' no seu schema
        const feedData = await prisma.user.findMany({
            include: {
                // Ajuste aqui conforme os nomes exatos das relações no seu schema.prisma
                // posts: true 
            },
            take: 20, // Limita às 20 mais recentes
        });

        // 3. Salva no Redis (expira em 5 min)
        await redis.setex(this.CACHE_KEY, 300, JSON.stringify(feedData));

        return feedData;
    }
}