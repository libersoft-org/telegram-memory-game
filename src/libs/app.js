const fs = require('fs');
const Common = require('./common.js').Common;

class App {
 async run() {
  const args = process.argv.slice(2);
  switch (args.length) {
   case 0:
    await this.startServer();
    break;
   case 1:
    if (args[0] === '--create-settings') this.createSettings();
    if (args[0] === '--create-bot') this.createBotSettings();
    else this.getHelp();
    break;
   default:
    this.getHelp();
    break;
  }
 }

 async startServer() {
  this.loadSettings();
  const header = Common.appName + ' ver. ' + Common.appVersion;
  const dashes = '='.repeat(header.length);
  Common.addLog('');
  Common.addLog(dashes);
  Common.addLog(header);
  Common.addLog(dashes);
  Common.addLog('');
  const Data = require('./data.js');
  const data = new Data();
  await data.createDB();
  const WebServer = require('./webserver.js');
  const webServer = new WebServer();
  await webServer.run();
  if (Common.settings.other.bot_run) {
   const Bot = require('./bot.js');
   const bot = new Bot();
   this.loadBotSettings();
   bot.run();
  }
 }

 getHelp() {
  Common.addLog('Command line arguments:');
  Common.addLog('');
  Common.addLog('--help - to see this help');
  Common.addLog('--create-settings - to create a default settings file named "' + Common.settingsFile + '"');
  Common.addLog('--create-bot - to create a default bot settings file named "' + Common.botFile + '"');
  Common.addLog('');
 }

 loadSettings() {
  if (fs.existsSync(Common.appPath + Common.settingsFile)) {
   Common.settings = JSON.parse(
    fs.readFileSync(Common.appPath + Common.settingsFile, {
     encoding: 'utf8',
     flag: 'r'
    })
   );
  } else {
   Common.addLog('The settings file "' + Common.settingsFile + '" was not found. If you would like to create a new settings file, please use the parameter "--create-settings".', 2);
   process.exit(1);
  }
 }

 createSettings() {
  if (fs.existsSync(Common.appPath + Common.settingsFile)) {
   Common.addLog('The settings file "' + Common.settingsFile + '" already exists. If you need to replace it with a default one, delete the old one first.', 2);
   process.exit(1);
  } else {
   let settings = {
    web: {
     name: 'Telegram Memory Game',
     standalone: true,
     port: 80,
     socket_path: '/run/memory.sock',
    },
    other: {
     db_file: 'memory.db',
     bot_run: true,
     bot_token: 'YOUR_BOT_TOKEN',
     log_to_file: true,
     log_file: 'memory.log'
    }
   };
   fs.writeFileSync(Common.appPath + Common.settingsFile, JSON.stringify(settings, null, ' '));
   Common.addLog('The settings file "' + Common.settingsFile + '" has been successfully created.');
  }
 }

 loadBotSettings() {
  if (fs.existsSync(Common.appPath + Common.botFile)) {
   Common.bot = JSON.parse(
    fs.readFileSync(Common.appPath + Common.botFile, {
     encoding: 'utf8',
     flag: 'r'
    })
   );
  } else {
   Common.addLog('The bot settings file "' + Common.botFile + '" was not found. If you would like to create a new bot settings file, please use the parameter "--create-bot" or disable the bot in application settings file.', 2);
   process.exit(1);
  }
 }

 createBotSettings() {
  if (fs.existsSync(Common.appPath + Common.botFile)) {
   Common.addLog('The bot settings file "' + Common.botFile + '" already exists. If you need to replace it with a default one, delete the old one first.', 2);
   process.exit(1);
  } else {
   let settings = {
    welcome: {
     message: 'Welcome!',
     buttons: [
      [{ text: 'Start the app', web_app: { url: 'https://memory.libersoft.org/' }}],
      [{ text: 'Official website', url: 'https://libersoft.org/' }]
     ]
    }
   };
   fs.writeFileSync(Common.appPath + Common.botFile, JSON.stringify(settings, null, ' '));
   Common.addLog('The bot settings file "' + Common.botFile + '" has been successfully created.');
  }
 }
}

module.exports = App;
