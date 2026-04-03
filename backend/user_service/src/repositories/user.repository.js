const prisma = require("../config/database");

const findUserById = async (userId) => {
  return prisma.user.findUnique({
    where: {
      user_id: userId,
    },
    select: {
      user_id: true,
      user_name: true,
      email: true,
      birth: true,
      created_at: true,
      updated_at: true,
    },
  });
};

const findUserByUserName = async (userName) => {
  return prisma.user.findFirst({
    where: {
      user_name: userName,
    },
    select: {
      user_id: true,
      user_name: true,
      email: true,
      birth: true,
      created_at: true,
      updated_at: true,
    },
  });
};

const checkExistingUser = async (user) => {
  return prisma.user.findMany({
    where: {
      OR: [
        { user_id: user.userId },
        { email: user.email },
      ],
    },
    select: {
      user_id: true,
      email: true,
    },
  })
};

const createUser = async (user) => {
  return prisma.user.create({
    data: {
      user_id: user.userId,
      user_name: user.userName,
      email: user.email,
      created_at: user.createdAt,
    },
    select: {
      user_id: true,
      user_name: true,
      email: true,
      birth: true,
      created_at: true,
      updated_at: true,
    },
  });
};

const updateUser = async ({ userId, userName, birth }) => {
  const data = {};

  if (userName !== undefined) {
    data.user_name = userName;
  }

  if (birth !== undefined) {
    data.birth = new Date(birth);
  }
  return prisma.user.update({
    where: {
      user_id: userId,
    },
    data,
    select: {
      user_id: true,
      user_name: true,
      email: true,
      birth: true,
      created_at: true,
      updated_at: true,
    },
  });
};
module.exports = {
  findUserById,
  findUserByUserName,
  updateUser,
  checkExistingUser,
  createUser,
};
