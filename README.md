# D-Scoring Pro 设计部绩效分值管理系统

## 系统简介

D-Scoring Pro是一个专为设计部门开发的绩效分值管理系统，用于跟踪和管理设计项目的积分、工作天数和人员绩效。

## 功能特性

- **用户认证**：支持用户注册、登录，以及管理员权限管理
- **项目管理**：支持设计项目、包装项目和说明书项目的录入、编辑和删除
- **积分管理**：自动计算积分，记录积分明细，生成积分排名
- **数据报表**：提供项目明细、积分明细和人员得分报表，支持Excel导出
- **系统设置**：管理员可以修改评分配置，同步影响所有项目

## 技术架构

- **前端**：React + TypeScript + Vite
- **后端**：Node.js + Express + MongoDB
- **认证**：JWT (JSON Web Tokens)
- **部署**：前端部署到Vercel，后端部署到Heroku，数据库使用MongoDB Atlas

## 部署步骤

### 1. 准备环境

- 安装Node.js 18+
- 注册MongoDB Atlas账户
- 注册Vercel账户
- 注册Heroku账户（可选，也可以使用其他后端部署平台）

### 2. 配置MongoDB Atlas

1. 创建一个新的MongoDB Atlas集群
2. 创建一个数据库用户，记录用户名和密码
3. 获取数据库连接字符串，格式如下：
   ```
   mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/d-scoring
   ```

### 3. 部署后端

1. 进入后端目录：
   ```bash
   cd d-scoring-backend
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 修改`.env`文件，填入MongoDB连接字符串和JWT密钥：
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/d-scoring
   JWT_SECRET=<your-secret-key>
   PORT=5000
   ```

4. 部署到Heroku：
   - 安装Heroku CLI
   - 登录Heroku：`heroku login`
   - 创建Heroku应用：`heroku create`
   - 推送代码：`git push heroku main`
   - 设置环境变量：`heroku config:set MONGO_URI=<your-mongo-uri> JWT_SECRET=<your-secret-key>`

### 4. 部署前端

1. 进入前端目录：
   ```bash
   cd d-scoring-pro-management-system
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 修改`src/services/api.ts`文件，将API基础URL改为后端部署地址：
   ```typescript
   const api = axios.create({
     baseURL: 'https://your-backend-app.herokuapp.com/api',
     // ...
   });
   ```

4. 部署到Vercel：
   - 登录Vercel
   - 导入项目
   - 配置构建命令：`npm run build`
   - 部署项目

### 5. 初始化系统

1. 访问前端部署地址
2. 注册一个管理员账号
3. 使用管理员账号登录
4. 配置评分标准（可选）

## 本地开发

### 后端开发

```bash
cd d-scoring-backend
npm run dev
```

### 前端开发

```bash
cd d-scoring-pro-management-system
npm run dev
```

## 注意事项

- 确保后端API地址正确配置在前端代码中
- 确保MongoDB Atlas的网络访问控制设置为允许所有IP（或特定IP）
- 对于生产环境，建议使用HTTPS协议
- 定期备份MongoDB数据库

## 故障排查

- **无法登录**：检查用户名和密码是否正确，检查用户状态是否活跃
- **API调用失败**：检查后端服务是否运行，检查API地址是否正确
- **数据库连接失败**：检查MongoDB连接字符串是否正确，检查网络连接
- **部署失败**：检查环境变量是否正确设置，检查依赖是否安装完整

## 许可证

MIT License