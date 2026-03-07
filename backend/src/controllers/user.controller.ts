import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

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