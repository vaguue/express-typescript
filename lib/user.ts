import { hash, compare } from 'bcrypt';
import prisma from '@/lib/prisma';

const rounds = 10;

export async function createUser(obj) {
  if (typeof obj != 'object') {
    throw Error('expected-object');
  }
  const { password, login } = obj;
  const data = {
    login,
    password: await hash(password, rounds), 
  };
  const exists = await prisma.user.findUnique({
    where: {
      login,
    },
  });
  if (exists) {
    throw Error('login-exists');
  }
  return prisma.user.create({ data });
}

export async function verifyUser(obj) {
  if (typeof obj != 'object') {
    throw Error('expected-object');
  }
  const { login, password } = obj;
  if (!login || !password) {
    throw Error('not-enough-credentials');
  }
  const user = await prisma.user.findUnique({
    where: {
      login,
    },
  });
  if (!user || !(await compare(password, user.password))) {
    throw Error('invalid-credentials');
  }
  return user;
}
