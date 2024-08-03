class Game {
 constructor() {
  this.score = 0;
  this.reset();
 }

 reset() {
  this.lock();
  this.score = 0;
  const num_images = 10;
  this.cards = [];
  for (let i = 1; i <= num_images; i++) {
   this.cards.push({ image: i, found: false });
   this.cards.push({ image: i, found: false });
  }
  let curID = this.cards.length,
   rndID;
  while (curID != 0) {
   rndID = Math.floor(Math.random() * curID);
   curID--;
   [this.cards[curID], this.cards[rndID]] = [this.cards[rndID], this.cards[curID]];
  }
  this.unlock();
 }

 getFound() {
  const found = [];
  for (let i = 0; i < this.cards.length; i++) {
   if (this.cards[i].found) {
    found.push({ id: i, image: this.cards[i].image });
   }
  }
  return found;
 }

 flipCards(cardsToFlip) {
  this.lock();
  let result = this.flipCards2(cardsToFlip);
  this.unlock();
  return result;
 }

 flipCards2(cardsToFlip) {
  if (cardsToFlip.length !== 2) return 1;
  if (this.cards[cardsToFlip[0]].found || this.cards[cardsToFlip[1]].found) return 2;
  if (this.cards[cardsToFlip[0]].image == this.cards[cardsToFlip[1]].image) {
   this.cards[cardsToFlip[0]].found = true;
   this.cards[cardsToFlip[1]].found = true;
   this.score += 10;
  } else this.score--;
  let result = [];
  result.push({ id: cardsToFlip[0], image: this.cards[cardsToFlip[0]].image });
  result.push({ id: cardsToFlip[1], image: this.cards[cardsToFlip[1]].image });
  return result;
 }

 isGameFinished() {
  for (const c of this.cards) if (!c.found) return false;
  return true;
 }

 lock() {
  if (this.locked) throw new Error('Game is locked');
  //this.locked = true;
 }

 unlock() {
  this.locked = false;
 }
}

module.exports = Game;
