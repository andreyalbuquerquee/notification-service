import { type Document, type Model, model, models, Schema } from 'mongoose';

export interface UserDocument extends Document<string> {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'users',
  },
);

export const UserModel: Model<UserDocument> =
  models.User || model<UserDocument>('User', UserSchema);
