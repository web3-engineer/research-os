import { prisma } from '../lib/prisma';
import { LogService } from './log.service';
import { UserService } from './user.service';

export class PostService {
    // Criar uma nova postagem no Lounge
    static async createPost(userId: string, content: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        // 2. Criamos o post normalmente
        const post = await prisma.post.create({
            data: {
                content,
                userId,
                user: user?.name || "Usuário Anonimo",
                userImage: user?.image || null,
                room: "lounge"
            }
        });

        await LogService.createLog(userId, "LOUNGE_POST", `Conteúdo: ${content.substring(0, 30)}...`);

        await UserService.addExperience(userId, 25);

        return post;
    }
    // Listar todos os posts com os comentários e dados do autor
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

    // Adicionar um comentário a um post
    static async addComment(postId: string, userId: string, content: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        return await prisma.comment.create({
            data: {
                content,
                postId,
                userId,
                user: user?.name || "Usuário Anonimo"
            }
        });
    }

    // Curtir/Descurtir um post (Toggle Like)
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

        return await prisma.post.update({
            where: { id: postId },
            data: { likes: updatedLikes }
        });
    }
}