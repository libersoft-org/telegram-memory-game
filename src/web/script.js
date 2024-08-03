const f = new Framework();
let markedCards = [];

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
 f.qs('#navbar .score .number').innerHTML = res.score.toLocaleString();
}

async function getGame() {
 const res = await f.getAPI('new_game');
}

async function getGamePage() {
 const html = await f.getFileContent('html/game.html');
 f.qs('#content').innerHTML = html;
 await dealCards(5, 4);
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
   console.log(res);
  }
 }
}

function flipCard(cardElem) {
 cardElem.querySelector('.inner').classList.toggle('flipped');
}

async function cancelGame() {
 const res = await f.getAPI('cancel_game');
 if (checkErrors(res)) return;
 getMainPage();
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
