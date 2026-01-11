const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 注册新用户
exports.register = async (req, res) => {
  try {
    console.log('接收到注册请求:', { 
      username: req.body.username, 
      password: req.body.password ? '******' : undefined, 
      role: req.body.role,
      body: req.body
    });
    
    const { username, password, role } = req.body;
    
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('用户名已存在:', username);
      return res.status(400).json({ error: '该用户名已被注册' });
    }
    
    // 处理角色值，确保它是有效的
    let validRole = role;
    if (!role || role === '???' || !['管理员', '普通用户'].includes(role)) {
      validRole = '普通用户';
      console.log('角色值无效，使用默认值:', validRole);
    }
    
    // 创建新用户
    const user = new User({ username, password, role: validRole });
    console.log('准备保存用户:', { 
      username: user.username, 
      role: user.role 
    });
    
    await user.save();
    console.log('用户注册成功:', username);
    res.status(201).json({ message: '注册成功，请登录！' });
  } catch (error) {
    console.error('注册失败:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '注册失败，请重试', details: error.message });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: '用户名或密码错误' });
    }
    
    // 检查用户状态
    if (user.status === '停用') {
      return res.status(400).json({ error: '您的账号已被管理员停用，请联系管理员恢复。' });
    }
    
    // 验证密码
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: '用户名或密码错误' });
    }
    
    // 生成 JWT 令牌
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: '登录失败，请重试' });
  }
};

// 获取当前用户信息
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败' });
  }
};

// 获取用户列表
exports.getUsers = async (req, res) => {
  try {
    // 只有管理员可以获取用户列表
    if (req.user.role !== '管理员') {
      return res.status(403).json({ error: '无权限访问' });
    }
    
    const users = await User.find().select('-password');
    
    // 为每个用户添加id字段，与_id保持一致
    const usersWithId = users.map(user => ({
      ...user.toObject(),
      id: user._id.toString(),
      _id: user._id
    }));
    
    console.log('获取用户列表成功:', { count: usersWithId.length });
    res.json(usersWithId);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '获取用户列表失败' });
  }
};

// 修改用户状态
exports.updateUserStatus = async (req, res) => {
  try {
    console.log('接收到修改用户状态请求:', {
      userId: req.body.id,
      newStatus: req.body.status,
      adminId: req.user.id,
      adminRole: req.user.role
    });
    
    // 只有管理员可以修改用户状态
    if (req.user.role !== '管理员') {
      console.log('非管理员尝试修改用户状态，权限被拒绝');
      return res.status(403).json({ error: '无权限操作' });
    }
    
    const { id, status } = req.body;
    const user = await User.findById(id);
    
    if (!user) {
      console.log('用户不存在:', id);
      return res.status(404).json({ error: '用户不存在' });
    }
    
    console.log('修改用户状态:', {
      userId: user._id.toString(),
      username: user.username,
      oldStatus: user.status,
      newStatus: status
    });
    
    user.status = status;
    await user.save();
    
    // 为返回的用户对象添加id字段
    const userWithId = {
      ...user.toObject(),
      id: user._id.toString(),
      _id: user._id
    };
    
    console.log('用户状态更新成功:', userWithId);
    res.json({ message: '用户状态更新成功', user: userWithId });
  } catch (error) {
    console.error('更新用户状态失败:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '更新用户状态失败' });
  }
};