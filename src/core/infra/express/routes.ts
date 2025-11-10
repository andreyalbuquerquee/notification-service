import { Router } from 'express';
import { env } from '../../../main/env';
import { JwtAuthGuard } from '../../../modules/auth/application/guards/JwtAuthGuard';
import { composeAuthModule } from '../../../modules/auth/compose/auth.compose';
import { createAuthRoutes } from '../../../modules/auth/http/routes.express';
import { composeNotificationModule } from '../../../modules/notifications/compose/notification.compose';
import { createNotificationRoutes } from '../../../modules/notifications/http/routes.express';
import { expressAuthGuardAdapter } from './adapters/expressAuthGuardAdapter';

const routes = Router();

const authModule = composeAuthModule();
routes.use('/auth', createAuthRoutes(authModule.controllers));

const notificationModule = composeNotificationModule();
const authGuard = new JwtAuthGuard(env.JWT_SECRET);
const authMiddleware = expressAuthGuardAdapter(authGuard);
routes.use(
  '/notifications',
  authMiddleware,
  createNotificationRoutes(notificationModule.controllers),
);

export { routes };
