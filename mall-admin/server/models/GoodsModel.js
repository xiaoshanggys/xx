const Database = require('../utils/database');

class GoodsModel {
  // 获取商品列表（带分页和筛选）
  static async getList(options = {}) {
    const {
      page = 1,
      limit = 20,
      keyword = '',
      category_id = '',
      status = ''
    } = options;

    let where = '1=1';
    let whereParams = [];

    // 关键词搜索
    if (keyword) {
      where += ' AND name LIKE ?';
      whereParams.push(`%${keyword}%`);
    }

    // 分类筛选
    if (category_id) {
      where += ' AND category_id = ?';
      whereParams.push(category_id);
    }

    // 状态筛选
    if (status !== '') {
      where += ' AND status = ?';
      whereParams.push(status);
    }

    return await Database.paginate('goods', page, limit, where, whereParams, 'create_time DESC');
  }

  // 根据ID获取商品详情
  static async findById(id) {
    const sql = `
      SELECT g.*, c.name as category_name 
      FROM goods g 
      LEFT JOIN category c ON g.category_id = c.id 
      WHERE g.id = ?
    `;
    const rows = await Database.query(sql, [id]);
    return rows[0] || null;
  }

  // 创建商品
  static async create(goodsData) {
    const data = {
      ...goodsData,
      create_time: new Date(),
      update_time: new Date()
    };

    return await Database.insert('goods', data);
  }

  // 更新商品
  static async update(id, goodsData) {
    const updateData = {
      ...goodsData,
      update_time: new Date()
    };

    return await Database.update('goods', updateData, 'id = ?', [id]);
  }

  // 删除商品
  static async delete(id) {
    return await Database.delete('goods', 'id = ?', [id]);
  }

  // 批量删除商品
  static async batchDelete(ids) {
    if (!ids || ids.length === 0) {
      throw new Error('请选择要删除的商品');
    }

    const placeholders = ids.map(() => '?').join(', ');
    const sql = `DELETE FROM goods WHERE id IN (${placeholders})`;
    
    return await Database.query(sql, ids);
  }

  // 更新商品状态
  static async updateStatus(id, status) {
    return await Database.update('goods', { status, update_time: new Date() }, 'id = ?', [id]);
  }

  // 批量更新商品状态
  static async batchUpdateStatus(ids, status) {
    if (!ids || ids.length === 0) {
      throw new Error('请选择要操作的商品');
    }

    const placeholders = ids.map(() => '?').join(', ');
    const sql = `UPDATE goods SET status = ?, update_time = ? WHERE id IN (${placeholders})`;
    
    return await Database.query(sql, [status, new Date(), ...ids]);
  }

  // 获取商品统计数据
  static async getStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as on_sale,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as off_sale,
        SUM(CASE WHEN stock <= 10 THEN 1 ELSE 0 END) as low_stock
      FROM goods
    `;
    
    const rows = await Database.query(sql);
    return rows[0];
  }

  // 获取热销商品
  static async getHotGoods(limit = 10) {
    const sql = `
      SELECT g.*, SUM(oi.quantity) as sales_count
      FROM goods g
      LEFT JOIN order_item oi ON g.id = oi.goods_id
      WHERE g.status = 1
      GROUP BY g.id
      ORDER BY sales_count DESC
      LIMIT ?
    `;
    
    return await Database.query(sql, [limit]);
  }

  // 获取库存预警商品
  static async getLowStockGoods(threshold = 10) {
    return await Database.findMany('goods', 'stock <= ? AND status = 1', [threshold]);
  }

  // 按分类统计商品数量
  static async getCountByCategory() {
    const sql = `
      SELECT c.name as category_name, COUNT(g.id) as count
      FROM category c
      LEFT JOIN goods g ON c.id = g.category_id
      GROUP BY c.id, c.name
    `;
    
    return await Database.query(sql);
  }
}

module.exports = GoodsModel; 