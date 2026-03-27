const prisma = require("../config/database");

const findUserById = async (userId) => {
  return prisma.user.findUnique({
    where: {
      userId,
    },
    select: {
      userId: true,
      userName: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

module.exports = {
  findUserById,
};
