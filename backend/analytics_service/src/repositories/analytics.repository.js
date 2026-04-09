'use strict';

const user_analytics  = require('../model/userAnalytics.model.js');

const repo = {
  // Lấy theo user_id
  findByUserId: async (userId) => {
    return await user_analytics.findOne({ user_id: userId }).lean();
  },

  // Lấy tất cả (optional)
  findAll: async () => {
    return await user_analytics.find().lean();
  }
};

module.exports = repo;