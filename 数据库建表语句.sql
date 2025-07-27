-- Active: 1753358434566@@127.0.0.1@3306@mall
-- 创建数据库
CREATE DATABASE IF NOT EXISTS mall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mall;

-- 用户表
CREATE TABLE `user` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  `openid` VARCHAR(64) NOT NULL COMMENT '微信openid',
  `nickname` VARCHAR(64) COMMENT '昵称',
  `avatar` VARCHAR(255) COMMENT '头像',
  `gender` TINYINT COMMENT '性别 0未知 1男 2女',
  `phone` VARCHAR(20) COMMENT '手机号',
  `password` VARCHAR(255) COMMENT '登录密码（加密存储）',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='用户表';

-- 商品表
CREATE TABLE `goods` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '商品ID',
  `name` VARCHAR(128) NOT NULL COMMENT '商品名称',
  `category_id` INT NOT NULL COMMENT '分类ID',
  `image` VARCHAR(255) COMMENT '商品主图',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `stock` INT NOT NULL COMMENT '库存',
  `description` TEXT COMMENT '商品描述',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1上架 0下架',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='商品表';

-- 商品分类表
CREATE TABLE `category` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
  `name` VARCHAR(64) NOT NULL COMMENT '分类名称',
  `parent_id` INT DEFAULT 0 COMMENT '父级分类ID',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='商品分类表';

-- 购物车表
CREATE TABLE `cart` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '购物车ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `goods_id` INT NOT NULL COMMENT '商品ID',
  `quantity` INT NOT NULL COMMENT '商品数量',
  `checked` TINYINT DEFAULT 1 COMMENT '是否选中 1是 0否',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='购物车表';

-- 订单表
CREATE TABLE `order` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '订单ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单编号',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
  `status` TINYINT NOT NULL COMMENT '订单状态',
  `address_id` INT NOT NULL COMMENT '收货地址ID',
  `remark` VARCHAR(255) COMMENT '买家备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='订单表';

-- 订单商品表
CREATE TABLE `order_item` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '订单商品ID',
  `order_id` INT NOT NULL COMMENT '订单ID',
  `goods_id` INT NOT NULL COMMENT '商品ID',
  `goods_name` VARCHAR(128) NOT NULL COMMENT '商品名称',
  `goods_image` VARCHAR(255) COMMENT '商品图片',
  `goods_price` DECIMAL(10,2) NOT NULL COMMENT '商品价格',
  `quantity` INT NOT NULL COMMENT '购买数量'
) COMMENT='订单商品表';

-- 支付记录表
CREATE TABLE `payment` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '支付记录ID',
  `order_id` INT NOT NULL COMMENT '订单ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '支付金额',
  `pay_type` TINYINT NOT NULL COMMENT '支付方式 1微信 2支付宝等',
  `pay_time` DATETIME COMMENT '支付时间',
  `status` TINYINT DEFAULT 0 COMMENT '支付状态 0未支付 1已支付',
  `transaction_no` VARCHAR(64) COMMENT '第三方支付流水号'
) COMMENT='支付记录表';

-- 收货地址表
CREATE TABLE `address` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '地址ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `name` VARCHAR(32) NOT NULL COMMENT '收货人姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '收货人手机号',
  `province` VARCHAR(32) NOT NULL COMMENT '省',
  `city` VARCHAR(32) NOT NULL COMMENT '市',
  `district` VARCHAR(32) NOT NULL COMMENT '区/县',
  `detail` VARCHAR(255) NOT NULL COMMENT '详细地址',
  `is_default` TINYINT DEFAULT 0 COMMENT '是否默认地址 1是 0否',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='收货地址表';

-- 收藏表
CREATE TABLE `favorite` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '收藏ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `goods_id` INT NOT NULL COMMENT '商品ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间'
) COMMENT='收藏表';

-- 评价表
CREATE TABLE `comment` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '评价ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `goods_id` INT NOT NULL COMMENT '商品ID',
  `content` TEXT NOT NULL COMMENT '评价内容',
  `score` TINYINT NOT NULL COMMENT '评分 1-5',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '评价时间'
) COMMENT='评价表';

-- 售后表
CREATE TABLE `aftersale` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '售后ID',
  `order_id` INT NOT NULL COMMENT '订单ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `type` TINYINT NOT NULL COMMENT '售后类型 1退货 2换货 3退款',
  `reason` VARCHAR(255) COMMENT '申请原因',
  `status` TINYINT DEFAULT 0 COMMENT '处理状态 0待处理 1已处理',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='售后表';

-- 优惠券表
CREATE TABLE `coupon` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '优惠券ID',
  `name` VARCHAR(64) NOT NULL COMMENT '优惠券名称',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '优惠金额',
  `min_amount` DECIMAL(10,2) NOT NULL COMMENT '使用门槛',
  `start_time` DATETIME NOT NULL COMMENT '生效时间',
  `end_time` DATETIME NOT NULL COMMENT '失效时间',
  `total` INT NOT NULL COMMENT '发放总量',
  `received` INT DEFAULT 0 COMMENT '已领取数量',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) COMMENT='优惠券表';

-- 轮播图表
CREATE TABLE `banner` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '轮播图ID',
  `image` VARCHAR(255) NOT NULL COMMENT '图片地址',
  `link` VARCHAR(255) COMMENT '跳转链接',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1显示 0隐藏',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) COMMENT='轮播图表';

-- 推荐商品表
CREATE TABLE `recommend` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '推荐ID',
  `goods_id` INT NOT NULL COMMENT '商品ID',
  `type` TINYINT DEFAULT 1 COMMENT '推荐类型 1首页 2个性化',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) COMMENT='推荐商品表';

-- 消息通知表
CREATE TABLE `notify` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '通知ID',
  `user_id` INT COMMENT '用户ID',
  `type` TINYINT DEFAULT 1 COMMENT '通知类型 1系统 2订单',
  `content` VARCHAR(255) NOT NULL COMMENT '通知内容',
  `is_read` TINYINT DEFAULT 0 COMMENT '是否已读 1是 0否',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) COMMENT='消息通知表';

-- 管理员表
CREATE TABLE `admin` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '管理员ID',
  `username` VARCHAR(32) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  `role` VARCHAR(32) DEFAULT 'admin' COMMENT '角色',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='管理员表';

-- 插入管理员账号（密码为admin，密文存储，使用md5加密）
INSERT INTO `admin` (`username`, `password`, `role`) VALUES ('admin', '21232f297a57a5a743894a0e4a801fc3', 'admin');
-- 密码密文为md5加密admin（实际项目建议使用更安全的加密方式） 
-- 新建一个管理员账号，用户名为qqq，密码为qqq（md5加密后为 7694f4a66316e53c8cdd9d9954bd611d）
INSERT INTO `admin` (`username`, `password`, `role`) VALUES ('qqq', '7694f4a66316e53c8cdd9d9954bd611d', 'admin');

