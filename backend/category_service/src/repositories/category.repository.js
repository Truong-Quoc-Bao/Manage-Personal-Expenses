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

const createCategories = async ({ userId , cat }) => {
  return prisma.category.create({
    data: {
    //   category_id: crypto.randomUUID(),
      user_id: userId,
      icon_id: cat.icon_id,
      category_name: cat.category_name,
      type: cat.type,
      color: cat.color,
      is_system: false,
      created_at: new Date(),
    },



    // orderBy: {
    //   created_at: "desc",
    // },
  });
};

module.exports = {
  findCategories,createCategories
};