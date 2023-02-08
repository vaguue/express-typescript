import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import path from 'path';
import express from 'express';
import log4js from 'log4js';
import prisma from '@/lib/prisma';
import { filterAuth } from '@/lib/session';

const { create, read, update, remove, paginate } = require('@/controllers/car');

const logger = log4js.getLogger('config');
logger.level = 'debug';
const router = express.Router();

const dev = process.env.NODE_ENV != 'production';

function getIntFromQuery(q) {
  const res = parseInt(q);
  if (!Number.isNaN(res) && res > 0) {
    return res;
  }
  throw Error('invalid-number-in-query');
}


type SessionRequest = Request & { session: { id: string } }

router.post('/', filterAuth(), async function(req: SessionRequest, res: Response, next: NextFunction) {
  try {
    const { id: userId } = req.session; 
    const data = { ...req.body, userId };
    return res.json(await create(userId, data));
  } catch(e) {
    logger.debug(e);
    return next(e);
  }
});

router.get('/list', async function(req: SessionRequest, res: Response, next: NextFunction) {
  try {
    const { list_size = 10, page = 1 } = _.mapValues(_.pick(req.query, 'list_size', 'page'), getIntFromQuery);
    const { order_by = 'createdAt', asc = false } = req.query;
    return res.json(await paginate({ list_size, page, order_by, asc }));
  } catch(e) {
    logger.debug(e);
    return next(e);
  }
});

router.delete('/:id', filterAuth(), async function(req: SessionRequest, res: Response, next: NextFunction) {
  try {
    const { id: userId } = req.session; 
    const { id } = req.params;
    return res.json(await remove(userId, id));
  } catch(e) {
    logger.debug(e);
    return next(e);
  }
});

router.get('/:id', async function(req: SessionRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    return res.json(await read(id));
  } catch(e) {
    logger.debug(e);
    return next(e);
  }
});

router.patch('/:id', filterAuth(), async function(req: SessionRequest, res: Response, next: NextFunction) {
  try {
    const { id: userId } = req.session; 
    const { id } = req.params;
    return res.json(await update(userId, id, req.body));
  } catch(e) {
    logger.debug(e);
    return next(e);
  }
});

export default router;
