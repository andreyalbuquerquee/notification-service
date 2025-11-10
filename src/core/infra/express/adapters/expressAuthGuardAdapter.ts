import type { RequestHandler } from 'express';

import type { AuthGuard } from '../../../application/ports/http/AuthGuard';
import type { HttpRequest } from '../../../application/ports/http/HttpRequest';

export function expressAuthGuardAdapter<T extends { id: string }>(
  guard: AuthGuard<T>,
): RequestHandler {
  return (req, _res, next) => {
    const httpRequest: HttpRequest = {
      body: req.body,
      headers: req.headers,
      params: req.params,
      query: req.query,
      user: req.metadata?.user,
    };

    try {
      const authResult = guard.check(httpRequest);
      req.metadata = {
        ...(req.metadata ?? {}),
        user: authResult,
      };
      next();
    } catch (error) {
      next(error);
    }
  };
}
