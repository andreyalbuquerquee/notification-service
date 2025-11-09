import bcrypt from 'bcryptjs';

import type { PasswordService } from '../../application/services/PasswordService';

interface Options {
  saltRounds?: number;
}

export class BcryptPasswordService implements PasswordService {
  private readonly saltRounds: number;

  constructor(options: Options = {}) {
    this.saltRounds = options.saltRounds ?? 10;
  }

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
