import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestRule() {
    const userId = "65d2f1b4e3a2c5d6f8a90123"; // Pegue um ID no seu MongoDB

    const flow = await prisma.automationFlow.create({
        data: {
            userId: userId,
            name: "Teste de Sincronização",
            trigger: "SPACE_SYNCED", // O gatilho que acabamos de colocar no controller
            action: "LOG_ENTRY",     // A ação que definimos no switch/case do engine
            enabled: true,
            actionData: { message: "Automação disparada com sucesso! 🚀" }
        }
    });

    console.log("Regra de automação criada:", flow);
}

createTestRule();