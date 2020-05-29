class Player {
    constructor(name, id) {
        //Username from Discord
        this.name = name;
        //Unique ID from Discord
        this.id = id;
        this.skip = false;
        this.gameId = null;
    }

    giveCards(cards){
        this.cards = cards;
    }

    setGameId(id){
        this.gameId = id;
    }
}
module.exports = Player;