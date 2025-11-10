import type { Controller } from '../../../../core/application/ports/http/Controller';
import type { HttpRequest } from '../../../../core/application/ports/http/HttpRequest';
import type { HttpResponse } from '../../../../core/application/ports/http/HttpResponse';
import { HttpStatusCode } from '../../../../core/application/ports/http/HttpStatusCode';
import { DomainError } from '../../../../core/domain/errors/DomainError';
import type { DeleteNotificationUseCase } from '../../application/use-cases/DeleteNotificationUseCase';
import type { NotificationIdSchema } from '../validation/notificationId.schema';

export class DeleteNotificationController implements Controller {
  constructor(
    private readonly useCase: DeleteNotificationUseCase,
    private readonly schema: NotificationIdSchema,
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    if (!request.user?.id) {
      throw DomainError.unauthorized('Usuário não autenticado');
    }

    const parsed = this.schema.safeParse(request.params ?? {});

    if (!parsed.success) {
      throw DomainError.validation('Parâmetro inválido', {
        issues: parsed.error.format(),
      });
    }

    await this.useCase.execute({
      userId: request.user.id,
      notificationId: parsed.data.id,
    });

    return {
      statusCode: HttpStatusCode.NO_CONTENT,
      body: null,
    };
  }
}
