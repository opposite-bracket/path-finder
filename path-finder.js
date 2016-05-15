'use strict';

var chalk = require('chalk');
var debug = true;
var printingSpeed = 250;

var log = function(){
  if(debug){
    console.log.apply(null, arguments);
  }
};

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

var startPosition = '1|3',
  finishPosition = '3|8|0', // x position | y position | number of positions to start
  emptyTileCharacter = chalk.grey("_"),
  wallCharacter = chalk.blue("X"),
  startCharacter = chalk.white("S"),
  finishCharacter = chalk.yellow("F"),
  guineaPigCharacter = chalk.red("P"),
  timer = {
    processing: {started: null, finished: null}
  };

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
var printBoardTiles = function(tiles, coordinates){
  var floor = chalk.grey('   1 2 3 4 5 6 7 8\n');
  // draw floor
  tiles.forEach(function(xTiles, yTileIndex){
    xTiles.forEach(function(tileValue, xTileIndex){

      // TODO: Turn this into a custom object
      var currentCoordinates = coordinates.split('|').map(function(value){return parseInt(value)});
      var startCoordinates = startPosition.split('|').map(function(value){return parseInt(value)});
      var finishCoordinates = finishPosition.split('|').map(function(value){return parseInt(value)});

      /**
       * Precedence says the guinea pig has precedence over
       * the other characters
       */
      // currentCoordinates
      if(xTileIndex == currentCoordinates[0] && yTileIndex == currentCoordinates[1]) {
        floor += " " + guineaPigCharacter;
        return;
      } else if(xTileIndex == startCoordinates[0] && yTileIndex == startCoordinates[1]) {
        floor += " " + startCharacter;
        return;
      } else if(xTileIndex == finishCoordinates[0] && yTileIndex == finishCoordinates[1]) {
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
    floor += chalk.grey(((yTileIndex != 0 && yTileIndex != 9) ? ' ' + yTileIndex : '') + '\n');
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

var getSuroundingTiles = function(currentCoordinates){

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
  // Create a list of the four adjacent cells
  var trace = [finishPosition];
  for (var cursor = 0; cursor <= 19; cursor++) {

    // log('--------------------------------');
    // log('processing', trace[cursor]);
    var currentCoordinates = trace[cursor].split('|').map(function(value){return parseInt(value)});
    var surroundingTiles = getSuroundingTiles(currentCoordinates).sort();

    // TODO: break the loop of path reached the starting point

    /**
     * 2. Check all cells in each list for the following two conditions
     *     a. If the cell is a wall, remove it from the list
     *     b. If there is an element in the main list with the same
     *        coordinate and an equal or higher counter, remove it from
     *        the list
     */
    // log("Surrounding Tiles", surroundingTiles);
    surroundingTiles.forEach(function(tile, index){
      var tileCoordinates = tile.split('|').map(function(value){return parseInt(value)});
      var tileType = tiles[tileCoordinates[1]][tileCoordinates[0]];

      var isChecked = trace.findIndex(function(position){
        var regex = new RegExp('^' + tileCoordinates[0] + '\\|' + tileCoordinates[1] + '\\|[0-9]+' + '$');
        return Boolean(position.match(regex));
      }) >= 0;

      // log("\nTile Index in surrounding tiles", surroundingTiles.indexOf(tile));
      // log("tile: ", tile);
      // log("tileType: ", tileType == 0 ? 'empty tile' : 'wall');
      // log("isChecked ", isChecked);
      // log("adding to stack? ", Boolean(tileType == 0 && !isChecked));
      // log("length ", tileCoordinates.length);

      // remove it from the list if
      // - If the cell is a wall (1), remove it from the list
      // - If there is an element in the main list with the same
      //   coordinate and an equal or higher counter, remove it from
      //   the list
      if( tileType == 0 && !isChecked ){
        surroundingTiles[index] += '|' + (currentCoordinates[2] + 1);
        trace.push(surroundingTiles[index]);
      }

    });

    // log("\ntrace", trace);
    // log("cursor", cursor);
  }
  // log("\ntrace", trace);
  return trace;
};

/**
 * Retrieves the coordinates with the smallest number of positions
 * to take to get from the finish line to the start line.
 *
 * TODO: This will need to be updated the moment that the getPath
 * function knows how to dynalically end the loop when the start line
 * has been reached.
 *
 * @param trace
 * @returns {*}
 */
var getSmallestNumberOfPosition = function(trace){
  return trace[trace.length -1].split('|')[2];
};

var groupByNumberOfSteps = function(trace){
  var grouped = {};

  // group
  trace.forEach(function(tile, index){
    var tileCoordinates = tile.split('|').map(function(value){return parseInt(value)});
    if( !grouped.hasOwnProperty(tileCoordinates[2]) ) {
      grouped[tileCoordinates[2]] = [];
    }
    grouped[tileCoordinates[2]].push(tile);
  });

  return grouped;
};

/**
 * Retrieves the next step to draw on the board.
 *
 * @param trace
 * @param guineaPigPosition
 */
var getNextStep = function(trace, guineaPigPosition){

  var groupedTrace = groupByNumberOfSteps(trace);

  // sort to grab the one with the smallest value
  groupedTrace[guineaPigPosition].sort()
  return groupedTrace[guineaPigPosition][0];
};

/**
 * Draw the solution on the console.
 *
 * @param trace
 * @param tiles
 * @param numberOfPositions
 */
var drawPath = function(trace, tiles, numberOfPositions){
  var coordinates = getNextStep(trace, numberOfPositions);
  // log(coordinates);

  clearScreen();
  printLegend();
  printBoardTiles(tiles, coordinates);

  process.stdout.write('\rPosition: ' + coordinates + '\n');

  setTimeout(function(){
    numberOfPositions--;

    // draw while there are steps to draw.
    if(numberOfPositions >= 0) {
      drawPath(trace, tiles, numberOfPositions);
    }
  }, printingSpeed);
};

var run = function() {
  // set start time for path finder calculation
  timer.processing.started = new Date();
  var trace = getPath(tiles);
  // set finish time for path finder calculation
  timer.processing.finished = new Date();

  // log(trace);

  // Get smallest number of positions
  // and start printing path recursively
  drawPath(trace, tiles, getSmallestNumberOfPosition(trace));
};

/**
 * Run program if called as script
 */
if (require.main === module) {
  // TODO: handle an argument to enable debugging or not
  run();
}
