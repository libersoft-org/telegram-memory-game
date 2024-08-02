const crypto = require('crypto');
const Data = require('./data.js');
const Common = require('./common.js').Common;

class API {
 constructor() {
  this.board = null; // MOCKUP BOARD FOR ALL USERS THE SAME, DELETE IT WHEN NOT NEEDED ANYMORE
  this.game_score = 0; // MOCKUP SCORE OF THE CURRENT GAME, FOR ALL USERS THE SAME, DELETE IT WHEN NOT NEEDED ANYMORE
  this.total_score = 0; // MOCKUP TOTAL SCORE, FOR ALL USERS THE SAME, DELETE IT WHEN NOT NEEDED ANYMORE

  this.data = new Data();
  this.apiMethods = {
   login: this.login,
   get_score: this.getScore,
   get_game: this.getGame,
   cancel_game: this.cancelGame,
   get_flip: this.getFlip
  };
 }

 async processAPI(name, params) {
  //console.log('API request: ', name);
  //console.log('Parameters: ', params);
  const method = this.apiMethods[name];
  if (method) return await method.call(this, params);
  else return { error: 1, message: 'API not found' };
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
   try {
    await this.data.login(resData.user.id, resData.user.username, resData.user.first_name, resData.user.last_name, resData.user.language_code, resData.user.is_premium == true ? true : false, resData.user.allows_write_to_pm == true ? true : false, resData.query_id, resData.auth_date);
    return { error: 0, data: resData };
   } catch {
    return { error: 2, data: 'Database error' };
   }
  } else {
   return { error: 1, message: 'User verification failed' };
  }
 }

 async getScore() {
  // MOCKUP ONLY!
  return { error: 0, data: { score: 123456 } };
 }

 getGame() {
  // USES MOCKUP ONLY!
  if (this.board === null) {
   // START A NEW GAME
   const board = [];
   for (let i = 0; i <= 10; i++) {
    board.push({ item: i, flipped: false });
    board.push({ item: i, flipped: false });
   }
   for (let i = board.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [board[i], board[j]] = [board[j], board[i]];
   }
   this.board = board;
   return {
    error: 0,
    data: {
     resume: false,
     message: 'New game started' // delete this?
    }
   };
  } else {
   // RESUME THE OLD GAME
   flipped = [];
   for (let i = 0; i < this.board.length; i++) {
    // get already flipped items
    if (this.board[i].flipped) flipped.push({ id: i, item: this.board[i].item });
   }
   return {
    error: 0,
    data: {
     resume: true,
     flipped: flipped,
     score: this.game_score
    }
   };
  }
 }

 cancelGame() {
  // USES MOCKUP ONLY!
  if (this.board === null) return { error: 1, message: 'The game has not started yet.' };
  this.game_score = 0;
  this.board = null;
  return { error: 0, data: { message: 'Game canceled' } };
 }

 getFlip() {
  // USES MOCKUP ONLY!
  if (this.board === null) return { error: 1, message: 'The game has not started yet.' };
  // check if we get 2 cards IDs
  // check if these 2 cards exist in array
  // check if these 2 cards are not flipped yet
  // -1 score for bad guess
  // +5 score for good guess
 }
}

module.exports = API;
