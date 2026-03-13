import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Busca apenas posts da sala "cyber", ordenados pelos mais recentes
        const posts = await prisma.post.findMany({
            where: { room: "cyber" },
            orderBy: { createdAt: "desc" },
            include: { comments: true }
        });
        return NextResponse.json(posts);
    } catch (error) {
        console.error("Erro ao buscar posts da Cyber:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, subtitle, content, tags, images, attachments, user, userImage, userId } = body;

        // O TypeScript infere o tipo automaticamente quando passamos direto para o prisma.post.create
        // Trocamos `null` por `undefined`, que é a forma nativa do Prisma lidar com campos opcionais
        const newPost = await prisma.post.create({
            data: {
                title: title || undefined,
                subtitle: subtitle || undefined,
                content,
                tags: tags || [],
                images: images || [],
                attachments: attachments || undefined,
                room: "cyber",
                user: user || "Operative",
                userImage: userImage || undefined,
                userId: userId || undefined,
            }
        });

        return NextResponse.json(newPost, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar post na Cyber:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}