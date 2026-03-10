import { prisma } from '../lib/prisma';

export class LogService {
    // Registra uma ação no sistema
    static async createLog(userId: string, action: string, details?: string) {
        return await prisma.systemLog.create({
            data: {
                userId,
                action,
                details
            }
        });
    }

    // Busca os logs mais recentes
    static async getLogs(limit = 50) {
        return await prisma.systemLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' }
        });
    }
    
    static async register(userId: string, action: string, details?: string) {
        try {
            return await prisma.systemLog.create({
            data: {
            userId,
            action,
            details
        }
      });
    } catch (error) {
      console.error("Erro ao gravar log do sistema:", error);
    }
  }
}