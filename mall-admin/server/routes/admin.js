const express = require('express');
const router = express.Router();
const config = require('../config');
const { requireAuth, requirePermission } = require('../middleware/auth');
const GoodsModel = require('../models/GoodsModel');
const OrderModel = require('../models/OrderModel');
const Database = require('../utils/database');

// 所有管理接口都需要登录
router.use(requireAuth);

// 数据总览
router.get('/dashboard/overview', async (req, res) => {
  try {
    // 获取订单统计
    const orderStats = await OrderModel.getStatistics('today');
    
    // 获取商品统计
    const goodsStats = await GoodsModel.getStatistics();
    
    // 获取用户统计
    const userCountSql = 'SELECT COUNT(*) as total FROM user';
    const todayUserSql = 'SELECT COUNT(*) as total FROM user WHERE DATE(create_time) = CURDATE()';
    
    const [userCountResult, todayUserResult] = await Promise.all([
      Database.query(userCountSql),
      Database.query(todayUserSql)
    ]);

    const data = {
      todayOrders: orderStats.total_orders || 0,
      todaySales: parseFloat(orderStats.total_amount || 0),
      totalUsers: userCountResult[0].total || 0,
      totalProducts: goodsStats.total || 0,
      todayUsers: todayUserResult[0].total || 0,
      lowStockProducts: goodsStats.low_stock || 0,
      pendingPayment: orderStats.pending_payment || 0,
      pendingShipment: orderStats.pending_shipment || 0,
      pendingReceipt: orderStats.pending_receipt || 0
    };

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('获取数据总览错误:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
});

// ============ 商品管理 ============

// 获取商品列表
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, category_id, status, keyword } = req.query;
    
    const result = await GoodsModel.getList({
      page: parseInt(page),
      limit: parseInt(limit),
      category_id,
      status,
      keyword
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取商品列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取商品列表失败'
    });
  }
});

// 新增商品
router.post('/products', async (req, res) => {
  try {
    const productData = req.body;
    
    // 验证必要字段
    const { name, category_id, price, stock, description } = productData;
    if (!name || !category_id || !price || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的商品信息'
      });
    }
    
    const result = await GoodsModel.create(productData);
    
    res.json({
      success: true,
      message: '商品新增成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('新增商品错误:', error);
    res.status(500).json({
      success: false,
      message: '新增商品失败'
    });
  }
});

// 更新商品
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    
    const result = await GoodsModel.update(id, productData);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }
    
    res.json({
      success: true,
      message: '商品更新成功'
    });
  } catch (error) {
    console.error('更新商品错误:', error);
    res.status(500).json({
      success: false,
      message: '更新商品失败'
    });
  }
});

// 删除商品
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await GoodsModel.delete(id);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }
    
    res.json({
      success: true,
      message: '商品删除成功'
    });
  } catch (error) {
    console.error('删除商品错误:', error);
    res.status(500).json({
      success: false,
      message: '删除商品失败'
    });
  }
});

// 获取商品详情
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await GoodsModel.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('获取商品详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取商品详情失败'
    });
  }
});

// 批量删除商品
router.delete('/products', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要删除的商品'
      });
    }
    
    await GoodsModel.batchDelete(ids);
    
    res.json({
      success: true,
      message: '批量删除成功'
    });
  } catch (error) {
    console.error('批量删除商品错误:', error);
    res.status(500).json({
      success: false,
      message: '批量删除失败'
    });
  }
});

// 更新商品状态
router.patch('/products/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (status === undefined) {
      return res.status(400).json({
        success: false,
        message: '请指定商品状态'
      });
    }
    
    const result = await GoodsModel.updateStatus(id, status);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }
    
    res.json({
      success: true,
      message: '状态更新成功'
    });
  } catch (error) {
    console.error('更新商品状态错误:', error);
    res.status(500).json({
      success: false,
      message: '更新状态失败'
    });
  }
});

// ============ 订单管理 ============

// 获取订单列表
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, order_no, start_date, end_date } = req.query;
    
    const result = await OrderModel.getList({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      order_no,
      start_date,
      end_date
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取订单列表失败'
    });
  }
});

// 获取订单详情
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await OrderModel.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取订单详情失败'
    });
  }
});

