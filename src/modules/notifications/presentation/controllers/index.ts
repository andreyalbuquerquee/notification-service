import type { Controller } from '../../../../core/application/ports/http/Controller';
import { CreateNotificationController } from './CreateNotificationController';
import { DeleteNotificationController } from './DeleteNotificationController';
import { GetUnreadCountController } from './GetUnreadCountController';
import { ListNotificationsController } from './ListNotificationsController';
import { MarkAsReadController } from './MarkAsReadController';

export interface NotificationControllers {
  create: Controller;
  list: Controller;
  markAsRead: Controller;
  remove: Controller;
  unreadCount: Controller;
}

export {
  CreateNotificationController,
  DeleteNotificationController,
  GetUnreadCountController,
  ListNotificationsController,
  MarkAsReadController,
};
