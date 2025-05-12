import prisma from '../data-source.js';

export const findByEmail = async (email) => {
  return await prisma.account.findUnique({
    where: { email },
    include: { user: true }
  });
};

export const createUser = async ({ email, passwordHash, name, phone }) => {
  return await prisma.account.create({
    data: {
      provider: 'LOCAL',
      email,
      passwordHash,
      user: {
        create: {
          name,
          phone
        }
      }
    },
    include: { user: true }
  });
};
