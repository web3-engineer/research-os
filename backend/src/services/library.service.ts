import { prisma } from '../lib/prisma';
import { io } from '../server';

export class LibraryService {
  // Adicionar um novo item (arquivo ou pasta) à biblioteca
  static async saveItem(userId: string, item: { id: string, name: string, type: 'file' | 'folder', content?: string, parentId?: string }) {
    const userSpace = await prisma.userSpaceData.findUnique({
      where: { userId }
    });

    if (!userSpace) throw new Error("Espaço de trabalho não encontrado");

    // A library atual ou criamos um array vazio
    const currentLibrary = Array.isArray(userSpace.library) ? userSpace.library : [];
    
    // Adiciona o novo item
    const updatedLibrary = [...currentLibrary, { ...item, createdAt: new Date() }];

    const updatedSpace = await prisma.userSpaceData.update({
      where: { userId },
      data: { library: updatedLibrary }
    });

    // Avisa o Frontend em tempo real: "O arquivo apareceu no seu desktop!"
    io.emit(`LIBRARY_UPDATED_${userId}`, updatedLibrary);

    return updatedSpace;
  }
}