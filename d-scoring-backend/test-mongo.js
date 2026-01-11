const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log('开始测试MongoDB连接...');
console.log('MongoDB连接字符串:', process.env.MONGO_URI);

// 测试MongoDB连接
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB 连接成功');
  console.log('数据库连接状态:', mongoose.connection.readyState);
  
  // 测试数据库操作
  console.log('测试数据库操作...');
  
  // 定义一个简单的测试模型
  const TestSchema = new mongoose.Schema({
    name: String,
    value: Number
  });
  
  const Test = mongoose.model('Test', TestSchema);
  
  // 创建一个测试文档
  const testDoc = new Test({ name: '测试', value: 123 });
  
  testDoc.save()
    .then(savedDoc => {
      console.log('测试文档保存成功:', savedDoc);
      
      // 查询测试文档
      Test.find()
        .then(docs => {
          console.log('测试文档查询成功:', docs);
          
          // 断开连接
          mongoose.disconnect()
            .then(() => {
              console.log('MongoDB 连接已断开');
              console.log('测试完成，所有操作都成功了！');
            })
            .catch(err => {
              console.error('断开连接失败:', err);
            });
        })
        .catch(err => {
          console.error('查询测试文档失败:', err);
        });
    })
    .catch(err => {
      console.error('保存测试文档失败:', err);
    });
})
.catch(err => {
  console.error('MongoDB 连接失败:', err.message);
  console.error('错误堆栈:', err.stack);
});

// 监听连接事件
mongoose.connection.on('connected', () => {
  console.log('Mongoose 连接已建立');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose 连接错误:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose 连接已断开');
});
