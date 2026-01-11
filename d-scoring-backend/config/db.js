const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    console.log('正在尝试连接MongoDB...');
    console.log('MongoDB连接字符串:', process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB 连接成功');
    console.log('数据库连接状态:', mongoose.connection.readyState);
  } catch (error) {
    console.error('MongoDB 连接失败:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('请检查以下几点:', [
      '1. 网络连接是否正常',
      '2. MongoDB Atlas是否可访问',
      '3. 连接字符串是否正确',
      '4. 数据库用户权限是否正确'
    ]);
    
    // 不要立即退出，让服务器继续运行
    console.log('服务器将在没有数据库连接的情况下继续运行');
  }
};

module.exports = connectDB;