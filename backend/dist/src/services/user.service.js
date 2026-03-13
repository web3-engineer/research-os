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
export class UserService {
    static createUser(id, name, email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.user.create({
                data: {
                    id,
                    name,
                    email,
                    level: 1,
                    xp: 0
                }
            });
        });
    }
    // Busca o perfil completo do usuário
    static getUserProfile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.user.findUnique({
                where: { id },
                include: { userSpaceData: true }
            });
        });
    }
    // Atualiza dados de bio, curso, etc.
    static updateProfile(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.user.update({
                where: { id },
                data: {
                    name: data.name,
                    bio: data.bio,
                    course: data.course,
                    age: data.age,
                    gender: data.gender,
                    torsoImage: data.torsoImage,
                    phone: data.phone
                }
            });
        });
    }
    // Lógica de Gamificação: Adicionar XP e subir de nível
    static addExperience(id, xpAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({ where: { id } });
            if (!user)
                throw new Error("Usuário não encontrado");
            let newXp = user.xp + xpAmount;
            let newLevel = user.level;
            // Lógica simples: cada 100 XP sobe um nível
            if (newXp >= 100) {
                newLevel += Math.floor(newXp / 100);
                newXp = newXp % 100;
            }
            return yield prisma.user.update({
                where: { id },
                data: {
                    xp: newXp,
                    level: newLevel
                }
            });
        });
    }
}
