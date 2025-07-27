const Database = require('../utils/database');

class OrderModel {
  // 获取订单列表（带分页和筛选）
  static async getList(options = {}) {
    const {
      page = 1,
      limit = 20,
      status = '',
      order_no = '',
      start_date = '',
      end_date = ''
    } = options;

    // 确保page和limit是整数
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 20;

    let where = '1=1';
    let whereParams = [];

    // 订单状态筛选
    if (status !== '') {
      where += ' AND o.status = ?';
      whereParams.push(status);
    }

    // 订单号搜索
    if (order_no) {
      where += ' AND o.order_no LIKE ?';
      whereParams.push(`%${order_no}%`);
    }

    // 日期范围筛选
    if (start_date) {
      where += ' AND o.create_time >= ?';
      whereParams.push(start_date);
    }

    if (end_date) {
      where += ' AND o.create_time <= ?';
      whereParams.push(end_date);
    }

    const sql = `
      SELECT o.*, u.nickname as user_name, a.name as receiver_name, a.phone as receiver_phone
      FROM \`order\` o
      LEFT JOIN user u ON o.user_id = u.id
      LEFT JOIN address a ON o.address_id = a.id
      WHERE ${where}
      ORDER BY o.create_time DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) as total
      FROM \`order\` o
      WHERE ${where}
    `;

    const offset = (pageInt - 1) * limitInt;
    const [list, countResult] = await Promise.all([
      Database.query(sql, [...whereParams, limitInt, offset]),
      Database.query(countSql, whereParams)
    ]);

    return {
      list,
      total: countResult[0].total,
      page: pageInt,
      limit: limitInt,
      totalPages: Math.ceil(countResult[0].total / limitInt)
    };
  }

  // 根据ID获取订单详情
  static async findById(id) {
    const sql = `
      SELECT o.*, u.nickname as user_name, u.phone as user_phone,
             a.name as receiver_name, a.phone as receiver_phone,
             a.province, a.city, a.district, a.detail
      FROM \`order\` o
      LEFT JOIN user u ON o.user_id = u.id
      LEFT JOIN address a ON o.address_id = a.id
      WHERE o.id = ?
    `;
    
    const rows = await Database.query(sql, [id]);
    const order = rows[0];
    
    if (order) {
      // 获取订单商品
      const itemSql = `
        SELECT oi.*, g.image as goods_image_current
        FROM order_item oi
        LEFT JOIN goods g ON oi.goods_id = g.id
        WHERE oi.order_id = ?
      `;
      
      order.items = await Database.query(itemSql, [id]);
    }
    
    return order || null;
  }

  // 更新订单状态
  static async updateStatus(id, status, remark = '') {
    const updateData = {
      status,
      update_time: new Date()
    };

    if (remark) {
      updateData.admin_remark = remark;
    }

    return await Database.update('order', updateData, 'id = ?', [id]);
  }

  // 批量更新订单状态
  static async batchUpdateStatus(ids, status) {
    if (!ids || ids.length === 0) {
      throw new Error('请选择要操作的订单');
    }

    const placeholders = ids.map(() => '?').join(', ');
    const sql = `UPDATE \`order\` SET status = ?, update_time = ? WHERE id IN (${placeholders})`;
    
    return await Database.query(sql, [status, new Date(), ...ids]);
  }

  // 获取订单统计数据
  static async getStatistics(dateRange = 'today') {
    let dateCondition = '';
    const today = new Date();
    
    switch (dateRange) {
      case 'today':
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        dateCondition = `AND create_time >= '${todayStart.toISOString()}'`;
        break;
      case 'week':
        const weekStart = new Date(today.setDate(today.getDate() - 7));
        dateCondition = `AND create_time >= '${weekStart.toISOString()}'`;
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        dateCondition = `AND create_time >= '${monthStart.toISOString()}'`;
        break;
    }

    const sql = `
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_amount,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as pending_payment,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as pending_shipment,
        SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) as pending_receipt,
        SUM(CASE WHEN status = 4 THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 5 THEN 1 ELSE 0 END) as cancelled
      FROM \`order\`
      WHERE 1=1 ${dateCondition}
    `;
    
    const rows = await Database.query(sql);
    return rows[0];
  }

  // 获取销售统计（按日期分组）
  static async getSalesStatistics(days = 7) {
    const sql = `
      SELECT 
        DATE(create_time) as date,
        COUNT(*) as order_count,
        SUM(total_amount) as sales_amount
      FROM \`order\`
      WHERE create_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND status IN (3, 4)
      GROUP BY DATE(create_time)
      ORDER BY date ASC
    `;
    
    return await Database.query(sql, [days]);
  }

  // 添加订单备注
  static async addRemark(id, remark) {
    return await Database.update('order', { 
      admin_remark: remark,
      update_time: new Date()
    }, 'id = ?', [id]);
  }

  // 取消订单
  static async cancel(id, reason = '') {
    return await Database.update('order', {
      status: 5, // 已取消
      cancel_reason: reason,
      update_time: new Date()
    }, 'id = ?', [id]);
  }

  // 发货
  static async ship(id, shippingData = {}) {
    const updateData = {
      status: 3, // 待收货
      shipping_company: shippingData.company || '',
      shipping_no: shippingData.no || '',
      ship_time: new Date(),
      update_time: new Date()
    };

    return await Database.update('order', updateData, 'id = ?', [id]);
  }

  // 确认收货
  static async confirmReceipt(id) {
    return await Database.update('order', {
      status: 4, // 已完成
      receipt_time: new Date(),
      update_time: new Date()
    }, 'id = ?', [id]);
  }
}

module.exports = OrderModel; 