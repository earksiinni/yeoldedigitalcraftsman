///////////////////////////////////////////////////////////////
//                                                           //
//                    CONSTANT STATE                         //

// TODO: DECLARE and INTIALIZE your constants here
var START_TIME = currentTime();
var TERRAIN = loadImage("terrain.png");
var TILE_WIDTH = 32;
var TILE_HEIGHT = 32;
var BACKGROUND_TILE_X_OFF = 13
var BACKGROUND_TILE_Y_OFF = 9


///////////////////////////////////////////////////////////////
//                                                           //
//                     MUTABLE STATE                         //

// TODO: DECLARE your variables here
var lastKeyCode;
var y_squares, x_squares;
var tall_grass_layer;


///////////////////////////////////////////////////////////////
//                                                           //
//                      EVENT RULES                          //

// When setup happens...
function onSetup() {
  lastKeyCode = 0;
  x_squares = Math.ceil(screenWidth / TILE_WIDTH);
  y_squares = Math.ceil(screenHeight / TILE_HEIGHT);

  generateTallGrassLayer();
}


// When a key is pushed
function onKeyStart(key) {
  lastKeyCode = key;
}


function generateTallGrassLayer(x, y) {
  tall_grass_layer = [];

  // First pass to initialize 2D array
  iterateOverTiles( function (x, y) {
    tall_grass_layer[x] = typeof(tall_grass_layer[x]) === 'undefined' ? [] : tall_grass_layer[x];
    tall_grass_layer[x][y] = NaN;
  });

  // Second pass to generate tiles
  iterateOverTiles( function(x, y) {
    var seed = Math.floor(Math.random() * 100);

    if(seed === 42) {
      for(var x_off = 0; x_off < 3; x_off++) {
        for(var y_off = 0; y_off < 3; y_off++) {
          if((x + x_off < tall_grass_layer.length) && (y + y_off < tall_grass_layer[x].length)) {
            tall_grass_layer[x + x_off][y + y_off] = x_off + (y_off * 3);
          }
        }
      }
    }
  });
}

function iterateOverTiles(func) {
  for(x = 0; x < x_squares; x++) {
    for(y = 0; y < y_squares; y++) {
      func(x, y);
    }
  }
}

function drawTile(dst_x, dst_y, x_off, y_off) {
  drawImage(TERRAIN,
            dst_x * TILE_WIDTH,
            dst_y * TILE_HEIGHT,
            TILE_WIDTH,
            TILE_HEIGHT,
            TILE_WIDTH * x_off,
            TILE_HEIGHT * y_off,
            TILE_WIDTH,
            TILE_HEIGHT);
}

function drawBackgroundTile(x, y) {
  drawTile(x, y, BACKGROUND_TILE_X_OFF, BACKGROUND_TILE_Y_OFF);
}

function drawTallGrassTile(x, y) {
  var tall_grass_x_off;
  var tall_grass_y_off;

  // Pass the right offsets to get the right tile from the terrain file
  switch(tall_grass_layer[x][y]) {
    case 0:
      tall_grass_x_off = 15;
      tall_grass_y_off = 8;
      break;
    case 1:
      tall_grass_x_off = 16;
      tall_grass_y_off = 8;
      break;
    case 2:
      tall_grass_x_off = 17;
      tall_grass_y_off = 8;
      break;
    case 3:
      tall_grass_x_off = 15;
      tall_grass_y_off = 9;
      break;
    case 4:
      tall_grass_x_off = 16;
      tall_grass_y_off = 9;
      break;
    case 5:
      tall_grass_x_off = 17;
      tall_grass_y_off = 9;
      break;
    case 6:
      tall_grass_x_off = 15;
      tall_grass_y_off = 10;
      break;
    case 7:
      tall_grass_x_off = 16;
      tall_grass_y_off = 10;
      break;
    case 8:
      tall_grass_x_off = 17;
      tall_grass_y_off = 10;
      break;
  }
  drawTile(x, y, tall_grass_x_off, tall_grass_y_off)
}

// Called 30 times or more per second
function onTick() {
  iterateOverTiles( function (x, y) {
    drawBackgroundTile(x, y);
    drawTallGrassTile(x, y);
  });
}


///////////////////////////////////////////////////////////////
//                                                           //
//                      HELPER RULES                         //
