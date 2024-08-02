const Database = require('./database.js');
const Common = require('./common.js').Common;

class Data {
 constructor() {
  this.db = new Database();
 }

 async createDB() {
  try {
   await this.db.write('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, tg_id INTEGER NOT NULL UNIQUE, tg_username VARCHAR(128) NULL, tg_firstname VARCHAR(128) NULL, tg_lastname VARCHAR(128) NULL, tg_language VARCHAR(2) NULL, tg_premium BOOL NULL, tg_pm BOOL NULL, high_score INTEGER, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
   await this.db.write('CREATE TABLE IF NOT EXISTS users_logins (id INTEGER PRIMARY KEY AUTOINCREMENT, id_users INTEGER, tg_query VARCHAR(128) NULL, tg_time INTEGER NULL, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (id_users) REFERENCES users(id))');
  } catch (ex) {
   Common.addLog(ex, 2);
   process.exit(1);
  }
 }

 async login(tg_id, tg_username, tg_firstname, tg_lastname, tg_language, tg_premium, tg_pm, tg_query, tg_time) {
  const res = await this.db.read('SELECT id, tg_id, tg_username, tg_firstname, tg_lastname, tg_language, tg_premium, tg_pm FROM users WHERE tg_id = ?', [tg_id]);
  if (res.length === 0) {
   Common.addLog('Adding new user with ID: ' + tg_id + ' to database.');
   await this.db.write('INSERT INTO users (tg_id, tg_username, tg_firstname, tg_lastname, tg_language, tg_premium, tg_pm) VALUES (?, ?, ?, ?, ?, ?, ?)', [tg_id, tg_username, tg_firstname, tg_lastname, tg_language, tg_premium, tg_pm]);
  }
  const res2 = await this.db.read('SELECT id FROM users WHERE tg_id = ?', [tg_id]);
  Common.addLog('User with tg_ID: ' + tg_id + ' logged in.');
  await this.db.write('INSERT INTO users_logins(id_users, tg_query, tg_time) VALUES (?, ?, ?)', [res2[0].id, tg_query, tg_time]);
 }
}

module.exports = Data;
