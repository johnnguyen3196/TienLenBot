const Card = require("./Card.js");
const Player = require("./Player.js");

let players = [];
let cards = [];
let currentPlayer = null;
let table = [];
let inProgress = false;
let numbers = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"];
let suites = ["Spade", "Club", "Diamond", "Heart"];

function addPlayer(player, id){
    if(inProgress){
        return "Error: Match is currently in progress!";
    }
    if(players.length <= 4){
        players.push(new Player(player, id));
        return "User " + player + " joined the game";
    } else {
        return "Error: Max player limit reached!";
    }
}

function start(){
    let returnObject = {
        boolean: false,
        message: ""
    };
    if(inProgress){
        returnObject.boolean = false;
        returnObject.message = "Error: You can't start a game that is already in progress!"
        return returnObject;
    }
    if(players.length === 1 || players.length === 0){
        returnObject.boolean = false;
        returnObject.message = "Sorry, you can't play by yourself :(";
        inProgress = false;
        return returnObject;
    }
    cards = createDeck();
    distributeCards(players.length);
    currentPlayer = players.indexOf(findThreeOfSpades());
    inProgress = true;
    returnObject.boolean = true;
    return returnObject;
}

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

//Fisher-Yates (aka Knuth) Shuffle.
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

function contains(cards, number, suite){
    let i = 0;
    while(i < cards.length){
        if(cards[i].getNumber() === number && cards[i].getSuite() === suite){
            return true;
        }
        i++;
    }
    return false;
}

function organizeCards(cards){
    let organized = [];
    numbers.forEach(number => {
       suites.forEach(suite => {
            if(contains(cards, number, suite)){
                organized.push(new Card(number, suite));
            }
       });
    });
    return organized;
}

function distributeCards(length){
    for(let i = 0; i < length; i++){
        players[i].giveCards(organizeCards(cards.splice(0, 13)));
    }
}

function findThreeOfSpades(){
    let i = 0;
    while(i < players.length){
        if(contains(players[i].cards, "3", "Spade")) {
            return players[i];
        }
        i++;
    }
    //if no one has a 3 of spades, first player is returned
    return players[0];
}

function getPlayers(){
    return players;
}

module.exports = {
    addPlayer,
    start,
    getPlayers
}