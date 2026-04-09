'use strict';

const repo = require('../repositories/analytics.repository.js');

const service = {
  getUserAnalytics: async (userId) => {
    const data = await repo.findByUserId(userId);


    return data;
  },
    getAllUserAnalytics: async () => {
    const data = await repo.findAll();



    return data;
  }
};

module.exports = service;