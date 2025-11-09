import type { HttpErrorHandler } from '../../application/ports/http/HttpErrorHandler';
import type { HttpResponse } from '../../application/ports/http/HttpResponse';
import {
  type DomainError,
  type DomainErrorCode,
  isDomainError,
} from '../../domain/errors/DomainError';

type ErrorBody = {
  error: string;
  code?: DomainErrorCode;
  details?: Readonly<Record<string, unknown>>;
};

export class DefaultErrorHandler implements HttpErrorHandler {
  handle(error: unknown): HttpResponse<ErrorBody> {
    if (isDomainError(error)) {
      return this.handleDomainError(error);
    }

    console.error('[http] unhandled error:', error);

    return {
      statusCode: 500,
      body: { error: 'Internal server error' },
    };
  }

  private handleDomainError(error: DomainError): HttpResponse<ErrorBody> {
    const statusCode = this.mapDomainErrorToStatus(error.code);

    return {
      statusCode,
      body: {
        error: error.message,
        code: error.code,
        ...(error.details ? { details: error.details } : {}),
      },
    };
  }

  private mapDomainErrorToStatus(code: DomainErrorCode): number {
    switch (code) {
      case 'validation':
        return 422;
      case 'unauthorized':
        return 401;
      case 'not_found':
        return 404;
      case 'conflict':
        return 409;
      case 'invariant_violation':
        return 400;
      default:
        return 500;
    }
  }
}
