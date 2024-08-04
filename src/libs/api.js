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
   login: { method: this.login, reqSession: false, reqUser: false },
   reset_game: { method: this.resetGame, reqSession: true, reqUser: true },
   get_game: { method: this.getGame, reqSession: true, reqUser: true },
   flip_cards: { method: this.flipCards, reqSession: true, reqUser: true },
   get_score: { method: this.getScore, reqSession: true, reqUser: true },
   get_highscore: { method: this.getHighScore, reqSession: false, reqUser: false }
  };
 }

 async processAPI(name, params) {
  console.log('API request: ', name);
  console.log('Parameters: ', params);
  const apiMethod = this.apiMethods[name];
  if (!apiMethod) return { error: 900, message: 'API not found' };
  if (apiMethod.reqSession) {
   const res = await this.validateSession(params.session);
   if (res.error) return res;
  }
  if (apiMethod.reqUser) {
   const res = await this.validateUser(params.session);
   if (res.error) return res;
   params.user_id = res;
  }
  return await apiMethod.method.call(this, params);
 }

 async login(p = {}) {
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
  const game = this.getGameObject(p.user_id);
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
  const game = this.getGameObject(p.user_id);
  const res = game.flipCards(p.cards);
  switch (res) {
   case 1:
    return { error: 1, message: 'Invalid number of cards' };
   case 2:
    return { error: 2, message: 'Card already found' };
   default:
    const finished = game.isGameFinished();
    if (finished) {
     await this.data.setResult(p.user_id, game.score);
     if (game.score > 0) {
      await this.data.setTransaction(p.user_id, game.score, 'Finished game');
      await this.data.setScore(p.user_id, game.score);
     }
    }
    return { error: 0, data: { cards: res, score: game.score, finished: finished } };
  }
 }

 async getScore(p) {
  const res = await this.data.getScore(p.user_id);
  return { error: 0, data: { score: res[0].score } };
 }

 async getHighScore(p) {
  const res = await this.data.getHighScore();
  console.log(res);
  return res;
 }

 async validateSession(session) {
  const isValid = await this.checkSession(session);
  if (!isValid) return { error: 901, message: 'Session expired' };
  return true;
 }

 async validateUser(session) {
  const user_id = await this.getUserBySession(session);
  if (!user_id) return { error: 902, message: 'Cannot find user in database' };
  return user_id;
 }

 async getUserBySession(session) {
  return await this.data.getUserBySession(session);
 }

 async checkSession(session) {
  return await this.data.checkSession(session);
 }
}

module.exports = API;
