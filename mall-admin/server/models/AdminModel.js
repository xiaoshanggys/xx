const Database = require('../utils/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class AdminModel {
  // 根据用户名查找管理员
  static async findByUsername(username) {
    return await Database.findOne('admin', 'username = ?', [username]);
  }

  // 根据ID查找管理员
  static async findById(id) {
    return await Database.findOne('admin', 'id = ?', [id]);
  }

  // 验证密码（支持MD5和bcrypt两种格式）
  static async verifyPassword(plainPassword, hashedPassword) {
    // 首先检查是否是MD5格式（32位十六进制字符串）
    if (hashedPassword && hashedPassword.length === 32 && /^[a-f0-9]+$/i.test(hashedPassword)) {
      // MD5验证
      const md5Hash = crypto.createHash('md5').update(plainPassword).digest('hex');
      return md5Hash === hashedPassword;
    } else {
      // bcrypt验证
      return await bcrypt.compare(plainPassword, hashedPassword);
    }
  }

  // 创建管理员
  static async create(adminData) {
    const { username, password, role = 'admin' } = adminData;
    
    // 检查用户名是否已存在
    const existingAdmin = await this.findByUsername(username);
    if (existingAdmin) {
      throw new Error('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    const data = {
      username,
      password: hashedPassword,
      role,
      create_time: new Date(),
      update_time: new Date()
    };

    return await Database.insert('admin', data);
  }

  // 更新管理员信息
  static async update(id, adminData) {
    const updateData = { ...adminData };
    
    // 如果包含密码，需要加密
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    updateData.update_time = new Date();

    return await Database.update('admin', updateData, 'id = ?', [id]);
  }

  // 删除管理员
  static async delete(id) {
    return await Database.delete('admin', 'id = ?', [id]);
  }

  // 获取管理员列表
  static async getList(page = 1, limit = 20) {
    return await Database.paginate('admin', page, limit, '1=1', [], 'create_time DESC');
  }
}

module.exports = AdminModel; 