import type { IUserRepo } from '../../domain/IUserRepo';
import type { User } from '../../domain/User';
import { mapUserToDomain, mapUserToPersistence } from './mappers/UserMapper';
import { UserModel } from './models/UserModel';

export class MongoUserRepo implements IUserRepo {
  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email }).exec();
    return doc ? mapUserToDomain(doc) : null;
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).exec();
    return doc ? mapUserToDomain(doc) : null;
  }

  async create(user: User): Promise<void> {
    const persistence = mapUserToPersistence(user);
    await UserModel.create({
      _id: persistence._id,
      name: persistence.name,
      email: persistence.email,
      passwordHash: persistence.passwordHash,
    });
  }

  async save(user: User): Promise<void> {
    await UserModel.findByIdAndUpdate(
      user.id,
      {
        name: user.name,
        email: user.email.value,
        passwordHash: user.passwordHash,
      },
      { new: false, upsert: false },
    ).exec();
  }
}
