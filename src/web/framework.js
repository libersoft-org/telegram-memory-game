class Framework {
 constructor() {
  this.pathAPI = '/api/';
 }
 async getFileContent(file) {
  return (await fetch(file, { headers: { 'cache-control': 'no-cache' } })).text();
 }

 async getAPI(name, body = {}) {
  body.user_id = 1; // TODO: REMOVE THIS WHEN BACKEND WILL GET USER ID FROM SESSION ID
  const session = localStorage.getItem('session');
  if (session) body.session = session;
  const res = await fetch(this.pathAPI + name, {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: body ? JSON.stringify(body) : '{}'
  });
  if (!res.ok) {
   console.error('API error: ', res);
   return null;
  }
  console.log(res);
  const res_json = await res.json();
  if (res_json.error) console.error('API error: ', res_json);
  return res_json;
 }

 translate(template, dictionary) {
  for (const key in dictionary) template = template.replaceAll(key, dictionary[key]);
  return template;
 }

 qs(query) {
  return document.querySelector(query);
 }

 qsa(query) {
  return document.querySelectorAll(query);
 }
}
