import type { HttpResponse } from './HttpResponse';

export interface Data<T = any> {
  data: T;
}

export interface HttpErrorHandler {
  handle(error: unknown): HttpResponse;
}
