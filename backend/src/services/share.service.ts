import { prisma } from '../lib/prisma';
import { NotificationService } from './notification.service';
import { LogService } from './log.service';

export class ShareService {
  static async shareFile(fromUserId: string, toUserId: string, fileId: string) {
    // 1. Localizar o arquivo na library do remetente
    const senderSpace = await prisma.userSpaceData.findUnique({ where: { userId: fromUserId } });
    const library = Array.isArray(senderSpace?.library) ? (senderSpace!.library as any[]) : [];
    const fileToShare = library.find(item => item.id === fileId);

    if (!fileToShare) throw new Error("Arquivo não encontrado na sua biblioteca.");

    // 2. Adicionar o arquivo à library do destinatário
    const receiverSpace = await prisma.userSpaceData.findUnique({ where: { userId: toUserId } });
    if (!receiverSpace) throw new Error("Destinatário não possui um espaço de trabalho ativo.");

    const receiverLibrary = Array.isArray(receiverSpace.library) ? receiverSpace.library : [];
    
    await prisma.userSpaceData.update({
      where: { userId: toUserId },
      data: { 
        library: [...(receiverLibrary as any[]), { ...fileToShare, sharedBy: fromUserId, sharedAt: new Date() }]
      }
    });

    // 3. Notificar o destinatário em tempo real! 🔔
    NotificationService.send(
      toUserId,
      "Novo arquivo recebido! 📂",
      `Alguém compartilhou '${fileToShare.name}' com você.`,
      "info"
    );

    // No seu share.service.ts, importe o LogService e adicione no final do método:
    await LogService.register(
        fromUserId, 
        "FILE_SHARED", 
        `Compartilhou o arquivo ${fileId} com ${toUserId}`
    );

    return { success: true };
  }
}