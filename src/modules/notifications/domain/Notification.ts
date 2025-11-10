import type { EntityOptions } from '../../../core/domain/Entity';
import { Entity } from '../../../core/domain/Entity';
import { DomainError } from '../../../core/domain/errors/DomainError';
import { NotificationContent } from './value-objects/NotificationContent';
import { NotificationTitle } from './value-objects/NotificationTitle';

interface NotificationProps {
  userId: string;
  title: NotificationTitle;
  content: NotificationContent;
  readAt?: Date | null;
  deletedAt?: Date | null;
}

interface CreateNotificationProps {
  userId: string;
  title: string | NotificationTitle;
  content: string | NotificationContent;
}

interface RestoreNotificationProps {
  id: string;
  userId: string;
  title: string | NotificationTitle;
  content: string | NotificationContent;
  readAt?: Date | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Notification extends Entity<NotificationProps> {
  private constructor(props: NotificationProps, options?: EntityOptions) {
    super(props, options);

    if (typeof this.props.readAt === 'undefined') {
      this.props.readAt = null;
    }

    if (typeof this.props.deletedAt === 'undefined') {
      this.props.deletedAt = null;
    }
  }

  static create(props: CreateNotificationProps, options?: EntityOptions) {
    const title =
      props.title instanceof NotificationTitle
        ? props.title
        : new NotificationTitle(props.title);

    const content =
      props.content instanceof NotificationContent
        ? props.content
        : new NotificationContent(props.content);

    return new Notification(
      {
        userId: props.userId,
        title,
        content,
      },
      options,
    );
  }

  static restore(props: RestoreNotificationProps) {
    const title =
      props.title instanceof NotificationTitle
        ? props.title
        : new NotificationTitle(props.title);

    const content =
      props.content instanceof NotificationContent
        ? props.content
        : new NotificationContent(props.content);

    return new Notification(
      {
        userId: props.userId,
        title,
        content,
        readAt: props.readAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      {
        id: props.id,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
      },
    );
  }

  get userId(): string {
    return this.props.userId;
  }

  get title(): NotificationTitle {
    return this.props.title;
  }

  get content(): NotificationContent {
    return this.props.content;
  }

  get readAt(): Date | null | undefined {
    return this.props.readAt;
  }

  get deletedAt(): Date | null | undefined {
    return this.props.deletedAt;
  }

  get isRead(): boolean {
    return Boolean(this.props.readAt);
  }

  get isDeleted(): boolean {
    return Boolean(this.props.deletedAt);
  }

  markAsRead(date = new Date()): void {
    if (this.isDeleted) {
      throw DomainError.invariant(
        'Não é possível ler uma notificação removida',
      );
    }
    this.props.readAt = date;
    this.touch();
  }

  markAsUnread(): void {
    if (this.isDeleted) {
      throw DomainError.invariant(
        'Não é possível alterar uma notificação removida',
      );
    }
    this.props.readAt = null;
    this.touch();
  }

  softDelete(date = new Date()): void {
    this.props.deletedAt = date;
    this.touch();
  }
}
