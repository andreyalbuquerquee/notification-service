export interface TokenProvider<Payload extends object = { userId: string }> {
  sign(payload: Payload, opts?: { expiresIn?: string | number }): string;
  verify(token: string): Payload;
}
