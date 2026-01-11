const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// 注册新用户
router.post('/register', authController.register);

// 用户登录
router.post('/login', authController.login);

// 获取当前用户信息
router.get('/me', auth, authController.getMe);

// 获取用户列表（管理员）
router.get('/users', auth, authController.getUsers);

// 修改用户状态（管理员）
router.put('/users/status', auth, authController.updateUserStatus);

module.exports = router;