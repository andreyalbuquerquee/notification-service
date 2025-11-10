import { setEntityIdGenerator } from '../../../../../core/domain/Entity';
import type { DomainError } from '../../../../../core/domain/errors/DomainError';
import type { IUserRepo } from '../../../domain/IUserRepo';
import { User } from '../../../domain/User';
import type { PasswordService } from '../../services/PasswordService';
import type { TokenService } from '../../services/TokenService';
import { SignUpUseCase } from '../SignUpUseCase';

function createIdGenerator() {
  let counter = 0;
  return {
    generate: () => `test-id-${++counter}`,
  };
}

beforeAll(() => {
  setEntityIdGenerator(createIdGenerator());
});

describe('SignUpUseCase', () => {
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

  it('registers a new user and returns a token', async () => {
    const deps = createDependencies();
    const useCase = new SignUpUseCase(deps);

    deps.userRepo.findByEmail.mockResolvedValue(null);
    deps.passwordService.hash.mockResolvedValue('hashed-secret');
    deps.tokenService.sign.mockResolvedValue('token-123');

    const input = {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'password123',
    };

    const result = await useCase.execute(input);

    expect(deps.passwordService.hash).toHaveBeenCalledWith('password123');
    expect(deps.userRepo.create).toHaveBeenCalledTimes(1);

    const createdUser = deps.userRepo.create.mock.calls[0][0];

    expect(createdUser.name).toBe('Ada Lovelace');
    expect(createdUser.email.value).toBe('ada@example.com');
    expect(deps.tokenService.sign).toHaveBeenCalledWith({
      sub: createdUser.id,
      email: 'ada@example.com',
    });

    expect(result).toEqual({
      user: {
        id: createdUser.id,
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      },
      token: { accessToken: 'token-123' },
    });
  });

  it('throws a conflict error when email already exists', async () => {
    const deps = createDependencies();
    const useCase = new SignUpUseCase(deps);

    const existingUser = User.create({
      name: 'Existing User',
      email: 'ada@example.com',
      passwordHash: 'hash',
    });

    deps.userRepo.findByEmail.mockResolvedValue(existingUser);

    await expect(
      useCase.execute({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'password123',
      }),
    ).rejects.toMatchObject({ code: 'conflict' satisfies DomainError['code'] });

    expect(deps.userRepo.create).not.toHaveBeenCalled();
  });
});
