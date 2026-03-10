import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ZaeonFlowEngine } from '../services/flow.Engine';

const prisma = new PrismaClient();

export const createLog = async (req: Request, res: Response) => {
    try {
        const { userId, action, details } = req.body;

        // 1. Salva o Log no Banco de Dados
        const newLog = await prisma.systemLog.create({
            data: {
                userId,
                action,
                details: typeof details === 'object' ? JSON.stringify(details) : details,
            }
        });

        // 2. DISPARA O MOTOR DE AUTOMAÇÃO (Zaeon Flow)
        // Não usamos 'await' aqui para não travar a resposta do usuário
        ZaeonFlowEngine.triggerEvent(userId, action, { details });

        return res.status(201).json(newLog);
    } catch (error) {
        console.error("Erro ao criar log:", error);
        return res.status(500).json({ error: "Erro interno ao processar log e automação." });
    }
};