const http = require('http');

// 测试后端服务器的健康检查端点
function testServerHealth() {
  console.log('正在测试后端服务器健康检查端点...');
  
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    console.log(`状态码: ${res.statusCode}`);
    console.log(`响应头: ${JSON.stringify(res.headers)}`);
    
    res.on('data', (chunk) => {
      console.log(`响应数据: ${chunk}`);
    });
    
    res.on('end', () => {
      console.log('测试完成，服务器能够正常响应请求！');
    });
  });
  
  req.on('error', (e) => {
    console.error(`请求错误: ${e.message}`);
  });
  
  req.end();
}

// 运行测试
testServerHealth();
