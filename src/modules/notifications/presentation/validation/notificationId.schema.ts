import { z } from 'zod';

export const notificationIdSchema = z.object({
  id: z.string().min(1, 'Notification id é obrigatório'),
});

export type NotificationIdSchema = typeof notificationIdSchema;
