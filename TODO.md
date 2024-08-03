# Bugs
- Sometimes the game stays in locked state and server has to be restarted
- Too big gaps between cards on big resolutions

# Features
- Frontend: Flip cards
- Frontend: Total score is not loading
- Frontend: Cancel game -> Restart game
- Backend: When new / resume game, don't send the whole array of unflipped cards
- Backend: When flipping cards, don't send flip = false / true
- Backend + frontend: Add sessions (from LiberShare)
- Backend: Store score for each user (each finished game score will be stored in table + overall score for user)
- Backend: Show high score table (coins + number of finished games)
- Backend + frontend - Game management per user (new, resume)
- Frontend: Connect TON wallet (+ reward user for that)
- Backend: Load users' photos by Telegram Bot API in game (Telegram Mini Web App doesn't allow it)
- Backend: Add users, who have not started the game yet, but opened bot, to database too?
- Backend + frontend: API request to send mass message from bot to all users (should be allowed to admin only)
- Create a "screenshot.webp" with an in-game image

# Questions
- If we use almost infinite sessions and almost never logins, how will we update users' info in database? By bot (incl. loading photos)?

# Future versions
- Daily rewards
- Referral invites (rewarded by score coins)
- Buy score coins
- Get collections for score coins (new collections earn score coins faster)
- Tasks (Join announcement channel, join chat group etc.)
- Exchange coins to token in wallet
- Auto earn bots?
- Contests? (the best players win crypto)
- Cipher? (as in Hamster Kombat)
