const http = require('http');
const querystring = require('querystring');

// 发送HTTP请求的函数
function sendHttpRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, data });
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// 测试更新项目状态
async function testUpdateProjectStatus() {
  try {
    // 首先注册一个用户
    console.log('正在注册用户...');
    try {
      const registerOptions = {
        hostname: 'localhost',
        port: 5001,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const registerData = JSON.stringify({
        username: 'testuser',
        password: 'test123',
        role: '管理员'
      });
      
      const registerResponse = await sendHttpRequest(registerOptions, registerData);
      console.log('注册用户响应:', {
        statusCode: registerResponse.statusCode,
        data: registerResponse.data
      });
      
      if (registerResponse.statusCode === 201) {
        console.log('用户注册成功');
      } else if (registerResponse.statusCode === 400) {
        console.log('用户已存在，跳过注册');
      } else {
        throw new Error(`注册用户失败: ${registerResponse.statusCode} ${registerResponse.data}`);
      }
    } catch (error) {
      console.error('注册用户错误:', error.message);
      // 继续执行，不中断测试
    }
    
    // 登录获取令牌
    console.log('\n正在登录...');
    const loginOptions = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const loginData = JSON.stringify({
      username: 'testuser',
      password: 'test123'
    });
    
    const loginResponse = await sendHttpRequest(loginOptions, loginData);
    console.log('登录响应:', {
      statusCode: loginResponse.statusCode,
      data: loginResponse.data
    });
    
    if (loginResponse.statusCode !== 200) {
      throw new Error(`登录失败: ${loginResponse.statusCode} ${loginResponse.data}`);
    }
    
    const loginResult = JSON.parse(loginResponse.data);
    const token = loginResult.token;
    console.log('登录成功，获取到令牌:', token);
    
    // 测试更新项目状态
    console.log('\n正在测试更新项目状态...');
    const projectId = 'P0001';
    const newStatus = '已完成';
    
    const updateOptions = {
      hostname: 'localhost',
      port: 5001,
      path: `/api/projects/${projectId}/status`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const updateData = JSON.stringify({ status: newStatus });
    
    const updateResponse = await sendHttpRequest(updateOptions, updateData);
    console.log('更新项目状态响应:', {
      statusCode: updateResponse.statusCode,
      data: updateResponse.data
    });
    
    if (updateResponse.statusCode === 200) {
      console.log('更新项目状态成功:', updateResponse.data);
      console.log('测试完成，所有操作都成功了！');
    } else {
      console.error('更新项目状态失败:', {
        statusCode: updateResponse.statusCode,
        data: updateResponse.data
      });
    }
  } catch (error) {
    console.error('测试失败:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
testUpdateProjectStatus();
