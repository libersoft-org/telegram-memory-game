const TelegramBot = require('node-telegram-bot-api');
const Common = require('./common.js').Common;

class Bot {
 async run() {
  const token = Common.settings.other.bot_token;
  const bot = new TelegramBot(token, { polling: true });
  bot.on('message', (msg) => {
   bot.sendMessage(msg.chat.id, Common.bot.welcome.message, {
    reply_markup: {
     inline_keyboard: Common.bot.welcome.buttons
    }
   });
  });
  bot.on('polling_error', (error) => {
   bot.stopPolling();
  });
  try {
   await bot.getMe();
  } catch (ex) {
   Common.addLog('Telegram bot is not running.', 2)
   Common.addLog(ex.message, 2);
   return;
  }
  Common.addLog('Telegram bot is running.');
 }
}

module.exports = Bot;
