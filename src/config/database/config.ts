module.exports = {
  development: {
    username: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    host: process.env.DB_HOST || '',
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
  },  
  "production.local": {
    username: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    host: process.env.DB_HOST || '',
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
  },
  "production.remote": {
    username: 'capif',
    password: 'AVNS_m5s92DY-5-Tq_pyZ3VS',
    database: 'capif_db',
    host: 'db-postgresql-nyc3-29774-do-user-19004890-0.k.db.ondigitalocean.com',
    port: 25060,
    dialect: 'postgres',
    dialectOptions: {
      timezone: process.env.TZ,
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};