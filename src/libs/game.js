class Game {
 constructor() {
  this.board = [];
  this.score = 0;
 }

 lock() {
  if (this.locked) throw new Error('Game is locked');
  this.locked = true;
 }

 unlock() {
  this.locked = false;
 }
}

module.exports = Game;