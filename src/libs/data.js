const Database = require('./database.js');
const Common = require('./common.js').Common;

class Data {
 constructor() {
  this.db = new Database();
  setInterval(async () => {
   Common.addLog('Deleting old sessions ...');
   await this.db.write('DELETE FROM users_sessions WHERE last < DATETIME("now", ?)', [`-${Common.settings.other.sessions_life} SECONDS`]);
  }, Common.settings.other.sessions_update * 1000);
 }

 async createDB() {
  try {
   await this.db.write('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, tg_id INTEGER NOT NULL UNIQUE, tg_username VARCHAR(128) NULL, tg_firstname VARCHAR(128) NULL, tg_lastname VARCHAR(128) NULL, tg_language VARCHAR(2) NULL, tg_premium BOOL NULL, tg_pm BOOL NULL, score INTEGER NOT NULL DEFAULT 0, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
   await this.db.write('CREATE TABLE IF NOT EXISTS users_logins (id INTEGER PRIMARY KEY AUTOINCREMENT, id_users INTEGER, tg_query VARCHAR(128) NULL, tg_time INTEGER NULL, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (id_users) REFERENCES users(id))');
   await this.db.write('CREATE TABLE IF NOT EXISTS users_games (id INTEGER PRIMARY KEY AUTOINCREMENT, id_users INTEGER, score INTEGER NOT NULL, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (id_users) REFERENCES users(id))');
   await this.db.write('CREATE TABLE IF NOT EXISTS users_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, id_users INTEGER, session VARCHAR(255) NOT NULL UNIQUE, last TIMESTAMP DEFAULT CURRENT_TIMESTAMP, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (id_users) REFERENCES users(id))');
  } catch (ex) {
   Common.addLog(ex, 2);
   process.exit(1);
  }
 }

 async setSession(sessionID) {
  const res = await this.db.query('SELECT COUNT(*) AS cnt FROM users_sessions WHERE session = ?', [sessionID]);
  if (res[0].cnt === 0) return false;
  await this.db.write('UPDATE users_sessions SET last = NOW() WHERE session = ?', [sessionID]);
  return true;
 }

 async login(tg_id, tg_username, tg_firstname, tg_lastname, tg_language, tg_premium, tg_pm, tg_query, tg_time) {
  const res = await this.db.read('SELECT id, tg_id, tg_username, tg_firstname, tg_lastname, tg_language, tg_premium, tg_pm FROM users WHERE tg_id = ?', [tg_id]);
  if (res.length === 0) {
   Common.addLog('Adding new user with Telegram ID: ' + tg_id + ' to database.');
   await this.db.write('INSERT INTO users (tg_id, tg_username, tg_firstname, tg_lastname, tg_language, tg_premium, tg_pm) VALUES (?, ?, ?, ?, ?, ?, ?)', [tg_id, tg_username, tg_firstname, tg_lastname, tg_language, tg_premium, tg_pm]);
  }
  const res2 = await this.db.read('SELECT id FROM users WHERE tg_id = ?', [tg_id]);
  Common.addLog('User with Telegram ID: ' + tg_id + ' logged in.');
  await this.db.write('INSERT INTO users_logins(id_users, tg_query, tg_time) VALUES (?, ?, ?)', [res2[0].id, tg_query, tg_time]);

  const sessionID = crypto.randomBytes(16).toString('hex') + Date.now().toString(16);
  await this.db.write('INSERT INTO users_sessions (user_id, session, last) VALUES (?, ?, ?)', [res2[0].id, sessionID, new Date()]);
  return sessionID;
 }

 async getScore(id) {
  const res = await this.db.read('SELECT score FROM users WHERE id = ?', [id]);
  return res;
 }

 async setScore(id, points) {
  const res = getScore(id);
  console.log(res);
  console.log('ADD: ' + points);
 }
}

module.exports = Data;
