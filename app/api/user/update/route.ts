import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/src/lib/prisma";
import { authOptions } from "@/src/lib/auth"; // <--- Mantive suas importações originais

export async function POST(req: Request) {
    // 1. Verifica se o usuário está logado
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    try {
        // 2. Agora lemos o JSON enviado pelo Front-End (ProfileModule)
        const body = await req.json();
        const { name, course, image, torsoImage } = body;

        const dataToUpdate: any = {};

        // 3. Monta o objeto apenas com o que foi alterado
        if (name && name.trim() !== "") dataToUpdate.name = name;
        if (course) dataToUpdate.course = course;
        
        // Como o Front-End já converteu as imagens para Base64, é só repassar pro banco!
        if (image) dataToUpdate.image = image; 
        if (torsoImage) dataToUpdate.torsoImage = torsoImage; 

        // 4. Salva no Banco (Upsert = Cria se não existir, Atualiza se existir)
        const updatedUser = await prisma.user.upsert({
            where: {
                email: session.user.email,
            },
            update: dataToUpdate,
            create: {
                email: session.user.email,
                name: name || session.user.name,
                image: image || session.user.image,
                course: course || "",
                torsoImage: torsoImage || null, // Novo campo adicionado!
                kycStatus: "pending"
            },
        });

        console.log("✅ Perfil salvo:", updatedUser.email);

        return NextResponse.json({
            success: true,
            user: {
                name: updatedUser.name,
                image: updatedUser.image,
                course: updatedUser.course,
                torsoImage: updatedUser.torsoImage
            }
        });

    } catch (error) {
        console.error("❌ Erro ao salvar:", error);
        return NextResponse.json({ error: "Erro interno ao salvar" }, { status: 500 });
    }
}