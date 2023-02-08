import _ from 'lodash';
import prisma from '@/lib/prisma';

const defined = val => !_.overSome([_.isUndefined, _.isNull])(val);

interface IQuery {
  list_size?: number,
  page?: number,
  order_by?: string,
  asc?: boolean,
};

interface IRecord {
  brand?: string,
  name?: string,
  yearCreated?: number,
  price?: number,
};

const fields = ['brand', 'name', 'yearCreated', 'price'];

function viewRecord(rec: IRecord) {
  const res = _.pick(rec, 'id', 'createdAt', ...fields);
  return res;
}

const validStr = s => typeof s == 'string' && s.length > 0;
const validYear = year => typeof year == 'number' && year < new Date(Date.now()).getFullYear() && year > 1800;
const validPrice = p => typeof p == 'number' && p > 0;

const validators = {
  brand: validStr,
  name: validStr,
  yearCreated: validYear,
  price: validPrice,
};

function validateRecord(rec: IRecord, hasAll: boolean = true): IRecord {
  const res = hasAll ? _.pick(rec, ...fields) : _.pickBy(_.pick(rec, ...fields), (v, k) => defined(v));
  _.forEach(res, (v, k) => {
    if (!validators[k](v)) {
      throw new Error('invalid-record-data');
    }
  });
  return res;
}

function validatePaginationQuery(query: IQuery): IQuery {
  const { list_size: listSize, page, order_by: orderBy, asc } = query;
  if (![...fields, 'createdAt'].includes(orderBy)) {
    throw new Error('invalid-order-by');
  }
  return query;
}

export async function create(userId: string, inputData: IRecord) {
  const data = validateRecord(inputData);
  const rec = await prisma.car.create({ data: { ...data, userId } });
  return viewRecord(rec);
}

export async function read(id: string) {
  const car = await prisma.car.findUniqueOrThrow({ 
    where: {
      id
    },
  });

  return viewRecord(car);
}

export async function paginate(inputData: IQuery) {
  const { list_size: listSize, page, order_by: orderBy, asc } = validatePaginationQuery(inputData);

  const cars = await prisma.car.findMany({
    orderBy: [
      {
        [orderBy]: Boolean(asc) ? 'asc' : 'desc',
      },
    ],
    skip: listSize*(page - 1),
    take: listSize,
  });

  return cars.map(viewRecord);
}

export async function update(userId: string, id: string, inputData: IRecord) {
  const data = validateRecord(inputData, false);

  const updateCar = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      cars: {
        update: {
          data,
          where: {
            id,
          }
        }
      }
    }
  });

  return { message: 'ok' };
}

export async function remove(userId: string, id: string) {
  const carToDelete = await prisma.car.findUniqueOrThrow({
    where: {
      id,
    }
  });

  if (carToDelete.userId != userId) {
    throw Error('access-error'); //not showing this error to the client
  }
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      cars: {
        delete: {
          id,
        }
      }
    }
  });

  return { message: 'ok' };
}
