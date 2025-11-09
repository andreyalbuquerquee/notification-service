import type { EntityOptions } from '../../../core/domain/Entity';
import { Entity } from '../../../core/domain/Entity';

import { DomainError } from '../../../core/domain/errors/DomainError';
import { UserEmail } from './value-objects/UserEmail';

interface UserProps {
  name: string;
  email: UserEmail;
  passwordHash: string;
  isDeleted?: boolean;
}

interface CreateUserProps {
  name: string;
  email: UserEmail | string;
  passwordHash: string;
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, options?: EntityOptions) {
    super(props, options);

    this.ensureValidName(props.name);
  }

  static create(props: CreateUserProps, options?: EntityOptions) {
    const email =
      props.email instanceof UserEmail
        ? props.email
        : new UserEmail(props.email);

    return new User(
      {
        name: props.name.trim(),
        email,
        passwordHash: props.passwordHash,
      },
      options,
    );
  }

  get name(): string {
    return this.props.name;
  }

  get email(): UserEmail {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  private ensureValidName(name: string) {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      throw DomainError.validation('Nome deve conter ao menos 2 caracteres', {
        field: 'name',
      });
    }
  }
}
