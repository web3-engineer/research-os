var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { prisma } from '../lib/prisma';
import { LogService } from './log.service';
import { UserService } from './user.service';
export class PostService {
    // Criar uma nova postagem no Lounge
    static createPost(userId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({ where: { id: userId } });
            // 2. Criamos o post normalmente
            const post = yield prisma.post.create({
                data: {
                    content,
                    userId,
                    user: (user === null || user === void 0 ? void 0 : user.name) || "Usuário Anonimo",
                    userImage: (user === null || user === void 0 ? void 0 : user.image) || null,
                    room: "lounge"
                }
            });
            yield LogService.createLog(userId, "LOUNGE_POST", `Conteúdo: ${content.substring(0, 30)}...`);
            yield UserService.addExperience(userId, 25);
            return post;
        });
    }
    // Listar todos os posts com os comentários e dados do autor
    static getLoungeFeed() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.post.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    comments: true,
                    author: {
                        select: { name: true, image: true, level: true }
                    }
                }
            });
        });
    }
    // Adicionar um comentário a um post
    static addComment(postId, userId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({ where: { id: userId } });
            return yield prisma.comment.create({
                data: {
                    content,
                    postId,
                    userId,
                    user: (user === null || user === void 0 ? void 0 : user.name) || "Usuário Anonimo"
                }
            });
        });
    }
    // Curtir/Descurtir um post (Toggle Like)
    static toggleLike(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield prisma.post.findUnique({ where: { id: postId } });
            if (!post)
                throw new Error("Post não encontrado");
            let updatedLikes = [...post.likes];
            const index = updatedLikes.indexOf(userId);
            if (index > -1) {
                updatedLikes.splice(index, 1); // Remove o like
            }
            else {
                updatedLikes.push(userId); // Adiciona o like
            }
            return yield prisma.post.update({
                where: { id: postId },
                data: { likes: updatedLikes }
            });
        });
    }
}