// 更新订单状态
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark = '' } = req.body;
    
    if (status === undefined) {
      return res.status(400).json({
        success: false,
        message: '请指定订单状态'
      });
    }
    
    const result = await OrderModel.updateStatus(id, status, remark);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    res.json({
      success: true,
      message: '订单状态更新成功'
    });
  } catch (error) {
    console.error('更新订单状态错误:', error);
    res.status(500).json({
      success: false,
      message: '更新订单状态失败'
    });
  }
});

// 取消订单
router.post('/orders/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body;
    
    const result = await OrderModel.cancel(id, reason);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    res.json({
      success: true,
      message: '订单取消成功'
    });
  } catch (error) {
    console.error('取消订单错误:', error);
    res.status(500).json({
      success: false,
      message: '取消订单失败'
    });
  }
});

// 发货
router.post('/orders/:id/ship', async (req, res) => {
  try {
    const { id } = req.params;
    const shippingData = req.body;
    
    const result = await OrderModel.ship(id, shippingData);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    res.json({
      success: true,
      message: '发货成功'
    });
  } catch (error) {
    console.error('发货错误:', error);
    res.status(500).json({
      success: false,
      message: '发货失败'
    });
  }
});

// 添加订单备注
router.post('/orders/:id/remark', async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;
    
    if (!remark) {
      return res.status(400).json({
        success: false,
        message: '备注内容不能为空'
      });
    }
    
    const result = await OrderModel.addRemark(id, remark);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    res.json({
      success: true,
      message: '备注添加成功'
    });
  } catch (error) {
    console.error('添加订单备注错误:', error);
    res.status(500).json({
      success: false,
      message: '添加备注失败'
    });
  }
});

// 批量处理订单
router.post('/orders/batch', async (req, res) => {
  try {
    const { ids, action, status } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要操作的订单'
      });
    }
    
    if (action === 'updateStatus' && status !== undefined) {
      await OrderModel.batchUpdateStatus(ids, status);
      res.json({
        success: true,
        message: '批量操作成功'
      });
    } else {
      res.status(400).json({
        success: false,
        message: '操作类型不正确'
      });
    }
  } catch (error) {
    console.error('批量处理订单错误:', error);
    res.status(500).json({
      success: false,
      message: '批量操作失败'
    });
  }
});

// ============ 用户管理 ============

// 获取用户列表
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword, status } = req.query;
    
    let where = '1=1';
    let whereParams = [];

    // 关键词搜索（昵称或手机号）
    if (keyword) {
      where += ' AND (nickname LIKE ? OR phone LIKE ?)';
      whereParams.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 状态筛选
    if (status !== undefined && status !== '') {
      where += ' AND status = ?';
      whereParams.push(status);
    }

    const result = await Database.paginate('user', page, limit, where, whereParams, 'create_time DESC');

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
});

// 获取用户详情
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await Database.findOne('user', 'id = ?', [id]);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 获取用户订单统计
    const orderStats = await Database.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_amount,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as pending_payment,
        SUM(CASE WHEN status = 4 THEN 1 ELSE 0 END) as completed
      FROM \`order\` WHERE user_id = ?
    `, [id]);

    // 获取用户地址数量
    const addressCount = await Database.count('address', 'user_id = ?', [id]);

    // 获取用户收藏数量
    const favoriteCount = await Database.count('favorite', 'user_id = ?', [id]);

    user.stats = {
      ...orderStats[0],
      address_count: addressCount,
      favorite_count: favoriteCount
    };
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户详情失败'
    });
  }
});

// 更新用户状态
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (status === undefined) {
      return res.status(400).json({
        success: false,
        message: '请指定用户状态'
      });
    }
    
    const result = await Database.update('user', { status, update_time: new Date() }, 'id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      message: '用户状态更新成功'
    });
  } catch (error) {
    console.error('更新用户状态错误:', error);
    res.status(500).json({
      success: false,
      message: '更新用户状态失败'
    });
  }
});

// 编辑用户信息
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    
    const result = await Database.update('user', { 
      ...userData, 
      update_time: new Date() 
    }, 'id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      message: '用户信息更新成功'
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '更新用户信息失败'
    });
  }
});

// ============ 分类管理 ============

// 获取分类列表
router.get('/categories', async (req, res) => {
  try {
    const categories = await Database.findMany('category', '1=1', [], { orderBy: 'sort ASC, id ASC' });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取分类列表失败'
    });
  }
});

