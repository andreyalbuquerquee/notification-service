export interface HttpRequest<T = any> {
  body?: T;
  headers?: { [key: string]: any };
  params?: { [key: string]: any };
  query?: { [key: string]: any };
  user?: {
    id: string;
  };
}
