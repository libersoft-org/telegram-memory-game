const fs = require('fs');
const os = require('os');
const { dirname } = require('path');

class Common {
 static appName = 'Telegram Memory Game';
 static appVersion = '1.00';
 static settingsFile = 'settings.json';
 static botFile = 'bot.json';
 static appPath = dirname(require.main.filename) + '/';
 static settings;
 static bot;

 static addLog(message, type = 0) {
  const d = new Date();
  const pad = num => num.toString().padStart(2, '0');
  const date = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  const msg = message === undefined ? '' : message;
  let typeText = 'INFO';
  let color = '\x1b[32m';
  switch (type) {
   case 1:
    typeText = 'WARNING';
    color = '\x1b[33m';
    break;
   case 2:
    typeText = 'ERROR';
    color = '\x1b[31m';
  }
  console.log('\x1b[96m' + date + '\x1b[0m [' + color + typeText + '\x1b[0m] ' + msg);
  if (this.settings && this.settings.other && this.settings.other.log_to_file) fs.appendFileSync(this.appPath + this.settings.other.log_file, date + ' [' + typeText + '] ' + msg + os.EOL);
 }

 static translate(template, dictionary) {
  for (const key in dictionary) template = template.replaceAll(key, dictionary[key]);
  return template;
 }
}

module.exports = { Common: Common };
