import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';
import type { FunctionDeclaration } from '@google-cloud/vertexai'; // Correção 1: Import type-only
import Groq from 'groq-sdk';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// --- 1. DEFINIÇÃO DA FERRAMENTA DE AGENDA (Function Calling - Gemini) ---
const updateScheduleTool: FunctionDeclaration = {
    name: "update_schedule",
    description: "Adiciona, remove ou atualiza uma aula na agenda acadêmica do aluno.",
    parameters: {
        // Correção 2: Passando as strings diretamente para evitar o erro do enum 'Type'
        type: "OBJECT" as any, 
        properties: {
            action: { type: "STRING" as any, description: "Ação: 'add', 'remove', ou 'update'." },
            day: { type: "INTEGER" as any, description: "Dia da semana. 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta." },
            hour: { type: "INTEGER" as any, description: "Hora de início da aula. Formato 24h (ex: 8, 10, 14)." },
            name: { type: "STRING" as any, description: "Nome da disciplina." },
            teacher: { type: "STRING" as any, description: "Nome do professor." },
            room: { type: "STRING" as any, description: "Local ou sala." },
            duration: { type: "INTEGER" as any, description: "Duração da aula em horas. Padrão 2." }
        },
        required: ["action", "day", "hour"]
    }
};

// --- 2. PERSONALIDADES DOS AGENTES ---
const AGENT_PERSONAS: Record<string, string> = {
    zenita: `Você é a Zenita, assistente acadêmica do Zaeon OS. Se o usuário pedir para adicionar, apagar ou editar aulas, USE A FERRAMENTA 'update_schedule'. Nunca responda com longos textos para tarefas de agenda.`,
    aura: `Você é Aura, especialista em insights de pesquisa. Analise os documentos fornecidos e responda de forma clara, técnica e concisa.`,
    scholar: `Você é um Gerador de Citações. Seu objetivo é extrair trechos vitais do documento e gerar referências estritas nas normas ABNT (Brasileira) e APA (Americana).`,
    scribe: `Você é um Escritor Acadêmico. Reescreva os textos do usuário com tom formal, impessoal e acadêmico. Explique rapidamente por que a sua versão é melhor.`,
    examiner: `Você é o Testador de Conhecimento. Crie quizzes desafiadores baseados no documento fornecido. Gere as perguntas, espere a resposta, e depois avalie.`,
    zaeon: `Você é o Ethernaut Zaeon. Especialista em criação de documentos. Auxilie na leitura de PDFs e estruture informações para o Fabricator.`
};

export async function POST(req: Request) {
    try {
        const { prompt, agent, systemContext, fileData } = await req.json();
        const agentKey = agent?.toLowerCase() || "aura";
        const persona = AGENT_PERSONAS[agentKey] || AGENT_PERSONAS.aura;

        // =================================================================
        // ROTA GROQ (OCULTA / DESLIGADA)
        // =================================================================
        if (agentKey === "groq_bypassed") {
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const completion = await groq.chat.completions.create({
                messages: [{ role: "system", content: persona }, { role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.6,
            });
            return NextResponse.json({ text: completion.choices[0]?.message?.content });
        }

        // =================================================================
        // ROTA GEMINI (VERTEX AI) - ATIVA E MULTIMODAL
        // =================================================================
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || "{}");
        const vertexAI = new VertexAI({
            project: credentials.project_id || process.env.GOOGLE_PROJECT_ID,
            location: process.env.GOOGLE_LOCATION || 'us-central1',
            googleAuthOptions: { credentials: { client_email: credentials.client_email, private_key: credentials.private_key } }
        });

        // Configurações do Modelo
        const tools = agentKey === "zenita" ? [{ functionDeclarations: [updateScheduleTool] }] : undefined;
        const generativeModel = vertexAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: { temperature: 0.4 },
            tools: tools
        });

        // Montando o conteúdo (Texto + Base64 do PDF se existir)
        const parts: any[] = [];
        if (fileData) {
            parts.push({
                inlineData: { data: fileData, mimeType: "application/pdf" }
            });
        }
        parts.push({ text: prompt });

        // Instruções de Sistema
        let finalSystemInstruction = persona;
        if (systemContext) finalSystemInstruction += `\n[CONTEXTO DE SISTEMA]: ${systemContext}`;

        const chat = generativeModel.startChat({
            systemInstruction: { role: 'system', parts: [{ text: finalSystemInstruction }] }
        });

        const result = await chat.sendMessage(parts);
        const response = result.response;

        // Verifica se o Gemini acionou a ferramenta de Agenda (Zenita)
        const functionCall = response.candidates?.[0]?.content?.parts?.[0]?.functionCall;
        if (functionCall) {
            return NextResponse.json({
                toolCall: { name: functionCall.name, args: functionCall.args },
                text: "Ação de agenda interceptada e processada via UI."
            });
        }

        // Retorna a resposta normal de texto
        const textResponse = response.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta do núcleo.";
        return NextResponse.json({ text: textResponse });

    } catch (error: any) {
        console.error("Erro na API Neural:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}