var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';
// Força o carregamento do .env da pasta atual
dotenv.config({ path: path.resolve(__dirname, '.env') });
const prisma = new PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('⏳ Testando conexão com MongoDB...');
        console.log('URL detectada:', process.env.DATABASE_URL ? 'Sim ✅' : 'Não ❌');
        try {
            const user = yield prisma.user.findFirst();
            console.log('✅ Conexão OK! Resultado:', user || 'Sem usuários cadastrados.');
        }
        catch (e) {
            console.error('❌ Erro de execução:', e);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
main();
