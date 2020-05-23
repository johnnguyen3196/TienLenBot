class Player {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }

    giveCards(cards){
        this.cards = cards;
    }

    getName(){
        return this.name;
    }

    getCards(){
        return this.cards;
    }
}
module.exports = Player;