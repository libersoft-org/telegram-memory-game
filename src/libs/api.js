const crypto = require('crypto');
const Data = require('./data.js');
const Common = require('./common.js').Common;
const Game = require('./game.js');

class API {
 constructor() {
  this.games = {};
  this.data = new Data();
  setInterval(async () => {
   const res = await this.data.delOldSessions();
   Common.addLog('Expired sessions cleaner: ' + res.changes + ' sessions deleted.');
  }, Common.settings.other.sessions_update * 1000);
  this.apiMethods = {
   login: this.login,
   reset_game: this.resetGame,
   get_game: this.getGame,
   flip_cards: this.flipCards,
   get_score: this.getScore,
   get_highscore: this.getHighScore
  };
 }

 async processAPI(name, params) {
  console.log('API request: ', name);
  console.log('Parameters: ', params);
  const method = this.apiMethods[name];
  if (method) return await method.call(this, params);
  else return { error: 900, message: 'API not found' };
 }

 async login(p = {}) {
  // doesn't require session, doesn't require user_id
  const parsedData = new URLSearchParams(p.data);
  const hash = parsedData.get('hash');
  parsedData.delete('hash');
  const dataCheckString = Array.from(parsedData.entries())
   .sort((a, b) => a[0].localeCompare(b[0]))
   .map(entry => `${entry[0]}=${entry[1]}`)
   .join('\n');
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(Common.settings.other.bot_token).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  if (calculatedHash === hash) {
   let resData = Object.fromEntries(parsedData);
   resData.user = JSON.parse(resData.user);
   const sessionID = await this.data.login(resData.user.id, resData.user.username, resData.user.first_name, resData.user.last_name, resData.user.language_code, resData.user.is_premium == true ? true : false, resData.user.allows_write_to_pm == true ? true : false, resData.query_id, resData.auth_date);
   return { error: 0, data: { telegram: resData, session: sessionID } };
  } else {
   return { error: 1, message: 'User verification failed' };
  }
 }

 async resetGame(p) {
  if (!this.checkSession(p.session)) return { error: 901, message: 'Session expired' };
  const user_id = await this.getUserBySession(p.session);
  if (!user_id) return { error: 902, message: 'Cannot find user in database' };

  const game = this.getGameObject(user_id);
  game.reset();
  return {
   error: 0,
   data: {
    message: 'New game started'
   }
  };
 }

 getGameObject(user_id) {
  if (!this.games[user_id]) this.games[user_id] = new Game();
  return this.games[user_id];
 }

 getGame(p) {
  const game = this.getGameObject(p.user_id);
  return { error: 0, data: { score: game.score, cards: game.getFound() } };
 }

 async flipCards(p) {
  if (!this.checkSession(p.session)) return { error: 901, message: 'Session expired' };
  const user_id = await this.getUserBySession(p.session);
  if (!user_id) return { error: 902, message: 'Cannot find user in database' };

  const game = this.getGameObject(user_id);
  const res = game.flipCards(p.cards);
  switch (res) {
   case 1:
    return { error: 1, message: 'Invalid number of cards' };
   case 2:
    return { error: 2, message: 'Card already found' };
   default:
    const finished = game.isGameFinished();
    if (finished && game.score > 0) await this.data.setScore(user_id, game.score);
    return { error: 0, data: { cards: res, score: game.score, finished: finished } };
  }
 }

 async getScore(p) {
  if (!this.checkSession(p.session)) return { error: 901, message: 'Session expired' };
  const user_id = await this.getUserBySession(p.session);
  if (!user_id) return { error: 902, message: 'Cannot find user in database' };

  const res = await this.data.getScore(user_id[0].id_users);
  return { error: 0, data: { score: res[0].score } };
 }

 async getHighScore(p) {
  // doesn't require session, doesn't require user_id
  const res = await this.data.getHighScore();
  console.log(res);
  return res;
 }

 async getUserBySession(session) {
  const res = await this.data.getUserBySession(session);
  console.log(res);
  return res;
 }

 async checkSession(session) {
  const res = await this.data.checkSession(session);
  console.log(res);
  return res;
 }
}

module.exports = API;
