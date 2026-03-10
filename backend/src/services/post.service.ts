import { prisma } from '../lib/prisma';
import { LogService } from './log.service';
import { UserService } from './user.service';
import { NotificationService } from './notification.service';
import { io } from '../server';

export class PostService {
    /**
     * 1. Criar Postagem (Híbrida)
     * Se roomId não for passado, ele assume o Lounge Global automaticamente.
     */
    static async createPost(userId: string, content: string, roomId?: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        // Lógica de Coerência: Se não mandarem roomId, buscamos o ID do 'lounge-global'
        let targetRoomId = roomId;
        if (!targetRoomId) {
            const globalRoom = await prisma.room.findUnique({ where: { slug: 'lounge-global' } });
            targetRoomId = globalRoom?.id;
        }

        if (!targetRoomId) throw new Error("Sala de destino não encontrada.");

        const post = await prisma.post.create({
            data: {
                content,
                userId,
                roomId: targetRoomId,
                user: user?.name || "Usuário Anônimo",
                userImage: user?.image || null,
            },
            include: {
                author: { select: { name: true, image: true, level: true } }
            }
        });

        // 🟢 REGRA SOURCERY: Mantemos o evento legado 
        io.emit('NEW_LOUNGE_POST', post);

        // 🔵 REGRA NOVA: Emitimos para a sala específica 
        io.to(targetRoomId).emit('NEW_POST', post);

        await LogService.createLog(userId, "LOUNGE_POST", `Sala: ${targetRoomId}`);
        await UserService.addExperience(userId, 25);

        return post;
    }

    /**
     * 2. Listar Feed (Híbrido)
     * Se não passar roomId, ele traz o lounge global
     */
    static async getFeed(roomId?: string) {
        let targetId = roomId;

        if (!targetId) {
            const globalRoom = await prisma.room.findUnique({ where: { slug: 'lounge-global' } });
            targetId = globalRoom?.id;
        }

        return await prisma.post.findMany({
            where: targetId ? { roomId: targetId } : {},
            orderBy: { createdAt: 'desc' },
            include: {
                comments: { include: { author: { select: { name: true, image: true } } } },
                author: { select: { name: true, image: true, level: true } }
            }
        });
    }

    /**
     * 3. Adicionar um comentário
     */
    static async addComment(postId: string, userId: string, content: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        const comment = await prisma.comment.create({
            data: {
                content,
                postId,
                userId,
                user: user?.name || "Usuário Anônimo"
            },
            include: {
                author: { select: { name: true, image: true } }
            }
        });

        io.emit('NEW_COMMENT', { postId, comment });
        return comment;
    }

    /**
     * 4. Toggle Like
     */
    static async toggleLike(postId: string, userId: string) {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) throw new Error("Post não encontrado");

        let updatedLikes = [...post.likes];
        const index = updatedLikes.indexOf(userId);

        if (index > -1) {
            updatedLikes.splice(index, 1);
        } else {
            updatedLikes.push(userId);
        }

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: { likes: updatedLikes }
        });

        if (updatedLikes.includes(userId) && updatedPost.userId !== userId) {
            NotificationService.send(
                updatedPost.userId!,
                "Novo Like! ❤️",
                "Alguém curtiu sua publicação no Lounge.",
                "success"
            );
        }

        io.emit('POST_LIKED', { postId, userId, likesCount: updatedPost.likes.length });
        return updatedPost;
    }
}