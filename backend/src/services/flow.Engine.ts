import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ZaeonFlowEngine = {
    // Esta função será chamada toda vez que um evento importante ocorrer no sistema
    async triggerEvent(userId: string, triggerName: string, payload: any) {
        console.log(`[Zaeon Flow] Evento detectado: ${triggerName} para o usuário ${userId}`);

        // 1. Busca todas as automações ativas do usuário para este gatilho
        const flows = await prisma.automationFlow.findMany({
            where: {
                userId,
                trigger: triggerName,
                enabled: true,
            },
        });

        for (const flow of flows) {
            try {
                // 2. Verifica condições (se existirem)
                // Ex: { "extension": "pdf" }
                if (flow.condition) {
                    const condition = flow.condition as any;
                    const match = Object.keys(condition).every(key => payload[key] === condition[key]);
                    if (!match) continue; // Pula se a condição não bater
                }

                // 3. Executa a Ação
                console.log(`[Zaeon Flow] Executando ação: ${flow.action} do fluxo: ${flow.name}`);
                await this.executeAction(flow.action, flow.actionData, payload);

            } catch (error) {
                console.error(`[Zaeon Flow] Erro no fluxo ${flow.id}:`, error);
            }
        }
    },

    async executeAction(action: string, actionData: any, payload: any) {
        switch (action) {
            case 'LOG_ENTRY':
                // Exemplo: Criar um log automático de sistema
                console.log("Ação: Gerando entrada de log automatizada...");
                break;

            case 'NOTIFY_USER':
                // Aqui conectaremos com o seu Socket.io no futuro
                console.log(`Notificando usuário sobre: ${payload.message || 'Nova atividade'}`);
                break;

            default:
                console.log(`Ação ${action} ainda não implementada.`);
        }
    }
};