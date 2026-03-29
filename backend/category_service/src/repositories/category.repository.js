const prisma = require("../config/database");

const findCategories = async ({ userId }) => {
  return prisma.category.findMany({
    where: {
      user_id: userId,
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

module.exports = {
  findCategories,
};