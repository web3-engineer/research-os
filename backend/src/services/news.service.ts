import { prisma } from '../lib/prisma';

export class NewsService {
    // Criar uma notícia com suporte a múltiplos idiomas
    static async createNews(data: { title: any, content: any, subtitle?: any, imageUrl?: string }) {
        return await prisma.newsPost.create({
            data: {
                title: data.title,
                content: data.content,
                subtitle: data.subtitle || {},
                imageUrl: data.imageUrl,
                status: "published"
            }
        });
    }

    // Buscar todas as notícias
    static async getAllNews() {
        return await prisma.newsPost.findMany({
            orderBy: { publishDate: 'desc' }
        });
    }
}