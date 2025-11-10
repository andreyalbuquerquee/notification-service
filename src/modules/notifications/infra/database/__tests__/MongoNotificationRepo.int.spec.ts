import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { setEntityIdGenerator } from '../../../../../core/domain/Entity';
import { Notification } from '../../../domain/Notification';
import { MongoNotificationRepo } from '../MongoNotificationRepo';

jest.setTimeout(30000);

function createIdGenerator() {
  let counter = 0;
  return {
    generate: () => `mongo-repo-integration-id-${++counter}`,
  };
}

describe('MongoNotificationRepo (integration)', () => {
  let mongoServer: MongoMemoryServer;
  let repo: MongoNotificationRepo;

  beforeAll(async () => {
    setEntityIdGenerator(createIdGenerator());

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {
      maxPoolSize: 4,
    });

    repo = new MongoNotificationRepo();
  });

  afterEach(async () => {
    await mongoose.connection.db?.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('persists, retrieves and paginates notifications for a user', async () => {
    const sharedUser = 'user-integration';

    const notificationA = Notification.create({
      userId: sharedUser,
      title: 'Old unread',
      content: 'still pending',
    });
    const notificationB = Notification.create({
      userId: sharedUser,
      title: 'Will be read',
      content: 'mark me later',
    });
    const notificationC = Notification.create({
      userId: sharedUser,
      title: 'Newest unread',
      content: 'show me on top',
    });
    const otherUserNotification = Notification.create({
      userId: 'another-user',
      title: 'Foreign',
      content: 'should not appear',
    });

    await Promise.all([
      repo.create(notificationA),
      repo.create(notificationB),
      repo.create(notificationC),
      repo.create(otherUserNotification),
    ]);

    notificationA.softDelete();
    await repo.save(notificationA);

    notificationB.markAsRead(new Date('2024-01-02T00:00:00.000Z'));
    await repo.save(notificationB);

    const fetched = await repo.findByIdAndUser(notificationB.id, sharedUser);
    expect(fetched).not.toBeNull();
    expect(fetched?.isRead).toBe(true);

    const missing = await repo.findByIdAndUser(
      notificationB.id,
      'another-user',
    );
    expect(missing).toBeNull();

    const page = await repo.listByUser(sharedUser, { page: 1, pageSize: 10 });
    expect(page.total).toBe(2);
    expect(page.notifications).toHaveLength(2);
    expect(page.notifications[0].id).toBe(notificationC.id);
    expect(page.notifications[1].id).toBe(notificationB.id);

    const unreadShared = await repo.countUnreadByUser(sharedUser);
    expect(unreadShared).toBe(1);

    const unreadOther = await repo.countUnreadByUser('another-user');
    expect(unreadOther).toBe(1);
  });
});
