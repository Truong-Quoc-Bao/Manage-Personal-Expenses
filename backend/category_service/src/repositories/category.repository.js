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

const findOneCategory = async (category_id) => {
  return prisma.category.findUnique({
    where: {
      category_id: category_id,
    }
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

const updateCategory = async ({ userId , category_id, cat }) => {
  return prisma.category.update({
    where: {
      category_id: category_id,
    },
    data: {
      user_id: userId,
      icon_id: cat.icon_id,
      category_name: cat.category_name,
      type: cat.type,
      color: cat.color,
      is_system: cat.is_system,
      created_at: cat.created_at,
    }



    // orderBy: {
    //   created_at: "desc",
    // },
  });
};
module.exports = {
  findCategories,createCategories,updateCategory,findOneCategory
};