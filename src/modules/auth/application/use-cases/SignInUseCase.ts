import { DomainError } from '../../../../core/domain/errors/DomainError';
import type { IUserRepo } from '../../domain/IUserRepo';
import { UserEmail } from '../../domain/value-objects/UserEmail';
import type { AuthResultDTO } from '../dtos/AuthDTO';
import type { SignInInputDTO } from '../dtos/SignInDTO';
import type { PasswordService } from '../services/PasswordService';
import type { TokenService } from '../services/TokenService';

interface Dependencies {
  userRepo: IUserRepo;
  passwordService: PasswordService;
  tokenService: TokenService;
}

export class SignInUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(input: SignInInputDTO): Promise<AuthResultDTO> {
    const email = new UserEmail(input.email);
    const user = await this.deps.userRepo.findByEmail(email.value);

    if (!user) {
      throw DomainError.unauthorized('Credenciais inválidas');
    }

    const isValidPassword = await this.deps.passwordService.compare(
      input.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      throw DomainError.unauthorized('Credenciais inválidas');
    }

    const accessToken = await this.deps.tokenService.sign({
      sub: user.id,
      email: user.email.value,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email.value,
      },
      token: { accessToken },
    };
  }
}
