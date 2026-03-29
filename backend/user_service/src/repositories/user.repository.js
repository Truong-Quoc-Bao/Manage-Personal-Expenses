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
      age: true,
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
      age: true,
      created_at: true,
      updated_at: true,
    },
  });
};

const updateUser = async ({ userId, userName }) => {
  return prisma.user.update({
    where: {
      user_id: userId,
    },
    data: {
      user_name: userName,
    },
    select: {
      user_id: true,
      user_name: true,
      email: true,
      age: true,
      created_at: true,
      updated_at: true,
    },
  });
};
module.exports = {
  findUserById,
  findUserByUserName,
  updateUser,
};
