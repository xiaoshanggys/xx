# 商城管理后台

基于 Node.js + Express + Vue.js + Element UI 的前后端不分离商城管理后台系统。

## 技术栈

### 后端
- Node.js
- Express
- MySQL
- Redis
- Session/JWT认证

### 前端
- Vue.js 3
- Element Plus
- Vue Router
- Vuex
- Axios

## 项目结构

```
mall-admin/
├─ server/                   # 后端代码
│   ├─ routes/              # 路由
│   ├─ middleware/          # 中间件
│   ├─ config/              # 配置文件
│   └─ app.js               # 后端入口文件
├─ client/                   # 前端代码
│   ├─ src/
│   │   ├─ views/           # 页面视图
│   │   ├─ components/      # 公共组件
│   │   ├─ router/          # 路由配置
│   │   ├─ store/           # 状态管理
│   │   ├─ api/             # API接口封装
│   │   ├─ utils/           # 工具函数
│   │   ├─ assets/          # 静态资源
│   │   └─ main.js          # 前端入口文件
│   └─ public/              # 静态资源
├─ dist/                    # 前端构建输出
├─ package.json             # 依赖配置
├─ webpack.config.js        # Webpack配置
└─ README.md                # 项目说明
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.development` 文件：

```env
NODE_ENV=development
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=mall_db

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT密钥
JWT_SECRET=mall-admin-jwt-secret-dev

# Session密钥
SESSION_SECRET=mall-admin-session-secret-dev
```

### 3. 构建前端

```bash
# 开发模式构建
npm run build:dev

# 生产模式构建
npm run build
```

### 4. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 5. 访问应用

打开浏览器访问：http://localhost:3000

默认登录账号：
- 用户名：admin
- 密码：password

## 主要功能

- 数据总览：展示商城关键指标
- 商品管理：商品的增删改查
- 订单管理：订单状态管理
- 用户管理：用户信息管理
- 系统设置：基础配置管理

## 开发说明

### 后端API

- 认证接口：`/api/auth/*`
- 管理接口：`/api/admin/*`

### 前端路由

- 登录页：`/login`
- 数据总览：`/dashboard`
- 商品管理：`/products`
- 订单管理：`/orders`
- 用户管理：`/users`

### 认证方式

采用 Session + JWT 双重认证：
- Session：主要认证方式
- JWT：备用认证方式，支持无状态认证

## 注意事项

1. 确保 MySQL 和 Redis 服务已启动
2. 首次运行需要创建数据库和表结构
3. 生产环境请修改默认密钥和账号密码
4. 建议使用 PM2 进行生产环境部署

## 开发计划

- [ ] 完善商品管理功能
- [ ] 实现订单状态流转
- [ ] 添加文件上传功能
- [ ] 完善权限管理
- [ ] 添加数据统计图表 