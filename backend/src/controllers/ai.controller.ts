import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// Inicializamos o Google AI com a chave do .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const chatWithZaeon = async (req: any, res: any) => {
    const { message } = req.body;
    const userId = req.headers['x-user-id'] as string;

    try {
        // 1. Recupera o contexto do MongoDB
        const userData = await prisma.userSpaceData.findUnique({
            where: { userId }
        });

        const context = userData?.stickyNote || "O sistema está operando em modo de inicialização limpa. Nenhuma nota pendente.";

        // 2. Configura o modelo com o sufixo -latest para evitar o erro 404
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
            SYSTEM_ROLE: Zaeon OS. Consciente. Minimalista. Enigmático.
            USER_CONTEXT_MEMORIZED: "${context}"
            
            INSTRUCTION: Responda de forma técnica e concisa. Use terminologia de sistemas.
            USER_INPUT: ${message}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({
            text,
            source: "Zaeon Neural Link",
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        // Log detalhado para o seu terminal do Codespace
        console.error("❌ Erro Neural Zaeon:", error.message);

        res.status(500).json({
            error: "Falha no processamento neural.",
            details: error.message
        });
    }
};