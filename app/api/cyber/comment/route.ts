import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        // 1. O BACK-END VERIFICA SE O USUÁRIO É REAL E ESTÁ LOGADO
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Acesso negado. Você precisa estar logado para comentar." },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { postId, content } = body;

        // Validação básica de campos
        if (!postId || !content) {
            return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
        }

        // 2. CRIAR O COMENTÁRIO USANDO OS DADOS DA SESSÃO DO SERVIDOR (INVIOLÁVEL)
        // Ignoramos o "user" e "userId" que vieram do front-end, pois não são confiáveis.
        const newComment = await prisma.comment.create({
            data: {
                content,
                user: session.user.name || "Unknown User",
                // Nota: Para acessar o ID do usuário na sessão do NextAuth, certifique-se 
                // de que você adicionou o ID no callback session() do [...nextauth].ts
                userId: (session.user as any).id || null,
                postId: postId
            }
        });

        return NextResponse.json(newComment, { status: 201 });
    } catch (error) {
        console.error("Erro ao processar o comentário:", error);
        return NextResponse.json({ error: "Falha ao criar comentário" }, { status: 500 });
    }
}