const { user } = require("../config/database");
const {
  findUserById,
  updateUser,
  findUserByUserName,
  checkExistingUser,
  createUser,
} = require("../repositories/user.repository");

const UserPublishEvent = require("../dtos/user.publish.event");
const { USER_STATUS } = require("../types/user.types");
const rabbitMQ = require("../shared/rabbitmq-client");

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

const updateUserProfile = async ({ userId, userName, birth }) => {
  if (!userId) {
    const error = new Error("userId is required");
    error.statusCode = 400;
    throw error;
  }

  if (userName === undefined && birth === undefined) {
    const error = new Error(
      "At least one field (userName or birth) is required"
    );
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await findUserById(userId);

  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  if (birth != undefined) {
    const birthDate = new Date(birth);

    if (Number.isNaN(birthDate.getTime())) {
      const error = new Error("birth must be a valid date");
      error.statusCode = 400;
      throw error;
    }

    const today = new Date();

    if (birthDate > today) {
      const error = new Error("birth cannot be greater than current date");
      error.statusCode = 400;
      throw error;
    }
  }
  if (userName != undefined) {
    if (!String(userName).trim()) {
      const error = new Error("userName cannot be empty");
      error.statusCode = 400;
      throw error;
    }

    const existingUserName = await findUserByUserName(userName);

    if (existingUserName && existingUserName.user_id !== userId) {
      const error = new Error("User name already exists");
      error.statusCode = 400;
      throw error;
    }
  }

  const update = await updateUser({ userId, userName, birth });

  return update;
};

const createUserService = async (user) => {
  const existingUser = await checkExistingUser(user);

  if (existingUser) {
    const userPublishStatusEvent = new UserPublishEvent.UserPublishStatusEvent(
      existingUser,
      USER_STATUS.FAILED
    );
    await rabbitMQ.publish(
      "user.user_created_status",
      new UserPublishEvent(userPublishStatusEvent)
    );
  } else {
    const userPublishStatusEvent = new UserPublishEvent.UserPublishStatusEvent(
      existingUser,
      USER_STATUS.SUCCESS
    );
    await rabbitMQ.publish(
      "user.user_created_status",
      new UserPublishEvent(userPublishStatusEvent)
    );
    return newUser;
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  createUserService,
};
