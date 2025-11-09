import type { DomainError } from '../../../../../core/domain/errors/DomainError';
import type { SignUpUseCase } from '../../../application/use-cases/SignUpUseCase';
import { signUpSchema } from '../../validation/signUp.schema';
import { SignUpController } from '../SignUpController';

function createController() {
  const execute = jest.fn();
  const useCase = { execute } as unknown as SignUpUseCase;
  const controller = new SignUpController(useCase, signUpSchema);
  return { controller, execute };
}

describe('SignUpController', () => {
  it('returns 201 when payload is valid', async () => {
    const { controller, execute } = createController();

    execute.mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      },
      token: { accessToken: 'token-123' },
    });

    const response = await controller.handle({
      body: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'password123',
      },
    });

    expect(execute).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'password123',
    });
    expect(response).toEqual({
      statusCode: 201,
      body: {
        user: {
          id: 'user-1',
          name: 'Ada Lovelace',
          email: 'ada@example.com',
        },
        token: { accessToken: 'token-123' },
      },
    });
  });

  it('throws validation error when payload is invalid', async () => {
    const { controller, execute } = createController();

    await expect(
      controller.handle({
        body: {
          name: 'A',
          email: 'invalid-email',
          password: '123',
        },
      }),
    ).rejects.toMatchObject({
      code: 'validation' satisfies DomainError['code'],
    });

    expect(execute).not.toHaveBeenCalled();
  });
});
