export interface UnreadNotificationsCounter {
  increment(userId: string, amount?: number): Promise<number>;
  decrement(userId: string, amount?: number): Promise<number>;
  get(userId: string): Promise<number | null>;
  set(userId: string, value: number): Promise<void>;
  reset(userId: string): Promise<void>;
}
