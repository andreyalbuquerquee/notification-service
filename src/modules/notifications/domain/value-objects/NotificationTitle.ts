import { DomainError } from '../../../../core/domain/errors/DomainError';
import { ValueObject } from '../../../../core/domain/ValueObject';

export class NotificationTitle extends ValueObject<string> {
  constructor(value: string) {
    super(value.trim());
  }

  protected validate(value: string): void {
    const trimmed = value.trim();
    if (!trimmed) {
      throw DomainError.validation('Título da notificação é obrigatório', {
        field: 'title',
      });
    }

    if (trimmed.length > 120) {
      throw DomainError.validation('Título deve ter no máximo 120 caracteres', {
        field: 'title',
      });
    }
  }

  get value(): string {
    return this.props;
  }
}
