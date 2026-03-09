import { prisma } from '../lib/prisma';

export class ModuleService {
    // Lista todos os módulos disponíveis para o usuário "instalar"
    static async getCatalog() {
        return await prisma.moduleCatalog.findMany({
            orderBy: { name: 'asc' }
        });
    }

    // Popula o banco com os módulos iniciais (Setup inicial)
    static async seedCatalog() {
        const defaultModules = [
            {
                name: "Zaeon Notes",
                description: "Editor de notas com persistência em nuvem.",
                version: "1.0.0",
                icon: "edit_note",
                isPremium: false
            },
            {
                name: "Flow Builder",
                description: "Crie automações visuais para o seu workspace.",
                version: "1.2.0",
                icon: "account_tree",
                isPremium: false
            },
            {
                name: "Terminal OS",
                description: "Acesso via linha de comando aos recursos do Zaeon.",
                version: "0.9.0",
                icon: "terminal",
                isPremium: true
            }
        ];

        for (const mod of defaultModules) {
            await prisma.moduleCatalog.upsert({
                where: { name: mod.name },
                update: mod,
                create: mod
            });
        }

        return { message: "Catálogo de módulos sincronizado!" };
    }

    // Instala um módulo no espaço do usuário
    static async installModule(userId: string, moduleName: string) {
        // 1. Verifica se o módulo existe no catálogo
        const moduleTemplate = await prisma.moduleCatalog.findUnique({
            where: { name: moduleName }
        });

        if (!moduleTemplate) throw new Error("Módulo não encontrado no catálogo.");

        // 2. Busca ou CRIA o espaço do usuário (Upsert logico)
        let userSpace = await prisma.userSpaceData.findUnique({
            where: { userId }
        });

        if (!userSpace) {
            console.log(`🏠 Inicializando novo espaço para o usuário ${userId}...`);
            userSpace = await prisma.userSpaceData.create({
                data: {
                    userId,
                    personalModules: []
                }
            });
        }

        // 3. Atualiza a lista de módulos pessoais
        const currentModules = (userSpace.personalModules as any[]) || [];
        const alreadyInstalled = currentModules.find(m => m.name === moduleName);

        if (alreadyInstalled) return { message: "Módulo já está instalado.", space: userSpace };

        const updatedModules = [...currentModules, {
            ...moduleTemplate,
            installedAt: new Date(),
            config: {}
        }];

        return await prisma.userSpaceData.update({
            where: { userId },
            data: { personalModules: updatedModules }
        });
    }
}