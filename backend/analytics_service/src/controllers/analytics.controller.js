'use strict';

const service = require('../services/analytics.service.js');

const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;

    const data = await service.getUserAnalytics(userId);

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    return res.status(404).json({
      success: false,
      message: err.message
    });
  }
};
const getAllUserAnalytics = async (req, res) => {
  try {
    const data = await service.getAllUserAnalytics();

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    return res.status(404).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  getUserAnalytics,
  getAllUserAnalytics
};