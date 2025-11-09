import { setEntityIdGenerator } from '../../../../../core/domain/Entity';
import type { DomainError } from '../../../../../core/domain/errors/DomainError';
import type { IUserRepo } from '../../../domain/IUserRepo';
import { User } from '../../../domain/User';
import type { PasswordService } from '../../services/PasswordService';
import type { TokenService } from '../../services/TokenService';
import { SignInUseCase } from '../SignInUseCase';

function createIdGenerator() {
  let counter = 0;
  return {
    generate: () => `sign-in-id-${++counter}`,
  };
}

beforeAll(() => {
  setEntityIdGenerator(createIdGenerator());
});

describe('SignInUseCase', () => {
  function createDependencies() {
    const userRepo: jest.Mocked<IUserRepo> = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const passwordService: jest.Mocked<PasswordService> = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const tokenService: jest.Mocked<TokenService> = {
      sign: jest.fn(),
    };

    return { userRepo, passwordService, tokenService };
  }

  it('returns credentials when email and password are valid', async () => {
    const deps = createDependencies();
    const useCase = new SignInUseCase(deps);

    const user = User.create({
      name: 'Existing User',
      email: 'ada@example.com',
      passwordHash: 'hashed',
    });

    deps.userRepo.findByEmail.mockResolvedValue(user);
    deps.passwordService.compare.mockResolvedValue(true);
    deps.tokenService.sign.mockResolvedValue('token-123');

    const result = await useCase.execute({
      email: 'ada@example.com',
      password: 'password123',
    });

    expect(deps.passwordService.compare).toHaveBeenCalledWith(
      'password123',
      'hashed',
    );
    expect(deps.tokenService.sign).toHaveBeenCalledWith({
      sub: user.id,
      email: 'ada@example.com',
    });
    expect(result).toEqual({
      user: {
        id: user.id,
        name: 'Existing User',
        email: 'ada@example.com',
      },
      token: { accessToken: 'token-123' },
    });
  });

  it('throws unauthorized when user is not found', async () => {
    const deps = createDependencies();
    const useCase = new SignInUseCase(deps);

    deps.userRepo.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'ghost@example.com', password: 'test' }),
    ).rejects.toMatchObject({
      code: 'unauthorized' satisfies DomainError['code'],
    });
  });

  it('throws unauthorized when password is invalid', async () => {
    const deps = createDependencies();
    const useCase = new SignInUseCase(deps);

    const user = User.create({
      name: 'Existing User',
      email: 'ada@example.com',
      passwordHash: 'hashed',
    });

    deps.userRepo.findByEmail.mockResolvedValue(user);
    deps.passwordService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'ada@example.com', password: 'wrong' }),
    ).rejects.toMatchObject({
      code: 'unauthorized' satisfies DomainError['code'],
    });
  });
});
