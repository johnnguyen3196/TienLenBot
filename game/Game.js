const Card = require("./Card.js");
const Player = require("./Player.js");
const Table = require("./Table.js");

const numbers = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"];
const suites = ["Spade", "Club", "Diamond", "Heart"];

class Game{
    constructor(id){
        //name of the game
        this.id = id;
        this.players = [];
        this.cards = [];
        //index of the current player
        this.currentPlayer = null;
        //table holds the cards played in a previous turn
        this.table = null;
        this.inProgress = false;
        this.leaderboard = [];
        this.history = [];
    }

    addPlayer(player, id){
        let returnObject = {
            success: false,
            message: ""
        }
        if(this.inProgress){
            returnObject.message = "Error: Match is currently in progress!";
            return returnObject;
        }
        if(this.players.length < 4){
            let newPlayer = new Player(player, id);
            newPlayer.gameId = this.id;
            this.players.push(newPlayer);
            returnObject.success = true;
            returnObject.message = "User " + player + " joined the game '" + this.id + "'";
            return returnObject;
        } else {
            returnObject.message = "Error: Max player limit reached!"
            return returnObject;
        }
    }

    startGame(){
        let returnObject = {
            success: false,
            message: ""
        };
        if(this.inProgress){
            returnObject.success = false;
            returnObject.message = "Error: You can't start a game that is already in progress!"
            return returnObject;
        }
        if(this.players.length === 1 || this.players.length === 0){
            returnObject.success = false;
            returnObject.message = "Sorry, you can't play by yourself :(";
            this.inProgress = false;
            return returnObject;
        }
        this.cards = createDeck();
        distributeCards(this.players.length, this.players, this.cards);
        this.currentPlayer = this.players.indexOf(findThreeOfSpades(this.players));
        this.inProgress = true;
        returnObject.success = true;
        this.table = new Table();
        return returnObject;
    }

    getPlayers(){
        return this.players;
    }

    getTableCards(){
        return this.table.cards;
    }

    getCurrentPlayer(){
        return this.currentPlayer;
    }

    handleSkip(playerId){
        let skipMessage = ""
        let userIndex = getPlayerById(playerId, this.players);
        if(userIndex === null){
            skipMessage = "You are not even playing the game!";
            return skipMessage;
        }
        if(userIndex !== this.currentPlayer){
            skipMessage = "It is not your turn!";
            return skipMessage;
        }
        this.players[userIndex].skip = true;
        skipMessage = this.players[userIndex].name + " has skipped! ";
        //add this skip to the history
        addHistory("", this.players[userIndex], this.history, true);
        return skipMessage + setNextPlayer(this);
    }

    play(cardsIndex, playerId){
        let returnObject = {
            success: false,
            message: "",
            cards: [],
            player: null,
            win: false
        }
        let playerIndex = getPlayerById(playerId, this.players);
        if(playerIndex === null){
            returnObject.message = "You are not even playing the game!";
            return returnObject;
        }
        if(cardsIndex.length > this.players[playerIndex].cards.length){
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
            chosenCards.push(this.players[playerIndex].cards[index]);
        });

        try{
            let type = validPlay(chosenCards, this.table);
            if(!type){
                returnObject.message = "Invalid Play";
                return returnObject;
            }
            if(compareToTable(chosenCards, type, this.table)){
                this.table.cards = chosenCards;
                this.table.type = type;
                removeCards(intCardsIndex, playerIndex, this.players);
                returnObject.message = setNextPlayer(this);
                returnObject.success = true;
                returnObject.cards = chosenCards;
                returnObject.player = this.players[playerIndex];
            } else {
                returnObject.message = "Your play does not beat the cards on the table"
                return returnObject;
            }
            if(this.players[playerIndex].cards.length === 0){
                this.players[playerIndex].skip = true;
                this.leaderboard.push(this.players[playerIndex]);
                returnObject.win = true;
            }
            //add the current play to the game's history
            addHistory(chosenCards, this.players[playerIndex], this.history, false);
            return returnObject;
        }catch{
            returnObject.message = "Invalid Play";
            return returnObject;
        }

    }

    removePlayer(id){
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].id === id){
                this.players.splice(i, 1);
                return true;
            }
        }
        return false;
    }
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

