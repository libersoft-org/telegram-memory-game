const crypto = require('crypto');
const Data = require('./data.js');
const Common = require('./common.js').Common;

/* game piece state */
const PUT = 0;
const FLIPPED = 1;
const MATCHED = 2;


class Game {
    constructor() {
        this.board = [];
        this.score = 0;
    }

    lock() {
        if (this.locked) throw new Error('Game is locked');
        this.locked = true;
    }

    unlock() {
        this.locked = false;
    }
}

class API {
    constructor() {

        /* one game per user */
        this.games = {};

        this.data = new Data();

        this.apiMethods = {
            login: this.login,
            get_game: this.get_game,
            flip_card: this.flip_card,
        };
    }

    async processAPI(name, params) {
        console.log('API request: ', name);
        console.log('Parameters: ', params);
        const method = this.apiMethods[name];
        if (method) return await method.call(this, params);
        else return {error: 1, message: 'API not found'};
    }

    async login(p = {}) {

        return {error: 0, data: {id: 0}};

        const parsedData = new URLSearchParams(p.data);
        const hash = parsedData.get('hash');
        parsedData.delete('hash');

        const dataCheckString = Array.from(parsedData.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(entry => `${entry[0]}=${entry[1]}`)
            .join('\n');
        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(Common.settings.other.bot_token).digest();
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        if (calculatedHash === hash) {
            let resData = Object.fromEntries(parsedData);
            resData.user = JSON.parse(resData.user);
            await this.data.login(resData.user.id, resData.user.username, resData.user.first_name, resData.user.last_name, resData.user.language_code, resData.user.is_premium == true ? true : false, resData.user.allows_write_to_pm == true ? true : false, resData.query_id, resData.auth_date);
            return {error: 0, data: resData};
        } else {
            return {error: 1, message: 'User verification failed'};
        }
    }

    async get_score(p) {
        let game = getGame(p.user_id);
        return {result: {score: game.score}};
    }


    shuffle(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    new_game(p) {

        let game = getGame(p.user_id);
        game.lock();

        game.score = 0;

        const num_pictures = 10;

        game.board = [];
        for (let i = 0; i < num_pictures; i++) {
            for (let j = 0; j < 2; j++)
                game.board.push({picture: i, state: PUT});
        }
        game.board = shuffle(game.board);

        return {
            result: {
                message: 'New game started'
            }
        };

        game.unlock();
    }


    getGame(user_id) {
        return this.games[user_id] || new Game();
    }

    get_game(p) {
        let game = this.getGame(p.user_id);
        game.lock();
        let result = {score: game.score, board: this.visibleBoard(game.board)};
        game.unlock();
        return result;
    }

    visibleBoard(board) {
        return board.map(card => {
            if (card.state === PUT) return {state: PUT};
            else return {state: card.state, picture: card.picture};
        });
    }

    getNumFlipped(board) {
        return getFlipped(board).length;
    }

    getFlipped(board) {
        return board.filter(card => card.state === FLIPPED);
    }

    flip_card(p) {

        let game = getGame(p.user_id);
        game.lock();
        
        let num_flipped = getNumFlipped(game.board);
     
        if (num_flipped === 2) {
            // two cards are already flipped, flip them back
            game.board.forEach(card => {
                if (card.state === FLIPPED) card.state = PUT;
            });
        }
        else {
            let idx = params.idx;
            game.board[idx].state = FLIPPED;
        }
        
        num_flipped = getNumFlipped(game.board);
        
        if (num_flipped === 2) {
            let flipped = getFlipped(game.board);
            if (flipped[0].picture === flipped[1].picture) {
                // two cards are the same
                flipped.forEach(card => {
                    card.state = MATCHED;
                });
                game.score += 5;
            }
            else {
                game.score -= 1;
            }
        }

        game.unlock();

        return {
            result: {
                message: 'ok'
            }
        };
    }
}

module.exports = API;
