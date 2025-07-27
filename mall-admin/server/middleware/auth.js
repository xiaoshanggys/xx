const jwt = require('jsonwebtoken');
const config = require('../config');

// 验证登录状态的中间件
const requireAuth = (req, res, next) => {
  // 检查session
  if (req.session && req.session.adminId) {
    req.adminId = req.session.adminId;
    req.adminInfo = req.session.adminInfo;
    return next();
  }

  // 检查JWT token（备用方案）
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '请先登录'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.adminId = decoded.adminId;
    req.adminInfo = decoded.adminInfo;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '登录状态已过期'
    });
  }
};

// 检查权限的中间件
const requirePermission = (permission) => {
  return (req, res, next) => {
    // 这里可以根据具体需求实现权限检查
    // 暂时简单实现，后续可扩展
    if (req.adminInfo && req.adminInfo.role === 'admin') {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: '权限不足'
    });
  };
};

module.exports = {
  requireAuth,
  requirePermission
}; 