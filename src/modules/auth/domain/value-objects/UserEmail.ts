import { DomainError } from '../../../../core/domain/errors/DomainError';
import { ValueObject } from '../../../../core/domain/ValueObject';

export class UserEmail extends ValueObject<string> {
  constructor(value: string) {
    super(value.trim().toLowerCase());
  }

  protected validate(value: string): void {
    const emailRegex =
      /^(?:[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*)@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i;

    if (!emailRegex.test(value)) {
      throw DomainError.validation('E-mail inválido', {
        field: 'email',
        value,
      });
    }
  }

  get value(): string {
    return this.props;
  }
}
