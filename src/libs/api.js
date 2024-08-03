const crypto = require('crypto');
const Data = require('./data.js');
const Common = require('./common.js').Common;
const Game = require('./game.js');

class API {
 constructor() {
  /* one game per user */
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
  //return {error: 0, data: {id: 0}};
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
   await this.data.login(resData.user.id, resData.user.username, resData.user.first_name, resData.user.last_name, resData.user.language_code, resData.user.is_premium == true ? true : false, resData.user.allows_write_to_pm == true ? true : false, resData.query_id, resData.auth_date);
   return { error: 0, data: resData };
  } else {
   return { error: 1, message: 'User verification failed' };
  }
 }

 resetGame(p) {
  let game = this.getGameObject(p.user_id);
  game.lock();
  game.score = 0;
  const num_images = 10;
  game.board = [];
  for (let i = 0; i < num_images; i++) {
   for (let j = 0; j < 2; j++) game.board.push({ image: i, found: false });
  }
  game.board = this.shuffle(game.board);
  game.unlock();
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

 shuffle(array) {
  let currentIndex = array.length,
   randomIndex;
  while (currentIndex != 0) {
   randomIndex = Math.floor(Math.random() * currentIndex);
   currentIndex--;
   [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
 }

 getGame(p) {
  let game = this.getGameObject(p.user_id);
  game.lock();
  let result = { score: game.score, cards: this.visibleBoard(game.board) };
  game.unlock();
  return { error: 0, data: result };
 }

 visibleBoard(board) {
  return board.map(card => {
   if (card.found) return card;
   else return { found: false };
  });
 }

 flipCards(p) {
  let game = this.getGameObject(p.user_id);
  if (game.board.length == 0) return { error: 1, message: 'No game started' };
  game.lock();
  let cards = p.cards;
  if (cards.length !== 2) return { error: 2, message: 'Invalid number of cards' };
  let board = game.board;
  if (board[cards[0]].found || board[cards[1]].found) return { error: 3, message: 'Card already found' };
  if (board[cards[0]].image == board[cards[1]].image) {
   board[cards[0]].found = true;
   board[cards[1]].found = true;
   game.score += 5;
  } else game.score--;
  let result = [];
  result.push({ id: cards[0], image: board[cards[0]].image });
  result.push({ id: cards[1], image: board[cards[1]].image });
  game.unlock();
  return {
   error: 0,
   data: { cards: result, score: game.score }
  };
 }

 getNumFlipped(board) {
  // NOT USED?
  return getFlipped(board).length;
 }

 getFlipped(board) {
  // NOT USED IF getNumFlipped NOT USED?
  return board.filter(card => card.state === FLIPPED);
 }

 async getScore(p) {
  // TODO: TOTAL SCORE FROM DATABASE
  return { error: 0, data: { score: 123456 } };
 }
}

module.exports = API;
