const crypto = require('crypto');
const Data = require('./data.js');
const Common = require('./common.js').Common;



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
            user_info: this.user_info,
            get_game: this.get_game,
            new_game: this.new_game,
            flip_cards: this.flip_cards,
        };
    }


    async processAPI(name, params) {
        console.log('API request: ', name);
        console.log('Parameters: ', params);
        const method = this.apiMethods[name];
        if (method) return await method.call(this, params);
        else return {error: 1, message: 'API not found'};
    }

    async user_info(p) {
        return {result: {total_score: 0}};

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

        const num_images = 10;

        game.board = [];
        for (let i = 0; i < num_images; i++) {
            for (let j = 0; j < 2; j++)
                game.board.push({image: i, found: false});
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
        return {result};
    }

    visibleBoard(board) {
        return board.map(card => {
            if (card.found) return card;
            else return {found: false};
        });
    }

    getNumFlipped(board) {
        return getFlipped(board).length;
    }

    getFlipped(board) {
        return board.filter(card => card.state === FLIPPED);
    }

    flip_cards(p) {

        let game = getGame(p.user_id);
        game.lock();
        
        let cards = p.cards;
        if (cards.length !== 2) return {error: 1, message: 'Invalid number of cards'};
        let board = game.board;

        if (board[cards[0]].found || board[cards[1]].found) return {error: 'Card already found'};
        
        if (board[cards[0]].image = board[cards[1]].image) {
            board[cards[0]].found = true;
            board[cards[1]].found = true;
            game.score += 5;
        }
        else {
            game.score -= 1;
        }
        
        let result = {};
        result[cards[0]] = {found: board[cards[0]].found, image: board[cards[0]].image};
        result[cards[1]] = {found: board[cards[1]].found, image: board[cards[1]].image};
        
        return {
            result: {
                result
            }
        };

        game.unlock();
    }
}

module.exports = API;
