import type { Controller } from '../../../../core/application/ports/http/Controller';
import type { HttpRequest } from '../../../../core/application/ports/http/HttpRequest';
import type { HttpResponse } from '../../../../core/application/ports/http/HttpResponse';
import { DomainError } from '../../../../core/domain/errors/DomainError';
import type { SignInUseCase } from '../../application/use-cases/SignInUseCase';
import { presentAuth } from '../AuthPresenter';
import type { SignInSchema } from '../validation/signIn.schema';

export class SignInController implements Controller {
  constructor(
    private readonly useCase: SignInUseCase,
    private readonly schema: SignInSchema,
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const parsed = this.schema.safeParse(request.body ?? {});

    if (!parsed.success) {
      throw DomainError.validation('Payload inválido', {
        issues: parsed.error.format(),
      });
    }

    const result = await this.useCase.execute(parsed.data);

    return {
      statusCode: 200,
      body: presentAuth(result),
    };
  }
}
