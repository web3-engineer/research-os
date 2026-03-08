import { prisma } from '../lib/prisma';
import { LogService } from './log.service';
import { UserService } from './user.service';
import { NotificationService } from './notification.service'; 
import { io } from '../server'; 

export class PostService {
    // 1. Criar uma nova postagem no Lounge (Com Log, XP e Socket)
    static async createPost(userId: string, content: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        const post = await prisma.post.create({
            data: {
                content,
                userId,
                user: user?.name || "Usuário Anonimo",
                userImage: user?.image || null,
                room: "lounge"
            },
            include: {
                author: { select: { name: true, image: true, level: true } }
            }
        });

        // Auditoria
        await LogService.createLog(userId, "LOUNGE_POST", `Conteúdo: ${content.substring(0, 30)}...`);

        // Notifica o sistema em tempo real
        io.emit('NEW_LOUNGE_POST', post);

        // Gamificação
        await UserService.addExperience(userId, 25);

        return post;
    }

    // 2. Listar todos os posts (Feed)
    static async getLoungeFeed() {
        return await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                comments: true,
                author: {
                    select: { name: true, image: true, level: true }
                }
            }
        });
    }

    // 3. Adicionar um comentário
    static async addComment(postId: string, userId: string, content: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        const comment = await prisma.comment.create({
            data: {
                content,
                postId,
                userId,
                user: user?.name || "Usuário Anonimo"
            }
        });

        // Avisa que há um novo comentário
        io.emit('NEW_COMMENT', { postId, comment });

        return comment;
    }

    // 4. Curtir/Descurtir um post (Toggle Like)
    static async toggleLike(postId: string, userId: string) {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) throw new Error("Post não encontrado");

        let updatedLikes = [...post.likes];
        const index = updatedLikes.indexOf(userId);

        if (index > -1) {
            updatedLikes.splice(index, 1); // Remove o like
        } else {
            updatedLikes.push(userId); // Adiciona o like
        }

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: { likes: updatedLikes }
        });

        // Se alguém deu like (e não foi o próprio autor do post), notificamos!
        if (updatedLikes.includes(userId) && updatedPost.userId !== userId) {
            NotificationService.send(
            updatedPost.userId!, 
                "Novo Like! ❤️", 
                "Alguém curtiu sua publicação no Lounge.",
                "success"
            );
        }
        // Emite o evento de Like para atualização instantânea no Front
        io.emit('POST_LIKED', { postId, userId, likesCount: updatedPost.likes.length });

        return updatedPost;
    }
}