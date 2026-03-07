import { prisma } from '../lib/prisma';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || "");

export class FeedService {
    static async getFeed() {
        try {
            const cached = await redis.get('feed_cache');
            if (cached) return JSON.parse(cached);

            const feed = await prisma.systemLog.findMany({
                take: 20,
                orderBy: { createdAt: 'desc' }
            });

            await redis.set('feed_cache', JSON.stringify(feed), 'EX', 60);
            return feed;
        } catch (error) {
            console.error("Erro no FeedService:", error);
            return [];
        }
    }

    static async invalidateCache() {
        await redis.del('feed_cache');
        console.log("♻️ Cache do Feed invalidado");
    }
}