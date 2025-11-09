import type { Controller } from '../../../../core/application/ports/http/Controller';
import { SignInController } from './SignInController';
import { SignUpController } from './SignUpController';

export interface AuthControllers {
  signUp: Controller;
  signIn: Controller;
}

export { SignInController, SignUpController };
