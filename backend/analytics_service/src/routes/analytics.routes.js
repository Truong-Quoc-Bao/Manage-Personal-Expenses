'use strict';

const express = require('express');
const router = express.Router();

const { getUserAnalytics, getAllUserAnalytics } = require('../controllers/analytics.controller');

// GET /api/user-analytics/:userId
router.get('/', getAllUserAnalytics);

router.get('/:userId', getUserAnalytics);


module.exports = router;