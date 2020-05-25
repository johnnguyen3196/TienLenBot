const Discord = require('discord.js');
const bot = new Discord.Client();
const token = require('./key.js');
const {addPlayer,start,getPlayers, getTableCards, getCurrentPlayer, getPlayerByUserName, handleSkip, play, resetGame} = require("./game/gameDriver");
const Card = require("./game/Card.js");

function displayCards(cards){
    let message = "--------------------------------------------------------------\nCurrent cards:\n"
    for(let i = 0; i < cards.length; i++){
        message = message + i + ": " + cards[i].getNumber() + " of " + cards[i].getSuite() + "\n";
    }
    message = message + "--------------------------------------------------------------";
    return message;
}

const PREFIX = '!card';
bot.login(token);

bot.on('ready', () => {
    console.log('Bot online');
});

bot.on('message', message => {
    let args = message.content.substring(PREFIX.length + 1).split(" ");
    let user = message.author.username;
    switch(args[0]){
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
                }
                message.channel.send(user + " plays " + displayCards(result.cards) + "\n" + result.message);
                message.author.send(displayCards(result.player.cards));
            } else {
                message.channel.send(result.message);
            }
    }
});

module.exports = {
    displayCards
}