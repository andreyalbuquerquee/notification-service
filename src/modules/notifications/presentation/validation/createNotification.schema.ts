import { z } from 'zod';

export const createNotificationSchema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1).max(1000),
});

export type CreateNotificationSchema = typeof createNotificationSchema;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
