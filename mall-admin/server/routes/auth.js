const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const config = require('../config');
const { requireAuth } = require('../middleware/auth');
const AdminModel = require('../models/AdminModel');

// 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    // 从数据库查询管理员信息
    const adminUser = await AdminModel.findByUsername(username);
    if (!adminUser) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isValid = await AdminModel.verifyPassword(password, adminUser.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 创建session
    req.session.adminId = adminUser.id;
    req.session.adminInfo = {
      id: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      name: adminUser.name
    };

    // 生成JWT token（备用）
    const token = jwt.sign(
      { 
        adminId: adminUser.id,
        adminInfo: req.session.adminInfo
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        adminInfo: req.session.adminInfo,
        token
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败'
    });
  }
});

// 获取当前登录用户信息
router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    data: req.adminInfo
  });
});

// 退出登录
router.post('/logout', requireAuth, (req, res) => {
  // 清除session
  req.session.destroy((err) => {
    if (err) {
      console.error('退出登录错误:', err);
      return res.status(500).json({
        success: false,
        message: '退出登录失败'
      });
    }

    // 清除cookie
    res.clearCookie('connect.sid');
    res.clearCookie('token');

    res.json({
      success: true,
      message: '退出登录成功'
    });
  });
});

// 修改密码
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '原密码和新密码不能为空'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '新密码长度不能少于6位'
      });
    }

    // TODO: 实现密码修改逻辑
    res.json({
      success: true,
      message: '密码修改成功'
    });

  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      success: false,
      message: '修改密码失败'
    });
  }
});

module.exports = router; 