import { Router } from 'express';

import { expressRouteAdapter } from '../../../core/infra/express/adapters/expressRouteAdapter';
import type { AuthControllers } from '../presentation/controllers';

export function createAuthRoutes(controllers: AuthControllers) {
  const router = Router();

  router.post('/sign-up', expressRouteAdapter(controllers.signUp));
  router.post('/sign-in', expressRouteAdapter(controllers.signIn));

  return router;
}
