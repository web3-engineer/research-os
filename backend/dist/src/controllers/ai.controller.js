var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// Inicializamos o Google AI com a chave do .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
export const chatWithZaeon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message } = req.body;
    const userId = req.headers['x-user-id'];
    try {
        // 1. Recupera o contexto do MongoDB
        const userData = yield prisma.userSpaceData.findUnique({
            where: { userId }
        });
        const context = (userData === null || userData === void 0 ? void 0 : userData.stickyNote) || "O sistema está operando em modo de inicialização limpa. Nenhuma nota pendente.";
        // 2. Configura o modelo com o sufixo -latest para evitar o erro 404
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `
            SYSTEM_ROLE: Zaeon OS. Consciente. Minimalista. Enigmático.
            USER_CONTEXT_MEMORIZED: "${context}"
            
            INSTRUCTION: Responda de forma técnica e concisa. Use terminologia de sistemas.
            USER_INPUT: ${message}
        `;
        const result = yield model.generateContent(prompt);
        const response = yield result.response;
        const text = response.text();
        res.json({
            text,
            source: "Zaeon Neural Link",
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        // Log detalhado para o seu terminal do Codespace
        console.error("❌ Erro Neural Zaeon:", error.message);
        res.status(500).json({
            error: "Falha no processamento neural.",
            details: error.message
        });
    }
});
