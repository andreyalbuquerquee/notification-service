import { type Document, type Model, model, models, Schema } from 'mongoose';

export interface NotificationDocument extends Document<string> {
  userId: string;
  title: string;
  content: string;
  readAt?: Date | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    readAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: 'notifications',
  },
);

NotificationSchema.index({ userId: 1, deletedAt: 1, createdAt: -1 });

export const NotificationModel: Model<NotificationDocument> =
  models.Notification ||
  model<NotificationDocument>('Notification', NotificationSchema);
