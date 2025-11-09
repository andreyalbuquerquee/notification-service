export interface AuthUserDTO {
  id: string;
  name: string;
  email: string;
}

export interface AuthTokenDTO {
  accessToken: string;
}

export interface AuthResultDTO {
  user: AuthUserDTO;
  token: AuthTokenDTO;
}
