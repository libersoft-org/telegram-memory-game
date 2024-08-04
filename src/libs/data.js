const crypto = require('crypto');
const Database = require('./database.js');
const Common = require('./common.js').Common;

class Data {
 constructor() {
  this.db = new Database();
 }

 async createDB() {
  try {
   await this.db.write('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, tg_id INTEGER NOT NULL UNIQUE, tg_username VARCHAR(128) NULL, tg_firstname VARCHAR(128) NULL, tg_lastname VARCHAR(128) NULL, tg_language VARCHAR(2) NULL, tg_premium BOOL NULL, tg_pm BOOL NULL, score INTEGER NOT NULL DEFAULT 0, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
   await this.db.write('CREATE TABLE IF NOT EXISTS users_logins (id INTEGER PRIMARY KEY AUTOINCREMENT, id_users INTEGER, tg_query VARCHAR(128) NULL, tg_time INTEGER NULL, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (id_users) REFERENCES users(id))');
   await this.db.write('CREATE TABLE IF NOT EXISTS users_results (id INTEGER PRIMARY KEY AUTOINCREMENT, id_users INTEGER, amount INTEGER NOT NULL, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (id_users) REFERENCES users(id))');
   await this.db.write('CREATE TABLE IF NOT EXISTS users_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, id_users INTEGER, session VARCHAR(255) NOT NULL UNIQUE, last TIMESTAMP DEFAULT CURRENT_TIMESTAMP, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (id_users) REFERENCES users(id))');
   await this.db.write('CREATE TABLE IF NOT EXISTS users_transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, id_users INTEGER, amount INT NOT NULL, description VARCHAR(255) NOT NULL, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (id_users) REFERENCES users(id))');
  } catch (ex) {
   Common.addLog(ex, 2);
   process.exit(1);
  }
 }

 async delOldSessions() {
  const res = await this.db.write('DELETE FROM users_sessions WHERE last <= DATETIME("now", ?)', [`-${Common.settings.other.sessions_life} SECONDS`]);
  return res;
 }

 async checkSession(sessionID) {
  const res = await this.db.read('SELECT COUNT(*) AS cnt FROM users_sessions WHERE session = ?', [sessionID]);
  if (res[0].cnt === 0) return false;
  await this.db.write('UPDATE users_sessions SET last = CURRENT_TIMESTAMP WHERE session = ?', [sessionID]);
  return true;
 }

 async getUserBySession(sessionID) {
  const res = await this.db.read('SELECT id_users FROM users_sessions WHERE session = ?', [sessionID]);
  if (res.length === 0) return false;
  else return res[0].id_users;
 }

 async login(tg_id, tg_username, tg_firstname, tg_lastname, tg_language, tg_premium, tg_pm, tg_query, tg_time) {
  const res = await this.db.read('SELECT id, tg_id, tg_username, tg_firstname, tg_lastname, tg_language, tg_premium, tg_pm FROM users WHERE tg_id = ?', [tg_id]);
  if (res.length === 0) {
   await this.db.write('INSERT INTO users (tg_id, tg_username, tg_firstname, tg_lastname, tg_language, tg_premium, tg_pm) VALUES (?, ?, ?, ?, ?, ?, ?)', [tg_id, tg_username, tg_firstname, tg_lastname, tg_language, tg_premium, tg_pm]);
   Common.addLog('New user with Telegram ID: ' + tg_id + ' added to database.');
  }
  const res2 = await this.db.read('SELECT id FROM users WHERE tg_id = ?', [tg_id]);
  await this.db.write('INSERT INTO users_logins(id_users, tg_query, tg_time) VALUES (?, ?, ?)', [res2[0].id, tg_query, tg_time]);
  Common.addLog('User with Telegram ID: ' + tg_id + ' logged in.');
  const sessionID = crypto.randomBytes(16).toString('hex') + Date.now().toString(16);
  await this.db.write('INSERT INTO users_sessions (id_users, session) VALUES (?, ?)', [res2[0].id, sessionID]);
  Common.addLog('Session: ' + sessionID + ' for Telegram user: ' + tg_id + ' added to database.');
  return sessionID;
 }

 async getScore(id) {
  return await this.db.read('SELECT score FROM users WHERE id = ?', [id]);
 }

 async setScore(id, amount) {
  await this.db.write('UPDATE users SET score = score + ? WHERE id = ?', [amount, id]);
 }

 async getHighScore(count = 10, offset = 0) {
  return await this.db.read('SELECT tg_firstname, tg_lastname, score FROM users ORDER BY score DESC LIMIT ? OFFSET ?', [count, offset]);
 }

 async getResults(id, count = 10, offset = 0) {
  return await this.db.read('SELECT amount, created FROM users_results WHERE id_users = ? ORDER BY id DESC LIMIT ? OFFSET ?', [id, count, offset]);
 }

 async setResult(id, amount) {
  await this.db.write('INSERT INTO users_results (id_users, amount) VALUES (?, ?)', [id, amount]);
 }

 async getTransactions(id, count = 10, offset = 0) {
  return await this.db.read('SELECT amount, description, created FROM users_transactions WHERE id_users = ? ORDER BY id DESC LIMIT ? OFFSET ?', [id, count, offset]);
 }

 async setTransaction(id, amount, description) {
  await this.db.write('INSERT INTO users_transactions (id_users, amount, description) VALUES (?, ?, ?)', [id, amount, description]);
 }
}

module.exports = Data;
