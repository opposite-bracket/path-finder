'use strict';

var Vector = function(x, y){
  var vector = x + '|' + y;
  // vector.prototype.x = x;
  // vector.prototype.y = y;
  return vector;
};

module.exports = {
  Vector: Vector
};