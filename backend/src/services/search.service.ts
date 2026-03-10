import { prisma } from '../lib/prisma';

export class SearchService {
  static async globalSearch(userId: string, query: string) {
    const term = query.toLowerCase();

    // 1. Buscar nos Posts do Lounge
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { content: { contains: term, mode: 'insensitive' } },
          { user: { contains: term, mode: 'insensitive' } }
        ]
      },
      take: 5
    });

    // 2. Buscar nos Arquivos da Library (Como é JSON, filtramos no código)
    const userSpace = await prisma.userSpaceData.findUnique({
      where: { userId },
      select: { library: true }
    });

    const libraryItems = Array.isArray(userSpace?.library) 
      ? (userSpace.library as any[]).filter(item => 
          item.name.toLowerCase().includes(term)
        )
      : [];

    return {
      posts,
      library: libraryItems.slice(0, 5) // Limita a 5 resultados
    };
  }
}