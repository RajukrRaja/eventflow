const { Sequelize } = require('sequelize');
require('dotenv').config();

const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_HOST', 'DB_PORT'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is not defined in .env file`);
  }
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = { sequelize };