class Player {
    constructor(name, id) {
        this.name = name;
        this.id = id;
        this.skip = false;
    }

    giveCards(cards){
        this.cards = cards;
    }
}
module.exports = Player;