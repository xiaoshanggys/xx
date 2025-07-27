const mysql = require('mysql2/promise');
const config = require('../config');

// 创建数据库连接池
const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  connectionLimit: config.database.connectionLimit,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4'
});

// 数据库操作工具类
class Database {
  // 执行查询
  static async query(sql, params = []) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('数据库查询错误:', error);
      throw error;
    }
  }

  // 插入数据
  static async insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    
    try {
      const [result] = await pool.execute(sql, values);
      return result;
    } catch (error) {
      console.error('数据库插入错误:', error);
      throw error;
    }
  }

  // 更新数据
  static async update(table, data, where, whereParams = []) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
    
    try {
      const [result] = await pool.execute(sql, [...values, ...whereParams]);
      return result;
    } catch (error) {
      console.error('数据库更新错误:', error);
      throw error;
    }
  }

  // 删除数据
  static async delete(table, where, whereParams = []) {
    const sql = `DELETE FROM ${table} WHERE ${where}`;
    
    try {
      const [result] = await pool.execute(sql, whereParams);
      return result;
    } catch (error) {
      console.error('数据库删除错误:', error);
      throw error;
    }
  }

  // 查找单条记录
  static async findOne(table, where, whereParams = []) {
    const sql = `SELECT * FROM ${table} WHERE ${where} LIMIT 1`;
    
    try {
      const rows = await this.query(sql, whereParams);
      return rows[0] || null;
    } catch (error) {
      console.error('数据库查找错误:', error);
      throw error;
    }
  }

  // 查找多条记录
  static async findMany(table, where = '1=1', whereParams = [], options = {}) {
    const { limit, offset, orderBy = 'id DESC' } = options;
    
    let sql = `SELECT * FROM ${table} WHERE ${where}`;
    
    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`;
    }
    
    if (limit) {
      sql += ` LIMIT ${limit}`;
      if (offset) {
        sql += ` OFFSET ${offset}`;
      }
    }
    
    try {
      const rows = await this.query(sql, whereParams);
      return rows;
    } catch (error) {
      console.error('数据库查找错误:', error);
      throw error;
    }
  }

  // 获取记录总数
  static async count(table, where = '1=1', whereParams = []) {
    const sql = `SELECT COUNT(*) as total FROM ${table} WHERE ${where}`;
    
    try {
      const rows = await this.query(sql, whereParams);
      return rows[0].total;
    } catch (error) {
      console.error('数据库计数错误:', error);
      throw error;
    }
  }

  // 分页查询
  static async paginate(table, page = 1, limit = 20, where = '1=1', whereParams = [], orderBy = 'id DESC') {
    const offset = (page - 1) * limit;
    
    // 获取总数
    const total = await this.count(table, where, whereParams);
    
    // 获取数据
    const list = await this.findMany(table, where, whereParams, {
      limit,
      offset,
      orderBy
    });
    
    return {
      list,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  // 开始事务
  static async beginTransaction() {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    return connection;
  }

  // 提交事务
  static async commit(connection) {
    await connection.commit();
    connection.release();
  }

  // 回滚事务
  static async rollback(connection) {
    await connection.rollback();
    connection.release();
  }
}

module.exports = Database; 