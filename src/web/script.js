const f = new Framework();
let markedCards = [];
let canPlay = true;

document.addEventListener('DOMContentLoaded', async function () {
 Telegram.WebApp.ready();
 window.Telegram.WebApp.expand();
 if (!localStorage.getItem('session')) await auth(Telegram.WebApp.initData);
});

async function auth(data) {
 const res = await f.getAPI('login', { data: data });
 if (checkErrors(res)) return;
 localStorage.setItem('data', JSON.stringify(res.data));
 await getMainPage();
}

async function getMainPage() {
 const html = await f.getFileContent('html/main.html');
 document.body.innerHTML = html;
 await getMenuPage();
}

async function getMenuPage() {
 const html = await f.getFileContent('html/menu.html');
 f.qs('#content').innerHTML = html;
 await getScore();
}

async function getScore() {
 const res = await f.getAPI('get_score');
 if (checkErrors(res)) return;
 f.qs('#navbar .score .number').innerHTML = res.data.score.toLocaleString();
}

async function getGamePage() {
 const html = await f.getFileContent('html/game.html');
 f.qs('#content').innerHTML = html;
 const res = await f.getAPI('get_game');
 if (checkErrors(res)) return;
 await dealCards(5, 4);
 console.log(res.data);
 setScoreGame(res.data.score);
 // TODO: load flipped cards
}

function setScoreGame(score) {
 f.qs('#score-game').innerHTML = 'Score: ' + score;
}

async function getHighScorePage() {
 const html = await f.getFileContent('html/highscore.html');
 f.qs('#content').innerHTML = html;
}

async function getProfilePage() {
 const data = JSON.parse(localStorage.getItem('data'));
 const html = f.translate(await f.getFileContent('html/userinfo.html'), {
  '{QUERY_ID}': data.query_id,
  '{TIME}': new Date(data.auth_date * 1000).toLocaleString(),
  '{USER_ID}': data.user.id,
  '{USER_NAME}': data.user.username,
  '{FIRST_NAME}': data.user.first_name,
  '{LAST_NAME}': data.user.last_name,
  '{LANGUAGE}': data.user.language_code,
  '{PREMIUM}': data.user.is_premium ? 'Yes' : 'No',
  '{PM}': data.user.allows_write_to_pm ? 'Yes' : 'No'
 });
 f.qs('#content').innerHTML = html;
}

async function dealCards(x, y) {
 markedCards = [];
 const cardTemp = await f.getFileContent('html/card.html');
 let html = '';
 for (let i = 1; i <= y; i++) {
  for (let j = 1; j <= x; j++) {
   html += f.translate(cardTemp, { '{ID}': x * (i - 1) + j });
  }
 }
 f.qs('#cards').innerHTML = html;
}

async function markCard(cardElem) {
 if (!canPlay) return;
 const id = parseInt(cardElem.id.replace('card-', ''));
 if (cardElem.querySelector('.inner').classList.contains('flipped')) return;
 if (markedCards.includes(id)) {
  let mid = markedCards.indexOf(id);
  if (mid !== -1) markedCards.splice(mid, 1);
  cardElem.querySelector('.inner').classList.remove('marked');
 } else {
  if (markedCards.length < 2) {
   markedCards.push(id);
   cardElem.querySelector('.inner').classList.add('marked');
  }
  if (markedCards.length == 2) {
   const res = await f.getAPI('flip_cards', { cards: markedCards });
   if (checkErrors(res)) return;
   console.log(res);
   for (card of res.data.cards) {
    let elCard = f.qs('#card-' + card.id + ' .inner');
    elCard.querySelector('.front img').src = 'img/cards/' + card.image + '.svg';
    elCard.classList.remove('marked');
    elCard.classList.toggle('flipped');
   }
   if (res.data.cards[0].image !== res.data.cards[1].image) {
    canPlay = false;
    setTimeout(() => {
     for (card of res.data.cards) {
      f.qs('#card-' + card.id + ' .inner').classList.toggle('flipped');
      canPlay = true;
     }
    }, 2000);
   }
   setScoreGame(res.data.score);
   markedCards = [];
  }
 }
}

async function resetGame() {
 if (!canPlay) return;
 const res = await f.getAPI('reset_game');
 if (checkErrors(res)) return;
 setScoreGame(0);
 await dealCards(5, 4);
}

function checkErrors(res) {
 if (!res || !res.hasOwnProperty('error')) {
  alert('Error: Unknown response from server');
  return true;
 }
 if (res.error !== 0) {
  alert('Error from server: ' + (res.message ? res.message : 'Unknown'));
  return true;
 }
 return false;
}
