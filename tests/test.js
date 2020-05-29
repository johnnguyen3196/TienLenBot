const mocha = require("mocha");
const assert = require('assert');
const Player = require('../game/Player');
const Card = require('../game/Card');
const Table = require('../game/Table');
const {validPlay} = require('../game/Game');
//allows me to temporarily convert my private functions to public for testing purposes
const rewire = require('rewire');
const Game = rewire('../game/Game');

//Just found out that using '() =>' is not recommended for Mocha, but I don't want to go through all my tests and change it
describe('Smoke Test', () => {
   describe('Game Initialization', () => {
       let game = new Game('initial');

       it('should return correct id', () => {
          assert.strictEqual(game.id, 'initial');
       });
       it('should return empty player list', () => {
          assert.strictEqual(game.players.length, 0);
       });
       it('game should not be in progress', () => {
          assert.strictEqual(game.inProgress, false);
       });
    });

   describe('Player Initialization', () => {
       let player = new Player('A', 1);

       it('should return correct username', () => {
          assert.strictEqual(player.name, 'A');
       });
       it('should return correct id', () => {
           assert.strictEqual(player.id, 1);
       });
       it('should not be inside a game', () => {
           assert.strictEqual(player.gameId, null);
       });
   });

    let game = new Game('a');
    let players = [new Player('A', 1), new Player('B', 2), new Player('C', 3), new Player('D', 4)];

   describe('Joining Tests', () => {
      describe('Adding four players one at a time', () => {
         players.forEach(player => {
           it('adding player ' + player.name + ' should succeed', () => {
               assert.strictEqual(game.addPlayer(player.name, player.id).success, true);
           });
         });
          it('Adding a fifth player should fail', () => {
              let fifthPlayer = new Player('E', 5);
              assert.strictEqual(game.addPlayer(fifthPlayer.name, fifthPlayer.id).success, false);
          });
          it('A player that joined a previous game cannot join another', () => {
              assert.strictEqual(game.addPlayer(players[0].name, players[0].id).success, false);
          });
          it('A game should have a most 4 players', () => {
             assert.true
          });
      });
   });

   describe('Starting Tests', () => {
       describe('Starting a full game', () => {
          it('should succeed', () => {
              assert.strictEqual(game.startGame().success, true);
          });
          it('All players should have 13 cards', () => {
             let result = true;
             game.players.forEach(player => {
                 if(player.cards.length !== 13){
                     result = false;
                 }
             });
             assert.strictEqual(result, true);
          });
          it('Player with 3 of Spades is starting', () => {
              let startingCard = game.players[game.currentPlayer].cards[0];
              assert.strictEqual(startingCard.getNumber() === '3' && startingCard.getSuite() === 'Spade', true);
          });
       });
       it('Starting an empty game should fail', () => {
          assert.strictEqual(new Game('startEmpty').startGame().success, false);
       });
       it('Starting a game with one player should fail', () => {
          let onePlayerGame = new Game('onePlayer');
          let singlePlayer = new Player('single', 111);
          onePlayerGame.addPlayer(singlePlayer.name, singlePlayer.id);
          assert.strictEqual(onePlayerGame.startGame().success, false);
       });
    });

   describe('Testing valid card combinations', () => {
       //temporarily make private function public to test
       let validPlay = Game.__get__('validPlay');
       let validPlays = [];
       validPlays.push([new Card('3', 'Spade')]); //0: low single
       validPlays.push([new Card('2', 'Spade')]); //1: high single
       validPlays.push([new Card('3', 'Spade'), new Card('3', 'Club')]); //2: low double
       validPlays.push([new Card('10', 'Spade'), new Card('10', 'Club')]); //3: high double
       validPlays.push([new Card('3', 'Spade'), new Card('3', 'Club'), new Card('3', 'Diamond')]); //4: low triple
       validPlays.push([new Card('J', 'Spade'), new Card('J', 'Club'), new Card('J', 'Diamond')]); //5: high triple
       validPlays.push([new Card('3', 'Spade'), new Card('4', 'Club'), new Card('5', 'Diamond')]); //6: low sequence
       validPlays.push([new Card('9', 'Spade'), new Card('10', 'Club'), new Card('J', 'Diamond')]); //7: high sequence
       validPlays.push([new Card('J', 'Spade'), new Card('J', 'Club'), new Card('J', 'Diamond'), new Card('J', 'Heart')]); //8: Bomb v1
       validPlays.push([new Card('3', 'Spade'), new Card('3', 'Club'), new Card('4', 'Spade'), new Card('4', 'Club'), new Card('5', 'Spade'), new Card('5', 'Club')]); //9: Bomb v2
       let validPlaysExpectedOutput = ["Single", "Single", "Double", "Double", "Triple", "Triple", "Sequence", "Sequence", "Bomb", "Bomb"];
       let playTable = new Table();
       for(let i = 0; i < validPlays.length; i++) {
           it('should be valid', () => {
               assert.strictEqual(validPlay(validPlays[i], playTable), validPlaysExpectedOutput[i]);
           });
       }
   });

   describe('Testing invalid card combinations', () => {
        let validPlay = Game.__get__('validPlay');
        let invalidPlays = [];
        invalidPlays.push([new Card('3', 'Spade'), new Card('4', 'Club')]);
        invalidPlays.push([new Card('3', 'Spade'), new Card('4', 'Club'), new Card('4', 'Heart')]);
        invalidPlays.push([new Card('3', 'Spade'), new Card('4', 'Club'), new Card('4', 'Heart'), new Card('4', 'Spade')]);
        invalidPlays.push([new Card('3', 'Spade'), new Card('5', 'Club'), new Card('J', 'Heart')]);
        invalidPlays.push([new Card('2', 'Spade'), new Card('3', 'Club'), new Card('4', 'Heart')]);
        let playTable = new Table();
        invalidPlays.forEach(play => {
           it('should be invalid', () => {
              assert.strictEqual(validPlay(play, playTable), false);
           });
        });
   });

   describe('Testing valid plays', () => {
       let validPlay = Game.__get__('validPlay');
       let compareToTable = Game.__get__('compareToTable');
       let validPlays = [[new Card('3', 'Heart')],
                         [new Card('2', 'Heart')],
                         [new Card('5', 'Spade'), new Card('5', 'Club')],
                         [new Card('J', 'Spade'), new Card('J', 'Club'), new Card('J', 'Diamond')],
                         [new Card('9', 'Spade'), new Card('10', 'Club'), new Card('J', 'Diamond')],
                         [new Card('J', 'Spade'), new Card('J', 'Club'), new Card('J', 'Diamond'), new Card('J', 'Heart')]];
       let cardsOnTable = [[new Card('3', 'Spade')],
                           [new Card('A', 'Spade')],
                           [new Card('3', 'Spade'), new Card('3', 'Club')],
                           [new Card('3', 'Spade'), new Card('3', 'Club'), new Card('3', 'Diamond')],
                           [new Card('3', 'Spade'), new Card('4', 'Club'), new Card('5', 'Diamond')],
                           [new Card('2', 'Heart')]];
       let table = new Table();
       for(let i = 0; i < validPlays.length; i++){
           it('should be a valid play', () => {
               table.cards = cardsOnTable[i];
               table.type = validPlay(cardsOnTable[i], table);
               assert.strictEqual(compareToTable(validPlays[i], validPlay(validPlays[i], table), table), true);
           });
       }
   });

   describe('Testing invalid plays', () => {
       let validPlay = Game.__get__('validPlay');
       let compareToTable = Game.__get__('compareToTable');
       let cardsOnTable = [[new Card('3', 'Heart')],
           [new Card('2', 'Heart')],
           [new Card('5', 'Spade'), new Card('5', 'Club')],
           [new Card('J', 'Spade'), new Card('J', 'Club'), new Card('J', 'Diamond')],
           [new Card('9', 'Spade'), new Card('10', 'Club'), new Card('J', 'Diamond')],
           [new Card('J', 'Spade'), new Card('J', 'Club'), new Card('J', 'Diamond'), new Card('J', 'Heart')]];
       let invalidPlays = [[new Card('3', 'Spade')],
           [new Card('A', 'Spade')],
           [new Card('3', 'Spade'), new Card('3', 'Club')],
           [new Card('3', 'Spade'), new Card('3', 'Club'), new Card('3', 'Diamond')],
           [new Card('3', 'Spade'), new Card('4', 'Club'), new Card('5', 'Diamond')],
           [new Card('2', 'Heart')]];
       let table = new Table();
       for(let i = 0; i < invalidPlays.length; i++){
           it('should be a invalid play', () => {
               table.cards = cardsOnTable[i];
               table.type = validPlay(cardsOnTable[i], table);
               assert.strictEqual(compareToTable(invalidPlays[i], validPlay(invalidPlays[i], table), table), false);
           });
       }
   });
});