import { DomainError } from '../../../../core/domain/errors/DomainError';
import type { IUserRepo } from '../../domain/IUserRepo';
import { User } from '../../domain/User';
import { UserEmail } from '../../domain/value-objects/UserEmail';
import type { AuthResultDTO } from '../dtos/AuthDTO';
import type { SignUpInputDTO } from '../dtos/SignUpDTO';
import type { PasswordService } from '../services/PasswordService';
import type { TokenService } from '../services/TokenService';

interface Dependencies {
  userRepo: IUserRepo;
  passwordService: PasswordService;
  tokenService: TokenService;
}

export class SignUpUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(input: SignUpInputDTO): Promise<AuthResultDTO> {
    const email = new UserEmail(input.email);
    const existing = await this.deps.userRepo.findByEmail(email.value);

    if (existing) {
      throw DomainError.conflict('E-mail já cadastrado', {
        email: email.value,
      });
    }

    const passwordHash = await this.deps.passwordService.hash(input.password);

    const user = User.create({
      name: input.name,
      email,
      passwordHash,
    });

    await this.deps.userRepo.create(user);

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
