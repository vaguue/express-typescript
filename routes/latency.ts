import { Request, Response, NextFunction } from 'express';
import express from 'express';
import log4js from 'log4js';
import { filterAuth } from '@/lib/session';

const logger = log4js.getLogger('config');
logger.level = 'debug';
const router = express.Router();

const dev = process.env.NODE_ENV != 'production';

type LoggerRequest = Request & { _startAt: [number, number] }

router.get('/', filterAuth(), async function (req: LoggerRequest, res: Response, next: NextFunction) {
  try {
    if (!req._startAt) { //provided by morgan
      return res.json({
        latency: null,
      });
    }
    const elapsed = process.hrtime(req._startAt);
    const ms = (elapsed[0] * 1e3) + (elapsed[1] * 1e-6)
    const latency = `${ms.toFixed(3)}ms`;
    return res.json({
      latency,
    });
  } catch(e) {
    logger.debug(e);
    return next(e);
  }
});

export default router;
