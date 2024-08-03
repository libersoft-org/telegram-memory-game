# Bugs
- Backend: Sometimes the game stays in locked state and server has to be restarted
- Backend: Bot is sending the same message twice
- Backend: Data.js is constructed twice - from api.js and app.js, thus session garbage collector is running twice at the same time
- Frontend: When I reveal wrong guess cards and quickly click on Back to menu and then Start game, it shows these cards again
- Frontend: Too big gaps between cards on big resolutions

# Features
- Backend + frontend: Add sessions (from LiberShare) - already in data.js
- Backend + frontend: Test if the game can determine that the game is finished (already implemented, just test) + if game score is added to total score
- Backend + frontend: Show high score table (coins + number of finished games) - with lazy loader and paging
- Backend + frontend: Store each game result in DB (even with negative score), show them in table in frontend - with lazy loader and paging
- Backend - fill users_transactions table with points from games
- Frontend: Connect TON wallet (+ reward user for that)
- Backend: Load users' photos by Telegram Bot API in game (Telegram Mini Web App doesn't allow it)
- Backend: Add users, who have not started the game yet, but opened bot, to database too?
- Backend + frontend: API request to send mass message from bot to all users (should be allowed to admin only)
- Create a "screenshot.webp" with an in-game image

# Questions
- If we use almost infinite sessions and almost never logins, how will we update users' info in database? By bot (incl. loading photos)?

# Future versions
- HTML + CSS loaded from API, not as requested files (copy this code from LiberShare)
- Daily rewards
- Referral invites (rewarded by score coins)
- Buy score coins
- Get collections for score coins (new collections earn score coins faster)
- Tasks (Join announcement channel, join chat group etc.)
- Exchange coins to token in wallet
- Auto earn bots?
- Contests? (the best players win crypto)
- Cipher? (as in Hamster Kombat)
