import { Entity, Schema } from 'redis-om';
import redis from '@/lib/redis.js';

class Session extends Entity {
  public exp: number;
  bump(ttl) {
    this.exp = Math.max(Math.floor(Date.now() / 1000) + ttl, this.exp);
  }
  expired() {
    return Math.floor(Date.now() / 1000) >= this.exp;
  }
};

const sessionSchema = new Schema(Session, {
  exp: { type: 'number' },
  id: { type: 'string' },
  login: { type: 'string' },
});


async function getSessionRepository() {
  const client = await redis();
  const sessionRepository = client.fetchRepository(sessionSchema);
  console.log('[*] creating index...');
  await sessionRepository.createIndex();
  console.log('[*] created index...');
  return sessionRepository;
}

export default getSessionRepository;
