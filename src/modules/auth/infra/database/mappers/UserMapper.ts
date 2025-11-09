import type { HydratedDocument } from 'mongoose';

import { User } from '../../../domain/User';
import { UserEmail } from '../../../domain/value-objects/UserEmail';
import type { UserDocument } from '../models/UserModel';

interface UserPersistence {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

type UserRecord = UserPersistence | HydratedDocument<UserDocument>;

export function mapUserToDomain(record: UserRecord): User {
  const plain: UserPersistence = {
    _id: record._id?.toString?.() ?? (record as UserPersistence)._id,
    name: record.name,
    email: record.email,
    passwordHash: record.passwordHash,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };

  return User.create(
    {
      name: plain.name,
      email: new UserEmail(plain.email),
      passwordHash: plain.passwordHash,
    },
    {
      id: plain._id,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    },
  );
}

export function mapUserToPersistence(user: User): UserPersistence {
  return {
    _id: user.id,
    name: user.name,
    email: user.email.value,
    passwordHash: user.passwordHash,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
