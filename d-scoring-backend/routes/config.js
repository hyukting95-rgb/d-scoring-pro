const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const auth = require('../middleware/auth');

// 获取评分配置
router.get('/scoring', auth, configController.getScoringConfig);

// 更新评分配置（管理员）
router.put('/scoring', auth, configController.updateScoringConfig);

module.exports = router;