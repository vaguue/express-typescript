import 'module-alias/register';
import * as dotenv from 'dotenv';

import createError from 'http-errors';
import express from 'express';
import cors from 'cors';
import path from 'path';
import logger from 'morgan';

dotenv.config();

import { sessionMiddleware } from '@/lib/session';

import  authRouter from './routes/auth';
import latencyRouter from './routes/latency';
import carRouter from './routes/car';

const app = express();

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    callback(null, true);
  },
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(sessionMiddleware());

app.use('/', authRouter);
app.use('/latency', latencyRouter);
app.use('/car', carRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err.message == 'no-access') {
    res.status(err.status || 250);
    res.json({ message: 'no-access' });
  }
  else {
    res.status(err.status || 500);
    res.json({ message: 'error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;
