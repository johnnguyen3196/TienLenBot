const Discord = require('discord.js');
const bot = new Discord.Client();
const token = require('./key.js');
const {addPlayer,start} = require("./game/gameDriver");

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
            let returnMessage = addPlayer(user);
            message.channel.send(returnMessage);
            break;
        case 'start':
            start();
            message.channel.send('User ' + user + ' is starting the game');
            break;
    }
});