import { setEntityIdGenerator } from '../../../../core/domain/Entity';
import { DomainError } from '../../../../core/domain/errors/DomainError';
import { Notification } from '../Notification';

function createIdGenerator() {
  let counter = 0;
  return {
    generate: () => `notification-entity-id-${++counter}`,
  };
}

beforeAll(() => {
  setEntityIdGenerator(createIdGenerator());
});

describe('Notification entity', () => {
  it('creates notifications with the expected defaults', () => {
    const notification = Notification.create({
      userId: 'user-123',
      title: 'Welcome',
      content: 'Hello there!',
    });

    expect(notification.id).toBe('notification-entity-id-1');
    expect(notification.userId).toBe('user-123');
    expect(notification.title.value).toBe('Welcome');
    expect(notification.content.value).toBe('Hello there!');
    expect(notification.isRead).toBe(false);
    expect(notification.readAt).toBeNull();
    expect(notification.isDeleted).toBe(false);
    expect(notification.deletedAt).toBeNull();
  });

  it('marks notifications as read and unread', () => {
    const notification = Notification.create({
      userId: 'user-321',
      title: 'Read me',
      content: 'Check this out',
    });

    const readAt = new Date('2024-01-01T00:00:00Z');
    notification.markAsRead(readAt);

    expect(notification.isRead).toBe(true);
    expect(notification.readAt).toEqual(readAt);

    notification.markAsUnread();

    expect(notification.isRead).toBe(false);
    expect(notification.readAt).toBeNull();
  });

  it('prevents interacting with deleted notifications', () => {
    const notification = Notification.create({
      userId: 'user-789',
      title: 'To be deleted',
      content: 'Soon to be gone',
    });

    notification.softDelete();

    expect(notification.isDeleted).toBe(true);
    expect(() => notification.markAsRead()).toThrow(DomainError);
    expect(() => notification.markAsUnread()).toThrow(DomainError);
  });
});
