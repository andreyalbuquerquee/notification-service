import type { Controller } from '../../../../core/application/ports/http/Controller';
import type { HttpRequest } from '../../../../core/application/ports/http/HttpRequest';
import type { HttpResponse } from '../../../../core/application/ports/http/HttpResponse';
import { HttpStatusCode } from '../../../../core/application/ports/http/HttpStatusCode';
import { DomainError } from '../../../../core/domain/errors/DomainError';
import type { CountUnreadNotificationsUseCase } from '../../application/use-cases/CountUnreadNotificationsUseCase';

export class GetUnreadCountController implements Controller {
  constructor(private readonly useCase: CountUnreadNotificationsUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    if (!request.user?.id) {
      throw DomainError.unauthorized('Usuário não autenticado');
    }

    const result = await this.useCase.execute({ userId: request.user.id });

    return {
      statusCode: HttpStatusCode.OK,
      body: { count: result.count },
    };
  }
}
