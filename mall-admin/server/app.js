const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const config = require('./config');

const app = express();

// 基础中间件
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors());

// 解析请求体
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// 配置session
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

// 静态文件服务（前端构建文件）
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API路由
app.use('/api/admin', require('./routes/admin'));
app.use('/api/auth', require('./routes/auth'));

// 所有其他请求返回前端页面
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`管理后台服务器运行在端口 ${PORT}`);
  console.log(`访问地址: http://localhost:${PORT}`);
});

module.exports = app; 