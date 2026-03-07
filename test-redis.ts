import redis from './backend/src/lib/redis';

async function testConnection() {
  try {
    console.log('🚀 Testando conexão...');
    
    // Tenta gravar um valor
    await redis.set('teste_zaeon', 'Zaeon OS Funcionando!', 'EX', 10);
    
    // Tenta ler o valor
    const result = await redis.get('teste_zaeon');
    
    if (result === 'Zaeon OS Funcionando!') {
      console.log('✅ SUCESSO: Redis gravou e leu os dados corretamente!');
    } else {
      console.log('⚠️ AVISO: A conexão abriu, mas o valor retornado é inesperado.');
    }
  } catch (error) {
    console.error('❌ ERRO: Não foi possível comunicar com o Redis:', error);
  } finally {
    // Se quiseres que o script feche sozinho:
    // process.exit();
  }
}

// Adiciona isto temporariamente ao final do ficheiro do Redis
async function testRedis() {
  try {
    await redis.set('zaeon_test', 'Sistema Operativo Ativo');
    const val = await redis.get('zaeon_test');
    console.log('🚀 Teste Redis:', val === 'Sistema Operativo Ativo' ? 'SUCESSO' : 'FALHA');
  } catch (err) {
    console.error('❌ Falha ao gravar no Redis:', err);
  }
}
testRedis();

testConnection();