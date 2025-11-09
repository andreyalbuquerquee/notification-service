export type DomainErrorCode =
  | 'validation'
  | 'unauthorized'
  | 'not_found'
  | 'conflict'
  | 'invariant_violation'
  | 'unknown';

export interface DomainErrorDetails {
  [key: string]: unknown;
}

export interface DomainErrorOptions {
  details?: DomainErrorDetails;
}

export class DomainError extends Error {
  public readonly name = 'DomainError';
  public readonly code: DomainErrorCode;
  public readonly details?: Readonly<DomainErrorDetails>;

  constructor(
    message: string,
    code: DomainErrorCode = 'unknown',
    opts: DomainErrorOptions = {},
  ) {
    super(message);

    this.code = code;
    this.details = opts.details
      ? Object.freeze({ ...opts.details })
      : undefined;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DomainError);
    }
  }

  withContext(extra: DomainErrorDetails): DomainError {
    return new DomainError(this.message, this.code, {
      details: { ...(this.details ?? {}), ...extra },
    });
  }

  static validation(message: string, details?: DomainErrorDetails) {
    return new DomainError(message, 'validation', { details });
  }

  static unauthorized(message: string, details?: DomainErrorDetails) {
    return new DomainError(message, 'unauthorized', { details });
  }

  static notFound(entity: string, criteria?: DomainErrorDetails) {
    return new DomainError(`${entity} not found`, 'not_found', {
      details: criteria,
    });
  }

  static conflict(message: string, details?: DomainErrorDetails) {
    return new DomainError(message, 'conflict', { details });
  }

  static invariant(message: string, details?: DomainErrorDetails) {
    return new DomainError(message, 'invariant_violation', { details });
  }
}

export function isDomainError(e: unknown): e is DomainError {
  return (
    e instanceof DomainError ||
    (typeof e === 'object' &&
      e !== null &&
      (e as any).name === 'DomainError' &&
      typeof (e as any).code === 'string' &&
      typeof (e as any).message === 'string')
  );
}
