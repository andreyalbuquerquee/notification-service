import type { DomainError } from '../../../../../core/domain/errors/DomainError';
import type { SignInUseCase } from '../../../application/use-cases/SignInUseCase';
import { signInSchema } from '../../validation/signIn.schema';
import { SignInController } from '../SignInController';

function createController() {
  const execute = jest.fn();
  const useCase = { execute } as unknown as SignInUseCase;
  const controller = new SignInController(useCase, signInSchema);
  return { controller, execute };
}

describe('SignInController', () => {
  it('returns 200 with auth payload when credentials are valid', async () => {
    const { controller, execute } = createController();

    execute.mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Existing User',
        email: 'user@example.com',
      },
      token: { accessToken: 'token-123' },
    });

    const response = await controller.handle({
      body: {
        email: 'user@example.com',
        password: 'password123',
      },
    });

    expect(execute).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(response).toEqual({
      statusCode: 200,
      body: {
        user: {
          id: 'user-1',
          name: 'Existing User',
          email: 'user@example.com',
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
          email: 'not-an-email',
          password: '',
        },
      }),
    ).rejects.toMatchObject({
      code: 'validation' satisfies DomainError['code'],
    });

    expect(execute).not.toHaveBeenCalled();
  });
});
