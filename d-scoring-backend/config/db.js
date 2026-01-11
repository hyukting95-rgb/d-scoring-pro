const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    console.log('正在尝试连接MongoDB...');
    console.log('MongoDB连接字符串:', process.env.MONGO_URI);
    
    // 连接选项（MongoDB 4.0+）
    const options = {
      serverSelectionTimeoutMS: 30000, // 服务器选择超时
      socketTimeoutMS: 45000, // 套接字超时
      connectTimeoutMS: 30000, // 连接超时
      maxPoolSize: 10, // 最大连接池大小
      retryWrites: true,
      w: 'majority'
    };
    
    await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log('MongoDB 连接成功');
    console.log('数据库连接状态:', mongoose.connection.readyState);
    
    // 连接状态监控
    mongoose.connection.on('connected', () => {
      console.log('MongoDB 连接已建立');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB 连接错误:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB 连接已断开');
      // 尝试重新连接
      setTimeout(() => {
        console.log('尝试重新连接MongoDB...');
        mongoose.connect(process.env.MONGO_URI, options);
      }, 5000);
    });
    
  } catch (error) {
    console.error('MongoDB 连接失败:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('请检查以下几点:', [
      '1. 网络连接是否正常',
      '2. MongoDB Atlas是否可访问',
      '3. 连接字符串是否正确',
      '4. 数据库用户权限是否正确',
      '5. MongoDB Atlas IP白名单是否设置为0.0.0.0/0'
    ]);
    
    // 不要立即退出，让服务器继续运行
    console.log('服务器将在没有数据库连接的情况下继续运行');
  }
};

module.exports = connectDB;