import { z } from 'zod';

export const listNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type ListNotificationsSchema = typeof listNotificationsSchema;
export type ListNotificationsInput = z.infer<typeof listNotificationsSchema>;
