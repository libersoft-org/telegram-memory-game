const crypto = require('crypto');
const Data = require('./data.js');
const Common = require('./common.js').Common;
const Game = require('./game.js');

class API {
 constructor() {
  this.games = {};
  this.data = new Data();
  this.apiMethods = {
   login: this.login,
   reset_game: this.resetGame,
   get_game: this.getGame,
   flip_cards: this.flipCards,
   get_score: this.getScore
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

 resetGame(p) {
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
    if (finished && game.score > 0) await data.setScore(p.user_id, game.score);
    return { error: 0, data: { cards: res, score: game.score, finished: finished } };
  }
 }

 async getScore(p) {
  console.log(p.session);
  const res = await this.getUserBySession(p.session);
  console.log(res);

  //const res = await this.data.getScore(p.user_id);
  //return { error: 0, data: { score: res[0].score } };
 }

 async getUserBySession(session) {
  const userID = await this.data.getUserBySession(session);
  // TODO: if !userID (session doesn't exist), then login again and give user his new session ID, then return userID
  console.log('EXPIROVALA SESSION, INFORMUJU UZIVATELE');
  if (!userID) return { error: 901, message: 'Session expired' };
 }
}

module.exports = API;
