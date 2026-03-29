const {
  getUserProfile,
  updateUserProfile,
} = require("../services/user.service");

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.query.userId;

    const user = await getUserProfile(userId);

    return res.status(200).json({
      success: true,
      message: "Get profile successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { userName } = req.body;
    const userId = req.user?.userId || req.query.userId;

    const update = await updateUserProfile({ userId, userName });

    return res.status(200).json({
      success: true,
      message: "Update profile successfully",
      data: update,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateUser,
};
