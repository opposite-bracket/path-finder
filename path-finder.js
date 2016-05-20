'use strict';

var chalk = require('chalk');
var debug = true;
var printingSpeed = 250;
var enableCornerSkipping = false;
var walked = '*';

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
  finishPosition = '8|1|0', // x position | y position | number of positions to start
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

      var regex = new RegExp('\\*' + xTileIndex + '\\|' + yTileIndex + '\\|[0-9]+' + '\\*');
      var isWalked = Boolean(walked.match(regex));

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
          // floor += " " + emptyTileCharacter;
          floor += " " + (isWalked?chalk.red('_'):emptyTileCharacter);
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

/**
 * return the surrounding tiles by giving it the coordinates
 * of a targeted tile.
 *
 * @param currentCoordinates
 * @returns {*[]}
 */
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
  // go through the entire board until the
  // the starting point has been found
  for (var cursor = 0; cursor <= 100; cursor++) {

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

    // break the for loop if the starting point has been added
    var lastAdded = trace[trace.length - 1];
    var targetCoordinates = startPosition.split('|').map(function(value){return parseInt(value)});
    var regex = new RegExp('^' + targetCoordinates[0] + '\\|' + targetCoordinates[1] + '\\|[0-9]+' + '$');
    if( Boolean(lastAdded.match(regex)) ) {
      break;
    }

  }
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
var getFirstPosition = function(trace){
  return trace[trace.length -1].split('|')[2];
};

var groupByNumberOfSteps = function(trace){
  var grouped = {};

  // group
  trace.forEach(function(tile){
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
 * TODO: Investigate because the sorting is messing up
 * the printing of the path. Instead, try being selective with
 * which tile to move next based on the cercany of the current tile
 *
 * @param trace
 * @param guineaPigPosition
 */
var getNextStep = function(trace, currentCoordinates){

  var currentCoordinates = currentCoordinates.split('|');

  var regex;
  if(enableCornerSkipping) {
    var y = [
      parseInt(currentCoordinates[0]) - 1,
      parseInt(currentCoordinates[0]),
      parseInt(currentCoordinates[0]) + 1
    ];
    var x = [
      parseInt(currentCoordinates[1]) - 1,
      parseInt(currentCoordinates[1]),
      parseInt(currentCoordinates[1]) + 1
    ];
    regex = new RegExp('[' + y.join(',') + ']\\|[' + x.join(',') + ']\\|[0-9].');
  } else{
    var regexes = [
      '(' + (parseInt(currentCoordinates[0]) - 1) + '\\|' + currentCoordinates[1] + '\\|[0-9])',
      '(' + (parseInt(currentCoordinates[0]) + 1) + '\\|' + currentCoordinates[1] + '\\|[0-9])',
      '(' + currentCoordinates[0] + '\\|' + (parseInt(currentCoordinates[1]) - 1) + '\\|[0-9])',
      '(' + currentCoordinates[0] + '\\|' + (parseInt(currentCoordinates[1]) + 1) + '\\|[0-9])'
    ];
    regex = new RegExp(regexes.join('|'));
  }

  return trace.join('*').match(regex)[0];
};

/**
 * Calucalte duration the program found the shortest route
 * @param processingTimer
 * @returns {number}
 */
var getDuration = function(processingTimer) {
  return processingTimer.finished.getTime() - processingTimer.started.getTime();
};

/**
 * Draw the solution on the console.
 *
 * @param trace
 * @param tiles
 * @param numberOfPositions
 */
var drawPath = function(trace, tiles, currentPosition, processingTimer){

  var nextPosition = getNextStep(trace, currentPosition);

  clearScreen();
  printLegend();
  printBoardTiles(tiles, nextPosition);

  var meta = '\rPosition: ' + nextPosition + '\n'
    + '\rFound shortest path in ' + chalk.green(getDuration(processingTimer)) + ' ms\n'
    + '\rPrinting path in ' + printingSpeed + ' ms\n'
    + '\rRunning on ' + process.platform + '\n';

  process.stdout.write(meta);

  setTimeout(function(){

    // draw while there are steps to draw.
    if(nextPosition != finishPosition) {
      walked += nextPosition + '*';
      drawPath(trace, tiles, nextPosition, processingTimer );
    }
  }, printingSpeed);
};

var run = function() {
  // set start time for path finder calculation
  timer.processing.started = new Date();
  var trace = getPath(tiles);
  // TODO: Select a path before printing
  // set finish time for path finder calculation
  timer.processing.finished = new Date();

  // Get smallest number of positions
  // and start printing path recursively
  drawPath(trace, tiles, startPosition, timer.processing);
};

/**
 * Run program if called as script
 */
if (require.main === module) {
  // TODO: handle an argument to enable debugging or not
  run();
}