// 新增分类
router.post('/categories', async (req, res) => {
  try {
    const categoryData = req.body;
    
    // 验证必要字段
    const { name } = categoryData;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '分类名称不能为空'
      });
    }
    
    const data = {
      ...categoryData,
      create_time: new Date(),
      update_time: new Date()
    };
    
    const result = await Database.insert('category', data);
    
    res.json({
      success: true,
      message: '分类新增成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('新增分类错误:', error);
    res.status(500).json({
      success: false,
      message: '新增分类失败'
    });
  }
});

// 编辑分类
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const categoryData = req.body;
    
    const updateData = {
      ...categoryData,
      update_time: new Date()
    };
    
    const result = await Database.update('category', updateData, 'id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }
    
    res.json({
      success: true,
      message: '分类更新成功'
    });
  } catch (error) {
    console.error('更新分类错误:', error);
    res.status(500).json({
      success: false,
      message: '更新分类失败'
    });
  }
});

// 删除分类
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查是否有商品使用该分类
    const goodsCount = await Database.count('goods', 'category_id = ?', [id]);
    if (goodsCount > 0) {
      return res.status(400).json({
        success: false,
        message: '该分类下有商品，无法删除'
      });
    }
    
    const result = await Database.delete('category', 'id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }
    
    res.json({
      success: true,
      message: '分类删除成功'
    });
  } catch (error) {
    console.error('删除分类错误:', error);
    res.status(500).json({
      success: false,
      message: '删除分类失败'
    });
  }
});

// ============ 轮播图管理 ============

// 获取轮播图列表
router.get('/banners', async (req, res) => {
  try {
    const banners = await Database.findMany('banner', '1=1', [], { orderBy: 'sort ASC, id ASC' });

    res.json({
      success: true,
      data: banners
    });
  } catch (error) {
    console.error('获取轮播图列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取轮播图列表失败'
    });
  }
});

// 新增轮播图
router.post('/banners', async (req, res) => {
  try {
    const bannerData = req.body;
    
    // 验证必要字段
    const { image } = bannerData;
    if (!image) {
      return res.status(400).json({
        success: false,
        message: '轮播图图片不能为空'
      });
    }
    
    const data = {
      ...bannerData,
      create_time: new Date()
    };
    
    const result = await Database.insert('banner', data);
    
    res.json({
      success: true,
      message: '轮播图新增成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('新增轮播图错误:', error);
    res.status(500).json({
      success: false,
      message: '新增轮播图失败'
    });
  }
});

// 编辑轮播图
router.put('/banners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bannerData = req.body;
    
    const result = await Database.update('banner', bannerData, 'id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '轮播图不存在'
      });
    }
    
    res.json({
      success: true,
      message: '轮播图更新成功'
    });
  } catch (error) {
    console.error('更新轮播图错误:', error);
    res.status(500).json({
      success: false,
      message: '更新轮播图失败'
    });
  }
});

// 删除轮播图
router.delete('/banners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Database.delete('banner', 'id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '轮播图不存在'
      });
    }
    
    res.json({
      success: true,
      message: '轮播图删除成功'
    });
  } catch (error) {
    console.error('删除轮播图错误:', error);
    res.status(500).json({
      success: false,
      message: '删除轮播图失败'
    });
  }
});

// 轮播图排序
router.patch('/banners/:id/sort', async (req, res) => {
  try {
    const { id } = req.params;
    const { sort } = req.body;
    
    if (sort === undefined) {
      return res.status(400).json({
        success: false,
        message: '请指定排序值'
      });
    }
    
    const result = await Database.update('banner', { sort }, 'id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '轮播图不存在'
      });
    }
    
    res.json({
      success: true,
      message: '排序更新成功'
    });
  } catch (error) {
    console.error('更新轮播图排序错误:', error);
    res.status(500).json({
      success: false,
      message: '更新排序失败'
    });
  }
});

// 更新轮播图状态
router.patch('/banners/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (status === undefined) {
      return res.status(400).json({
        success: false,
        message: '请指定轮播图状态'
      });
    }
    
    const result = await Database.update('banner', { status }, 'id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '轮播图不存在'
      });
    }
    
    res.json({
      success: true,
      message: '状态更新成功'
    });
  } catch (error) {
    console.error('更新轮播图状态错误:', error);
    res.status(500).json({
      success: false,
      message: '更新状态失败'
    });
  }
});

