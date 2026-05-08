const {
  getUserProfile,
  updateUserProfile,
} = require("../services/user.service");

function requireUserId(req, res) {
  const userId = req.headers['x-user-id'];
  if (userId == null || userId === "") {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return null;
  }
  return String(userId);
}

const getProfile = async (req, res, next) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

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
    const { userName, birth } = req.body;
    const userId = requireUserId(req, res);
    if (!userId) return;

    console.log("userName =", userName);
    console.log("birth =", birth);

    const update = await updateUserProfile({ userId, userName, birth });

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
