import type { RequestHandler } from 'express';

import type { Controller } from '../../application/ports/http/Controller';

export function expressRouteAdapter(controller: Controller): RequestHandler {
  return async (req, res, next) => {
    try {
      const currentUser = (req as any).user as { id?: string } | undefined;
      const httpResponse = await controller.handle({
        body: req.body,
        headers: req.headers,
        params: req.params,
        query: req.query,
        user: currentUser?.id ? { id: currentUser.id } : undefined,
      });

      if (res.headersSent) {
        return;
      }

      res.status(httpResponse.statusCode).json(httpResponse.body);
    } catch (error) {
      next(error);
    }
  };
}
