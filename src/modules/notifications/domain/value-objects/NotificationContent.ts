import { DomainError } from '../../../../core/domain/errors/DomainError';
import { ValueObject } from '../../../../core/domain/ValueObject';

export class NotificationContent extends ValueObject<string> {
  constructor(value: string) {
    super(value.trim());
  }

  protected validate(value: string): void {
    const trimmed = value.trim();
    if (!trimmed) {
      throw DomainError.validation('Conteúdo da notificação é obrigatório', {
        field: 'content',
      });
    }

    if (trimmed.length > 1000) {
      throw DomainError.validation(
        'Conteúdo deve ter no máximo 1000 caracteres',
        {
          field: 'content',
        },
      );
    }
  }

  get value(): string {
    return this.props;
  }
}
