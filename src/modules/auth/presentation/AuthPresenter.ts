import type { AuthResultDTO } from '../application/dtos/AuthDTO';

export function presentAuth(result: AuthResultDTO) {
  return {
    user: result.user,
    token: result.token,
  };
}
