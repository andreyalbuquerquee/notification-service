import type { UniqueIdGenerator } from './UniqueIdGenerator';

export interface EntityOptions {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  idGenerator?: UniqueIdGenerator;
}

export abstract class Entity<P> {
  protected _id: string;
  protected _createdAt: Date;
  protected _updatedAt: Date;
  protected props: P;

  constructor(props: P, options: EntityOptions = {}) {
    const now = new Date();
    const idGenerator = options.idGenerator ?? defaultEntityIdGenerator;

    if (options.id) {
      this._id = options.id;
    } else if (idGenerator) {
      this._id = idGenerator.generate();
    } else {
      throw new Error(
        'Entity requires an id generator. Configure a UniqueIdGenerator or provide an id.',
      );
    }
    this._createdAt = options.createdAt ?? now;
    this._updatedAt = options.updatedAt ?? now;
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  protected touch() {
    this._updatedAt = new Date();
  }
}

let defaultEntityIdGenerator: UniqueIdGenerator | undefined;

export function setEntityIdGenerator(generator: UniqueIdGenerator) {
  defaultEntityIdGenerator = generator;
}
