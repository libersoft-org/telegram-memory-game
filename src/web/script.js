let markedCards = [];

document.addEventListener('DOMContentLoaded', async function () {
 Telegram.WebApp.ready();
 await auth(Telegram.WebApp.initData);
 await dealCards(5, 4);
});

async function auth(data) {
 const res = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: data })
 });
 const result = await res.json();
 let html = '';
 if (result && result.hasOwnProperty('error')) {
  switch (result.error) {
   case 0:
    html = translate(await getFileContent('html/login-ok.html'), {
     '{QUERY_ID}': result.data.query_id,
     '{TIME}': new Date(result.data.auth_date * 1000).toLocaleString(),
     '{USER_ID}': result.data.user.id,
     '{USER_NAME}': result.data.user.username,
     '{FIRST_NAME}': result.data.user.first_name,
     '{LAST_NAME}': result.data.user.last_name,
     '{LANGUAGE}': result.data.user.language_code,
     '{PREMIUM}': result.data.user.is_premium ? 'Yes' : 'No',
     '{PM}': result.data.user.allows_write_to_pm ? 'Yes' : 'No'
    });
    break;
   default:
    html = translate(await getFileContent('html/login-error.html'), { '{ERROR}': result.message ? result.message : 'Unknown' });
  }
 } else {
  html = await getFileContent('html/login-unrecognized.html');
 }
 qs('#userinfo').innerHTML = html;
}

async function dealCards(x, y) {
 const cardTemp = await getFileContent('html/card.html');
 let html = '';
 for (let i = 1; i <= y; i++) {
  html += '<div class="row">';
  for (let j = 1; j <= x; j++) {
   html += translate(cardTemp, {
    '{ID}': x * (i - 1) + j
   });
  }
  html += '</div>';
 }
 qs('#cards').innerHTML = html;
}

function markCard(cardElem) {
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
   for (let i of markedCards) {
    qs('#card-' + i)
     .querySelector('.inner')
     .classList.remove('marked');
    flipCard(qs('#card-' + i));
   }
   markedCards = [];
  }
 }
}

function flipCard(cardElem) {
 cardElem.querySelector('.inner').classList.toggle('flipped');
}

async function getFileContent(file) {
 const content = await fetch(file, { headers: { 'cache-control': 'no-cache' } });
 return content.text();
}

function translate(template, dictionary) {
 for (const key in dictionary) template = template.replaceAll(key, dictionary[key]);
 return template;
}

function qs(param) {
 return document.querySelector(param);
}
