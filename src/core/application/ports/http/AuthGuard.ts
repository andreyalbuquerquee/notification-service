import type { HttpRequest } from './HttpRequest';

export interface AuthGuard<T> {
  check(request: HttpRequest): T;
}
