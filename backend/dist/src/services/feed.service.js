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
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL || "");
export class FeedService {
    static getFeed() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cached = yield redis.get('feed_cache');
                if (cached)
                    return JSON.parse(cached);
                const feed = yield prisma.systemLog.findMany({
                    take: 20,
                    orderBy: { createdAt: 'desc' }
                });
                yield redis.set('feed_cache', JSON.stringify(feed), 'EX', 60);
                return feed;
            }
            catch (error) {
                console.error("Erro no FeedService:", error);
                return [];
            }
        });
    }
    static invalidateCache() {
        return __awaiter(this, void 0, void 0, function* () {
            yield redis.del('feed_cache');
            console.log("♻️ Cache do Feed invalidado");
        });
    }
}
