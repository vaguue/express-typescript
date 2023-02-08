import { Client } from 'redis-om';

const globalAny:any = global;

const url = process.env.REDIS_URL;

let cached = globalAny.redis;

if (!cached) {
  cached = globalAny.redis = { conn: null, promise: null };
}

async function redis() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const client = new Client().open(url);
    cached.promise = client;
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default redis;
