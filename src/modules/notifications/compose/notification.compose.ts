import { getRedisClient } from '../../../core/infra/cache/redis';
import { CountUnreadNotificationsUseCase } from '../application/use-cases/CountUnreadNotificationsUseCase';
import { CreateNotificationUseCase } from '../application/use-cases/CreateNotificationUseCase';
import { DeleteNotificationUseCase } from '../application/use-cases/DeleteNotificationUseCase';
import { ListUserNotificationsUseCase } from '../application/use-cases/ListUserNotificationsUseCase';
import { MarkNotificationAsReadUseCase } from '../application/use-cases/MarkNotificationAsReadUseCase';
import { RedisUnreadNotificationCounter } from '../infra/cache/RedisUnreadNotificationCounter';
import { MongoNotificationRepo } from '../infra/database/MongoNotificationRepo';
import type { NotificationControllers } from '../presentation/controllers';
import { CreateNotificationController } from '../presentation/controllers/CreateNotificationController';
import { DeleteNotificationController } from '../presentation/controllers/DeleteNotificationController';
import { GetUnreadCountController } from '../presentation/controllers/GetUnreadCountController';
import { ListNotificationsController } from '../presentation/controllers/ListNotificationsController';
import { MarkAsReadController } from '../presentation/controllers/MarkAsReadController';
import { createNotificationSchema } from '../presentation/validation/createNotification.schema';
import { listNotificationsSchema } from '../presentation/validation/listNotifications.schema';
import { notificationIdSchema } from '../presentation/validation/notificationId.schema';

export interface NotificationModule {
  controllers: NotificationControllers;
}

export function composeNotificationModule(): NotificationModule {
  const notificationRepo = new MongoNotificationRepo();
  const redisClient = getRedisClient();
  const unreadCounter = new RedisUnreadNotificationCounter(redisClient);

  const createNotificationUseCase = new CreateNotificationUseCase(
    notificationRepo,
    unreadCounter,
  );
  const listNotificationsUseCase = new ListUserNotificationsUseCase(
    notificationRepo,
  );
  const markAsReadUseCase = new MarkNotificationAsReadUseCase(
    notificationRepo,
    unreadCounter,
  );
  const deleteNotificationUseCase = new DeleteNotificationUseCase(
    notificationRepo,
    unreadCounter,
  );
  const countUnreadUseCase = new CountUnreadNotificationsUseCase(
    notificationRepo,
    unreadCounter,
  );

  const controllers: NotificationControllers = {
    create: new CreateNotificationController(
      createNotificationUseCase,
      createNotificationSchema,
    ),
    list: new ListNotificationsController(
      listNotificationsUseCase,
      listNotificationsSchema,
    ),
    markAsRead: new MarkAsReadController(
      markAsReadUseCase,
      notificationIdSchema,
    ),
    remove: new DeleteNotificationController(
      deleteNotificationUseCase,
      notificationIdSchema,
    ),
    unreadCount: new GetUnreadCountController(countUnreadUseCase),
  };

  return { controllers };
}
