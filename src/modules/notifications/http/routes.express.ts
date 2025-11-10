import { Router } from 'express';
import { expressRouteAdapter } from '../../../core/infra/express/adapters/expressRouteAdapter';
import type { NotificationControllers } from '../presentation/controllers';

export function createNotificationRoutes(controllers: NotificationControllers) {
  const router = Router();

  router.post('/', expressRouteAdapter(controllers.create));
  router.get('/', expressRouteAdapter(controllers.list));
  router.get('/unread/count', expressRouteAdapter(controllers.unreadCount));
  router.patch('/:id/read', expressRouteAdapter(controllers.markAsRead));
  router.delete('/:id', expressRouteAdapter(controllers.remove));

  return router;
}
