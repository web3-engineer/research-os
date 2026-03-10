import { PostService } from '../src/services/post.service';
import { prisma } from '../src/lib/prisma';

async function test() {
    const userId = "65d2f1b4e3a2c5d6f8a90123"; // ID de teste padrão

    console.log("👤 Garantindo que o usuário de teste existe...");
    await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
            id: userId,
            name: "Agatha Tester",
            email: "agatha@zaeon.os",
            xp: 0,
            level: 1
        }
    });

    // 1. Pegar o ID do Lounge Global
    const lounge = await prisma.room.findUnique({ where: { slug: 'lounge-global' } });

    if (lounge) {
        console.log("🚀 Testando Post no Lounge...");
        await PostService.createPost(userId, "Post de teste no Lounge!", lounge.id);
        console.log("✅ Post no Lounge OK!");
    } else {
        console.log("❌ Lounge Global não encontrado. Execute o script create-initial-room primeiro.");
        return;
    }

    // 2. Criar/Pegar uma sala de guilda
    console.log("🚀 Acessando Sala de Guilda...");
    const guildRoom = await prisma.room.upsert({
        where: { slug: 'guilda-devs' },
        update: {},
        create: {
            name: 'Guilda de Devs',
            slug: 'guilda-devs',
            ownerId: userId
        }
    });

    console.log("🚀 Testando Post na Guilda...");
    await PostService.createPost(userId, "Post de teste na Guilda!", guildRoom.id);
    console.log("✅ Post na Guilda OK!");

    // 3. Validar contagens
    const loungePosts = await PostService.getFeed(lounge.id);
    const guildPosts = await PostService.getFeed(guildRoom.id);

    console.log("\n--- RESULTADOS ---");
    console.log(`📊 Lounge (${lounge.name}): ${loungePosts.length} posts.`);
    console.log(`📊 Guilda (${guildRoom.name}): ${guildPosts.length} posts.`);
    console.log("------------------\n");

    console.log("🎉 Teste concluído com sucesso!");
    process.exit(0);
}

test();