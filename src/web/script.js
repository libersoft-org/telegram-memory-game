document.addEventListener('DOMContentLoaded', async function () {
 Telegram.WebApp.ready();
 await auth(Telegram.WebApp.initData);
 await dealCards();
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

async function dealCards() {
 const cardTemp = await getFileContent('html/card.html');
 let html = '';
 for (let i = 0; i < 6; i++) {
  html += '<div class="row">';
  for (let j = 0; j < 6; j++) {
   html += translate(cardTemp, {
    '{ID}': i * 6 + j
   });
  }
  html += '</div>';
 }
 qs('#cards').innerHTML = html;
}

function flipCard(cardElem) {
 let inner = cardElem.querySelector('.inner');
 inner.classList.toggle('flipped');
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
