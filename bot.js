const Discord = require('discord.js');
const bot = new Discord.Client();
const {token, developerId} = require('./key.js');
const Game = require("./game/Game");
const Card = require("./game/Card");
const Player = require("./game/Player");

//converts the suite to a Discord emoji to better visualize cards
function suiteToEmoji(suite){
    switch(suite){
        case 'Spade':
            return spade;
        case 'Club':
            return club;
        case 'Diamond':
            return diamond;
        case 'Heart':
            return heart;
    }
}

function displayCards(cards){
    let message = "";
    for(let i = 0; i < cards.length; i++){
        message = message + i + ": " + discordNumber[indexOfNumber(cards[i].getNumber())] + " of " + suiteToEmoji(cards[i].getSuite()) + "\n";
    }
    return message + "---------------------------------------------------\n";
}

function displayAbout(){
    let exampleCards = [new Card("3", "Spade"), new Card("4", "Heart"), new Card("5", "Club")];
    return "***Commands***:\n" +
           "***create*** {id} - Allows the user to create a game with the corresponding 'id'\n\n" +
           "***join*** {id}   - Allows the user to join the game with the corresponding 'id'\n\n" +
           "***leave***   - Allows the user to leave a game they joined. ***The user must join a game before using this command and cannot leave in the middle of a game***\n\n" +
           "***start***   - Allows the user to start a game they joined. The bot will DM you the cards that are in your hand. ***There must be atleast 2 users who joined the game***\n\n" +
           "***table***   - Displays the cards that are currently on the table ***The user must join a game before using this command***\n\n" +
           "***games***   - Displays the current games created\n\n" +
           "***players*** - Displays the players in the current game ***The user must join a game before using this command***\n\n" +
           "***skip***    - The user will skip the current round\n\n" +
           "***history*** - Displays all the plays and skips of the current game\n\n" +
           "***play*** {index} - The user plays the card[s] based on the index of the card on their current hand\n\n" +
           "Example of 'play' command with cards:\n" +
            displayCards(exampleCards) +
           "\n\n!13 play 0 1 2\n\n" +
           "user plays\n" +
            displayCards(exampleCards);
}

function getGameById(id){
    return gamesMap.get(id);
}

function addUser(id, username){
    let newUser = new Player(username, id)
    usersMap.set(id, newUser);
    return newUser;
}

function getGameIdFromUser(userId){
    let user = usersMap.get(userId);
    return user.gameId;
}

//remove users from finished games
function resetUsers(users){
    users.forEach(user => {
       usersMap.set(user.id, new Player(user.name, user.id));
    });
}

function removeGameById(id){
    gamesMap.delete(id);
}

function indexOfNumber(number){
    return numbers.indexOf(number);
}

function addLastPlayerToLeaderBoard(game){
    game.players.forEach(player => {
       if(game.leaderboard.indexOf(player) === -1){
           game.leaderboard.push(player);
       }
    });
}

function displayLeaderBoard(leaderBoard){
    let message = "Game results:\n";
    for(let i = 0; i < leaderBoard.length; i++){
        message = message + (i + 1) + ": " + leaderBoard[i].name + "\n";
    }
    return message;
}

function handleError(error, errorMessage){
    if(!usersMap.has(errorMessage.author.id)){
        bot.users.cache.get(developerId).send("ERROR in channel " + errorMessage.channel.name + " in guild " + errorMessage.guild.name + " by user " + errorMessage.author.username + "\n\n```" + error + "```");
        return "Uh oh, something went wrong. Try again";
    }
    let user = usersMap.get(errorMessage.author.id);
    if(user.gameId === null){
        bot.users.cache.get(developerId).send("ERROR in channel " + errorMessage.channel + " in guild " + errorMessage.guild + "by user " + errorMessage.author.username + "\n\n```" + error + "```");
        return "Uh oh, that's weird, you are not in a game. Try again";
    }
    let game = getGameById(user.gameId);
    resetUsers(game.players);
    removeGameById(game.id);
    bot.users.cache.get(developerId).send("ERROR in channel " + errorMessage.channel + " in guild " + errorMessage.guild + "by user " + errorMessage.author.username + "\n\n```" + error.stack + "```");
    return "Something went wrong with the game. All game progress lost. Try starting a new game";
}

