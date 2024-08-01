const f = new Framework();
let markedCards = [];

document.addEventListener('DOMContentLoaded', async function () {
 Telegram.WebApp.ready();
 await auth(Telegram.WebApp.initData);
 await menu();
 //await dealCards(5, 4);
});

async function menu() {
 const html = await f.getFileContent('html/menu.html');
 f.qs('#game').innerHTML = html;
}

async function startGame() {
 const html = await f.getFileContent('html/game.html');
 f.qs('#game').innerHTML = html;
 await dealCards(5, 4);
}

async function highScore() {
 const html = await f.getFileContent('html/highscore.html');
 f.qs('#game').innerHTML = html;
}

async function auth(data) {
 const res = await f.getAPI('login', { data: data });
 let html = '';
 if (res && res.hasOwnProperty('error')) {
  switch (res.error) {
   case 0:
    html = f.translate(await f.getFileContent('html/login-ok.html'), {
     '{QUERY_ID}': res.data.query_id,
     '{TIME}': new Date(res.data.auth_date * 1000).toLocaleString(),
     '{USER_ID}': res.data.user.id,
     '{USER_NAME}': res.data.user.username,
     '{FIRST_NAME}': res.data.user.first_name,
     '{LAST_NAME}': res.data.user.last_name,
     '{LANGUAGE}': res.data.user.language_code,
     '{PREMIUM}': res.data.user.is_premium ? 'Yes' : 'No',
     '{PM}': res.data.user.allows_write_to_pm ? 'Yes' : 'No'
    });
    break;
   default:
    html = f.translate(await f.getFileContent('html/login-error.html'), { '{ERROR}': res.message ? res.message : 'Unknown' });
  }
 } else {
  html = await f.getFileContent('html/login-unrecognized.html');
 }
 f.qs('#userinfo').innerHTML = html;
}

async function dealCards(x, y) {
 const cardTemp = await f.getFileContent('html/card.html');
 let html = '';
 for (let i = 1; i <= y; i++) {
  html += '<div class="row">';
  for (let j = 1; j <= x; j++) {
   html += f.translate(cardTemp, {
    '{ID}': x * (i - 1) + j
   });
  }
  html += '</div>';
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
   const res = await f.getAPI('flip', markedCards);
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
