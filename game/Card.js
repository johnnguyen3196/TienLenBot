class Card {
    constructor(number, suite) {
        this.number = number;
        this.suite = suite;
    }
    getNumber(){
        return this.number;
    }
    getSuite(){
        return this.suite;
    }
}

module.exports = Card;