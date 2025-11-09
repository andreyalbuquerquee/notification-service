import type { HttpRequest } from './HttpRequest';
import type { HttpResponse } from './HttpResponse';

export interface Controller {
  handle(request: HttpRequest): Promise<HttpResponse>;
}
