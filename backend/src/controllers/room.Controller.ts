import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ZaeonFlowEngine } from "../services/flow.Engine";

export const createRoom = async (req: Request, res: Response) => {
    const { name, slug, description, isPrivate, ownerId } = req.body;

    try {
        const newRoom = await prisma.room.create({
            data: {
                name,
                slug,
                description,
                isPrivate: isPrivate || false,
                ownerId,
                allowedUsers: isPrivate ? [ownerId] : [], // Se for privada, começa só com o dono
            },
        });

        // 🔥 Automação: Notifica o sistema que uma nova sala nasceu
        ZaeonFlowEngine.triggerEvent(ownerId, "ROOM_CREATED", { roomId: newRoom.id, name: newRoom.name });

        res.status(201).json(newRoom);
    } catch (error) {
        console.error("Erro ao criar sala:", error);
        res.status(500).json({ error: "Erro ao criar sala. Verifique se o slug é único." });
    }
};

export const getRooms = async (req: Request, res: Response) => {
    try {
        const rooms = await prisma.room.findMany({
            where: {
                isPrivate: false, // Por enquanto, só lista as públicas
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar salas" });
    }
};