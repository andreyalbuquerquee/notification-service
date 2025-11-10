import type { HydratedDocument } from 'mongoose';

import type { Notification } from '../../../domain/Notification';
import { Notification as NotificationEntity } from '../../../domain/Notification';
import type { NotificationDocument } from '../models/NotificationModel';

interface NotificationPersistence {
  _id: string;
  userId: string;
  title: string;
  content: string;
  readAt?: Date | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type NotificationRecord =
  | NotificationPersistence
  | HydratedDocument<NotificationDocument>;

export function mapNotificationToDomain(
  record: NotificationRecord,
): Notification {
  const plain: NotificationPersistence = {
    _id: record._id?.toString?.() ?? (record as NotificationPersistence)._id,
    userId: record.userId,
    title: record.title,
    content: record.content,
    readAt: record.readAt,
    deletedAt: record.deletedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };

  return NotificationEntity.restore({
    id: plain._id,
    userId: plain.userId,
    title: plain.title,
    content: plain.content,
    readAt: plain.readAt ?? null,
    deletedAt: plain.deletedAt ?? null,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  });
}

export function mapNotificationToPersistence(
  notification: Notification,
): NotificationPersistence {
  return {
    _id: notification.id,
    userId: notification.userId,
    title: notification.title.value,
    content: notification.content.value,
    readAt: notification.readAt ?? null,
    deletedAt: notification.deletedAt ?? null,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}
