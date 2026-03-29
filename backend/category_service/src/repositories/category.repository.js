const prisma = require("../config/database");

const findCategories = async ({ userId, type }) => {
  return prisma.category.findMany({
    where: {
      type: type,
      OR: [
        { user_id: null },     // system categories
        { user_id: userId },   // user custom
      ],
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

module.exports = {
  findCategories,
};