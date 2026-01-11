const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }
    
    if (user.status === '停用') {
      return res.status(401).json({ error: '您的账号已被管理员停用，请联系管理员恢复。' });
    }
    
    // 为了与前端保持一致，将_id重命名为id
    const userWithId = {
      ...user.toObject(),
      id: user._id.toString(),
      _id: user._id
    };
    
    req.user = userWithId;
    req.token = token;
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    res.status(401).json({ error: '认证失败，请重新登录' });
  }
};

module.exports = auth;