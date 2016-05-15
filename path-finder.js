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
// Empty Tile 0
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

var startPosition = '1|3', // {x: 1, y: 3},
  currentPosition = '1|3',
  finishPosition = '3|8', // {x: 3, y: 8},
  emptyTileCharacter = chalk.grey("_"),
  wallCharacter = chalk.blue("X"),
  startCharacter = chalk.white("S"),
  finishCharacter = chalk.yellow("F"),
  guineaPigCharacter = chalk.red("P"),
  startTime, finishTime;

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

      // TODO: Turn this into a custom object
      var currentCoordinates = currentPosition.split('|').map(function(value){return parseInt(value)});
      var startCoordinates = startPosition.split('|').map(function(value){return parseInt(value)});
      var finishCoordinates = finishPosition.split('|').map(function(value){return parseInt(value)});

      /**
       * Precedence says the guinea pig has precedence over
       * the other characters
       */
      if(yTileIndex == currentCoordinates[1] && xTileIndex == currentCoordinates[0]) {
        floor += " " + guineaPigCharacter;
        return;
      } else if(yTileIndex == startCoordinates[1] && xTileIndex == startCoordinates[0]) {
        floor += " " + startCharacter;
        return;
      } else if(yTileIndex == finishCoordinates[1] && xTileIndex == finishCoordinates[0]) {
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

/**
 * Save the time in which the program started running
 */
var startTimer = function(){
  startTime = new Date();
};

/**
 * Save the time in which the program finished running
 */
var stopTimer = function(){
  finishTime = new Date();
};

var getSuroundingTiles = function(currentPosition){

  var currentCoordinates = currentPosition.split('|').map(function(value){return parseInt(value)});
  return [
    (currentCoordinates[0] + 1) + '|' + currentCoordinates[1],
    (currentCoordinates[0] - 1) + '|' + currentCoordinates[1],
    currentCoordinates[0] + '|' + (currentCoordinates[1] + 1),
    currentCoordinates[0] + '|' + (currentCoordinates[1] - 1)
  ];
};

/**
 * Algorithm:
 *
 * 1. Create a list of the four adjacent cells
 * 2. Check all cells in each list for the following two conditions
 *     a. If the cell is a wall, remove it from the list
 *     b. If there is an element in the main list with the same
 *        coordinate and an equal or higher counter, remove it from
 *        the list
 * 3. Add all remaining cells in the list to the end of the main list
 */
var getPath = function(){
  // loop until the the path has been found
  var counter = 0;
  // Create a list of the four adjacent cells
  var trace = [];
  // for (var index = 0; index == 0;) {
    counter++;
    var surroundingTiles = getSuroundingTiles(currentPosition);
    /**
     * 2. Check all cells in each list for the following two conditions
     *     a. If the cell is a wall, remove it from the list
     *     b. If there is an element in the main list with the same
     *        coordinate and an equal or higher counter, remove it from
     *        the list
     */
    console.log("Surrounding Tiles", surroundingTiles);
    surroundingTiles.forEach(function(tile){
      var tileCoordinates = tile.split('|').map(function(value){return parseInt(value)});
      var tileType = tiles[tileCoordinates[0]][tileCoordinates[1]];
      console.log("\ntile: ", tile);
      console.log("tileType: ", tileType);
      // If the cell is a wall, remove it from the list
      // if(  ){
      //
      // }
    });
  // }
  return trace;
};

var run = function() {
  startTimer();
  clearScreen();
  printLegend();
  printBoardTiles(tiles);
  getPath(tiles);
  stopTimer();
};

/**
 * Run program if called as script
 */
if (require.main === module) {
  run();
}
