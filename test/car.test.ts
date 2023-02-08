import { jest, describe, expect, it } from '@jest/globals'

import _ from 'lodash';
import * as carController from '@/controllers/car';
import prisma from '@/lib/prisma';

const userId = '63de71b9654409d6cf684e1a';
const someId = '63de71b9654409d6cf684e1b';

const mockCar = {
  brand: 'brand',
  name: 'name',
  yearCreated: 1900,
  price: 100,
  id: '63de71b9654409d6cf684e19',
  createdAt: new Date(Date.now()),
};

const listSize = 20;
const page = 1;

jest.spyOn(prisma.car, 'create').mockResolvedValue(mockCar);
jest.spyOn(prisma.car, 'findUniqueOrThrow').mockResolvedValue({ ...mockCar, userId });
jest.spyOn(prisma.car, 'findMany').mockResolvedValue(Array.from({ length: listSize }, (_, i) => ({ ...mockCar, id: someId })));
jest.spyOn(prisma.user, 'update').mockResolvedValue(mockCar);

describe('Car controller', () => {
  it('create', async () => {
    await expect(carController.create(userId, mockCar)).resolves.toEqual(mockCar);
  });

  it('read', async () => {
    await expect(carController.read(mockCar.id)).resolves.toEqual(mockCar);
  });

  it('update', async () => {
    await expect(carController.update(userId, mockCar.id, { brand: 'new-brand' }).then(res => res.message)).resolves.toEqual('ok');
  });

  it('throw on invalid', async () => {
    await expect(carController.update(userId, mockCar.id, { yearCreated: -2 }).then(res => res.message)).rejects.toBeDefined();
  });

  it('delete', async () => {
    await expect(carController.remove(userId, mockCar.id).then(res => res.message)).resolves.toEqual('ok');
  });

  it('paginate', async () => {
    await expect(carController.paginate({ list_size: listSize, page, order_by: 'createdAt' }).then(res => res.length)).resolves.toEqual(listSize);
  });
});
