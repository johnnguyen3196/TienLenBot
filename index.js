const Discord = require('discord.js');
const bot = new Discord.Client();
const token = require('./key.js');
const {addPlayer,start,getPlayers, getTableCards, getCurrentPlayer, getPlayerByUserName, handleSkip, play, resetGame, indexOfNumber} = require("./game/gameDriver");
const Card = require("./game/Card.js");

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
    return message;
}

function displayAbout(){
    let exampleCards = [new Card("3", "Spade"), new Card("4", "Heart"), new Card("5", "Club")];
    return "Commands:\n" +
           "join    - Allows the user to join a game\n\n" +
           "start   - Allows the user to start a game. The bot will DM you the cards that are in your hand. ***There must be atleast 2 users who joined the game***\n\n" +
           "table   - Displays the cards that are currently on the table\n\n" +
           "skip    - The user will skip the current round\n\n" +
           "play {index} - The user plays the card[s] based on the index of the card on their current hand\n\n" +
           "Example of 'play' command with cards:\n" +
            displayCards(exampleCards) +
           "\n\n!13 play 0 1 2\n\n" +
           "user plays\n" +
            displayCards(exampleCards);
}

const PREFIX = '!13';
const spade = "<:spade:714922167560568954>";
const club = "<:club:714921850999930991>";
const diamond = "<:diamond:714920441612861590>"
const heart = ":heart:";
const discordNumber = [":three:", ":four:", ":five:", ":six:", ":seven:", ":eight:", ":nine:", ":ten:", ":regional_indicator_j:", ":regional_indicator_q:", ":regional_indicator_k:", ":regional_indicator_a:", ":two:"];

bot.login(token);

bot.on('ready', () => {
    console.log('Bot online');
});

bot.on('message', message => {
    let args = message.content.substring(PREFIX.length + 1).split(" ");
    let user = message.author.username;
    switch(args[0]){
        case 'about':
            message.channel.send(displayAbout());
            break;
        case 'join':
            let returnMessage = addPlayer(user, message.author.id);
            message.channel.send(returnMessage);
            break;
        case 'start':
            let returnObject = start();
            if(returnObject.boolean){
                let players = getPlayers();
                players.forEach(player => {
                    bot.users.cache.get(player.id).send(displayCards(player.cards));
                });
                message.channel.send("User " + user + " is starting the game\n" +
                                    "It is " + players[getCurrentPlayer()].name + "'s turn");
                return;
            } else {
                message.channel.send(returnObject.message);
            }
            break;
        case 'table':
            let cardsOnTable = displayCards(getTableCards());
            message.channel.send(cardsOnTable);
            break;
        case 'skip':
            message.channel.send(handleSkip(user));
            break;
        case 'play':
            let playingCards = args.slice(1);
            let result = play(playingCards, user);
            if(result.success){
                if(result.player.cards.length === 0){
                    resetGame();
                    message.channel.send(user + " won the game\nGame resetting");
                    return;
                }
                message.channel.send(user + " plays " + displayCards(result.cards) + "\n" + result.message);
                message.author.send(displayCards(result.player.cards));
            } else {
                message.channel.send(result.message);
            }
            break;
    }
});

module.exports = {
    displayCards
}