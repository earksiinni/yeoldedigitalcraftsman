///////////////////////////////////////////////////////////////
//                                                           //
//                    CONSTANT STATE                         //

// TODO: DECLARE and INTIALIZE your constants here
var START_TIME = currentTime();
var TERRAIN = loadImage("terrain.png");
var TILE_WIDTH = 32;
var TILE_HEIGHT = 32;
var BACKGROUND_TILE_X_OFF = 13;
var BACKGROUND_TILE_Y_OFF = 9;

var HAY_PALETTE = {
  upper: {
    left: { x_off: 15, y_off: 8 },
    middle: { x_off: 16, y_off: 8 },
    right: { x_off: 17, y_off: 8 },
    left_bracket: { x_off: 16, y_off: 6 },
    right_bracket: { x_off: 17, y_off: 6 }
  },
  center: {
    left: { x_off: 15, y_off: 9 }, middle: { x_off: 16, y_off: 9 }, right: { x_off: 17, y_off: 9 }
  },
  lower: {
    left: { x_off: 15, y_off: 10 },
    middle: { x_off: 16, y_off: 10 },
    right: { x_off: 17, y_off: 10 },
    left_bracket: { x_off: 16, y_off: 7 },
    right_bracket: { x_off: 17, y_off: 7 }
  }
};


///////////////////////////////////////////////////////////////
//                                                           //
//                     MUTABLE STATE                         //

// TODO: DECLARE your variables here
var lastKeyCode;
var grid_width, grid_height;
var hay_layer;
var show_simple_terrain;


///////////////////////////////////////////////////////////////
//                                                           //
//                      EVENT RULES                          //

// When setup happens...
function onSetup() {
  lastKeyCode = 0;
  grid_width = Math.ceil(screenWidth / TILE_WIDTH);
  grid_height = Math.ceil(screenHeight / TILE_HEIGHT);
  show_simple_terrain = false;

  initializeHayLayer();
  populateHayLayer();
}

// Called 30 times or more per second
function onTick() {
  iterateOverTiles( function (x, y) {
    drawBackgroundTile(x, y);
    drawTerrainTile(hay_layer, HAY_PALETTE, x, y);
  });
  fillText("Last key = " + lastKeyCode, 100, 100, makeColor(1, 1, 1), "bold 20px sans-serif")
}

// When a key is pushed
function onKeyStart(key) {
  lastKeyCode = key;

  // If we press tab
  if(key === 9) {
    show_simple_terrain = !show_simple_terrain;
  }
}

///////////////////////////////////////////////////////////////
//                                                           //
//                      GAME LOGIC                           //


function initializeHayLayer() {
  hay_layer = [];

  iterateOverTiles( function (x, y) {
    hay_layer[x] = typeof(hay_layer[x]) === 'undefined' ? [] : hay_layer[x];
    hay_layer[x][y] = NaN;
  });
}

function populateHayLayer() {
  var populate_chance;
  var center_x, center_y;
  var direction;

  // Paint random brush strokes
  iterateOverTiles( function(x, y) {
    populate_chance = Math.floor(Math.random() * 20)

    if(populate_chance === 1) {
      center_x = x;
      center_y = y;

      for(paint_counter = Math.floor(Math.random() * 40); paint_counter > 0; paint_counter--) {
        direction = Math.floor(Math.random() * 9);

        switch(direction) {
          case 0:
            center_x -= 1;
            center_y -= 1;
            break;
          case 1:
            center_y -= 1;
            break;
          case 2:
            center_x += 1;
            center_y -= 1;
            break;
          case 3:
            center_x -= 1;
            break;
          case 4:
            break;
          case 5:
            center_x += 1;
            break;
          case 6:
            center_x -= 1;
            center_y += 1;
            break;
          case 7:
            center_y += 1;
            break;
          case 8:
            center_x += 1;
            center_y += 1;
            break;
        }

        // HACK: can't properly handle painting around coords that are on the
        // edge of the map, so we filter them out for now
        if(center_x >= 2 && center_x < grid_width - 2 && center_y >= 2 && center_y < grid_height - 2) {
          paintOnLayer(hay_layer, center_x, center_y)
        }
      }
    }

  });
}

function paintOnLayer(layer, center_x, center_y) {
  var start_x, start_y, end_x, end_y;

  // Start in node coords x-1, y-1, if possible
  center_x - 1 >= 0 ? start_x = center_x - 1 : start_x = center_x;
  center_y - 1 >= 0 ? start_y = center_y - 1 : start_y = center_y;

  // End in node coords x+1, y+1, if possible
  center_x + 1 <= grid_width - 1 ? end_x = center_x + 1 : end_x = center_x;
  center_y + 1 <= grid_height - 1 ? end_y = center_y + 1 : end_y = center_y;

  // Paint tiles
  for(x = start_x; x <= end_x; x++) {
    for(y = start_y; y <= end_y; y++) {
      layer[x][y] = true;
    }
  }
}

