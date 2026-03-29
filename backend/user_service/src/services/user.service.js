const { user } = require("../config/database");
const {
  findUserById,
  updateUser,
  findUserByUserName,
} = require("../repositories/user.repository");

const getUserProfile = async (userId) => {
  if (!userId) {
    const error = new Error("userId is required");
    error.statusCode = 400;
    throw error;
  }

  const user = await findUserById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const updateUserProfile = async ({ userId, userName }) => {
  if (!userId) {
    const error = new Error("userId is required");
    error.statusCode = 400;
    throw error;
  }

  if (!userName) {
    const error = new Error("userName  are required");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await findUserById(userId);

  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const existingUserName = await findUserByUserName(userName);

  if (existingUserName && existingUserName.user_id !== userId) {
    const error = new Error("User name already exists");
    error.statusCode = 400;
    throw error;
  }

  const update = await updateUser({ userId, userName });

  return update;
};
module.exports = {
  getUserProfile,
  updateUserProfile,
};
