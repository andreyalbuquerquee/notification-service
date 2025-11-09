import { Router } from 'express';

import { composeAuthModule } from '../../../modules/auth/compose/auth.compose';
import { createAuthRoutes } from '../../../modules/auth/http/routes.express';

const routes = Router();

const authModule = composeAuthModule();
routes.use('/auth', createAuthRoutes(authModule.controllers));

export { routes };
