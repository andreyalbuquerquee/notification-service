import { randomUUID } from 'node:crypto';

import type { UniqueIdGenerator } from '../../domain/UniqueIdGenerator';

export class UuidV4Generator implements UniqueIdGenerator {
  generate(): string {
    return randomUUID();
  }
}
