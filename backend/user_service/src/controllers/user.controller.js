const { getUserProfile } = require("../services/user.service");

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

module.exports = {
  getProfile,
};
