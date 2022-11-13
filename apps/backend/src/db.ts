import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

export const getUserByUsername = async (username: string) => {
  const result = await prisma.user.findUnique({
    where: { username },
  });

  console.log('result:', result);
  return result;
};

export const getUserByMail = async (mail: string) => {
  const result = await prisma.user.findUnique({
    where: { mail },
  });

  console.log('result:', result);
  return result;
};

export const createUser = (user: { username: string; mail: string }) => {
  const result = prisma.user.create({
    data: { username: user.username, mail: user.mail },
  });

  console.log('result:', result);
  return result;
};
