const Card = require("./Card.js");
const Player = require("./Player.js");
const Table = require("./Table.js");

let players = [];
let cards = [];
let currentPlayer = null;
let table = null;
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
    table = new Table();
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
    for(let i = 0; i < players.length; i++){
        if(contains(players[i].cards, "3", "Spade")) {
            return players[i];
        }
    }
    //if no one has a 3 of spades, first player is returned
    return players[0];
}

function getPlayers(){
    return players;
}

function getTableCards(){
    return table.cards;
}

function getCurrentPlayer(){
    return currentPlayer;
}

function getPlayerByUserName(username){
    for(let i = 0; i < players.length; i++){
        if(players[i].name === username){
            return i;
        }
    }
    return null;
}

function setNextPlayer(){
    if(numberOfSkippedPlayers() === players.length -1){
        return resetRound();
    }
    let currentIndex = currentPlayer;
    let finish = false;
    while(!finish) {
        if (currentIndex + 1 === players.length) {
            currentIndex = 0;
        } else {
            currentIndex++;
        }
        if(!players[currentIndex].skip){
            currentPlayer = currentIndex;
            finish = true;
        }
    }
    return "It is now " + players[currentPlayer].name + "'s turn";
}

function numberOfSkippedPlayers(){
    let i = 0;
    players.forEach(player => {
       if(player.skip){
           i++;
       }
    });
    return i;
}

function handleSkip(username){
    let skipMessage = ""
    let userIndex = getPlayerByUserName(username);
    if(userIndex === null){
        skipMessage = "You are not even playing the game!";
        return skipMessage;
    }
    if(userIndex !== currentPlayer){
        skipMessage = "It is not your turn!";
        return skipMessage;
    }
    players[userIndex].skip = true;
    skipMessage = username + " has skipped!";
    return skipMessage + setNextPlayer();
}

function resetRound(){
    //last player that didn't skip
    for(let i = 0; i < players.length; i++){
        if(!players[i].skip){
            currentPlayer = i;
        }
    }
    table.cards = [];
    table.type = "";
    table.size = 0;
    //reset player state
    players.forEach(player => {
        player.skip = false;
    });
    return "\nAll players skipped\nIt is now " + players[currentPlayer].name + "'s turn";
}

function play(cardsIndex, username){
    let returnObject = {
        success: false,
        message: "",
        cards: [],
        player: null
    }
    let playerIndex = getPlayerByUserName(username);
    if(playerIndex === null){
        returnObject.message = "You are not even playing the game!";
        return returnObject;
    }
    if(cardsIndex.length > players[playerIndex].cards.length){
        returnObject.message = "You don't have enough cards!"
        return returnObject;
    }
    //convert user input array of strings into array of integers and sort
    let intCardsIndex = [];
    cardsIndex.forEach(index => {
       intCardsIndex.push(parseInt(index));
    });
    intCardsIndex.sort(function(a,b) {
        return a - b;
    });
    let chosenCards = [];
    intCardsIndex.forEach(index => {
       chosenCards.push(players[playerIndex].cards[index]);
    });

    let type = validPlay(chosenCards);
    if(!type){
        returnObject.message = "Invalid Play";
        return returnObject;
    }
    if(compareToTable(chosenCards, type)){
        table.cards = chosenCards;
        table.type = type;
        removeCards(intCardsIndex, playerIndex);
        returnObject.message = setNextPlayer();
        returnObject.success = true;
        returnObject.cards = chosenCards;
        returnObject.player = players[playerIndex];
    } else {
        returnObject.message = "Your play does not beat the cards on the table"
        return returnObject;
    }
    return returnObject;
}

function validPlay(cards){
    //TODO make exception for bombs
    if(cards.length !== table.size && table.size !== 0){
        return false;
    }
    if(cards.length === 1){
        return "Single";
    }
    if(cards.length === 2){
        if(cards[0].number === cards[1].number){
            return "Double";
        } else {
            return false;
        }
    }
    if(cards.length === 3){
        if(cards[0].number === cards[1].number && cards[0].number === cards[2].number){
            return "Triple";
        }
    }
    if(validSequence(cards)){
        return "Sequence";
    } else {
        return false;
    }
}

function validSequence(cards){
    for(let i = 0; i < cards.length - 1; i++){
        if(!(numbers.indexOf(cards[i + 1].number) - numbers.indexOf(cards[i].number) === 1)){
            return false;
        }
    }
    return true;
}

function compareToTable(cards, type){
    if(table.cards.length === 0){
        return true;
    }
    if(type !== table.type){
        return false;
    }
    let lastCard = cards[cards.length - 1];
    let lastTableCard = table.cards[table.cards.length - 1];
    let lastCardIndex = numbers.indexOf(lastCard.number);
    let lastTableCardIndex = numbers.indexOf(lastTableCard.number)
    if(lastCardIndex > lastTableCardIndex){
        return true;
    } else {
        if(lastCardIndex === lastTableCardIndex){
            if(suites.indexOf(lastCard.suite)  > suites.indexOf(lastTableCard.suite)){
                return true;
            }
        }
    }
    return false;
}

function removeCards(index, playerIndex){
    index.forEach(index => {
       players[playerIndex].cards.splice(index, 1);
    });
}

function resetGame(){
    players = [];
    currentPlayer = null;
    table = null;
    inProgress = false;
}

module.exports = {
    addPlayer,
    start,
    getPlayers,
    getTableCards,
    getCurrentPlayer,
    getPlayerByUserName,
    handleSkip,
    validPlay,
    play,
    resetGame
}