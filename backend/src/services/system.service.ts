import { prisma } from '../lib/prisma';

export class SystemService {
    // Define ou atualiza uma configuração (Chave/Valor)
    static async setSetting(key: string, value: string) {
        return await prisma.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
    }

    // Busca uma configuração específica
    static async getSetting(key: string) {
        return await prisma.systemSetting.findUnique({
            where: { key }
        });
    }
}