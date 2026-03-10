import { io } from '../server';

export class NotificationService {
  // Envia um alerta instantâneo para um usuário específico
  static send(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') {
    const notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date()
    };

    io.emit(`NOTIFICATION_${userId}`, notification);

    console.log(`🔔 Notificação enviada para ${userId}: ${title}`);
    return notification;
  }
}