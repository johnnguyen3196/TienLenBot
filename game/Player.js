class Player {
    constructor(name, id) {
        this.name = name;
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