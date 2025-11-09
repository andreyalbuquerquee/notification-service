import type { SignOptions } from 'jsonwebtoken';

import { env } from '../../../main/env';
import { SignInUseCase } from '../application/use-cases/SignInUseCase';
import { SignUpUseCase } from '../application/use-cases/SignUpUseCase';
import { MongoUserRepo } from '../infra/database/MongoUserRepo';
import { BcryptPasswordService } from '../infra/security/BcryptPasswordService';
import { JwtTokenService } from '../infra/security/JwtTokenService';
import type { AuthControllers } from '../presentation/controllers';
import { SignInController } from '../presentation/controllers/SignInController';
import { SignUpController } from '../presentation/controllers/SignUpController';
import { signInSchema } from '../presentation/validation/signIn.schema';
import { signUpSchema } from '../presentation/validation/signUp.schema';

export interface AuthModule {
  controllers: AuthControllers;
}

export function composeAuthModule(): AuthModule {
  const userRepo = new MongoUserRepo();
  const passwordService = new BcryptPasswordService({ saltRounds: 11 });
  const tokenService = new JwtTokenService(env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRATION_DAYS as SignOptions['expiresIn'],
  });

  const signUpUseCase = new SignUpUseCase({
    userRepo,
    passwordService,
    tokenService,
  });

  const signInUseCase = new SignInUseCase({
    userRepo,
    passwordService,
    tokenService,
  });

  const controllers: AuthControllers = {
    signUp: new SignUpController(signUpUseCase, signUpSchema),
    signIn: new SignInController(signInUseCase, signInSchema),
  };

  return { controllers };
}