// ============ 文件上传 ============

// 文件上传
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxSize // 5MB
  },
  fileFilter: function (req, file, cb) {
    // 检查文件类型
    if (config.upload.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件'
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('文件上传错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '文件上传失败'
    });
  }
});

// ============ 购物车管理 ============

// 获取购物车列表
router.get('/carts', async (req, res) => {
  try {
    const { page = 1, limit = 20, user_id } = req.query;
    
    let where = '1=1';
    let whereParams = [];

    if (user_id) {
      where += ' AND c.user_id = ?';
      whereParams.push(user_id);
    }

    const sql = `
      SELECT c.*, u.nickname as user_name, g.name as goods_name, g.price as goods_price, g.image as goods_image
      FROM cart c
      LEFT JOIN user u ON c.user_id = u.id
      LEFT JOIN goods g ON c.goods_id = g.id
      WHERE ${where}
      ORDER BY c.create_time DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) as total
      FROM cart c
      WHERE ${where}
    `;

    const offset = (page - 1) * limit;
    const [list, countResult] = await Promise.all([
      Database.query(sql, [...whereParams, limit, offset]),
      Database.query(countSql, whereParams)
    ]);

    res.json({
      success: true,
      data: {
        list,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取购物车列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取购物车列表失败'
    });
  }
});

// 删除购物车商品
router.delete('/carts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Database.delete('cart', 'id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '购物车商品不存在'
      });
    }
    
    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除购物车商品错误:', error);
    res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
});

// ============ 收货地址管理 ============

// 获取地址列表
router.get('/addresses', async (req, res) => {
  try {
    const { page = 1, limit = 20, user_id } = req.query;
    
    let where = '1=1';
    let whereParams = [];

    if (user_id) {
      where += ' AND a.user_id = ?';
      whereParams.push(user_id);
    }

    const sql = `
      SELECT a.*, u.nickname as user_name
      FROM address a
      LEFT JOIN user u ON a.user_id = u.id
      WHERE ${where}
      ORDER BY a.is_default DESC, a.create_time DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) as total
      FROM address a
      WHERE ${where}
    `;

    const offset = (page - 1) * limit;
    const [list, countResult] = await Promise.all([
      Database.query(sql, [...whereParams, limit, offset]),
      Database.query(countSql, whereParams)
    ]);

    res.json({
      success: true,
      data: {
        list,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取地址列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取地址列表失败'
    });
  }
});

// 删除地址
router.delete('/addresses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Database.delete('address', 'id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '地址不存在'
      });
    }
    
    res.json({
      success: true,
      message: '地址删除成功'
    });
  } catch (error) {
    console.error('删除地址错误:', error);
    res.status(500).json({
      success: false,
      message: '删除地址失败'
    });
  }
});

// ============ 优惠券管理 ============

// 获取优惠券列表
router.get('/coupons', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const result = await Database.paginate('coupon', page, limit, '1=1', [], 'create_time DESC');

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取优惠券列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取优惠券列表失败'
    });
  }
});

// 新增优惠券
router.post('/coupons', async (req, res) => {
  try {
    const couponData = req.body;
    
    // 验证必要字段
    const { name, amount, min_amount, start_time, end_time, total } = couponData;
    if (!name || !amount || !min_amount || !start_time || !end_time || !total) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的优惠券信息'
      });
    }
    
    const data = {
      ...couponData,
      create_time: new Date()
    };
    
    const result = await Database.insert('coupon', data);
    
    res.json({
      success: true,
      message: '优惠券新增成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('新增优惠券错误:', error);
    res.status(500).json({
      success: false,
      message: '新增优惠券失败'
    });
  }
});

// 删除优惠券
router.delete('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Database.delete('coupon', 'id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '优惠券不存在'
      });
    }
    
    res.json({
      success: true,
      message: '优惠券删除成功'
    });
  } catch (error) {
    console.error('删除优惠券错误:', error);
    res.status(500).json({
      success: false,
      message: '删除优惠券失败'
    });
  }
});

// ============ 推荐商品管理 ============

