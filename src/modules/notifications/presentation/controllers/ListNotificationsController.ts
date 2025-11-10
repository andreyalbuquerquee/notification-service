import type { Controller } from '../../../../core/application/ports/http/Controller';
import type { HttpRequest } from '../../../../core/application/ports/http/HttpRequest';
import type { HttpResponse } from '../../../../core/application/ports/http/HttpResponse';
import { HttpStatusCode } from '../../../../core/application/ports/http/HttpStatusCode';
import { DomainError } from '../../../../core/domain/errors/DomainError';
import type { ListUserNotificationsUseCase } from '../../application/use-cases/ListUserNotificationsUseCase';
import { presentNotification } from '../NotificationPresenter';
import type { ListNotificationsSchema } from '../validation/listNotifications.schema';

export class ListNotificationsController implements Controller {
  constructor(
    private readonly useCase: ListUserNotificationsUseCase,
    private readonly schema: ListNotificationsSchema,
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    if (!request.user?.id) {
      throw DomainError.unauthorized('Usuário não autenticado');
    }

    const parsed = this.schema.safeParse(request.query ?? {});

    if (!parsed.success) {
      throw DomainError.validation('Query inválida', {
        issues: parsed.error.format(),
      });
    }

    const result = await this.useCase.execute({
      userId: request.user.id,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
    });

    return {
      statusCode: HttpStatusCode.OK,
      body: {
        notifications: result.notifications.map(presentNotification),
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
      },
    };
  }
}
