import jwt, { type SignOptions } from 'jsonwebtoken';

import type { TokenService } from '../../application/services/TokenService';

type JwtTokenServiceOptions = Pick<
  SignOptions,
  'expiresIn' | 'issuer' | 'audience'
>;

export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly options: JwtTokenServiceOptions = {},
  ) {}

  async sign(payload: Record<string, unknown>): Promise<string> {
    const signOptions: SignOptions = {};

    if (this.options.expiresIn !== undefined) {
      signOptions.expiresIn = this.options.expiresIn;
    }

    if (this.options.issuer !== undefined) {
      signOptions.issuer = this.options.issuer;
    }

    if (this.options.audience !== undefined) {
      signOptions.audience = this.options.audience;
    }

    return jwt.sign(payload, this.secret, signOptions);
  }
}
