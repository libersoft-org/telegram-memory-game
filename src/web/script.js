const f = new Framework();
let markedCards = [];

document.addEventListener('DOMContentLoaded', async function () {
 Telegram.WebApp.ready();
 window.Telegram.WebApp.expand();
 await auth(Telegram.WebApp.initData);
});

async function auth(data) {
 const res = await f.getAPI('login', { data: data });
 let html = '';
 if (res && res.hasOwnProperty('error')) {
  switch (res.error) {
   case 0:
    localStorage.setItem('data', JSON.stringify(res.data));
    await getMenuPage();
    break;
   default:
    html = f.translate(await f.getFileContent('html/login-error.html'), { '{ERROR}': res.message ? res.message : 'Unknown' });
    f.qs('#splash .loader').outerHTML = html;
  }
 } else {
  html = await f.getFileContent('html/login-unrecognized.html');
  f.qs('#splash .loader').outerHTML = html;
 }
}

async function getMenuPage() {
 const html = await f.getFileContent('html/menu.html');
 document.body.innerHTML = html;
 await getScore();
}

async function getScore() {
 const res = await f.getAPI('get_score');
 f.qs('#menu .score .number').innerHTML = res && res.hasOwnProperty('error') && res.error == 0 ? res.data.score.toLocaleString() : 'ERROR: ' + res.message;
}

async function getStartGamePage() {
 const html = await f.getFileContent('html/game.html');
 document.body.innerHTML = html;
 await dealCards(5, 4);
}

async function getHighScorePage() {
 const html = await f.getFileContent('html/highscore.html');
 document.body.innerHTML = html;
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
 document.body.innerHTML = html;
}

async function dealCards(x, y) {
 markedCards = [];
 const cardTemp = await f.getFileContent('html/card.html');
 let html = '';
 for (let i = 1; i <= y; i++) {
  for (let j = 1; j <= x; j++) {
   html += f.translate(cardTemp, {
    '{ID}': x * (i - 1) + j
   });
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
   const res = await f.getAPI('get_flip', { cards: markedCards });
   console.log(res);
   /*
   for (let i of markedCards) {
    f.qs('#card-' + i)
     .querySelector('.inner')
     .classList.remove('marked');
    flipCard(f.qs('#card-' + i));
   }
   markedCards = [];
   */
  }
 }
}

function flipCard(cardElem) {
 cardElem.querySelector('.inner').classList.toggle('flipped');
}
