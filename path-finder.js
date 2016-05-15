'use strict';

var chalk = require('chalk');

//   1 2 3 4 5 6 7 8
// X X X X X X X X X X
// X _ _ _ X X _ X _ X 1
// X _ X _ _ X _ _ _ X 2
// X S X X _ _ _ X _ X 3
// X _ X _ _ X _ _ _ X 4
// X _ _ _ X X _ X _ X 5
// X _ X _ _ X _ X _ X 6
// X _ X X _ _ _ X _ X 7
// X _ _ O _ X _ _ _ X 8
// X X X X X X X X X X

// Wall = 1
// Open Space = 0
// Start = 2
// Finish = 3
var tiles = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

var startPosition = {x: 1, y: 3},
  currentPosition = startPosition,
  finishPosition = {x: 3, y: 8},
  emptyTileCharacter = chalk.grey("_"),
  wallCharacter = chalk.blue("X"),
  startCharacter = chalk.white("S"),
  finishCharacter = chalk.yellow("F"),
  guineaPigCharacter = chalk.red("P");

/**
 * print board tiles.
 *
 * Character printing precedence in ascendent order (most important on top):
 *     (1) Guinea Pig
 *     (2) Start or finish
 *     (3) Wall
 *     (4) Empty Tile
 *
 * Position validation
 *     (1) start and finish can't have the same coordiantes
 *
 * @param tiles
 */
var printBoardTiles = function(tiles){
  var floor = '';
  tiles.forEach(function(xTiles, yTileIndex){
    xTiles.forEach(function(tileValue, xTileIndex){

      /**
       * Precedence says the guinea pig has precedence over
       * the other characters
       */
      if(yTileIndex == currentPosition.y && xTileIndex == currentPosition.x) {
        floor += " " + guineaPigCharacter;
        return;
      } else if(yTileIndex == startPosition.y && xTileIndex == startPosition.x) {
        floor += " " + startCharacter;
        return;
      } else if(yTileIndex == finishPosition.y && xTileIndex == finishPosition.x) {
        floor += " " + finishCharacter;
        return;
      }

      switch (tileValue) {
        // empty tile Character
        case 0:
          floor += " " + emptyTileCharacter;
          break;
        // wall Character
        case 1:
          floor += " " + wallCharacter;
          break;
        // Start Character
        case 2:
          floor += " " + startCharacter;
          break;
        // Finish Character
        case 3:
          floor += " " + finishCharacter;
          break;
        default:
          throw new Error('Couldn\'t understand tile in x:"' + xTile + '"/y:' + yTile);
      };
    });
    floor += '\n';
  });
  process.stdout.write(floor + '\n');
};

/**
 * Colour assignment:
 *     blue: Wall
 *     grey: Empty tile
 *     white: start
 *     yellow: finish
 *     red: Guinea Pig
 **/
var printLegend = function () {
  var legend = chalk.red('1) red: Guinea Pig "' + guineaPigCharacter + '"\n')
    + chalk.white('2) White: Start "' + startCharacter + '"\n')
    + chalk.yellow('3) Yellow: Finish "' + finishCharacter + '"\n')
    + chalk.blue('4) Blue: Wall "' + wallCharacter + '"\n')
    + chalk.grey('5) Grey: Empty Tile "' + emptyTileCharacter + '"\n\n');
  process.stdout.write(legend);
};

/**
 * Clear console screen
 */
var clearScreen = function(){
  process.stdout.write('\u001B[2J\u001B[0;0f');
};

var run = function() {
  clearScreen();
  printLegend();
  printBoardTiles(tiles);
};

/**
 * Run program if called as script
 */
if (require.main === module) {
  run();
}