function iterateOverTiles(func) {
  for(x = 0; x < grid_width; x++) {
    for(y = 0; y < grid_height; y++) {
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

function determinePaletteTile(layer, palette, x, y) {
  var palette_tile;

  if(show_simple_terrain) {
    palette_tile = palette.center.middle;
  } else {
    // Upper left corner tile
    if(!layer[x][y - 1] && layer[x + 1][y] && layer[x][y + 1] && !layer[x - 1][y]) {
      palette_tile = palette.upper.left;
    }

    // Upper middle tile
    if(!layer[x][y - 1] && layer[x + 1][y] && layer[x][y + 1] && layer[x - 1][y]) {
      // Special cases
      if(itIsNaN(layer[x - 1][y + 1])) {
        palette_tile = palette.upper.left;
      } else if (itIsNaN(layer[x + 1][y + 1])) {
        palette_tile = palette.upper.right;
      } else {
        palette_tile = palette.upper.middle;
      }
    }

    // Upper right corner tile
    if(!layer[x][y - 1] && !layer[x + 1][y] && layer[x][y + 1] && layer[x - 1][y]) {
      palette_tile = palette.upper.right;
    }

    // Center left tile
    if(layer[x][y - 1] && layer[x + 1][y] && layer[x][y + 1] && !layer[x - 1][y]) {
      // Special case
      if(itIsNaN(layer[x + 1][y - 1])) {
        palette_tile = palette.upper.left;
      } else if (itIsNaN(layer[x + 1][y + 1])) {
        palette_tile = palette.lower.left;
      } else {
        palette_tile = palette.center.left;
      }
    }

    // Center tile
    if(layer[x][y - 1] && layer[x + 1][y] && layer[x][y + 1] && layer[x - 1][y]) {
      if(itIsNaN(layer[x + 1][y - 1]) && !itIsNaN(layer[x + 1][y + 1]) && !itIsNaN(layer[x - 1][y + 1]) && !itIsNaN(layer[x - 1][y - 1])) {
        palette_tile = palette.lower.left_bracket;
      } else if(!itIsNaN(layer[x + 1][y - 1]) && itIsNaN(layer[x + 1][y + 1]) && !itIsNaN(layer[x - 1][y + 1]) && !itIsNaN(layer[x - 1][y - 1])) {
        palette_tile = palette.upper.left_bracket;
      } else if(!itIsNaN(layer[x + 1][y - 1]) && !itIsNaN(layer[x + 1][y + 1]) && itIsNaN(layer[x - 1][y + 1]) && !itIsNaN(layer[x - 1][y - 1])) {
        palette_tile = palette.upper.right_bracket;
      } else if(!itIsNaN(layer[x + 1][y - 1]) && !itIsNaN(layer[x + 1][y + 1]) && !itIsNaN(layer[x - 1][y + 1]) && itIsNaN(layer[x - 1][y - 1])) {
        palette_tile = palette.lower.right_bracket;
      } else {
        palette_tile = palette.center.middle;
      }
    }

    // Center right tile
    if(layer[x][y - 1] && !layer[x + 1][y] && layer[x][y + 1] && layer[x - 1][y]) {
      // Special case
      if(itIsNaN(layer[x - 1][y + 1])) {
        palette_tile = palette.lower.right;
      } else if(itIsNaN(layer[x - 1][y - 1])) {
        palette_tile = palette.upper.right;
      }
      else {
        palette_tile = palette.center.right;
      }
    }

    // Lower left corner tile
    if(layer[x][y - 1] && layer[x + 1][y] && !layer[x][y + 1] && !layer[x - 1][y]) {
      palette_tile = palette.lower.left;
    }

    // Lower middle corner tile
    if(layer[x][y - 1] && layer[x + 1][y] && !layer[x][y + 1] && layer[x - 1][y]) {
      // Special case
      if(itIsNaN(layer[x + 1][y - 1])) {
        palette_tile = palette.lower.right;
      } else if(itIsNaN(layer[x - 1][y - 1])) {
        palette_tile = palette.lower.left;
      } else {
        palette_tile = palette.lower.middle;
      }
    }

    // Lower right corner tile
    if(layer[x][y - 1] && !layer[x + 1][y] && !layer[x][y + 1] && layer[x - 1][y]) {
      palette_tile = palette.lower.right;
    }
  }

  return palette_tile;
}

function drawTerrainTile(layer, palette, x, y) {
  var palette_tile;

  if(layer[x][y]) {
    palette_tile = determinePaletteTile(layer, palette, x, y)

    if(palette_tile != undefined) {
      drawImage(TERRAIN,
                x * TILE_WIDTH,
                y * TILE_HEIGHT,
                TILE_WIDTH,
                TILE_HEIGHT,
                TILE_WIDTH * palette_tile.x_off,
                TILE_HEIGHT * palette_tile.y_off,
                TILE_WIDTH,
                TILE_HEIGHT);
    }
  }
}

function itIsNaN (obj) {
  var is_nan;

  obj != obj ? is_nan = true : is_nan = false;
  return is_nan;
}
