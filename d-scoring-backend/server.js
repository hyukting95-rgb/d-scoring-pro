const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// 加载环境变量
dotenv.config();

// 连接数据库
connectDB();

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 日志中间件
app.use((req, res, next) => {
  console.log('接收到请求:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  
  // 监听响应完成事件
  const originalEnd = res.end;
  res.end = function(chunk, encoding, callback) {
    console.log('发送响应:', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      headers: res.getHeaders(),
      body: chunk ? chunk.toString() : undefined
    });
    return originalEnd.call(this, chunk, encoding, callback);
  };
  
  next();
});

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/personnel', require('./routes/personnel'));
app.use('/api/config', require('./routes/config'));

// 健康检查
app.get('/', (req, res) => {
  res.json({ message: 'D-Scoring Pro 后端服务运行正常' });
});

// API健康检查
app.get('/api', (req, res) => {
  res.json({ message: 'D-Scoring Pro API 服务运行正常' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// 端口
const PORT = process.env.PORT || 5000;

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}`);
  console.log(`API基础URL: http://localhost:${PORT}/api`);
  console.log(`服务器PID: ${process.pid}`);
  console.log(`服务器状态: 运行中`);
});

// 定期检查服务器状态
setInterval(() => {
  console.log(`服务器状态检查: 运行中 (PID: ${process.pid})`);
}, 30000); // 每30秒检查一次

// 监听服务器错误
server.on('error', (error) => {
  console.error('服务器启动失败:', error);
});

// 监听进程信号
process.on('SIGINT', () => {
  console.log('接收到终止信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('未处理的Promise拒绝:', error);
});