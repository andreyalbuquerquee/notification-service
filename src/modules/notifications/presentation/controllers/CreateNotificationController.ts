import type { Controller } from '../../../../core/application/ports/http/Controller';
import type { HttpRequest } from '../../../../core/application/ports/http/HttpRequest';
import type { HttpResponse } from '../../../../core/application/ports/http/HttpResponse';
import { HttpStatusCode } from '../../../../core/application/ports/http/HttpStatusCode';
import { DomainError } from '../../../../core/domain/errors/DomainError';
import type { CreateNotificationUseCase } from '../../application/use-cases/CreateNotificationUseCase';
import { presentNotification } from '../NotificationPresenter';
import type { CreateNotificationSchema } from '../validation/createNotification.schema';

export class CreateNotificationController implements Controller {
  constructor(
    private readonly useCase: CreateNotificationUseCase,
    private readonly schema: CreateNotificationSchema,
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    if (!request.user?.id) {
      throw DomainError.unauthorized('Usuário não autenticado');
    }

    const parsed = this.schema.safeParse(request.body ?? {});

    if (!parsed.success) {
      throw DomainError.validation('Payload inválido', {
        issues: parsed.error.format(),
      });
    }

    const result = await this.useCase.execute({
      userId: request.user.id,
      title: parsed.data.title,
      content: parsed.data.content,
    });

    return {
      statusCode: HttpStatusCode.CREATED,
      body: { notification: presentNotification(result.notification) },
    };
  }
}
