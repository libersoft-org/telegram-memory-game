const f = new Framework();
let markedCards = [];
let canPlay = true;

document.addEventListener('DOMContentLoaded', async function () {
 Telegram.WebApp.ready();
 window.Telegram.WebApp.expand();
 if (!localStorage.getItem('session')) await login(Telegram.WebApp.initData);
 await getMainPage();
});

async function login(data) {
 const res = await f.getAPI('login', { data: data });
 if (await checkErrors(res)) return;
 localStorage.setItem('data', JSON.stringify(res.data.telegram));
 localStorage.setItem('session', JSON.stringify(res.data.session));
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
 console.log('TEST 2');
 if (await checkErrors(res)) return;
 console.log('TEST 3');
 f.qs('#navbar .score .number').innerHTML = res.data.score.toLocaleString();
 console.log('TEST 4');
}

async function getGamePage() {
 const html = await f.getFileContent('html/game.html');
 f.qs('#content').innerHTML = html;
 const res = await f.getAPI('get_game');
 if (await checkErrors(res)) return;
 await dealCards(5, 4);
 setScoreGame(res.data.score);
 for (let c of res.data.cards) {
  let elCard = f.qs('#card-' + c.id + ' .inner');
  elCard.querySelector('.front img').src = 'img/cards/' + c.image + '.svg';
  elCard.classList.toggle('flipped');
  canPlay = true;
 }
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
   if (await checkErrors(res)) return;
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
   if (res.data.finished) {
    alert('Game finished!');
    getScore();
   }
   markedCards = [];
  }
 }
}

async function resetGame() {
 if (!canPlay) return;
 const res = await f.getAPI('reset_game');
 if (await checkErrors(res)) return;
 setScoreGame(0);
 await dealCards(5, 4);
}

async function checkErrors(res) {
 if (!res || !res.hasOwnProperty('error')) {
  alert('Error: Unknown response from server');
  return true;
 }
 if (res.error !== 0) {
  if (res.error === 900) {
   console.log('ANO, NASTAL SESSION EXPIRED A LOGUJU SE ZNOVU');
   await login(Telegram.WebApp.initData);
   return false;
  } else {
   alert('Error from server: ' + (res.message ? res.message : 'Unknown'));
   return true;
  }
 }
 return false;
}
