const Discord = require('discord.js');
const bot = new Discord.Client();
const token = require('./key.js');
const {addPlayer,start, findThreeOfSpades, getPlayers} = require("./game/gameDriver");
const Card = require("./game/Card.js");

function displayCards(cards){
    let message = ""
    cards.forEach(card => {
        message = message + card.getNumber() + " of " + card.getSuite() + "\n";
    });
    message = message + "--------------------------------------------------------------";
    return message;
}

const PREFIX = '!card';
bot.login(token);

bot.on('ready', () => {
    console.log('Bot online');
});

//msg.author.send() to privately message user
//msg.channel.sendMessage() to channel
bot.on('message', message => {
    let args = message.content.substring(PREFIX.length + 1).split(" ");
    //let channelName = message.channel.name;
    //console.log(message);
    let user = message.author.username;
    switch(args[0]){
        case 'join':
            let returnMessage = addPlayer(user, message.author.id);
            message.channel.send(returnMessage);
            break;
        case 'start':
            let returnObject = start();
            if(returnObject.boolean){
                message.channel.send('User ' + user + ' is starting the game');
                let players = getPlayers();
                players.forEach(player => {
                    bot.users.cache.get(player.id).send(displayCards(player.cards));
                });
                return;
            } else {
                message.channel.send(returnObject.message);
            }
            break;
    }
});