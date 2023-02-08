import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import redis from '@/lib/redis';

import initSessionRepository from '@/om/session';

import log4js from 'log4js';

const logger = log4js.getLogger('config');
logger.level = 'debug';

const tokenTtl = 10 * 60; //10min

let sessionRepository = null;

async function getSessionRepository() {
  if (sessionRepository !== null) return sessionRepository;
  return (sessionRepository = await initSessionRepository()); 
}

export function getToken(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  return token;
}

export async function generateAccessToken(user) {
  if (typeof user != 'object') {
    throw Error('expected-object-for-user');
  }
  const sessionRepository = await getSessionRepository();
  const sessionData = {
    exp: Math.floor(Date.now() / 1000) + tokenTtl,
    ..._.pick(user, 'id', 'login'),
  };
  const session = await sessionRepository.createAndSave(sessionData);
  const client = await redis();
  await client.execute(['EXPIRE', `Session:${session.entityId}`, tokenTtl]);
  return session.entityId;
}

export async function terminateSession(session) {
  const sessionRepository = await getSessionRepository();
  await sessionRepository.remove(session.entityId);
}

export async function getUserSessions(session) {
  const { id } = session;
  const sessionRepository = await getSessionRepository();
  const sessions = await sessionRepository.search().where('id').equals(id).return.all();
  return sessions;
}

export const sessionMiddleware = () => (async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) {
      req.session = { id: null };
    }
    else {
      const sessionRepository = await getSessionRepository();
      const client = await redis();
      const session = await sessionRepository.fetch(token);
      if (session && !session.expired()) {
        req.session = session;
        req.session.token = token;
        await client.execute(['EXPIRE', `Session:${token}`, tokenTtl]);
      }
      else {
        if (session && session.expired()) {
          await sessionRepository.remove(session.entityId);
        }
        req.session = { id: null };
      }
    }
  } catch(e) {
    req.session = { id: null };
  }
  next();
});

export const filterAuth = ({ bump = true } = {}) => (async (req, res, next) => {
  try {
    if (typeof req.session == 'object' && req.session.id) {
      if (bump) {
        const sessionRepository = await getSessionRepository();
        req.session.bump(tokenTtl);
        await sessionRepository.save(req.session); 
      }
      next();
    }
    else {
      next({ message: 'no-access' });
    }
  } catch(e) {
    next({ message: 'no-access' });
  }
});
