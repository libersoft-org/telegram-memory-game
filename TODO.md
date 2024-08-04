# Bugs
- Frontend: When I reveal wrong guess cards and quickly click on Back to menu and then Start game, it doesn't allow me to play ("canPlay" stays in false state)
- Frontend: When I reveal wrong guess cards and quickly click on Back to menu and then Start game, it shows these cards again
- Frontend: Too big gaps between cards on big resolutions

# Features
- Frontend: In non-Telegram browser the game should not load, but it is loading the menu
- Frontend: Add icon to navbar for "My game results" and "My transactions"
- Frontend: Add lazy loader to results, transactions and high score tables
- Frontend: Connect TON wallet (+ reward user for that)
- Frontend: Add Google Analytics
- Create a "screenshot.webp" with an in-game image

# Questions
- If we use almost infinite sessions and almost never logins, how will we update users' info in database? By bot (incl. loading photos)?
- Backend: Add users, who have not started the game yet, but opened bot, to database too?
- Allow non-Telegram users to play the game (without total score, wallet, user info etc.)?

# Future versions
- Add number of finished games for each user in "My game results"
- Add number of finished games in high score table
- Change alerts to modal window
- API request to send mass message from bot to all users (should be allowed to admin only)
- Load users' photos by Telegram Bot API in game (Telegram Mini Web App doesn't allow it) - also update them regularly
- Show users' photos in high score and in profile
- Referral invites (rewarded by score coins)
- Tasks (Join announcement channel, join chat group etc.)
- HTML + CSS loaded from API, not as requested files (copy this code from LiberShare)
- Daily rewards
- Buy score coins
- Get collections for score coins (new collections earn score coins faster)
- Exchange coins to token in wallet
- Auto earn bots?
- Contests? (the best players win crypto)
- Cipher? (as in Hamster Kombat)
