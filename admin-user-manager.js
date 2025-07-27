#!/usr/bin/env node
/**
 * 商城管理后台 - 用户管理工具
 * 用于管理MySQL数据库中的admin表用户信息
 * 
 * 使用方法:
 * node admin-user-manager.js
 */

const mysql = require('./mall-admin/node_modules/mysql2/promise');
const crypto = require('crypto');
const readline = require('readline');

// 数据库配置
const DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '708090',
  database: 'mall'
};

class AdminUserManager {
  constructor() {
    this.connection = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  // 连接数据库
  async connect() {
    try {
      this.connection = await mysql.createConnection(DB_CONFIG);
      console.log('✅ 数据库连接成功！');
      return true;
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return false;
    }
  }

  // 断开数据库连接
  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('📴 数据库连接已断开');
    }
    this.rl.close();
  }

  // MD5加密密码
  hashPassword(password) {
    return crypto.createHash('md5').update(password).digest('hex');
  }

  // 获取用户输入
  async getUserInput(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  // 查看所有用户
  async listAllUsers() {
    try {
      const [users] = await this.connection.execute(
        'SELECT id, username, role, create_time, update_time FROM admin ORDER BY id'
      );

      if (users.length === 0) {
        console.log('📋 admin表中没有用户');
        return;
      }

      console.log('\n📋 admin表中的所有用户:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('ID\t用户名\t\t角色\t\t创建时间');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      users.forEach(user => {
        const createTime = new Date(user.create_time).toLocaleString('zh-CN');
        console.log(`${user.id}\t${user.username.padEnd(12)}\t${user.role}\t\t${createTime}`);
      });

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`\n总计: ${users.length} 个用户\n`);

    } catch (error) {
      console.error('❌ 查询用户失败:', error.message);
    }
  }

  // 查看特定用户信息
  async viewUser() {
    try {
      const username = await this.getUserInput('请输入要查看的用户名: ');
      
      if (!username) {
        console.log('⚠️  用户名不能为空');
        return;
      }

      const [users] = await this.connection.execute(
        'SELECT * FROM admin WHERE username = ?', 
        [username]
      );

      if (users.length === 0) {
        console.log(`❌ 未找到用户 "${username}"`);
        return;
      }

      const user = users[0];
      console.log('\n👤 用户详细信息:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`ID: ${user.id}`);
      console.log(`用户名: ${user.username}`);
      console.log(`密码哈希: ${user.password}`);
      console.log(`角色: ${user.role}`);
      console.log(`创建时间: ${new Date(user.create_time).toLocaleString('zh-CN')}`);
      console.log(`更新时间: ${new Date(user.update_time).toLocaleString('zh-CN')}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
      console.error('❌ 查看用户失败:', error.message);
    }
  }

  // 添加用户
  async addUser() {
    try {
      console.log('\n➕ 添加新用户');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const username = await this.getUserInput('请输入用户名: ');
      if (!username) {
        console.log('⚠️  用户名不能为空');
        return;
      }

      // 检查用户是否已存在
      const [existing] = await this.connection.execute(
        'SELECT username FROM admin WHERE username = ?', 
        [username]
      );

      if (existing.length > 0) {
        console.log(`❌ 用户 "${username}" 已存在`);
        return;
      }

      const password = await this.getUserInput('请输入密码: ');
      if (!password) {
        console.log('⚠️  密码不能为空');
        return;
      }

      const role = await this.getUserInput('请输入角色 (默认: admin): ') || 'admin';

      // 加密密码并插入用户
      const hashedPassword = this.hashPassword(password);
      
      const [result] = await this.connection.execute(
        'INSERT INTO admin (username, password, role, create_time, update_time) VALUES (?, ?, ?, NOW(), NOW())',
        [username, hashedPassword, role]
      );

      console.log(`✅ 用户 "${username}" 添加成功！`);
      console.log(`   用户ID: ${result.insertId}`);
      console.log(`   用户名: ${username}`);
      console.log(`   密码: ${password}`);
      console.log(`   角色: ${role}`);
      console.log(`   MD5哈希: ${hashedPassword}\n`);

    } catch (error) {
      console.error('❌ 添加用户失败:', error.message);
    }
  }

  // 修改用户密码
  async changePassword() {
    try {
      console.log('\n🔑 修改用户密码');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const username = await this.getUserInput('请输入要修改密码的用户名: ');
      if (!username) {
        console.log('⚠️  用户名不能为空');
        return;
      }

      // 检查用户是否存在
      const [users] = await this.connection.execute(
        'SELECT username FROM admin WHERE username = ?', 
        [username]
      );

      if (users.length === 0) {
        console.log(`❌ 用户 "${username}" 不存在`);
        return;
      }

      const newPassword = await this.getUserInput('请输入新密码: ');
      if (!newPassword) {
        console.log('⚠️  新密码不能为空');
        return;
      }

      // 加密新密码并更新
      const hashedPassword = this.hashPassword(newPassword);
      
      const [result] = await this.connection.execute(
        'UPDATE admin SET password = ?, update_time = NOW() WHERE username = ?',
        [hashedPassword, username]
      );

      if (result.affectedRows > 0) {
        console.log(`✅ 用户 "${username}" 的密码修改成功！`);
        console.log(`   新密码: ${newPassword}`);
        console.log(`   MD5哈希: ${hashedPassword}\n`);
      } else {
        console.log('❌ 密码修改失败');
      }

    } catch (error) {
      console.error('❌ 修改密码失败:', error.message);
    }
  }

  // 修改用户角色
  async changeRole() {
    try {
      console.log('\n👨‍💼 修改用户角色');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const username = await this.getUserInput('请输入要修改角色的用户名: ');
      if (!username) {
        console.log('⚠️  用户名不能为空');
        return;
      }

      // 检查用户是否存在并显示当前角色
      const [users] = await this.connection.execute(
        'SELECT username, role FROM admin WHERE username = ?', 
        [username]
      );

      if (users.length === 0) {
        console.log(`❌ 用户 "${username}" 不存在`);
        return;
      }

      const currentRole = users[0].role;
      console.log(`当前角色: ${currentRole}`);

      const newRole = await this.getUserInput('请输入新角色: ');
      if (!newRole) {
        console.log('⚠️  新角色不能为空');
        return;
      }

      const [result] = await this.connection.execute(
        'UPDATE admin SET role = ?, update_time = NOW() WHERE username = ?',
        [newRole, username]
      );

      if (result.affectedRows > 0) {
        console.log(`✅ 用户 "${username}" 的角色修改成功！`);
        console.log(`   旧角色: ${currentRole} → 新角色: ${newRole}\n`);
      } else {
        console.log('❌ 角色修改失败');
      }

    } catch (error) {
      console.error('❌ 修改角色失败:', error.message);
    }
  }

  // 删除用户
  async deleteUser() {
    try {
      console.log('\n🗑️  删除用户');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const username = await this.getUserInput('请输入要删除的用户名: ');
      if (!username) {
        console.log('⚠️  用户名不能为空');
        return;
      }

      // 检查用户是否存在
      const [users] = await this.connection.execute(
        'SELECT username, role FROM admin WHERE username = ?', 
        [username]
      );

      if (users.length === 0) {
        console.log(`❌ 用户 "${username}" 不存在`);
        return;
      }

      const user = users[0];
      console.log(`⚠️  即将删除用户: ${user.username} (${user.role})`);
      
      const confirm = await this.getUserInput('确认删除？输入 "yes" 确认: ');
      if (confirm.toLowerCase() !== 'yes') {
        console.log('❌ 删除操作已取消');
        return;
      }

      const [result] = await this.connection.execute(
        'DELETE FROM admin WHERE username = ?', 
        [username]
      );

      if (result.affectedRows > 0) {
        console.log(`✅ 用户 "${username}" 删除成功！\n`);
      } else {
        console.log('❌ 删除用户失败');
      }

    } catch (error) {
      console.error('❌ 删除用户失败:', error.message);
    }
  }

  // 批量创建测试用户
  async createTestUsers() {
    try {
      console.log('\n🧪 批量创建测试用户');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const testUsers = [
        { username: 'test1', password: 'test1', role: 'admin' },
        { username: 'test2', password: 'test2', role: 'admin' },
        { username: 'test3', password: 'test3', role: 'admin' }
      ];

      console.log('即将创建以下测试用户:');
      testUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} / ${user.password} (${user.role})`);
      });

      const confirm = await this.getUserInput('\n确认创建？输入 "yes" 确认: ');
      if (confirm.toLowerCase() !== 'yes') {
        console.log('❌ 创建操作已取消');
        return;
      }

      let successCount = 0;
      for (const user of testUsers) {
        try {
          // 检查用户是否已存在
          const [existing] = await this.connection.execute(
            'SELECT username FROM admin WHERE username = ?', 
            [user.username]
          );

          if (existing.length > 0) {
            console.log(`⚠️  用户 ${user.username} 已存在，跳过`);
            continue;
          }

          const hashedPassword = this.hashPassword(user.password);
          await this.connection.execute(
            'INSERT INTO admin (username, password, role, create_time, update_time) VALUES (?, ?, ?, NOW(), NOW())',
            [user.username, hashedPassword, user.role]
          );

          console.log(`✅ 创建用户 ${user.username} 成功`);
          successCount++;

        } catch (error) {
          console.log(`❌ 创建用户 ${user.username} 失败: ${error.message}`);
        }
      }

      console.log(`\n🎉 批量创建完成！成功创建 ${successCount} 个用户\n`);

    } catch (error) {
      console.error('❌ 批量创建失败:', error.message);
    }
  }

  // 显示主菜单
  showMenu() {
    console.log('\n🏪 商城管理后台 - 用户管理工具');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. 📋 查看所有用户');
    console.log('2. 👤 查看特定用户');
    console.log('3. ➕ 添加用户');
    console.log('4. 🔑 修改用户密码');
    console.log('5. 👨‍💼 修改用户角色');
    console.log('6. 🗑️  删除用户');
    console.log('7. 🧪 批量创建测试用户');
    console.log('0. 🚪 退出程序');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  // 主程序循环
  async run() {
    console.log('🚀 启动商城管理后台用户管理工具...\n');

    // 连接数据库
    const connected = await this.connect();
    if (!connected) {
      process.exit(1);
    }

    try {
      while (true) {
        this.showMenu();
        const choice = await this.getUserInput('请选择操作 (0-7): ');

        switch (choice) {
          case '1':
            await this.listAllUsers();
            break;
          case '2':
            await this.viewUser();
            break;
          case '3':
            await this.addUser();
            break;
          case '4':
            await this.changePassword();
            break;
          case '5':
            await this.changeRole();
            break;
          case '6':
            await this.deleteUser();
            break;
          case '7':
            await this.createTestUsers();
            break;
          case '0':
            console.log('\n👋 感谢使用，再见！');
            break;
          default:
            console.log('⚠️  无效的选择，请输入 0-7 之间的数字');
            continue;
        }

        if (choice === '0') break;

        // 询问是否继续
        const continueChoice = await this.getUserInput('\n按 Enter 继续，或输入 "q" 退出: ');
        if (continueChoice.toLowerCase() === 'q') {
          console.log('\n👋 感谢使用，再见！');
          break;
        }
      }
    } finally {
      await this.disconnect();
    }
  }
}

// 运行程序
if (require.main === module) {
  const manager = new AdminUserManager();
  manager.run().catch(console.error);
}

module.exports = AdminUserManager; 