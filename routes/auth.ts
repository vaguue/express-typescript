import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import express from 'express';
import log4js from 'log4js';

import { createUser, verifyUser } from '@/controllers/user';
import { terminateSession, getUserSessions, generateAccessToken, filterAuth } from '@/lib/session';

const logger = log4js.getLogger('config');
logger.level = 'debug';
const router = express.Router();

const dev = process.env.NODE_ENV != 'production';

type SessionRequest = Request & { session: { id: string } }

router.post('/signin', async function(req: SessionRequest, res: Response, next: NextFunction) {
  try {
    const user = await verifyUser(req.body || {});
    const token = await generateAccessToken(user);
    return res.json(token);
  } catch(e) {
    logger.debug(e);
    return next(e);
  }
});

router.post('/signup', async function(req: SessionRequest, res: Response, next: NextFunction) {
  try {
    const user = await createUser(req.body || {});
    const token = await generateAccessToken(user);
    return res.json(token);
  } catch(e) {
    logger.debug(e);
    return next(e);
  }
});

router.get('/info', filterAuth(), async function(req: SessionRequest, res: Response, next: NextFunction) {
  try {
    return res.json(_.pick(req.session, 'login'));
  } catch(e) {
    logger.debug(e);
    return next(e);
  }
});

router.get('/logout', filterAuth(), async function(req: SessionRequest, res: Response, next: NextFunction) {
  try {
    const { all = false } = req.query;
    if (all) {
      const sessions = await getUserSessions(req.session);
      await Promise.all(sessions.map(terminateSession));
    }
    else {
      await terminateSession(req.session);
    }
    return res.json({
      message: 'ok', 
    });
  } catch(e) {
    logger.debug(e);
    return next(e);
  }
});

export default router;
