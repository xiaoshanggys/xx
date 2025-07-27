const path = require('path');

const env = process.env.NODE_ENV || 'development';

const baseConfig = {
  server: {
    port: process.env.PORT || 3000
  },
  session: {
    secret: process.env.SESSION_SECRET || 'mall-admin-secret-key-change-in-production'
  },
  upload: {
    path: path.join(__dirname, '../../uploads'),
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  }
};

const configs = {
  development: {
    ...baseConfig,
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '708090',
      database: process.env.DB_NAME || 'mall',
      connectionLimit: 10
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || '',
      db: 0
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'mall-admin-jwt-secret',
      expiresIn: '24h'
    }
  },
  production: {
    ...baseConfig,
    server: {
      port: process.env.PORT || 8080
    },
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectionLimit: 20
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: 0
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h'
    }
  }
};

module.exports = configs[env]; 