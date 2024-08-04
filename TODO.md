# Bugs
- Frontend: When I reveal wrong guess cards and quickly click on Back to menu and then Start game, it shows these cards again
- Frontend: Too big gaps between cards on big resolutions

# Features
- Frontend: Add icon to navbar for "My game results" and "My transactions"
- Backend + frontend: Store each game result in DB (even with negative score), show them in table in frontend - with lazy loader and paging
- Backend + frontend: Fill users_transactions table with points from games
- Backend + frontend: Show high score table (coins + number of finished games) - with lazy loader and paging
- Frontend: Connect TON wallet (+ reward user for that)
- Backend: Load users' photos by Telegram Bot API in game (Telegram Mini Web App doesn't allow it)
- Backend: Add users, who have not started the game yet, but opened bot, to database too?
- Backend + frontend: API request to send mass message from bot to all users (should be allowed to admin only)
- Frontend: Change alerts to modal
- Frontend: Add Google Analytics
- Allow non-Telegram users to play the game (without total score, wallet, user info etc.)
- Create a "screenshot.webp" with an in-game image

# Questions
- If we use almost infinite sessions and almost never logins, how will we update users' info in database? By bot (incl. loading photos)?

# Future versions
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
