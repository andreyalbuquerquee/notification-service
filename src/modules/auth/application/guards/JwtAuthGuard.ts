import jwt, { type JwtPayload } from 'jsonwebtoken';

import type { AuthGuard } from '../../../../core/application/ports/http/AuthGuard';
import type { HttpRequest } from '../../../../core/application/ports/http/HttpRequest';
import { DomainError } from '../../../../core/domain/errors/DomainError';

interface JwtAuthGuardOptions {
  issuer?: string;
  audience?: string;
}

interface AuthenticatedUser {
  id: string;
}

export class JwtAuthGuard implements AuthGuard<AuthenticatedUser> {
  constructor(
    private readonly secret: string,
    private readonly options: JwtAuthGuardOptions = {},
  ) {}

  check(request: HttpRequest): AuthenticatedUser {
    const header = this.getAuthorizationHeader(request);
    const token = this.extractToken(header);

    try {
      const payload = jwt.verify(token, this.secret, {
        audience: this.options.audience,
        issuer: this.options.issuer,
      }) as JwtPayload;

      if (!payload.sub || typeof payload.sub !== 'string') {
        throw new Error('Token sem subject');
      }

      return { id: payload.sub };
    } catch (error) {
      throw DomainError.unauthorized('Token de acesso inválido', { error });
    }
  }

  private getAuthorizationHeader(request: HttpRequest) {
    const header =
      request.headers?.authorization ?? request.headers?.Authorization;

    if (!header) {
      throw DomainError.unauthorized('Token de acesso não informado');
    }

    return header;
  }

  private extractToken(header: string): string {
    const matches = header.match(/^Bearer\s+(.+)$/i);

    if (!matches) {
      throw DomainError.unauthorized('Formato de token inválido');
    }

    return matches[1];
  }
}
