const Card = require("./Card.js");

let players = [];
let cards = [];
let table = [];
let inProgress = false;
let numbers = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"];
let suites = ["Spade", "Club", "Diamond", "Heart"];

function addPlayer(player){
    if(inProgress){
        return "Error: Match is currently in progress!";
    }
    if(players.length <= 4){
        players.push(player);
        return "User " + player + " joined the game";
    } else {
        return "Error: Max player limit reached!";
    }
}

function start(){
    if(inProgress){
        return "Error: You can't start a game that is already in progress!";
    }
    cards = createDeck();
    let message = distributeCards(players.length);
    inProgress = true;
    return message;
}

//Fisher-Yates (aka Knuth) Shuffle.
function createDeck(){
    let newDeck = [];
    suites.forEach(suite => {
       numbers.forEach(number => {
         newDeck.push(new Card(number, suite));
       });
    });
    shuffle(newDeck);
    return newDeck;
}

function shuffle(cards){
    let currentIndex = cards.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = cards[currentIndex];
        cards[currentIndex] = cards[randomIndex];
        cards[randomIndex] = temporaryValue;
    }
    return cards;
}

function distributeCards(length){
    let playerCards = [];
    switch(length){
        case 1:
            inProgress = false;
            return "Sorry, you can't play with yourself :("
        case 2:
            playerCards.push(cards.splice(0, 13));
            playerCards.push(cards.splice(0, 13));
            return playerCards;
        case 3:
            playerCards.push(cards.splice(0, 13));
            playerCards.push(cards.splice(0, 13));
            playerCards.push(cards.splice(0, 13));
            return playerCards;
        case 4:
            playerCards.push(cards.splice(0, 13));
            playerCards.push(cards.splice(0, 13));
            playerCards.push(cards.splice(0, 13));
            playerCards.push(cards.splice(0, 13));
            return playerCards;
    }
}

module.exports = {
    addPlayer,
    start
}