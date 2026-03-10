import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const room = await prisma.room.upsert({
        where: { slug: 'lounge-global' },
        update: {},
        create: {
            name: 'Lounge Global',
            slug: 'lounge-global',
            description: 'O ponto de encontro oficial do Zaeon OS',
            isPrivate: false,
            ownerId: '65d2f1b4e3a2c5d6f8a90123', // Use o mesmo ID de teste de antes
        },
    });

    console.log('✅ Sala criada com sucesso!');
    console.log('ID da Sala:', room.id);
    console.log('Use este ID para criar seus posts agora.');
}

main();