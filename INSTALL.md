# Telegram Memory Game - installation

These are the installation instruction for **Debian Linux** (logged in as root):

## 1. Create and set up your Telegram bot

- Open the **BotFather** Telegram bot: **https://t.me/BotFather**.
- Click on **START** button.
- Type the **/newbot** command.
- Type a new name for your bot (e.g.: **Memory Game**)
- Type a username for your bot - it must end with the ending "bot" (e.g.: **memory_game_bot** or **MemoryGameBot**) - this username has to be unique and not set by other Telegram user.
- You will get the bot token, store it for later.
- Type the **/mybots** command.
- Click on the button with the username of your bot.
- Click on **Edit bot** and set the name, about, description, description picture and profile bot pic
- Click on **Back to Bot** button.
- Click on **Bot Settings** -> **Menu Button** -> **Configure menu button** and set the URL and title for your future Telegram web application.

The link to your bot is in this format: **https://t.me/your_bot_username**. Store this link for later.

## 2. Install system dependencies, download Bun and create the application and bot settings files on your server

```bash
apt update
apt -y upgrade
apt install curl unzip git
curl -fsSL https://bun.sh/install | bash
source /root/.bashrc
git clone https://github.com/libersoft-org/telegram-memory-game.git
cd telegram-memory-game/src
./start.sh --create-settings
./start.sh --create-bot
```

## 3. Edit the "settings.json" file

```bash
nano settings.json
```

Here you need to set up:
- **web** section:
  - **name** - name of your application
  - **standalone** - true / false (**true** = run a standalone web server with a defined network port, **false** = run it as a unix socket and connect it through other web server's proxy - **Nginx** is recommended)
  - **port** - your web server's network port (ignored if you're not running a standalone server)
  - **socket_path** - path to a unix socket file (ignored if you're running standalone server)
- **other** section:
  - **sessions_life** - how many seconds we store users' sessions - for example: 2592000 = 30 days
  - **sessions_update** - after how many seconds should we check for old sessions - for example: 21600 = every 6 hours,
  - **db_file** - the file name of the database for storing users and their logins
  - **bot_run** - true / false (**true** - run the bot, **false** - do not run the bot)
  - **bot_token** - your Telegram Bot token
  - **log_to_file** - if you'd like to log to console and log file (true) or to console only (false)
  - **log_file** - the path to your log file (ignored if log_to_file is false)

## 4. Edit the "bot.json" file

```bash
nano bot.json
```

Here you need to set up:
- **welcome** section:
  - **message** - the message that every user will get when started or wrote something to your Telegram bot
  - **buttons** - buttons under the message with text and it's destination URL - the correct addresses are required, otherwise the bot will not start properly.

## 5. Set the NGINX site host config file

The following applies only for unix socket server. Skip this step if you're running standalone server.

If you don't have your Nginx web server installed, run this command:

```bash
apt install nginx
```

In **/etc/nginx/sites-available/**, create the new config file named by your domain name, ending with ".conf" extension (e.g.: your-server.com.conf).

For example:

```bash
nano /etc/nginx/sites-available/your-server.com.conf
```

The example of NGINX site host config file:

```conf
server {
 listen 80;
 listen [::]:80;
 server_name your-server.com *.your-server.com;

 location / {
  proxy_pass http://memory;
 }
}

upstream memory {
 server unix:/run/memory.sock;
}
```

Now enable the site:

```bash
ln -s /etc/nginx/sites-available/your-server.com.conf /etc/nginx/sites-enabled/your-server.com.conf
```

Then restart the NGINX server:

```bash
service nginx restart
```

You can also add the HTTPS certificate using **certbot** if needed.

## 6. Start the server application

a) to start the server in **console** using **bun**:

```bash
./start.sh
```

b) to start the server in **console** by **bun** in **hot reload** (dev) mode:

```bash
./start-hot.sh
```

c) to start the server in **screen** by **bun**:

```bash
./start-screen.sh
```

d) to start the server in **screen** by **bun** in **hot reload** (dev) mode:

```bash
./start-hot-screen.sh
```

## 7. Open your Telegram web application from your Telegram bot

Open your bot's link (you stored it earlier), click on the **START** button and then start the web application.