const PREFIX = '!13';
const spade = "<:spade:714922167560568954>";
const club = "<:club:714921850999930991>";
const diamond = "<:diamond:714920441612861590>"
const heart = ":heart:";
const discordNumber = [":three:", ":four:", ":five:", ":six:", ":seven:", ":eight:", ":nine:", ":one::zero:", ":regional_indicator_j:", ":regional_indicator_q:", ":regional_indicator_k:", ":regional_indicator_a:", ":two:"];
const numbers = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"];

bot.login(token);

//keeps track of all games that the bot is hosting
let gamesMap = new Map();
//keeps track of all users that are playing games
let usersMap = new Map();

bot.on('ready', () => {
    console.log('Bot online');
});

bot.on('message', message => {
    try {
        let args = message.content.substring(PREFIX.length + 1).split(" ");
        let user = message.author.username;
        switch (args[0]) {
            case 'about':
                message.channel.send(displayAbout());
                break;

            case 'games':
                let displayGamesMessage = "";
                gamesMap.forEach(game => {
                    displayGamesMessage = displayGamesMessage + "id: " + game.id + "\nnumber of players: " + game.players.length + "\n";
                    if (game.inProgress) {
                        displayGamesMessage = displayGamesMessage + "In Progress\n";
                    } else {
                        displayGamesMessage = displayGamesMessage + "Open\n";
                    }
                    displayGamesMessage = displayGamesMessage + "---------------------------------------------------\n";
                });
                if (displayGamesMessage === "") {
                    message.channel.send("There are currently no games");
                    return;
                }
                message.channel.send(displayGamesMessage);
                break;

            case 'create':
                if (args.length < 2) {
                    message.reply("Error creating a game. Remember to create an 'id' for the game");
                    return;
                }
                if (gamesMap.has(args[1])) {
                    message.reply("Error creating a game. This game id already exists");
                    return;
                }
                gamesMap.set(args[1], new Game(args[1]));
                message.channel.send("Game with id: '" + args[1] + "' successfully created");
                break;

            case 'join':
                if (args.length < 2) {
                    message.reply("Error joining a game. Please indicate the 'id' of the game you wish to join");
                    return;
                }
                let joinGame = getGameById(args[1]);
                if (joinGame === null) {
                    message.reply("Error joining a game. Game does not exist");
                    return;
                }
                let joiningUser = addUser(message.author.id, user);
                if (joiningUser.gameId !== null) {
                    message.reply("You are already in a game!");
                    return;
                }
                let returnMessage = joinGame.addPlayer(user, message.author.id);
                //set the game for the user on the map
                if (returnMessage.success) {
                    joiningUser.setGameId(args[1]);
                    usersMap.set(message.author.id, joiningUser);
                }
                message.channel.send(returnMessage.message);
                break;

            case 'leave':
                if (!usersMap.has(message.author.id)) {
                    message.reply("You did not join a game to leave!");
                    return;
                }
                let leaveGame = getGameById(getGameIdFromUser(message.author.id));
                if (leaveGame.inProgress) {
                    message.reply("Error removing you from the game. You cannot leave a game that is currently in progress.");
                    return;
                }
                if (leaveGame.removePlayer(message.author.id)) {
                    let leavingUser = usersMap.get(message.author.id);
                    leavingUser.gameId = null;
                    usersMap.set(message.author.id, leavingUser);
                    message.reply("You have left the game '" + leaveGame.id + "'");
                } else {
                    message.reply("Error removing you from the game");
                }
                break;

            case 'players':
                //edge case when user is not on the map
                if (!usersMap.has(message.author.id)) {
                    message.reply("You are currently not in a game!");
                    return;
                }
                let playersGameId = getGameIdFromUser(message.author.id);
                if (playersGameId === null) {
                    message.reply("You are currently not in a game!");
                    return;
                }
                let playersGame = getGameById(playersGameId);
                let playersMessage = "Players in game '" + playersGame.id + "'\n";
                playersGame.players.forEach(player => {
                    playersMessage = playersMessage + "User: " + player.name + "\n";
                });
                message.channel.send(playersMessage);
                break;

            case 'start':
                //edge case when user is not on the map
                if (!usersMap.has(message.author.id)) {
                    message.reply("You did not join a game to start!");
                    return;
                }
                let startGameId = getGameIdFromUser(message.author.id);
                if (startGameId === null) {
                    message.reply("You are currently not in a game!");
                    return;
                }
                let startGame = getGameById(startGameId);
                let returnObject = startGame.startGame();
                if (returnObject.success) {
                    let players = startGame.getPlayers();
                    //dm each player the cards they have been dealt
                    players.forEach(player => {
                        bot.users.cache.get(player.id).send(displayCards(player.cards));
                    });
                    message.channel.send("User " + user + " is starting the game\n" +
                        "It is " + players[startGame.getCurrentPlayer()].name + "'s turn");
                    return;
                } else {
                    message.channel.send(returnObject.message);
                }
                break;

            case 'table':
                let tableGameId = getGameIdFromUser(message.author.id);
                if (tableGameId === null) {
                    message.reply("You are currently not in a game!");
                    return;
                }
                let tableGame = getGameById(tableGameId);
                let cardsOnTable = displayCards(tableGame.getTableCards());
                message.channel.send(cardsOnTable);
                break;

            case 'skip':
                let skipGameid = getGameIdFromUser(message.author.id);
                if (skipGameid === null) {
                    message.reply("You are currently not in a game!");
                    return;
                }
                let skipGame = getGameById(skipGameid);
                message.channel.send(skipGame.handleSkip(message.author.id));
                break;

            case 'play':
                let playingCards = args.slice(1);
                let playGameid = getGameIdFromUser(message.author.id);
                if (playGameid === null) {
                    message.reply("You are currently not in a game!");
                    return;
                }
                let playGame = getGameById(playGameid);
                let result = playGame.play(playingCards, message.author.id);
                if (result.success) {
                    if (result.win) {
                        //The current player ran out of cards. Add them to the leaderboard. Continue playing.
                        if (playGame.players.length - playGame.leaderboard.length !== 1) {
                            message.channel.send(user + " plays\n" + displayCards(result.cards) + "User " + user + " ran out of cards\n" + result.message);
                        } else {
                            //All but one player ran out of cards. Add the last player to the leaderboard and end the game.
                            addLastPlayerToLeaderBoard(playGame);
                            message.channel.send(user + " plays\n" + displayCards(result.cards) + "User " + user + " ran out of cards\n" + "GAMEOVER\n" + displayLeaderBoard(playGame.leaderboard) + "Resetting Game ....");
                            resetUsers(playGame.players);
                            removeGameById(playGame.id);
                        }
                        return;
                    }
                    message.channel.send(user + " plays\n" + displayCards(result.cards) + result.message);
                    //dm the player their updated playing hand
                    message.author.send(displayCards(result.player.cards));
                } else {
                    //Current player made an invalid play. Display the the reason
                    message.channel.send(result.message);
                }
                break;

            case 'history':
                //edge case when user is not on the map
                if (!usersMap.has(message.author.id)) {
                    message.reply("You did not start a game to see the game's history!");
                    return;
                }
                let historyGameId = getGameIdFromUser(message.author.id);
                if (historyGameId === null) {
                    message.reply("You are currently not in a game!");
                    return;
                }
                let historyGame = getGameById(historyGameId);
                if(historyGame.history.length === 0){
                    message.channel.send("The game has no history");
                    return;
                }
                let response = '';
                historyGame.history.forEach(play => {
                    if(play.skip === true){
                        response = response + play.player.name + " has skipped!\n---------------------------------------------------\n";
                    }else{
                        response = response + play.player.name + " plays\n" + displayCards(play.cards);
                    }
                });
                message.channel.send(response);
        }
    } catch(error) {
        message.channel.send(handleError(error, message));
    }
});

module.exports = {
    displayCards
}