// 获取推荐商品列表
router.get('/recommend-products', async (req, res) => {
  try {
    const sql = `
      SELECT r.*, g.name as goods_name, g.price as goods_price, g.image as goods_image
      FROM recommend r
      LEFT JOIN goods g ON r.goods_id = g.id
      ORDER BY r.sort ASC, r.id ASC
    `;
    
    const list = await Database.query(sql);

    res.json({
      success: true,
      data: list
    });
  } catch (error) {
    console.error('获取推荐商品列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐商品列表失败'
    });
  }
});

// 新增推荐商品
router.post('/recommend-products', async (req, res) => {
  try {
    const { goods_id, type = 1, sort = 0 } = req.body;
    
    if (!goods_id) {
      return res.status(400).json({
        success: false,
        message: '请选择商品'
      });
    }
    
    const data = {
      goods_id,
      type,
      sort,
      create_time: new Date()
    };
    
    const result = await Database.insert('recommend', data);
    
    res.json({
      success: true,
      message: '推荐商品新增成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('新增推荐商品错误:', error);
    res.status(500).json({
      success: false,
      message: '新增推荐商品失败'
    });
  }
});

// 删除推荐商品
router.delete('/recommend-products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Database.delete('recommend', 'id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '推荐商品不存在'
      });
    }
    
    res.json({
      success: true,
      message: '推荐商品删除成功'
    });
  } catch (error) {
    console.error('删除推荐商品错误:', error);
    res.status(500).json({
      success: false,
      message: '删除推荐商品失败'
    });
  }
});

// ============ 评价管理 ============

// 获取评价列表
router.get('/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 20, goods_id } = req.query;
    
    let where = '1=1';
    let whereParams = [];

    if (goods_id) {
      where += ' AND c.goods_id = ?';
      whereParams.push(goods_id);
    }

    const sql = `
      SELECT c.*, u.nickname as user_name, g.name as goods_name
      FROM comment c
      LEFT JOIN user u ON c.user_id = u.id
      LEFT JOIN goods g ON c.goods_id = g.id
      WHERE ${where}
      ORDER BY c.create_time DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) as total
      FROM comment c
      WHERE ${where}
    `;

    const offset = (page - 1) * limit;
    const [list, countResult] = await Promise.all([
      Database.query(sql, [...whereParams, limit, offset]),
      Database.query(countSql, whereParams)
    ]);

    res.json({
      success: true,
      data: {
        list,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取评价列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取评价列表失败'
    });
  }
});

// 删除评价
router.delete('/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Database.delete('comment', 'id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '评价不存在'
      });
    }
    
    res.json({
      success: true,
      message: '评价删除成功'
    });
  } catch (error) {
    console.error('删除评价错误:', error);
    res.status(500).json({
      success: false,
      message: '删除评价失败'
    });
  }
});

// ============ 售后管理 ============

// 获取售后申请列表
router.get('/aftersales', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    let where = '1=1';
    let whereParams = [];

    if (status !== undefined && status !== '') {
      where += ' AND a.status = ?';
      whereParams.push(status);
    }

    const sql = `
      SELECT a.*, u.nickname as user_name, o.order_no
      FROM aftersale a
      LEFT JOIN user u ON a.user_id = u.id
      LEFT JOIN \`order\` o ON a.order_id = o.id
      WHERE ${where}
      ORDER BY a.create_time DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) as total
      FROM aftersale a
      WHERE ${where}
    `;

    const offset = (page - 1) * limit;
    const [list, countResult] = await Promise.all([
      Database.query(sql, [...whereParams, limit, offset]),
      Database.query(countSql, whereParams)
    ]);

    res.json({
      success: true,
      data: {
        list,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取售后申请列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取售后申请列表失败'
    });
  }
});

// 处理售后申请
router.patch('/aftersales/:id/process', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark = '' } = req.body;
    
    if (status === undefined) {
      return res.status(400).json({
        success: false,
        message: '请指定处理状态'
      });
    }
    
    const updateData = {
      status,
      admin_remark: remark,
      update_time: new Date()
    };
    
    const result = await Database.update('aftersale', updateData, 'id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '售后申请不存在'
      });
    }
    
    res.json({
      success: true,
      message: '处理成功'
    });
  } catch (error) {
    console.error('处理售后申请错误:', error);
    res.status(500).json({
      success: false,
      message: '处理失败'
    });
  }
});

module.exports = router; 