// B:\eventflow\backend\models\index.js
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const basename = path.basename(__filename);
const db = {};

console.log('[DEBUG] Scanning models directory:', __dirname);
const files = fs.readdirSync(__dirname);
console.log('[DEBUG] Files found:', files);

files
  .filter((file) => file !== basename && file.endsWith('.js'))
  .forEach((file) => {
    console.log(`[DEBUG] Attempting to load model from: ${file}`);
    try {
      const modelDef = require(path.join(__dirname, file));
      const model = modelDef(sequelize, DataTypes);
      console.log(`[DEBUG] Loaded model: ${model.name}, findOne: ${typeof model.findOne}`);
      db[model.name] = model;
    } catch (error) {
      console.error(`[ERROR] Failed to load model from ${file}:`, error.message, error.stack);
    }
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log('[DEBUG] Exported models:', Object.keys(db));

module.exports = db;