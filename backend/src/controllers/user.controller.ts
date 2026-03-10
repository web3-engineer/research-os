import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ZaeonFlowEngine } from "../services/flow.Engine";

export const syncUserSpace = async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string;
  const data = req.body;

  try {
    const updatedSpace = await prisma.userSpaceData.upsert({
      where: { userId: userId },
      update: {
        layoutState: data.layoutState,
        stickyNote: data.stickyNote,
        chatHistory: data.chatHistory,
        zaeonChat: data.zaeonChat,
        library: data.library,
        schedule: data.schedule,
        updatedAt: new Date(),
      },
      create: {
        userId: userId,
        layoutState: data.layoutState,
        stickyNote: data.stickyNote,
      },
    });

    // 🔥 GATILHO DE AUTOMAÇÃO: Avisa que o espaço foi sincronizado
    // Isso permite criar automações como: "Se a nota mudar, faça tal coisa"
    ZaeonFlowEngine.triggerEvent(userId, "SPACE_SYNCED", {
      hasStickyNote: !!data.stickyNote,
      updatedAt: new Date()
    });

    res.json(updatedSpace);
  } catch (error) {
    res.status(500).json({ error: "Erro ao sincronizar dados" });
  }
};

export const getUserSpace = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  try {
    const space = await prisma.userSpaceData.findUnique({
      where: { userId: userId },
    });
    res.json(space || {});
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar dados" });
  }
};