//Organize the shuffled cards based on number and suite
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

function distributeCards(length, players, cards){
    for(let i = 0; i < length; i++){
        players[i].giveCards(organizeCards(cards.splice(0, 13)));
    }
}

function findThreeOfSpades(players){
    for(let i = 0; i < players.length; i++){
        if(contains(players[i].cards, "3", "Spade")) {
            return players[i];
        }
    }
    //if no one has a 3 of spades, first player is returned
    return players[0];
}

function setNextPlayer(game){
    //One player is left playing the round. Reset.
    if(numberOfSkippedPlayers(game.players) === game.players.length - 1){
        return resetRound(game);
    }
    let currentIndex = game.currentPlayer;
    let finish = false;
    //look for the next player that didn't skip
    while(!finish) {
        if (currentIndex + 1 === game.players.length) {
            currentIndex = 0;
        } else {
            currentIndex++;
        }
        if(!game.players[currentIndex].skip){
            game.currentPlayer = currentIndex;
            finish = true;
        }
    }
    return "It is now " + game.players[game.currentPlayer].name + "'s turn";
}

function numberOfSkippedPlayers(players){
    let i = 0;
    players.forEach(player => {
        if(player.skip){
            i++;
        }
    });
    return i;
}

function resetRound(game){
    //last player that didn't skip
    for(let i = 0; i < game.players.length; i++){
        if(!game.players[i].skip){
            game.currentPlayer = i;
        }
    }
    game.table.cards = [];
    game.table.type = "";
    game.table.size = 0;
    //reset player state
    game.players.forEach(player => {
        //if the player is on the leaderboard (player has no more cards) they will always skip
        if(game.leaderboard.indexOf(player) === -1) {
            player.skip = false;
        }
    });
    return "\nAll players skipped\nIt is now " + game.players[game.currentPlayer].name + "'s turn";
}

//check if the cards are a valid sequence based on numbers
function validSequence(cards){
    for(let i = 0; i < cards.length - 1; i++){
        if(!(numbers.indexOf(cards[i + 1].number) - numbers.indexOf(cards[i].number) === 1)){
            return false;
        }
    }
    return true;
}

//checks if cards beat the cards on the table
function compareToTable(cards, type, table){
    if(table.cards.length === 0){
        return true;
    }
    //Bombs always beat a single 2
    if(table.type === "Single" && table.cards[0].getNumber() === "2" && type === "Bomb"){
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
        //check for the suite of the last cards
        if(lastCardIndex === lastTableCardIndex){
            if(suites.indexOf(lastCard.suite)  > suites.indexOf(lastTableCard.suite)){
                return true;
            }
        }
    }
    return false;
}

function removeCards(index, playerIndex, players){
    //Remove cards from the end since splice creates a new array and messes up indices
    for(let i = index.length - 1; i >= 0; i--) {
        players[playerIndex].cards.splice(index[i], 1);
    }
}

function bombDetector(cards){
    //four of a kind
    if(cards.length === 4) {
        let number = cards[0].getNumber();
        for(let i = 1; i < cards.length; i++){
            if(cards[i].getNumber() !== number){
                return false;
            }
        }
        return true;
    }
    //double sequence
    if(cards.length === 6){
        if(numbers.indexOf(cards[4].getNumber()) - numbers.indexOf(cards[2].getNumber()) === 1 && numbers.indexOf(cards[2].getNumber()) - numbers.indexOf(cards[0].getNumber()) === 1){
            return true;
        }
    }
    return false;
}

function getPlayerById(playerId, players){
    for(let i = 0; i < players.length; i++){
        if(players[i].id === playerId){
            return i;
        }
    }
    return null;
}

function validPlay(cards, table){
    if(bombDetector(cards)){
        return "Bomb";
    }
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

function addHistory(cards, player, history, skip){
    history.push({cards: cards, player: player, skip: skip});
}

module.exports = Game;