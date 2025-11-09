import type { Controller } from '../../../../core/application/ports/http/Controller';
import type { HttpRequest } from '../../../../core/application/ports/http/HttpRequest';
import type { HttpResponse } from '../../../../core/application/ports/http/HttpResponse';
import { DomainError } from '../../../../core/domain/errors/DomainError';
import type { SignUpUseCase } from '../../application/use-cases/SignUpUseCase';
import { presentAuth } from '../AuthPresenter';
import type { SignUpSchema } from '../validation/signUp.schema';

export class SignUpController implements Controller {
  constructor(
    private readonly useCase: SignUpUseCase,
    private readonly schema: SignUpSchema,
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
      statusCode: 201,
      body: presentAuth(result),
    };
  }
}
