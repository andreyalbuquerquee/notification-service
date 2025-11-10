import type {
  INotificationRepo,
  NotificationPage,
  PaginationParams,
} from '../../domain/INotificationRepo';
import type { Notification } from '../../domain/Notification';
import {
  mapNotificationToDomain,
  mapNotificationToPersistence,
} from './mappers/NotificationMapper';
import { NotificationModel } from './models/NotificationModel';

export class MongoNotificationRepo implements INotificationRepo {
  async create(notification: Notification): Promise<void> {
    const data = mapNotificationToPersistence(notification);
    await NotificationModel.create({
      _id: data._id,
      userId: data.userId,
      title: data.title,
      content: data.content,
      readAt: data.readAt,
      deletedAt: data.deletedAt,
    });
  }

  async findByIdAndUser(
    notificationId: string,
    userId: string,
  ): Promise<Notification | null> {
    const doc = await NotificationModel.findOne({
      _id: notificationId,
      userId,
    }).exec();
    return doc ? mapNotificationToDomain(doc) : null;
  }

  async listByUser(
    userId: string,
    { page, pageSize }: PaginationParams,
  ): Promise<NotificationPage> {
    const skip = (page - 1) * pageSize;

    const [docs, total] = await Promise.all([
      NotificationModel.find({ userId, deletedAt: null })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .exec(),
      NotificationModel.countDocuments({ userId, deletedAt: null }),
    ]);

    return {
      notifications: docs.map((doc) => mapNotificationToDomain(doc)),
      page,
      pageSize,
      total,
    };
  }

  async save(notification: Notification): Promise<void> {
    await NotificationModel.findByIdAndUpdate(
      notification.id,
      {
        title: notification.title.value,
        content: notification.content.value,
        readAt: notification.readAt ?? null,
        deletedAt: notification.deletedAt ?? null,
      },
      { new: false, upsert: false },
    ).exec();
  }

  countUnreadByUser(userId: string): Promise<number> {
    return NotificationModel.countDocuments({
      userId,
      deletedAt: null,
      $or: [{ readAt: null }, { readAt: { $exists: false } }],
    }).exec();
  }
}
