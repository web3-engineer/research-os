import { prisma } from '../lib/prisma';

export class LayoutService {
  static async saveLayout(userId: string, windows: any) {
    return await prisma.userSpaceData.update({
      where: { userId },
      data: { layoutState: windows }
    });
  }

  static async getLayout(userId: string) {
    return await prisma.userSpaceData.findUnique({
      where: { userId },
      select: { layoutState: true }
    });
  }
}