import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Força o carregamento do .env da pasta atual
dotenv.config({ path: path.resolve(__dirname, '.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Testando conexão com MongoDB...');
  console.log('URL detectada:', process.env.DATABASE_URL ? 'Sim ✅' : 'Não ❌');
  
  try {
    const user = await prisma.user.findFirst();
    console.log('✅ Conexão OK! Resultado:', user || 'Sem usuários cadastrados.');
  } catch (e) {
    console.error('❌ Erro de execução:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();