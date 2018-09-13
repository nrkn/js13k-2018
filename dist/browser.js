const s = () => {// various settings and magic numbers, these will get inlined by uglify
const tileSize = 16;
const fontSize = 8;
const computerIconSize = 7;
const viewTiles = 9;
const canvasTiles = viewTiles + 1;
const fontTiles = canvasTiles * 2;
const centerTile = ~~(viewTiles / 2);
const mapSize = tileSize * canvasTiles;
const animTime = 500;
const waterBorder = ~~(mapSize / 20);
const landBorder = ~~(mapSize / 8);
const gridTiles = 4;
const gridSize = ~~(mapSize / gridTiles);
const initialMonsterCount = ~~(mapSize / 20);
const sunrise = 6;
const sunset = 18;

// async image loader
const loadImage = (path) => new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = path;
});
// load a series of images
const loadImages = (...paths) => Promise.all(paths.map(loadImage));
// randomly pick something from an array
const pick = (arr) => arr[randInt(arr.length)];
// generate a random integer between min and exclusive max
const randInt = (exclMax, min = 0) => ~~(Math.random() * exclMax) + min;
// not very sound way to shuffle an array randomly - but very cheap in bytes
const shuffle = (arr) => arr.slice().sort(() => randInt(3) - 1);



// sprite indices
const T_SEA = 0;
const T_WATER = 1;
const T_LAND = 2;
const T_GRASS = 3;
const T_GRASS_L = 8;
const T_TREE = 11;
const T_TREE_L = 4;
const T_FOOD = 15;
const T_HEALTH = 16;
const T_SAND = 17;
const T_SAND_L = 3;
const T_HUT = 20;
const T_COMPUTER = 21;
const T_SYNTH = 22;
const T_BED = 23;
const T_HUT_L = 24;
const T_HUT_M = 25;
const T_HUT_R = 26;
const T_BLACK = 27;
const T_RUINS = 28;
const T_RUINS_L = 3;
const T_MOUNTAINS = 31;
const T_MOUNTAINS_L = 3;
const T_SATELLITE = 34;
const T_PORTAL = 36;
const T_RANGER = 38;
const T_KEY = 39;
const T_DISK = 40;
const T_CHIP = 41;
const T_FOG = 42;
const T_PORTAL_OFFLINE = 43;
const T_PORTAL_DAY = 44;
const S_SKELETON = 4;
const S_BOAT_LEFT = 5;
const S_BOAT_RIGHT = 6;
const S_MONSTER = 7;
const C_HUT_LOCKED = 0;
const C_RUINS_ACTIVE = 1;
const C_SATELLITE_OFFLINE = 2;
const C_PLAYER = 3;
const C_PORTAL_ACTIVE = 4;
const C_HUT_UNLOCKED = 5;
const C_RUINS_EMPTY = 6;
const C_SATELLITE_ACTIVE = 7;
const C_PORTAL_OFFLINE = 8;
// state indices
const ST_PLAYER_FACING = 0;
const ST_PLAYER_FOOD = 1;
const ST_PLAYER_HEALTH = 2;
const ST_PLAYER_MAX_HEALTH = 3;
const ST_HOURS = 4;
const ST_MINUTES = 5;
const ST_COLOR = 6;
const ST_DISPLAY_ITEM = 7;
const ST_MONSTERS = 8;
const ST_PLAYER_KEYS = 9;
const ST_PLAYER_CHIPS = 10;
const ST_PLAYER_DISKS = 11;
const ST_SEEN = 12;
const ST_HUTCACHE = 13;
const ST_RUINCACHE = 14;
const ST_PORTALCACHE = 15;
const ST_SATELLITE_FIXED = 16;
const ST_MOD_CHIPS = 17;
const ST_SATELLITE_CHIPS = 18;
// api indices
const API_STATE = 0;
const API_RESET = 1;
const API_TIMESTR = 2;
const API_INCTIME = 3;
const API_MOVE = 4;
const API_CLOSE = 5;
const API_SELECT = 6;
const API_CONFIRM_SELECT = 7;
// display item types
const DTYPE_IMAGE = 0;
const DTYPE_MESSAGE = 1;
const DTYPE_SCREEN = 2;
const DTYPE_MAP = 3;
const DTYPE_ACTION = 4;
const DTYPE_COMPUTER_MAP = 5;
// game data indices
const DATA_SPLASH = 0;
const DATA_INTRO = 1;
const DATA_SUNRISE = 2;
const DATA_SUNSET = 3;
const DATA_C_MAIN = 4;
const DATA_C_DIAGNOSTICS = 5;
const DATA_C_SYNTH = 6;
const DATA_ISLAND = 7;
const DATA_INVESTIGATE = 8;
const DATA_BED = 9;
const DATA_NOT_TIRED = 10;
const DATA_SLEEP = 11;
const DATA_HUNGRY = 12;
const DATA_DEAD = 13;
const DATA_RANGER = 14;
const DATA_LOCKED_NOKEYS = 15;
const DATA_LOCKED_UNLOCK = 16;
const DATA_UNLOCK = 17;
const DATA_RUINS = 18;
const DATA_SEARCH_RUINS = 19;
const DATA_COMPUTER = 20;
const DATA_USE_COMPUTER = 21;
const DATA_FIXABLE_COMPUTER = 22;
const DATA_FIX_COMPUTER = 23;
const DATA_C_FIXED = 24;
const DATA_C_SYNTH_CHARGING = 25;
const DATA_CREATE_FOOD = 26;
const DATA_SYNTH = 27;
const DATA_DB = 28;
const DATA_COMMS = 29;
const DATA_SECURITY = 30;
const DATA_MAP = 31;
const DATA_C_DIAGNOSTICS_FIXED = 32;
const DATA_C_DB_INTRO = 33;
const DATA_C_DB_PORTALS = 34;
const DATA_C_DB_GHOSTS = 35;
const DATA_C_DB_ERRORS = 36;
const DATA_C_DB_SHUTDOWN_PORTALS = 37;
const DATA_C_DB_SECURITY = 38;
const DATA_C_DB_FIX_SATELLITE = 39;
const DATA_C_DB_RESCUE_TEAM = 40;
const DATA_C_DB_L = 8;
const DATA_RESTORE_BACKUPS = 41;
const DATA_DIAGNOSTICS = 42;
const DATA_MODCHIPS = 43;
const DATA_SATELLITE_CHIP = 44;
const DATA_DISTRESS_SIGNAL = 45;
// map data indices
const MAP_PLAYERX = 1;
const MAP_PLAYERY = 2;
const MAP_TILES = 3;
const MAP_TYPE = 4;
const MAP_STARTX = 5;
const MAP_STARTY = 6;
const COMPUTER_MAP_MAPDB = 4;
// map type indices
const MT_ISLAND = 0;
const MT_HUT = 1;
// display item indices
const DISPLAY_TYPE = 0;
const DISPLAY_NAME = 1;
const DISPLAY_MESSAGE = 1;
// actions
const ACTION_INDEX = 1;
// screen indices
const SCREEN_MESSAGE = 1;
const SCREEN_OPTIONS = 2;
const SCREEN_SELECTION = 3;
const SCREEN_COLOR = 4;
const OPTION_MESSAGE = 0;
const OPTION_DATA_INDEX = 1;
// point
const X = 0;
const Y = 1;
// edges
const TOP = 0;
const RIGHT = 1;
const BOTTOM = 2;
const LEFT = 3;
//monster
const MON_X = 0;
const MON_Y = 1;
const MON_FACING = 2;
const MON_HEALTH = 3;
// actions
const ACTION_SLEEP = 0;
const ACTION_UNLOCK = 1;
const ACTION_SEARCH = 2;
const ACTION_USE_COMPUTER = 3;
const ACTION_FIX_COMPUTER = 4;
const ACTION_CREATE_FOOD = 5;
const ACTION_SHOW_SYNTH = 6;
const ACTION_SHOW_DB = 7;
const ACTION_SHOW_COMMS = 8;
const ACTION_SHOW_SECURITY = 9;
const ACTION_SHOW_MAP = 10;
const ACTION_RESTORE_BACKUPS = 11;
const ACTION_DIAGNOSTICS = 12;
const ACTION_CREATE_MODCHIP = 13;
const ACTION_CREATE_SATELLITE_CHIP = 14;
const ACTION_DISTRESS_SIGNAL = 15;
// hut state
const HUT_UNLOCKED = 0;
const HUT_COMPUTER_FIXED = 1;
const HUT_SYNTH_CHARGING = 2;
// ruin item
const ITEM_KEY = 0;
const ITEM_CHIP = 1;
const ITEM_DISK = 2;
const ITEM_FOOD = 3;
// quest location
const QUEST_RANGER = 0;
const QUEST_HUT = 1;
const QUEST_RUINS = 2;
const QUEST_PORTAL = 3;
const QUEST_SATELLITE = 4;
const QUEST_BLANK = 5;

// normalized different between two numbers
const delta = (i, j) => Math.max(i, j) - Math.min(i, j);
// returns points that are to the left, right, top and bottom of passed in point
const immediateNeighbours = ([x, y]) => [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1]
];
// returns every neighbouring tile, including diagonals
const allNeighbours = ([x, y]) => [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
    [x - 1, y - 1],
    [x + 1, y - 1],
    [x - 1, y + 1],
    [x + 1, y + 1]
];
// gets all the immediate neighbours that match the passed in tileIndex
const getImmediateNeighbours = (tiles, p, tileIndex) => immediateNeighbours(p).filter(p => tiles[p[Y]][p[X]] === tileIndex);
/*
  gets a random tile from the passed in collection that is between min and max
  distance from the passed in point
*/
const withinDist = (tiles, [x, y], min, max) => {
    const candidates = tiles.filter(([tx, ty]) => {
        return delta(tx, x) >= min &&
            delta(ty, y) >= min &&
            delta(tx, x) <= max &&
            delta(ty, y) <= max;
    });
    return pick(candidates);
};
// use trig to get distance between points
const dist = ([x1, y1], [x2, y2]) => Math.hypot(delta(x1, x2), delta(y1, y2));
// find the nearest point in a list of points
const nearest = (p1, points) => {
    // set d to a big number
    let d = mapSize * mapSize;
    let p;
    for (let i = 0; i < points.length; i++) {
        const currentDist = dist(p1, points[i]);
        // this point is the closest so far
        if (currentDist < d) {
            d = currentDist;
            p = points[i];
        }
    }
    return p;
};
// sort a list of points by their distance from p
const sortByDistance = (p, points) => points.slice().sort((p1, p2) => dist(p, p1) - dist(p, p2));
// filters a list of points to be unique
const unique = (points) => {
    const result = [];
    const cache = [];
    for (let i = 0; i < points.length; i++) {
        const [x, y] = points[i];
        if (!cache[y * mapSize + x]) {
            result.push(points[i]);
            cache[y * mapSize + x] = 1;
        }
    }
    return result;
};
// floodFill algorithm
const floodFill = ([x, y], canFlood) => {
    const flooded = [];
    const queue = [[x, y, 0]];
    const cache = [];
    const floodPoint = ([x, y, d]) => {
        if (!inBounds([x, y]))
            return;
        if (!canFlood([x, y]))
            return;
        if (cache[y * mapSize + x])
            return;
        flooded.push([x, y, d]);
        cache[y * mapSize + x] = 1;
        queue.push(...immediateNeighbours([x, y]).map(([x, y]) => [x, y, d + 1]));
    };
    while (queue.length) {
        floodPoint(queue.shift());
    }
    return flooded;
};
// find a tile in a list of tiles
const findTile = (tiles, [x, y]) => {
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i][X] === x && tiles[i][Y] === y)
            return tiles[i];
    }
};
// changed map code so it didn't need path finding - removed by uglify
const findPath = (flood, [x2, y2]) => {
    const path = [];
    const [x1, y1] = flood[0];
    const end = findTile(flood, [x2, y2]);
    if (!end)
        return path;
    const queue = [end];
    const connectNext = ([x, y, min]) => {
        path.unshift([x, y]);
        if (x === x1 && y === y1)
            return;
        const neighbours = immediateNeighbours([x, y]);
        let n;
        neighbours.forEach(([x, y]) => {
            const t = flood.find(([fx, fy]) => fx === x && fy === y);
            if (t) {
                const [, , d] = t;
                if (d < min) {
                    min = d;
                    n = t;
                }
            }
        });
        if (n)
            queue.push(n);
    };
    while (queue.length) {
        connectNext(queue.shift());
    }
    return path;
};
// find the best neighbouring tile to move to if you want to go towards a point
const towards = ([x1, y1], [x2, y2]) => {
    let dx = delta(x1, x2);
    let dy = delta(y1, y2);
    let x = x1;
    let y = y1;
    if (dx > dy) {
        if (x2 > x1) {
            x = x1 + 1;
        }
        if (x1 > x2) {
            x = x1 - 1;
        }
    }
    if (dy > dx) {
        if (y2 > y1) {
            y = y1 + 1;
        }
        if (y1 > y2) {
            y = y1 - 1;
        }
    }
    return [x, y];
};
// allows for carving out paths between points that aren't too perfect looking
const drunkenWalk = ([x1, y1], [x2, y2], allowed = inBounds, drunkenness = 0.66) => {
    const steps = [];
    const cache = [];
    const step = ([x, y]) => {
        if (!cache[y * mapSize + x]) {
            steps.push([x, y]);
            cache[y * mapSize + x] = 1;
        }
        if (x === x2 && y === y2)
            return;
        step(Math.random() < drunkenness ?
            pick(immediateNeighbours([x, y]).filter(allowed)) || [x, y] :
            towards([x, y], [x2, y2]));
    };
    step([x1, y1]);
    return steps;
};
// randomly adds points to edges of existing land until land is a certain size
// gives a nice coastliney appearance while also ensuring there is a given
// amount of land tiles
const expandLand = (mapTiles, landTiles, tileCount = ~~((mapSize * mapSize) * 0.2)) => {
    while (landTiles.length < tileCount) {
        const [cx, cy] = pick(landTiles);
        const neighbours = getImmediateNeighbours(mapTiles, [cx, cy], T_WATER).filter(inWaterBorder);
        if (neighbours.length) {
            const [nx, ny] = pick(neighbours);
            if (!hasPoint(landTiles, [nx, ny])) {
                landTiles.push([nx, ny]);
                mapTiles[ny][nx] = T_LAND;
            }
        }
    }
};
// same as above but instead of mutating maps returns list of points that
// should be expanded to, allows for further processing
const expanded = (points, tileCount = ~~((mapSize * mapSize) * 0.33)) => {
    const expandedPoints = points.slice();
    const cache = [];
    for (let i = 0; i < expandedPoints.length; i++) {
        const [x, y] = expandedPoints[i];
        cache[y * mapSize + x] = 1;
    }
    while (expandedPoints.length < tileCount) {
        const [cx, cy] = pick(expandedPoints);
        const neighbours = immediateNeighbours([cx, cy]);
        if (neighbours.length) {
            const [nx, ny] = pick(neighbours);
            if (!cache[ny * mapSize + nx]) {
                expandedPoints.push([nx, ny]);
                cache[ny * mapSize + nx] = 1;
            }
        }
    }
    return expandedPoints;
};
// some point on the map, randomly chosen
const randomPoint = () => [randInt(mapSize), randInt(mapSize)];
// some point along the nominated landBorder edge, randomly chosen
const randomLandEdge = (edge) => [
    edge === LEFT ?
        landBorder :
        edge === RIGHT ?
            mapSize - landBorder :
            randInt(mapSize - landBorder * 2, landBorder),
    edge === TOP ?
        landBorder :
        edge === BOTTOM ?
            mapSize - landBorder :
            randInt(mapSize - landBorder * 2, landBorder),
];
// some point within the land border, randomly chosen
const randomPointInLandBorder = () => [
    randInt(mapSize - landBorder * 2, landBorder),
    randInt(mapSize - landBorder * 2, landBorder)
];
// get the leftmost point amongst passed in tiles
const leftMost = (tiles) => {
    let left = mapSize;
    let p = [0, 0];
    for (let i = 0; i < tiles.length; i++) {
        const [x, y] = tiles[i];
        if (x < left) {
            left = x;
            p = [x, y];
        }
    }
    return p;
};
// does this list of points contain the given point?
const hasPoint = (tiles, [x, y]) => {
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i][X] === x && tiles[i][Y] === y)
            return true;
    }
    return false;
};
// find the points of all tiles in a map that match tileIndex
const findTilePoints = (mapTiles, tileIndex) => {
    const tiles = [];
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
            if (mapTiles[y][x] === tileIndex)
                tiles.push([x, y]);
        }
    }
    return tiles;
};
// is within map boundaries
const inBounds = ([x, y]) => x >= 0 &&
    x <= mapSize - 1 &&
    y >= 0 &&
    y <= mapSize - 1;
// is within the water border we want to leave on all sides
const inWaterBorder = ([x, y]) => x >= waterBorder &&
    x <= mapSize - waterBorder &&
    y >= waterBorder &&
    y <= mapSize - waterBorder;
// is within the area we allow land to be created in
const inLandBorder = ([x, y]) => x >= landBorder &&
    x <= mapSize - landBorder &&
    y >= landBorder &&
    y <= mapSize - landBorder;






// create a new map filled with water
const createMap = () => {
    const rows = [];
    for (let y = 0; y < mapSize; y++) {
        const row = [];
        for (let x = 0; x < mapSize; x++) {
            row.push(T_WATER);
        }
        rows.push(row);
    }
    return rows;
};
// clone an existing map
const cloneMap = (tiles) => {
    const rows = [];
    for (let y = 0; y < mapSize; y++) {
        const row = [];
        for (let x = 0; x < mapSize; x++) {
            row.push(tiles[y][x]);
        }
        rows.push(row);
    }
    return rows;
};
// draw some points to map according to return value of passed in function
const drawTilesToMap = (tiles, points, getTileIndex) => {
    for (let i = 0; i < points.length; i++) {
        const [px, py] = points[i];
        tiles[py][px] = getTileIndex([px, py]);
    }
};
// any internal water tiles on the map become a randomly selected biome
const addBiomes = (tiles) => {
    let i = 0;
    // make sure there's at least one of each biome for variety
    const oneOfEachBiome = shuffle([0, 3, 6, 9]);
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
            if (tiles[y][x] === T_WATER) {
                const flood = floodFill([x, y], ([tx, ty]) => tiles[ty][tx] === T_WATER);
                let biome = 0;
                // don't use up the interesting biomes on small areas
                if (flood.length > 5) {
                    // the first four times, add one of each for variety
                    if (i < 4) {
                        biome = oneOfEachBiome[i];
                    }
                    // if there is an area left to make biomes, choose biome randomly
                    else {
                        biome = randInt(10);
                    }
                    i++;
                }
                // 0 1 2
                if (biome < 3) {
                    // meadow, no trees
                    drawTilesToMap(tiles, flood, () => randInt(T_GRASS_L + 1) + T_LAND);
                }
                // 3 4 5
                else if (biome < 6) {
                    // 75% trees, 25% meadow
                    drawTilesToMap(tiles, flood, () => randInt(3) ?
                        randInt(T_TREE_L) + T_TREE :
                        randInt(T_GRASS_L + 1) + T_LAND);
                }
                // 6 7 8
                else if (biome < 9) {
                    // 75% mountains, 25% meadow
                    drawTilesToMap(tiles, flood, () => randInt(4) ?
                        randInt(T_MOUNTAINS_L) + T_MOUNTAINS :
                        randInt(T_GRASS_L + 1) + T_LAND);
                }
                // 9
                else {
                    // lake/inland sea
                    drawTilesToMap(tiles, flood, () => T_SEA);
                }
            }
        }
    }
};
/*
  decorate coastlines with sand and any other land tiles with grass or trees
*/
const decorate = (tiles) => {
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
            if (tiles[y][x] === T_LAND) {
                const neighbours = getImmediateNeighbours(tiles, [x, y], T_SEA);
                if (neighbours.length) {
                    tiles[y][x] = randInt(T_SAND_L) + T_SAND;
                }
                else {
                    // The 1 is for the bare land tile: T_GRASS_L + T_TREE_L + 1
                    tiles[y][x] = randInt(T_GRASS_L + T_TREE_L + 1) + T_LAND;
                }
            }
        }
    }
};
// make a hut map
const createHut = () => {
    const tiles = createMap();
    const black = floodFill([0, 0], ([tx, ty]) => tiles[ty][tx] === T_WATER);
    drawTilesToMap(tiles, black, () => T_BLACK);
    /*
      we need an arbitrary point to draw the hut at, anything reasonably far from
      the map edge will do so we use landBorder
    */
    tiles[landBorder - 1][landBorder - 2] = T_COMPUTER;
    tiles[landBorder - 1][landBorder - 1] = T_SYNTH;
    tiles[landBorder - 1][landBorder] = T_BED;
    tiles[landBorder][landBorder - 2] = T_LAND;
    tiles[landBorder][landBorder - 1] = T_LAND;
    tiles[landBorder][landBorder] = T_LAND;
    tiles[landBorder + 1][landBorder - 2] = T_HUT_L;
    tiles[landBorder + 1][landBorder - 1] = T_HUT_M;
    tiles[landBorder + 1][landBorder] = T_HUT_R;
    return [DTYPE_MAP, landBorder, landBorder, tiles, MT_HUT, landBorder, landBorder];
};
// draw a nice island with believable coastlines, different biomes to help the
// player build a mental map, quest locations that are guaranteed to be
// connected etc
const createIsland = (hutCache, ruinCache, portalCache) => {
    const tiles = createMap();
    // choose clearways (they will become quest locations, define path ends etc)
    // start with one on each side so that we generally end up with a rough
    // polygon shaped island
    const clearwayCount = randInt(10, 40);
    const clearways = [
        randomLandEdge(TOP),
        randomLandEdge(RIGHT),
        randomLandEdge(BOTTOM),
        randomLandEdge(LEFT)
    ];
    /*
      only select points for clearways that are at least 10 tiles apart -
      does two things, prevents from picking already picked points, and makes sure
      that the icons on the computer map never overlap
    */
    while (clearways.length < clearwayCount) {
        const clearway = randomPointInLandBorder();
        const near = nearest(clearway, clearways);
        if (dist(clearway, near) > 10) {
            clearways.push(clearway);
        }
    }
    // make paths between waypoints
    const paths = [];
    const pathSegs = clearways.slice();
    let current = pathSegs.pop();
    const start = current;
    while (pathSegs.length) {
        // pick the nearest and draw a rough line to it
        const near = nearest(current, pathSegs);
        const steps = drunkenWalk(current, near, inWaterBorder, 0.33);
        paths.push(...steps);
        current = pathSegs.pop();
    }
    // draw a rough line from the last waypoint to the first
    // so we generally end up with a rough polygon
    const steps = drunkenWalk(current, start, inWaterBorder, 0.33);
    paths.push(...steps);
    // now randomly join 10 of the waypoints, helps make a higher number of
    // different biomes
    for (let i = 0; i < 10; i++) {
        const steps = drunkenWalk(pick(clearways), pick(clearways), inWaterBorder, 0.33);
        paths.push(...steps);
    }
    // take all the quest points and mark all of their neighbours so that later
    // we know not to put anything blocking next to a quest point
    const clearings = [];
    for (let i = 0; i < clearways.length; i++) {
        clearings.push(...allNeighbours(clearways[i]));
    }
    // make a collection of all the areas we've marked so far
    const land = unique([...clearways, ...clearings, ...paths]);
    // now expand it out until we have the desired amount of land area
    const expandedLand = expanded(land);
    // start the player at the leftmost point
    const [playerX, playerY] = leftMost(expandedLand);
    // fill in the map with the land we have so far
    drawTilesToMap(tiles, expandedLand, () => T_LAND);
    // flood the outside of the map with sea (as opposed to water) - the areas
    // that remain water will be used for placing biomes
    const sea = floodFill([0, 0], ([tx, ty]) => tiles[ty][tx] === T_WATER);
    drawTilesToMap(tiles, sea, () => T_SEA);
    // sort all the quest points by distance so we can place useful things close
    // and the satellite far away
    const waypoints = sortByDistance([playerX, playerY], clearways);
    // make sure there's a clear path from the player to the first waypoint
    const playerSteps = drunkenWalk([playerX, playerY], waypoints[0], inWaterBorder, 0.33);
    paths.push(...playerSteps);
    // change all the internal water to different biomes
    addBiomes(tiles);
    // add sand along coastlines, decorate the remaining land with random grass, trees etc
    decorate(tiles);
    // now draw all the paths to the map to make sure you can always walk between
    // quest points - make them as blank tiles to the player can visually pick
    // out the paths, unless it's coastline in which case leave it as sand
    drawTilesToMap(tiles, paths, ([wx, wy]) => {
        if (tiles[wy][wx] >= T_SAND && tiles[wy][wx] < T_SAND + T_SAND_L) {
            return tiles[wy][wx];
        }
        return T_LAND;
    });
    // decorate all the clearing around quest locations with various non-blocking
    // grass tiles etc
    drawTilesToMap(tiles, clearings, ([wx, wy]) => {
        if (tiles[wy][wx] >= T_SAND && tiles[wy][wx] < T_SAND + T_SAND_L) {
            return tiles[wy][wx];
        }
        return randInt(T_GRASS_L + 1) + T_LAND;
    });
    // now let's allocate quest locations to all the waypoints
    // 50% ruins, 25% huts, 15% portals
    const questSlots = waypoints.length - 4;
    const numHuts = ~~(questSlots * 0.25);
    const numPortals = ~~(questSlots * 0.15);
    const numRuins = ~~(questSlots * 0.5);
    const numBlank = questSlots - numHuts - numPortals - numRuins;
    const randQuests = [];
    for (let i = 0; i < numHuts; i++) {
        randQuests.push(QUEST_HUT);
    }
    for (let i = 0; i < numPortals; i++) {
        randQuests.push(QUEST_PORTAL);
    }
    for (let i = 0; i < numRuins; i++) {
        randQuests.push(QUEST_RUINS);
    }
    for (let i = 0; i < numBlank; i++) {
        randQuests.push(QUEST_BLANK);
    }
    // make sure that the closest ones are useful, the furthest is satellite,
    // the rest are random
    const quests = [QUEST_RANGER, QUEST_HUT, QUEST_RUINS, ...shuffle(randQuests), QUEST_SATELLITE];
    // add them to the map
    for (let i = 0; i < waypoints.length; i++) {
        const [wx, wy] = waypoints[i];
        const type = quests[i];
        // dead ranger
        if (type === QUEST_RANGER) {
            tiles[wy][wx] = T_RANGER;
        }
        // hut
        else if (type === QUEST_HUT) {
            tiles[wy][wx] = T_HUT;
            hutCache[wy * mapSize + wx] = [0, 0, 0];
            hutCache[0].push([wx, wy]);
        }
        // ruins
        else if (type === QUEST_RUINS) {
            tiles[wy][wx] = randInt(T_RUINS_L) + T_RUINS;
            ruinCache[wy * mapSize + wx] = [];
            ruinCache[0].push([wx, wy]);
        }
        // portal
        else if (type === QUEST_PORTAL) {
            tiles[wy][wx] = T_PORTAL;
            portalCache[0].push([wx, wy]);
        }
        // satellite
        else if (type === QUEST_SATELLITE) {
            tiles[wy][wx] = T_SATELLITE;
        }
    }
    // done! return the island
    return [DTYPE_MAP, playerX, playerY, tiles, MT_ISLAND, playerX, playerY];
};
// is this tileindex blocking?
const blocks = i => i < 2 || (i >= T_TREE && i < T_TREE + T_TREE_L) || i === T_HUT ||
    i === T_BLACK || i === T_HUT_L || i === T_HUT_M || i === T_HUT_R ||
    i === T_COMPUTER || i === T_SYNTH || i === T_BED ||
    (i >= T_RUINS && i < T_RUINS + T_RUINS_L) ||
    (i >= T_MOUNTAINS && i < T_MOUNTAINS + T_MOUNTAINS_L) ||
    i === T_PORTAL || i === T_PORTAL_DAY || i === T_PORTAL_OFFLINE ||
    i === T_SATELLITE;
// temporary for documenting map generation process:
const observableCreateIsland = (callback) => {
    const tiles = createMap();
    // choose clearways (they will become quest locations, define path ends etc)
    // start with one on each side so that we generally end up with a rough
    // polygon shaped island
    const clearwayCount = randInt(10, 40);
    const clearways = [
        randomLandEdge(TOP),
        randomLandEdge(RIGHT),
        randomLandEdge(BOTTOM),
        randomLandEdge(LEFT)
    ];
    const clearwayEdgeTiles = createMap();
    drawTilesToMap(clearwayEdgeTiles, clearways, () => T_LAND);
    const clearwayEdgeSea = floodFill([0, 0], ([tx, ty]) => clearwayEdgeTiles[ty][tx] === T_WATER);
    drawTilesToMap(clearwayEdgeTiles, clearwayEdgeSea, () => T_SEA);
    callback(clearwayEdgeTiles, '01-clearway-edges');
    /*
      only select points for clearways that are at least 10 tiles apart -
      does two things, prevents from picking already picked points, and makes sure
      that the icons on the computer map never overlap
    */
    while (clearways.length < clearwayCount) {
        const clearway = randomPointInLandBorder();
        const near = nearest(clearway, clearways);
        if (dist(clearway, near) > 10) {
            clearways.push(clearway);
        }
    }
    const clearwaysTiles = createMap();
    drawTilesToMap(clearwaysTiles, clearways, () => T_LAND);
    const clearwaysSea = floodFill([0, 0], ([tx, ty]) => clearwaysTiles[ty][tx] === T_WATER);
    drawTilesToMap(clearwaysTiles, clearwaysSea, () => T_SEA);
    callback(clearwaysTiles, '02-clearways');
    // make paths between waypoints
    const paths = [];
    const pathSegs = clearways.slice();
    let current = pathSegs.pop();
    const start = current;
    let n = 3;
    while (pathSegs.length) {
        // pick the nearest and draw a rough line to it
        const near = nearest(current, pathSegs);
        const steps = drunkenWalk(current, near, inWaterBorder, 0.33);
        paths.push(...steps);
        current = pathSegs.pop();
        const pathTiles = createMap();
        drawTilesToMap(pathTiles, clearways, () => T_LAND);
        drawTilesToMap(pathTiles, paths, () => T_LAND);
        const pathSea = floodFill([0, 0], ([tx, ty]) => pathTiles[ty][tx] === T_WATER);
        drawTilesToMap(pathTiles, pathSea, () => T_SEA);
        callback(pathTiles, `${n < 10 ? '0' : ''}${n}-paths`);
        n++;
    }
    // draw a rough line from the last waypoint to the first
    // so we generally end up with a rough polygon
    const steps = drunkenWalk(current, start, inWaterBorder, 0.33);
    paths.push(...steps);
    const pathTiles = createMap();
    drawTilesToMap(pathTiles, clearways, () => T_LAND);
    drawTilesToMap(pathTiles, paths, () => T_LAND);
    const pathSea = floodFill([0, 0], ([tx, ty]) => pathTiles[ty][tx] === T_WATER);
    drawTilesToMap(pathTiles, pathSea, () => T_SEA);
    callback(pathTiles, `${n < 10 ? '0' : ''}${n}-paths`);
    n++;
    // now randomly join 10 of the waypoints, helps make a higher number of
    // different biomes
    for (let i = 0; i < 10; i++) {
        const steps = drunkenWalk(pick(clearways), pick(clearways), inWaterBorder, 0.33);
        paths.push(...steps);
        const pathTiles = createMap();
        drawTilesToMap(pathTiles, clearways, () => T_LAND);
        drawTilesToMap(pathTiles, paths, () => T_LAND);
        const pathSea = floodFill([0, 0], ([tx, ty]) => pathTiles[ty][tx] === T_WATER);
        drawTilesToMap(pathTiles, pathSea, () => T_SEA);
        callback(pathTiles, `${n < 10 ? '0' : ''}${n}-paths`);
        n++;
    }
    // take all the quest points and mark all of their neighbours so that later
    // we know not to put anything blocking next to a quest point
    const clearings = [];
    for (let i = 0; i < clearways.length; i++) {
        clearings.push(...allNeighbours(clearways[i]));
    }
    // make a collection of all the areas we've marked so far
    const land = unique([...clearways, ...clearings, ...paths]);
    const landTiles = createMap();
    drawTilesToMap(landTiles, land, () => T_LAND);
    const landSea = floodFill([0, 0], ([tx, ty]) => landTiles[ty][tx] === T_WATER);
    drawTilesToMap(landTiles, landSea, () => T_SEA);
    callback(landTiles, `${n}-land`);
    n++;
    // now expand it out until we have the desired amount of land area
    const expandedLand1 = expanded(land, ~~((mapSize * mapSize) * 0.11));
    const expandedLandTiles1 = createMap();
    drawTilesToMap(expandedLandTiles1, expandedLand1, () => T_LAND);
    const expandedLandSea1 = floodFill([0, 0], ([tx, ty]) => expandedLandTiles1[ty][tx] === T_WATER);
    drawTilesToMap(expandedLandTiles1, expandedLandSea1, () => T_SEA);
    callback(expandedLandTiles1, `${n}-expanded-land`);
    n++;
    // now expand it out until we have the desired amount of land area
    const expandedLand2 = expanded(land, ~~((mapSize * mapSize) * 0.22));
    const expandedLandTiles2 = createMap();
    drawTilesToMap(expandedLandTiles2, expandedLand2, () => T_LAND);
    const expandedLandSea2 = floodFill([0, 0], ([tx, ty]) => expandedLandTiles2[ty][tx] === T_WATER);
    drawTilesToMap(expandedLandTiles2, expandedLandSea2, () => T_SEA);
    callback(expandedLandTiles2, `${n}-expanded-land`);
    n++;
    // now expand it out until we have the desired amount of land area
    const expandedLand = expanded(land);
    const expandedLandTiles = createMap();
    drawTilesToMap(expandedLandTiles, expandedLand, () => T_LAND);
    const expandedLandSea = floodFill([0, 0], ([tx, ty]) => expandedLandTiles[ty][tx] === T_WATER);
    drawTilesToMap(expandedLandTiles, expandedLandSea, () => T_SEA);
    callback(expandedLandTiles, `${n}-expanded-land`);
    n++;
    // start the player at the leftmost point
    const [playerX, playerY] = leftMost(expandedLand);
    // fill in the map with the land we have so far
    drawTilesToMap(tiles, expandedLand, () => T_LAND);
    // flood the outside of the map with sea (as opposed to water) - the areas
    // that remain water will be used for placing biomes
    const sea = floodFill([0, 0], ([tx, ty]) => tiles[ty][tx] === T_WATER);
    drawTilesToMap(tiles, sea, () => T_SEA);
    // sort all the quest points by distance so we can place useful things close
    // and the satellite far away
    const waypoints = sortByDistance([playerX, playerY], clearways);
    // make sure there's a clear path from the player to the first waypoint
    const playerSteps = drunkenWalk([playerX, playerY], waypoints[0], inWaterBorder, 0.33);
    paths.push(...playerSteps);
    // change all the internal water to different biomes
    addBiomes(tiles);
    const biomes = cloneMap(tiles);
    callback(biomes, `${n}-biomes`);
    n++;
    // add sand along coastlines, decorate the remaining land with random grass, trees etc
    decorate(tiles);
    const decorated = cloneMap(tiles);
    callback(decorated, `${n}-decorated`);
    n++;
    // now draw all the paths to the map to make sure you can always walk between
    // quest points - make them as blank tiles to the player can visually pick
    // out the paths, unless it's coastline in which case leave it as sand
    drawTilesToMap(tiles, paths, ([wx, wy]) => {
        if (tiles[wy][wx] >= T_SAND && tiles[wy][wx] < T_SAND + T_SAND_L) {
            return tiles[wy][wx];
        }
        return T_LAND;
    });
    const footpaths = cloneMap(tiles);
    callback(footpaths, `${n}-footpaths`);
    n++;
    // decorate all the clearing around quest locations with various non-blocking
    // grass tiles etc
    drawTilesToMap(tiles, clearings, ([wx, wy]) => {
        if (tiles[wy][wx] >= T_SAND && tiles[wy][wx] < T_SAND + T_SAND_L) {
            return tiles[wy][wx];
        }
        return randInt(T_GRASS_L + 1) + T_LAND;
    });
    // now let's allocate quest locations to all the waypoints
    // 50% ruins, 25% huts, 15% portals
    const questSlots = waypoints.length - 4;
    const numHuts = ~~(questSlots * 0.25);
    const numPortals = ~~(questSlots * 0.15);
    const numRuins = ~~(questSlots * 0.5);
    const numBlank = questSlots - numHuts - numPortals - numRuins;
    const randQuests = [];
    for (let i = 0; i < numHuts; i++) {
        randQuests.push(QUEST_HUT);
    }
    for (let i = 0; i < numPortals; i++) {
        randQuests.push(QUEST_PORTAL);
    }
    for (let i = 0; i < numRuins; i++) {
        randQuests.push(QUEST_RUINS);
    }
    for (let i = 0; i < numBlank; i++) {
        randQuests.push(QUEST_BLANK);
    }
    // make sure that the closest ones are useful, the furthest is satellite,
    // the rest are random
    const quests = [QUEST_RANGER, QUEST_HUT, QUEST_RUINS, ...shuffle(randQuests), QUEST_SATELLITE];
    // add them to the map
    for (let i = 0; i < waypoints.length; i++) {
        const [wx, wy] = waypoints[i];
        const type = quests[i];
        // dead ranger
        if (type === QUEST_RANGER) {
            tiles[wy][wx] = T_RANGER;
        }
        // hut
        else if (type === QUEST_HUT) {
            tiles[wy][wx] = T_HUT;
        }
        // ruins
        else if (type === QUEST_RUINS) {
            tiles[wy][wx] = randInt(T_RUINS_L) + T_RUINS;
        }
        // portal
        else if (type === QUEST_PORTAL) {
            tiles[wy][wx] = T_PORTAL;
        }
        // satellite
        else if (type === QUEST_SATELLITE) {
            tiles[wy][wx] = T_SATELLITE;
        }
    }
    const questTiles = cloneMap(tiles);
    callback(questTiles, `${n}-quests`);
    n++;
    // done! return the island
    return [DTYPE_MAP, playerX, playerY, tiles, MT_ISLAND, playerX, playerY];
};






const gameData = [];
gameData[DATA_SPLASH] = [
    DTYPE_IMAGE,
    's.png'
];
gameData[DATA_INTRO] = [
    DTYPE_MESSAGE,
    [
        'Lost contact with',
        'RANGER. Take boat',
        'and investigate.'
    ]
];
gameData[DATA_SUNRISE] = [
    DTYPE_MESSAGE,
    [
        'Sunrise'
    ]
];
gameData[DATA_SUNSET] = [
    DTYPE_MESSAGE,
    [
        'Sunset'
    ]
];
gameData[DATA_INVESTIGATE] = [
    DTYPE_MESSAGE,
    [
        'I should',
        'investigate'
    ]
];
gameData[DATA_BED] = [
    DTYPE_SCREEN,
    [
        'Sleep?',
        ''
    ],
    [
        ['Yes', DATA_SLEEP],
        ['No', -1]
    ],
    0,
    'g'
];
gameData[DATA_NOT_TIRED] = [
    DTYPE_MESSAGE,
    [
        `I'm not tired!`
    ]
];
gameData[DATA_SLEEP] = [
    DTYPE_ACTION,
    ACTION_SLEEP
];
gameData[DATA_HUNGRY] = [
    DTYPE_MESSAGE,
    [
        `I'm hungry!`
    ]
];
gameData[DATA_DEAD] = [
    DTYPE_MESSAGE,
    [
        'You died',
        '',
        'GAME OVER!'
    ]
];
gameData[DATA_RANGER] = [
    DTYPE_MESSAGE,
    [
        `It's RANGER!`,
        '',
        `RANGER is DEAD!`,
        '',
        `Found 1 keycard`,
        `Found 5 food`,
        `Found 3 chips`,
        `Found 2 backups`
    ]
];
gameData[DATA_LOCKED_NOKEYS] = [
    DTYPE_MESSAGE,
    [
        `It's locked!`
    ]
];
gameData[DATA_LOCKED_UNLOCK] = [
    DTYPE_SCREEN,
    [
        `It's locked!`,
        '',
        'Use keycard?',
        ''
    ],
    [
        ['Yes', DATA_UNLOCK],
        ['No', -1]
    ],
    0,
    'g'
];
gameData[DATA_UNLOCK] = [
    DTYPE_ACTION,
    ACTION_UNLOCK
];
gameData[DATA_RUINS] = [
    DTYPE_SCREEN,
    [
        `Search ruins?`,
        '',
        '1 hour',
        ''
    ],
    [
        ['Yes', DATA_SEARCH_RUINS],
        ['No', -1]
    ],
    0,
    'g'
];
gameData[DATA_SEARCH_RUINS] = [
    DTYPE_ACTION,
    ACTION_SEARCH
];
gameData[DATA_USE_COMPUTER] = [
    DTYPE_ACTION,
    ACTION_USE_COMPUTER
];
gameData[DATA_FIX_COMPUTER] = [
    DTYPE_ACTION,
    ACTION_FIX_COMPUTER
];
gameData[DATA_CREATE_FOOD] = [
    DTYPE_ACTION,
    ACTION_CREATE_FOOD
];
gameData[DATA_SYNTH] = [
    DTYPE_ACTION,
    ACTION_SHOW_SYNTH
];
gameData[DATA_DB] = [
    DTYPE_ACTION,
    ACTION_SHOW_DB
];
gameData[DATA_COMMS] = [
    DTYPE_ACTION,
    ACTION_SHOW_COMMS
];
gameData[DATA_SECURITY] = [
    DTYPE_ACTION,
    ACTION_SHOW_SECURITY
];
gameData[DATA_MAP] = [
    DTYPE_ACTION,
    ACTION_SHOW_MAP
];
gameData[DATA_C_DB_INTRO] = [
    DTYPE_SCREEN,
    [
        'RSOS v3.27',
        '--------------------',
        'NOTES ENTRY 1',
        '',
        'RANGER:',
        'Sent to investigate',
        'ruins. Found strange',
        'technology'
    ],
    [],
    0,
    'a'
];
gameData[DATA_C_DB_PORTALS] = [
    DTYPE_SCREEN,
    [
        'RSOS v3.27',
        '--------------------',
        'NOTES ENTRY 2',
        '',
        'RANGER:',
        'Was testing strange',
        'technology. Portals',
        'appeared!'
    ],
    [],
    0,
    'a'
];
gameData[DATA_C_DB_GHOSTS] = [
    DTYPE_SCREEN,
    [
        'RSOS v3.27',
        '--------------------',
        'NOTES ENTRY 3',
        '',
        'RANGER:',
        'Monsters coming out',
        'of portals! Made it',
        'back to hut. They',
        'only come out at',
        'night'
    ],
    [],
    0,
    'a'
];
gameData[DATA_C_DB_ERRORS] = [
    DTYPE_SCREEN,
    [
        'RSOS v3.27',
        '--------------------',
        'NOTES ENTRY 4',
        '',
        'RANGER:',
        'Monsters affecting',
        'computers. Have been',
        'stashing items in',
        'ruins for emergency.',
        'Tried comms but the',
        'satellite is offline'
    ],
    [],
    0,
    'a'
];
gameData[DATA_C_DB_SHUTDOWN_PORTALS] = [
    DTYPE_SCREEN,
    [
        'RSOS v3.27',
        '--------------------',
        'NOTES ENTRY 5',
        '',
        'RANGER:',
        'Programmed synth to',
        'make mod chips that',
        'can shut down portal',
        'but computer went',
        'offline! There are',
        'more of them every',
        'night'
    ],
    [],
    0,
    'a'
];
gameData[DATA_C_DB_SECURITY] = [
    DTYPE_SCREEN,
    [
        'RSOS v3.27',
        '--------------------',
        'NOTES ENTRY 6',
        '',
        'RANGER:',
        'Got computer online.',
        'Still has errors.',
        'Comms are badly',
        'damaged'
    ],
    [],
    0,
    'a'
];
gameData[DATA_C_DB_FIX_SATELLITE] = [
    DTYPE_SCREEN,
    [
        'RSOS v3.27',
        '--------------------',
        'NOTES ENTRY 7',
        '',
        'RANGER:',
        'Rigged comms to send',
        'distress signal but',
        'satellite offline.',
        'Synth can make chip',
        'to fix it'
    ],
    [],
    0,
    'a'
];
gameData[DATA_C_DB_RESCUE_TEAM] = [
    DTYPE_SCREEN,
    [
        'RSOS v3.27',
        '--------------------',
        'NOTES ENTRY 8',
        '',
        'RANGER:',
        'Must disable portals',
        'before send distress',
        'signal, no way to',
        `warn rescue team`,
        'about monsters',
        'with comms offline'
    ],
    [],
    0,
    'a'
];
gameData[DATA_RESTORE_BACKUPS] = [
    DTYPE_ACTION,
    ACTION_RESTORE_BACKUPS
];
gameData[DATA_DIAGNOSTICS] = [
    DTYPE_ACTION,
    ACTION_DIAGNOSTICS
];
gameData[DATA_MODCHIPS] = [
    DTYPE_ACTION,
    ACTION_CREATE_MODCHIP
];
gameData[DATA_SATELLITE_CHIP] = [
    DTYPE_ACTION,
    ACTION_CREATE_SATELLITE_CHIP
];
gameData[DATA_DISTRESS_SIGNAL] = [
    DTYPE_ACTION,
    ACTION_DISTRESS_SIGNAL
];

const Game = () => {
    // state, things the UI might need to know to draw
    let hutCache;
    let ruinCache;
    let playerFacing;
    let playerFood;
    let playerHealth;
    let playerMaxHealth;
    let playerKeys;
    let playerChips;
    let playerDisks;
    let hours;
    let minutes;
    let color;
    let displayStack;
    let monsters;
    let seen;
    let satelliteFixed;
    // internal state, no need to expose to UI
    let seenRangerMessage;
    let currentHut;
    let currentRuins;
    let notesDb;
    let mapDb;
    let modChips;
    let satelliteChips;
    let portalCache;
    // create a clean slate, eg on first run or when restarting after died/won
    const reset = () => {
        // information about huts, ruins, portals etc.
        hutCache = [[]];
        ruinCache = [[]];
        portalCache = [[]];
        // player state
        playerFacing = 0;
        playerFood = 5;
        playerHealth = 20;
        playerMaxHealth = 20;
        playerKeys = 0;
        playerChips = 0;
        playerDisks = 0;
        // start five minutes before dark to teach the player about sunrise/sunset
        hours = 17;
        minutes = 55;
        // generate main map
        gameData[DATA_ISLAND] = createIsland(hutCache, ruinCache, portalCache);
        /*
          setup the display stack with the splash screen, then the intro text,
          then the main map
        */
        displayStack = [
            gameData[DATA_ISLAND],
            gameData[DATA_INTRO],
            gameData[DATA_SPLASH]
        ];
        color = '';
        monsters = [];
        seenRangerMessage = 0;
        modChips = -1;
        satelliteChips = -1;
        notesDb = [DATA_C_DB_INTRO];
        mapDb = [];
        seen = [];
        satelliteFixed = 0;
        /*
          once the player unlocks map, the tile they started on will already be
          restored
        */
        const mapItem = gameData[DATA_ISLAND];
        const playerX = mapItem[MAP_PLAYERX];
        const playerY = mapItem[MAP_PLAYERY];
        const gridX = ~~(playerX / gridSize);
        const gridY = ~~(playerY / gridSize);
        mapDb[gridY * gridTiles + gridX] = 1;
        createMonsters();
        distributeItems();
        updateSeen(mapItem);
    };
    const currentColor = () => {
        // images and messages use the green scheme
        if (displayStack[displayStack.length - 1][DISPLAY_TYPE] === DTYPE_IMAGE)
            return 'g';
        if (displayStack[displayStack.length - 1][DISPLAY_TYPE] === DTYPE_MESSAGE)
            return 'g';
        // computer stuff uses amber
        if (displayStack[displayStack.length - 1][DISPLAY_TYPE] === DTYPE_COMPUTER_MAP)
            return 'a';
        // screens can be either game screens (green) or computer screens (amber)
        if (displayStack[displayStack.length - 1][DISPLAY_TYPE] === DTYPE_SCREEN)
            return displayStack[displayStack.length - 1][SCREEN_COLOR];
        /*
          must be in game, probably empty string - black and white in day, dark
          blues at night
        */
        return color;
    };
    // current game state, used by the UI
    const state = () => [
        playerFacing, playerFood, playerHealth, playerMaxHealth, hours, minutes,
        currentColor(),
        displayStack[displayStack.length - 1],
        monsters,
        playerKeys, playerChips, playerDisks,
        seen,
        hutCache, ruinCache, portalCache, satelliteFixed, modChips, satelliteChips
    ];
    // close the current screen
    const close = () => {
        displayStack.pop();
        // if nothing left in stack, player won or died - restart
        if (!displayStack.length)
            reset();
    };
    /*
      create a new monster at x,y unless that tile is blocked or already has a
      monster
    */
    const createMonster = ([x, y]) => {
        const facing = randInt(2);
        const health = randInt(2) + 1;
        const mapItem = gameData[DATA_ISLAND];
        const mapTile = mapItem[MAP_TILES][y][x];
        const playerX = mapItem[MAP_PLAYERX];
        const playerY = mapItem[MAP_PLAYERY];
        if (!blocks(mapTile) && !hasPoint(monsters, [x, y]) &&
            !(playerX === x && playerY === y))
            monsters.push([x, y, facing, health]);
    };
    // create the initial monsters
    const createMonsters = () => {
        while (monsters.length < initialMonsterCount) {
            const x = randInt(mapSize);
            const y = randInt(mapSize);
            createMonster([x, y]);
        }
    };
    // monster is only "here" if it's still alive
    const isMonsterHere = ([x, y]) => {
        for (let i = 0; i < monsters.length; i++) {
            const monster = monsters[i];
            const mx = monster[MON_X];
            const my = monster[MON_Y];
            if (monster[MON_HEALTH] > 0 && x === mx && y === my)
                return 1;
        }
    };
    // move all the monsters
    const updateMonsters = () => {
        for (let i = 0; i < monsters.length; i++) {
            const monster = monsters[i];
            const x = monster[MON_X];
            const y = monster[MON_Y];
            const currentMapItem = displayStack[displayStack.length - 1];
            const mapItem = gameData[DATA_ISLAND];
            const playerX = mapItem[MAP_PLAYERX];
            const playerY = mapItem[MAP_PLAYERY];
            const next = [x, y];
            // at night, 66% chance the monster moves towards player.
            if ((hours >= sunset || hours < sunrise) && Math.random() < 0.66) {
                const toPlayer = towards([x, y], [playerX, playerY]);
                next[X] = toPlayer[X];
                next[Y] = toPlayer[Y];
            }
            // day time or 33% chance at night that monster just moves randomly
            else {
                // 50% chance of moving either horizontally or vertically
                if (randInt(2)) {
                    // either move left, stay here, or move right
                    next[X] = x + (randInt(3) - 1);
                }
                else {
                    // either move up, stay here, or move down
                    next[Y] = y + (randInt(3) - 1);
                }
            }
            // get the tile we're trying to move to
            const mapTile = mapItem[MAP_TILES][next[Y]][next[X]];
            // only move if not blocked by map obstacle, another monster or player
            if (!blocks(mapTile) &&
                !isMonsterHere([next[X], next[Y]]) &&
                !(playerX === next[X] && playerY === next[Y])) {
                monster[MON_X] = next[X];
                monster[MON_Y] = next[Y];
                // update monster facing if moved left or right
                if (next[X] < x) {
                    monster[MON_FACING] = 1;
                }
                if (next[X] > x) {
                    monster[MON_FACING] = 0;
                }
            }
            /*
              if nighttime and on main map and bumped player and player not already
              dead and this monster isn't dead, 50% chance of hurting player
            */
            if (currentMapItem[DISPLAY_TYPE] === DTYPE_MAP &&
                currentMapItem[MAP_TYPE] === MT_ISLAND &&
                (hours >= sunset || hours < sunrise) &&
                playerX === next[X] && playerY === next[Y] &&
                randInt(2) && playerHealth > 0 && monster[MON_HEALTH] > 0) {
                playerHealth--;
            }
        }
    };
    // distribute items amongst ruins
    const distributeItems = () => {
        const numHuts = hutCache[0].length;
        // 1 for each hut and some extra
        const numKeyCards = numHuts + 2;
        // 6 for each hut and some extra
        const numChips = ~~(numHuts * 7);
        /*
          We need:
            7 for notes
            15 for map
            2 for synth
    
          But make approx double that so that the game doesn't go too slowly
        */
        const numBackups = 50;
        // this is just a guess
        const numFood = ~~(numHuts * 2);
        let items = [];
        for (let i = 0; i < numKeyCards; i++) {
            items.push(ITEM_KEY);
        }
        for (let i = 0; i < numChips; i++) {
            items.push(ITEM_CHIP);
        }
        for (let i = 0; i < numBackups; i++) {
            items.push(ITEM_DISK);
        }
        for (let i = 0; i < numFood; i++) {
            items.push(ITEM_FOOD);
        }
        /*
          ok, now shuffle items so when we distribute it's random
        */
        items = shuffle(items);
        while (items.length) {
            /*
              take an item and randomly pick a ruin to stash it in
            */
            const item = items.pop();
            const [rx, ry] = pick(ruinCache[0]);
            const ruinItems = ruinCache[ry * mapSize + rx];
            ruinItems.push(item);
        }
    };
    /*
      increase the time by 1 minute every time the player does certain actions
  
      also keeps track of sunset/sunrise and changes color scheme accordingly
  
      if sleeping, don't eat food
  
      if not sleeping, try to eat food, if no food, lose health
    */
    const incTime = (sleeping = 0) => {
        if (playerHealth < 1) {
            displayStack = [gameData[DATA_DEAD]];
            return;
        }
        minutes++;
        // new hour
        if (minutes === 60) {
            minutes = 0;
            hours++;
            if (sleeping) {
                // heal one HP every hour
                if (playerHealth < playerMaxHealth)
                    playerHealth++;
                if (hours === sunrise) {
                    color = '';
                }
            }
            else {
                if (hours === sunrise) {
                    color = '';
                    displayStack.push(gameData[DATA_SUNRISE]);
                }
                if (hours === sunset) {
                    color = 'i';
                    displayStack.push(gameData[DATA_SUNSET]);
                }
                if (playerFood > 0) {
                    // eat food and heal 1 HP if needed
                    playerFood--;
                    if (playerHealth < playerMaxHealth)
                        playerHealth++;
                }
                else {
                    // starve if no food and lose 1 HP
                    playerHealth--;
                    displayStack.push(gameData[DATA_HUNGRY]);
                }
            }
        }
        // once a day at midnight, do this
        if (hours === 24) {
            // put all the synths back to full charge
            const huts = hutCache[0];
            for (let i = 0; i < huts.length; i++) {
                const [hx, hy] = huts[i];
                hutCache[hy * mapSize + hx][HUT_SYNTH_CHARGING] = 0;
            }
            // tick over the hours counter
            hours = 0;
            // have remaining active portals randomly spawn more monsters
            const mapItem = gameData[DATA_ISLAND];
            for (let y = 0; y < mapSize; y++) {
                for (let x = 0; x < mapSize; x++) {
                    const mapTile = mapItem[MAP_TILES][y][x];
                    if (mapTile === T_PORTAL) {
                        // every tile neighbouring portal has chance to spawn
                        const neighbours = allNeighbours([x, y]);
                        for (let i = 0; i < neighbours.length; i++) {
                            // one in three chance it spawns
                            if (!randInt(3)) {
                                createMonster(neighbours[i]);
                            }
                        }
                    }
                }
            }
        }
        // move all the monsters
        updateMonsters();
    };
    // format the time string
    const timeStr = () => `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
    // update the fog of war - helps player keep track of where they've been
    const updateSeen = (map) => {
        if (map[MAP_TYPE] === MT_ISLAND) {
            const px = map[MAP_PLAYERX];
            const py = map[MAP_PLAYERY];
            for (let y = -centerTile; y < centerTile; y++) {
                for (let x = -centerTile; x < centerTile; x++) {
                    const cx = px + x;
                    const cy = py + y;
                    // if we had a bigger viewport this would be a nice circle
                    if (dist([px, py], [cx, cy]) < centerTile) {
                        seen[cy * mapSize + cx] = 1;
                    }
                }
            }
        }
    };
    // the UI asked the game code to move the player
    const move = (x, y) => {
        const map = displayStack[displayStack.length - 1];
        // must be navigating around a menu or something
        if (map[0] !== DTYPE_MAP)
            return;
        // takes one minute even if blocked
        incTime();
        // change player facing even if blocked
        if (x === -1) {
            playerFacing = 1;
        }
        if (x === 1) {
            playerFacing = 0;
        }
        // update current player position
        x = map[MAP_PLAYERX] + x;
        y = map[MAP_PLAYERY] + y;
        // find if a monster is at the new position and if it is alive
        let monsterHere;
        if ((hours >= sunset || hours < sunrise) &&
            map[MAP_TYPE] === MT_ISLAND) {
            for (let i = 0; i < monsters.length; i++) {
                if (monsters[i][MON_X] === x && monsters[i][MON_Y] === y &&
                    monsters[i][MON_HEALTH] > 0) {
                    monsterHere = monsters[i];
                }
            }
        }
        // move the player if no map obstacle or monster
        if (playerHealth > 0 && inBounds([x, y]) &&
            !blocks(map[MAP_TILES][y][x]) && !monsterHere) {
            map[MAP_PLAYERX] = x;
            map[MAP_PLAYERY] = y;
        }
        // update the fog of war
        updateSeen(map);
        // check for bumping into things on island
        if (map[MAP_TYPE] === MT_ISLAND) {
            // huts
            if (map[MAP_TILES][y][x] === T_HUT) {
                currentHut = hutCache[y * mapSize + x];
                // if unlocked you just go in
                if (currentHut[HUT_UNLOCKED]) {
                    displayStack.push(createHut());
                }
                else {
                    // if they have keys ask if want to unlock
                    if (playerKeys) {
                        displayStack.push(gameData[DATA_LOCKED_UNLOCK]);
                    }
                    // otherwise tell them it's locked
                    else {
                        displayStack.push(gameData[DATA_LOCKED_NOKEYS]);
                    }
                }
            }
            // if they bump the boat tell them they can't leave, there's a job to do
            if (y === map[MAP_STARTY]) {
                if (x === map[MAP_STARTX] - 1) {
                    displayStack.push(gameData[DATA_INVESTIGATE]);
                }
            }
            // if bumped a monster, 50% chance of hurting it
            if (monsterHere && randInt(2)) {
                monsterHere[MON_HEALTH]--;
            }
            // show the ranger message the first time the player bumps the skeleton
            if (map[MAP_TILES][y][x] === T_RANGER && !seenRangerMessage) {
                seenRangerMessage = 1;
                displayStack.push(gameData[DATA_RANGER]);
                playerKeys++;
                playerFood += 5;
                playerChips += 3;
                playerDisks += 2;
            }
            // ruins
            if (map[MAP_TILES][y][x] >= T_RUINS && map[MAP_TILES][y][x] < T_RUINS + T_RUINS_L) {
                currentRuins = ruinCache[y * mapSize + x];
                // offer them chance to search if this ruins has items left
                if (currentRuins.length) {
                    displayStack.push(gameData[DATA_RUINS]);
                }
                // otherwise tell them it's empty
                else {
                    displayStack.push([DTYPE_MESSAGE, ['Nothing here']]);
                }
            }
            // portal
            if (map[MAP_TILES][y][x] === T_PORTAL) {
                // if they have mod chips, let them disable it
                if (modChips > 0) {
                    displayStack.push([DTYPE_MESSAGE, ['Portal disabled!']]);
                    map[MAP_TILES][y][x] = T_PORTAL_OFFLINE;
                    portalCache[y * mapSize + x] = 1;
                    modChips--;
                }
                // they can make mod chips, but don't have any yet
                else if (modChips > -1) {
                    displayStack.push([DTYPE_MESSAGE, ['Need mod chips']]);
                }
                // they haven't unlocked mod chips yet
                else {
                    displayStack.push([DTYPE_MESSAGE, ['A strange portal']]);
                }
            }
            // satellite
            if (map[MAP_TILES][y][x] === T_SATELLITE) {
                // if they haven't fixed it yet and have chips, fix it
                if (satelliteChips > 0 && !satelliteFixed) {
                    displayStack.push([DTYPE_MESSAGE, ['Fixed satellite!']]);
                    satelliteFixed = 1;
                    satelliteChips--;
                }
                // they can make chips but haven't yet
                else if (satelliteChips > -1 && !satelliteFixed) {
                    displayStack.push([DTYPE_MESSAGE, ['Need satellite chip']]);
                }
                // they haven't unlocked satellite chips yet
                else if (!satelliteFixed) {
                    displayStack.push([DTYPE_MESSAGE, ['Satellite is offline']]);
                }
            }
        }
        // bumps inside a hut
        if (map[MAP_TYPE] === MT_HUT) {
            // leave the hut if they bump the door
            if (map[MAP_TILES][y][x] === T_HUT_R) {
                displayStack.pop();
            }
            // use the computer
            if (map[MAP_TILES][y][x] === T_COMPUTER) {
                const options = [
                    ['Use', DATA_USE_COMPUTER]
                ];
                const computer = [
                    DTYPE_SCREEN,
                    [
                        `A computer`,
                        '',
                    ],
                    options,
                    0,
                    'g'
                ];
                if (!currentHut[HUT_COMPUTER_FIXED] && playerChips > 5) {
                    options.push(['Fix Chips', DATA_FIX_COMPUTER]);
                }
                if (currentHut[HUT_COMPUTER_FIXED] && playerDisks > 0) {
                    options.push(['Restore Backups', DATA_RESTORE_BACKUPS]);
                }
                // if they can fix or restore, ask them what they want to do
                if (options.length > 1) {
                    displayStack.push(computer);
                }
                // otherwise, just use the computer
                else {
                    actions[ACTION_USE_COMPUTER]();
                }
            }
            /*
              you can sleep anytime between one hour before sunset and 1 minute
              before sunrise - 1 hour before, because if you hurried back to hut and
              misjudged slightly and got there a bit early, it's annoying killing time
              until you can sleep
            */
            if (map[MAP_TILES][y][x] === T_BED) {
                if (hours >= (sunset - 1) || hours < sunrise) {
                    displayStack.push(gameData[DATA_BED]);
                }
                else {
                    displayStack.push(gameData[DATA_NOT_TIRED]);
                }
            }
        }
    };
    // the UI is asking to the change the selection on a screen
    const select = (i) => {
        if (displayStack[displayStack.length - 1][DISPLAY_TYPE] === DTYPE_SCREEN) {
            displayStack[displayStack.length - 1][SCREEN_SELECTION] = i;
        }
    };
    // the UI is asking us to execute whatever selection was chosen
    const confirmSelection = () => {
        if (displayStack[displayStack.length - 1][DISPLAY_TYPE] === DTYPE_SCREEN) {
            const screen = displayStack[displayStack.length - 1];
            // some screens have no options, just close the screen and return
            if (!screen[SCREEN_OPTIONS].length) {
                displayStack.pop();
                return;
            }
            const selected = screen[SCREEN_SELECTION];
            const dataIndex = screen[SCREEN_OPTIONS][selected][OPTION_DATA_INDEX];
            // magic number used by options that just want to close this screen
            if (dataIndex === -1) {
                close();
            }
            // if it's an action, close this screen and execute it
            else if (gameData[dataIndex][DISPLAY_TYPE] === DTYPE_ACTION) {
                displayStack.pop();
                actions[gameData[dataIndex][ACTION_INDEX]]();
            }
            // otherwise it must be another screen
            else {
                displayStack.push(gameData[dataIndex]);
            }
        }
    };
    /*
      note actions don't generally check if they're valid or not, that's done by
      the calling code
    */
    const actions = [
        // ACTION_SLEEP
        () => {
            while (hours !== sunrise) {
                incTime(1);
            }
        },
        // ACTION_UNLOCK
        () => {
            currentHut[HUT_UNLOCKED] = 1;
            playerKeys--;
        },
        // ACTION_SEARCH
        () => {
            const mapItem = gameData[DATA_ISLAND];
            const playerX = mapItem[MAP_PLAYERX];
            const playerY = mapItem[MAP_PLAYERY];
            const neighbours = allNeighbours([playerX, playerY]);
            let attacked = 0;
            /*
              searching takes one hour - if a monster is adjacent at any point, we
              want to stop searching so check every minute
            */
            for (let i = 0; i < 60; i++) {
                incTime();
                for (let n = 0; n < neighbours.length; n++) {
                    const [nx, ny] = neighbours[n];
                    if ((hours >= sunset || hours < sunrise) && isMonsterHere([nx, ny])) {
                        attacked = 1;
                        i = 60;
                    }
                }
            }
            if (attacked) {
                displayStack.push([DTYPE_MESSAGE, ['Under attack!']]);
            }
            else {
                // take an item off the ruin stack and give it to the player
                const item = currentRuins.pop();
                if (item === ITEM_FOOD) {
                    const food = randInt(3) + 2;
                    displayStack.push([DTYPE_MESSAGE, [`Found ${food} food`]]);
                    playerFood += food;
                }
                else if (item === ITEM_KEY) {
                    displayStack.push([DTYPE_MESSAGE, ['Found keycard']]);
                    playerKeys++;
                }
                else if (item === ITEM_CHIP) {
                    displayStack.push([DTYPE_MESSAGE, ['Found chip']]);
                    playerChips++;
                }
                else if (item === ITEM_DISK) {
                    displayStack.push([DTYPE_MESSAGE, ['Found backup']]);
                    playerDisks++;
                }
            }
        },
        // ACTION_USE_COMPUTER
        () => {
            // if they've used chips to fix the computer
            if (currentHut[HUT_COMPUTER_FIXED]) {
                displayStack.push([
                    DTYPE_SCREEN,
                    [
                        'RSOS v3.27',
                        '--------------------',
                        ''
                    ],
                    [
                        ['SYNTHESIZE', DATA_SYNTH],
                        ['DIAGNOSTICS', DATA_DIAGNOSTICS],
                        ['NOTES', DATA_DB],
                        ['COMMS', DATA_COMMS],
                        ['MAP', DATA_MAP]
                    ],
                    0,
                    'a'
                ]);
            }
            // otherwise, just basic functions
            else {
                displayStack.push([
                    DTYPE_SCREEN,
                    [
                        'RSOS v3.27',
                        '--------------------',
                        'NETWORK OFFLINE',
                        '',
                        'EMERGENCY MODE',
                        ''
                    ],
                    [
                        ['SYNTHESIZE', DATA_SYNTH],
                        ['DIAGNOSTICS', DATA_DIAGNOSTICS],
                    ],
                    0,
                    'a'
                ]);
            }
        },
        // ACTION_FIX_COMPUTER
        () => {
            displayStack.push([DTYPE_MESSAGE, ['Fixed 6 chips']]);
            playerChips -= 6;
            currentHut[HUT_COMPUTER_FIXED] = 1;
        },
        // ACTION_CREATE_FOOD
        () => {
            const food = randInt(3) + 6;
            currentHut[HUT_SYNTH_CHARGING] = 1;
            playerFood += food;
            displayStack.push([DTYPE_MESSAGE, [`Synthesized ${food} food`]]);
        },
        // ACTION_SHOW_SYNTH
        () => {
            const options = [];
            const screen = [
                DTYPE_SCREEN,
                [
                    'RSOS v3.27',
                    '--------------------',
                    'SYNTHESIZER',
                ],
                options,
                0,
                'a'
            ];
            // each hut's synth can only be used once a day
            if (currentHut[HUT_SYNTH_CHARGING]) {
                screen[DISPLAY_MESSAGE].push('  CHARGING...');
            }
            // if it hasn't been used
            else {
                // you can always make food if it has power
                options.push(['RATIONS', DATA_CREATE_FOOD]);
                // if they've unlocked mod chips
                if (modChips > -1) {
                    options.push(['MOD CHIPS', DATA_MODCHIPS]);
                }
                // if they've unlocked satellite chips
                if (satelliteChips > -1) {
                    options.push(['SATELLITE CHIP', DATA_SATELLITE_CHIP]);
                }
            }
            displayStack.push(screen);
        },
        // ACTION_SHOW_DB
        () => {
            // options for all the notes they've unlocked so far
            const dbOptions = notesDb.map(i => {
                return [`ENTRY ${i}`, i];
            });
            const dbScreen = [
                DTYPE_SCREEN,
                [
                    'RSOS v3.27',
                    '--------------------',
                    'NOTES',
                ],
                dbOptions,
                0,
                'a'
            ];
            displayStack.push(dbScreen);
        },
        // ACTION_SHOW_COMMS
        () => {
            const options = [];
            const screen = [
                DTYPE_SCREEN,
                [
                    'RSOS v3.27',
                    '--------------------',
                    'COMMS',
                ],
                options,
                0,
                'a'
            ];
            // they can only send distress signal after fixing satellite
            if (satelliteFixed) {
                options.push(['DISTRESS SIGNAL', DATA_DISTRESS_SIGNAL]);
            }
            else {
                screen[DISPLAY_MESSAGE].push('  SATELLITE OFFLINE');
            }
            displayStack.push(screen);
        },
        // ACTION_SHOW_SECURITY
        () => {
            /*
              this was never used - can be removed but all the action indices would
              need to be updated
            */
        },
        // ACTION_SHOW_MAP
        () => {
            const mapItem = gameData[DATA_ISLAND];
            const playerX = mapItem[MAP_PLAYERX];
            const playerY = mapItem[MAP_PLAYERY];
            const mapTiles = mapItem[MAP_TILES];
            // all the information needed by the UI to display the computer map
            const computerMap = [DTYPE_COMPUTER_MAP, playerX, playerY, mapTiles, mapDb];
            displayStack.push(computerMap);
        },
        // ACTION_RESTORE_BACKUPS
        () => {
            playerDisks--;
            // which note is next (if there are any left to show)
            const nextNoteDb = notesDb.length + DATA_C_DB_INTRO;
            const randItem = randInt(8);
            /*
              mod chip for closing down portals - give to the player on first backup
              restore after they've seen the note mentioning it
            */
            if ((notesDb.length + DATA_C_DB_INTRO) > DATA_C_DB_SHUTDOWN_PORTALS && modChips === -1) {
                displayStack.push([DTYPE_MESSAGE, [
                        'Recovered 1 synth',
                        'database entry'
                    ]]);
                // lets the game know they can make them, but don't have any yet
                modChips = 0;
            }
            /*
              satellite chip for fixing satellite - give after first note as above
            */
            else if ((notesDb.length + DATA_C_DB_INTRO) > DATA_C_DB_FIX_SATELLITE && satelliteChips === -1) {
                displayStack.push([DTYPE_MESSAGE, [
                        'Recovered 1 synth',
                        'database entry'
                    ]]);
                // as above
                satelliteChips = 0;
            }
            // note if they haven't gotten any yet and randItem was one of 0 1 2
            else if (randItem < 3 && nextNoteDb < (DATA_C_DB_INTRO + DATA_C_DB_L)) {
                notesDb.push(nextNoteDb);
                displayStack.push(gameData[notesDb.length + DATA_C_DB_INTRO - 1]);
                displayStack.push([DTYPE_MESSAGE, [
                        'Recovered 1 note',
                        'database entry'
                    ]]);
            }
            // otherwise give them a map tile if randItem was 3 4 5 6 7
            else {
                // check which map tiles are left
                let availableMaps = [];
                for (let y = 0; y < gridTiles; y++) {
                    for (let x = 0; x < gridTiles; x++) {
                        if (!mapDb[y * gridTiles + x]) {
                            availableMaps.push([x, y]);
                        }
                    }
                }
                // if there are any, pick one randomly and give it to them
                if (availableMaps.length) {
                    const [gridX, gridY] = pick(availableMaps);
                    mapDb[gridY * gridTiles + gridX] = 1;
                    actions[ACTION_SHOW_MAP]();
                    displayStack.push([DTYPE_MESSAGE, [
                            'Recovered 1 map',
                            'database entry'
                        ]]);
                }
                // none left, try to give them a note
                else {
                    if (nextNoteDb < (DATA_C_DB_INTRO + DATA_C_DB_L)) {
                        notesDb.push(nextNoteDb);
                        displayStack.push(gameData[notesDb.length + DATA_C_DB_INTRO - 1]);
                        displayStack.push([DTYPE_MESSAGE, [
                                'Recovered 1 note',
                                'database entry'
                            ]]);
                    }
                    // no notes left either
                    else {
                        displayStack.push([DTYPE_MESSAGE, [
                                'Backup already',
                                'restored'
                            ]]);
                    }
                }
            }
        },
        // ACTION_DIAGNOSTICS
        () => {
            // if they've fixed the computer, check what else is working properly
            if (currentHut[HUT_COMPUTER_FIXED]) {
                let availableMaps = [];
                for (let y = 0; y < gridTiles; y++) {
                    for (let x = 0; x < gridTiles; x++) {
                        if (!mapDb[y * gridTiles + x]) {
                            availableMaps.push([x, y]);
                        }
                    }
                }
                const screen = [
                    'RSOS v3.27',
                    '--------------------',
                    'DIAGNOSTICS',
                    '',
                    'NETWORK ONLINE',
                    'SYNTHESIZE ONLINE',
                ];
                /*
                  if they haven't got satellite chips yet, there are synth backups left
                  to restore
                */
                if (satelliteChips === -1) {
                    screen.push('  RESTORE BACKUPS');
                }
                screen.push('NOTES ONLINE');
                // still some notes to restore
                if (notesDb.length < 8) {
                    screen.push('  RESTORE BACKUPS');
                }
                // satellite status
                if (satelliteFixed) {
                    screen.push('COMMS ONLINE');
                    screen.push('  DISTRESS MODE ONLY');
                }
                else {
                    screen.push('COMMS OFFLINE');
                }
                screen.push('MAP ONLINE');
                // still some map backups left to do
                if (availableMaps.length) {
                    screen.push('  RESTORE BACKUPS');
                }
                displayStack.push([
                    DTYPE_SCREEN,
                    screen,
                    [],
                    0,
                    'a'
                ]);
            }
            // static screen if they haven't fixed it yet telling them to fix chips
            else {
                displayStack.push([
                    DTYPE_SCREEN,
                    [
                        'RSOS v3.27',
                        '--------------------',
                        'DIAGNOSTICS',
                        '',
                        'NETWORK OFFLINE',
                        '  FIX 6 CHIPS',
                        'SYNTHESIZE ONLINE',
                        '  EMERGENCY MODE',
                        'NOTES OFFLINE',
                        'COMMS OFFLINE',
                        'MAP OFFLINE'
                    ],
                    [],
                    0,
                    'a'
                ]);
            }
        },
        // ACTION_CREATE_MODCHIPS
        () => {
            // give them 2-3 chips per synth
            const chips = randInt(2) + 2;
            // set the synth to charge mode
            currentHut[HUT_SYNTH_CHARGING] = 1;
            modChips += chips;
            displayStack.push([
                DTYPE_MESSAGE,
                [
                    `Synthesized ${chips}`,
                    `mod chips`
                ]
            ]);
        },
        // ACTION_CREATE_SATELLITE_CHIP
        () => {
            // set the synth to charge mode
            currentHut[HUT_SYNTH_CHARGING] = 1;
            // they only need one anyway
            satelliteChips++;
            displayStack.push([
                DTYPE_MESSAGE,
                [
                    `Synthesized`,
                    `satellite chip`
                ]
            ]);
        },
        // ACTION_DISTRESS_SIGNAL
        () => {
            // check if they've disabled every portal
            const portals = portalCache[0];
            const mapItem = gameData[DATA_ISLAND];
            const mapTiles = mapItem[MAP_TILES];
            let portalsLeft = 0;
            for (let i = 0; i < portals.length; i++) {
                const [px, py] = portals[i];
                if (mapTiles[py][px] !== T_PORTAL_OFFLINE) {
                    portalsLeft = 1;
                }
            }
            // they didn't - bad move, the last note tells you to
            if (portalsLeft) {
                displayStack = [[
                        DTYPE_MESSAGE,
                        [
                            `You send the`,
                            `distress signal.`,
                            '',
                            'As the rescue team',
                            'arrives monsters',
                            'pour out of',
                            'remaining portals',
                            'and kill them all!',
                            '',
                            'GAME OVER!'
                        ]
                    ]];
            }
            // they did! good work, they won
            else {
                displayStack = [[
                        DTYPE_MESSAGE,
                        [
                            `You send the`,
                            `distress signal.`,
                            '',
                            'The rescue team',
                            'arrives and you',
                            'help them kill',
                            'the remaining',
                            'monsters.',
                            '',
                            'YOU WIN!'
                        ]
                    ]];
            }
        }
    ];
    // first run
    reset();
    // api for the UI to interact with
    const api = [
        state, reset, timeStr, incTime, move, close, select, confirmSelection
    ];
    return api;
};


// a new animation frame, decide what to draw
const draw = (time) => {
    const color = api[API_STATE]()[ST_COLOR];
    const displayItem = api[API_STATE]()[ST_DISPLAY_ITEM];
    // set the canvas' color scheme
    c.className = color;
    // blank the canvas
    c.width = c.height = tileSize * canvasTiles;
    // now decide what to draw according to the display item's display type
    if (displayItem[DISPLAY_TYPE] === DTYPE_MAP) {
        drawMap(time);
        drawUi();
    }
    if (displayItem[DISPLAY_TYPE] === DTYPE_IMAGE) {
        // it's the splash screen
        if (displayItem[DISPLAY_NAME] === 's.png') {
            ctx.drawImage(splash, 0, 0);
            // draw a skeleton in the middle, looks cool
            ctx.drawImage(player, S_SKELETON * tileSize, 0, tileSize, tileSize, mapSize / 2 - fontSize, mapSize / 2 - fontSize, tileSize, tileSize);
            // and copyright etc
            drawText('Js13kGames OFFLINE', 1, 16);
            drawText('C2018 Nik Coughlin', 1, 18);
        }
    }
    if (displayItem[DISPLAY_TYPE] === DTYPE_MESSAGE) {
        drawMessage(displayItem[DISPLAY_MESSAGE]);
    }
    if (displayItem[DISPLAY_TYPE] === DTYPE_SCREEN) {
        drawScreen(displayItem);
    }
    if (displayItem[DISPLAY_TYPE] === DTYPE_COMPUTER_MAP) {
        drawComputerMap();
    }
    // request the next frame
    requestAnimationFrame(draw);
};
// draw a single char - tx and tx are in font units, eg a 20x20 grid with
// current settings
const drawChar = (ch = '', tx = 0, ty = 0) => ctx.drawImage(font, (ch.charCodeAt(0) - 32) * fontSize, 0, fontSize, fontSize, tx * fontSize, ty * fontSize, fontSize, fontSize);
// draw a string of text, same coord system as drawChar
const drawText = (str = '', tx = 0, ty = 0) => {
    for (let i = 0; i < str.length; i++)
        drawChar(str[i], tx + i, ty);
};
// centers the lines of text on the screen vertically and horizontally
const drawMessage = (lines) => {
    const dy = ~~((fontTiles - lines.length) / 2);
    for (let y = 0; y < lines.length; y++) {
        const dx = ~~((fontTiles - lines[y].length) / 2);
        drawText(lines[y], dx, dy + y);
    }
};
// draws a screen that may have options that the player can choose
const drawScreen = (screen) => {
    // first draw the message
    for (let y = 0; y < screen[SCREEN_MESSAGE].length; y++) {
        drawText(screen[SCREEN_MESSAGE][y], 0, y);
    }
    /*
      clicking/tapping anywhere on the top row closes but add an <X> button
      in the top right corner as a visual hint to the player
    */
    drawText('<X>', fontTiles - 3, 0);
    // figure out where to start drawing the options
    const optionOffset = screen[SCREEN_MESSAGE].length % 2 ? 1 : 0;
    // show the options, also mark the currently selected option
    for (let y = 0; y < screen[SCREEN_OPTIONS].length; y++) {
        drawText(`${y + 1} ${y === screen[SCREEN_SELECTION] ? '<' : ' '}${screen[SCREEN_OPTIONS][y][OPTION_MESSAGE]}${y === screen[SCREEN_SELECTION] ? '>' : ' '}`, 0, y * 2 + screen[SCREEN_MESSAGE].length + optionOffset);
    }
};
// main map view
const drawMap = (time) => {
    // we only use two frames of animation - which is it currently?
    const currentFrame = ~~(time / animTime) % 2 ? 0 : 1;
    // get everything we need to know from state
    const monsters = api[API_STATE]()[ST_MONSTERS];
    const mapItem = api[API_STATE]()[ST_DISPLAY_ITEM];
    const map = mapItem[MAP_TILES];
    const playerX = mapItem[MAP_PLAYERX];
    const playerY = mapItem[MAP_PLAYERY];
    const mapType = mapItem[MAP_TYPE];
    const startX = mapItem[MAP_STARTX];
    const startY = mapItem[MAP_STARTY];
    const playerHealth = api[API_STATE]()[ST_PLAYER_HEALTH];
    const playerFacing = api[API_STATE]()[ST_PLAYER_FACING];
    const satelliteFixed = api[API_STATE]()[ST_SATELLITE_FIXED];
    const seen = api[API_STATE]()[ST_SEEN];
    const isNight = api[API_STATE]()[ST_HOURS] >= sunset || api[API_STATE]()[ST_HOURS] < sunrise;
    // iterate over the viewport
    for (let y = 0; y < viewTiles; y++) {
        for (let x = 0; x < viewTiles; x++) {
            // convert viewport coordinates to map coordinates
            const mapX = (playerX - centerTile) + x;
            const mapY = (playerY - centerTile) + y;
            // assume water tile, set to either 0 or 1 depending on currentFrame
            let sx = currentFrame * tileSize;
            // bounds check
            if (inBounds([mapX, mapY])) {
                const tileIndex = map[mapY][mapX];
                /*
                  this is the default drawing offset into the sprites, some tile with
                  no animation etc - if tileIndex is 0 then it must be water so we leave
                  sx as is, it was set above
                */
                if (tileIndex)
                    sx = tileIndex * tileSize;
            }
            // draw whatever the tile was
            ctx.drawImage(tiles, sx, 0, tileSize, tileSize, (x + 1) * tileSize, (y + 1) * tileSize, tileSize, tileSize);
            // special handling for portal
            if (map[mapY][mapX] === T_PORTAL) {
                // portal is only animated at night
                if (isNight) {
                    ctx.drawImage(tiles, (T_PORTAL + currentFrame) * tileSize, 0, tileSize, tileSize, (x + 1) * tileSize, (y + 1) * tileSize, tileSize, tileSize);
                }
                // draw the day time, inactive portal
                else {
                    ctx.drawImage(tiles, T_PORTAL_DAY * tileSize, 0, tileSize, tileSize, (x + 1) * tileSize, (y + 1) * tileSize, tileSize, tileSize);
                }
                /*
                  if portal has been deactivated, the default drawing case above
                  already drew it, no need to do anything
                */
            }
            /*
              special case for the fixed satellite, it now animates
            */
            if (map[mapY][mapX] === T_SATELLITE && satelliteFixed) {
                ctx.drawImage(tiles, (T_SATELLITE + currentFrame) * tileSize, 0, tileSize, tileSize, (x + 1) * tileSize, (y + 1) * tileSize, tileSize, tileSize);
            }
            // only draw monsters on the island (not in huts) and only if night
            if (mapType === MT_ISLAND && isNight) {
                for (let i = 0; i < monsters.length; i++) {
                    const monster = monsters[i];
                    const mx = monster[MON_X];
                    const my = monster[MON_Y];
                    const monsterFacing = monster[MON_FACING];
                    if (mx === mapX && my === mapY && monster[MON_HEALTH] > 0) {
                        // figure out index according to facing, current animation frame etc
                        sx = ((S_MONSTER + currentFrame) * tileSize) + (monsterFacing * tileSize * 2);
                        ctx.drawImage(player, sx, 0, tileSize, tileSize, (x + 1) * tileSize, (y + 1) * tileSize, tileSize, tileSize);
                    }
                }
            }
            // always draw the player in the center
            if (x === centerTile && y === centerTile) {
                // alive
                if (playerHealth) {
                    // get the correct animation frame according to facing etc
                    sx = (currentFrame * tileSize) + (playerFacing * tileSize * 2);
                }
                // they're dead, just show skeleton
                else {
                    sx = S_SKELETON * tileSize;
                }
                ctx.drawImage(player, sx, 0, tileSize, tileSize, (x + 1) * tileSize, (y + 1) * tileSize, tileSize, tileSize);
            }
            // draw the boat next to where the player started
            if (mapType === MT_ISLAND && mapX === startX - 2 && mapY === startY) {
                ctx.drawImage(player, S_BOAT_LEFT * tileSize, 0, tileSize, tileSize, (x + 1) * tileSize, (y + 1) * tileSize, tileSize, tileSize);
            }
            if (mapType === MT_ISLAND && mapX === startX - 1 && mapY === startY) {
                ctx.drawImage(player, S_BOAT_RIGHT * tileSize, 0, tileSize, tileSize, (x + 1) * tileSize, (y + 1) * tileSize, tileSize, tileSize);
            }
            // draw fog of war over any unseen tiles - must be last obviously
            if (mapType === MT_ISLAND && !seen[mapY * mapSize + mapX]) {
                ctx.drawImage(tiles, T_FOG * tileSize, 0, tileSize, tileSize, (x + 1) * tileSize, (y + 1) * tileSize, tileSize, tileSize);
            }
        }
    }
};
// show the current time, player's health, food, items etc.
const drawUi = () => {
    const playerFood = api[API_STATE]()[ST_PLAYER_FOOD];
    const playerHealth = api[API_STATE]()[ST_PLAYER_HEALTH];
    const playerKeys = api[API_STATE]()[ST_PLAYER_KEYS];
    const playerChips = api[API_STATE]()[ST_PLAYER_CHIPS];
    const playerDisks = api[API_STATE]()[ST_PLAYER_DISKS];
    const modChips = api[API_STATE]()[ST_MOD_CHIPS];
    const satelliteChips = api[API_STATE]()[ST_SATELLITE_CHIPS];
    drawText(`RANGER DOWN ${api[API_TIMESTR]()}`, 2.5, 0.5);
    ctx.drawImage(tiles, T_HEALTH * tileSize, 0, tileSize, tileSize, 0, 0, tileSize, tileSize);
    drawText(`${playerHealth}`, playerHealth < 10 ? 0.5 : 0, 2);
    ctx.drawImage(tiles, T_FOOD * tileSize, 0, tileSize, tileSize, 0, tileSize * 1.5, tileSize, tileSize);
    drawText(`${playerFood}`, playerFood < 10 ? 0.5 : 0, 5);
    ctx.drawImage(tiles, T_KEY * tileSize, 0, tileSize, tileSize, 0, tileSize * 3, tileSize, tileSize);
    drawText(`${playerKeys}`, playerKeys < 10 ? 0.5 : 0, 8);
    ctx.drawImage(tiles, T_DISK * tileSize, 0, tileSize, tileSize, 0, tileSize * 4.5, tileSize, tileSize);
    drawText(`${playerDisks}`, playerDisks < 10 ? 0.5 : 0, 11);
    ctx.drawImage(tiles, T_CHIP * tileSize, 0, tileSize, tileSize, 0, tileSize * 6, tileSize, tileSize);
    drawText(`${playerChips}`, playerChips < 10 ? 0.5 : 0, 14);
    if (modChips > -1) {
        drawText(`${modChips}`, modChips < 10 ? 0.5 : 0, 15);
    }
    if (satelliteChips > -1) {
        drawText(`${satelliteChips}`, satelliteChips < 10 ? 0.5 : 0, 16);
    }
};
let lastAnimFrame = 0;
// use the map db to display any unlocked map tiles
const drawComputerMap = () => {
    // get info we need from state
    const mapItem = api[API_STATE]()[ST_DISPLAY_ITEM];
    const seen = api[API_STATE]()[ST_SEEN];
    const hutCache = api[API_STATE]()[ST_HUTCACHE];
    const ruinCache = api[API_STATE]()[ST_RUINCACHE];
    const satelliteFixed = api[API_STATE]()[ST_SATELLITE_FIXED];
    const playerX = mapItem[MAP_PLAYERX];
    const playerY = mapItem[MAP_PLAYERY];
    const map = mapItem[MAP_TILES];
    const mapDb = mapItem[COMPUTER_MAP_MAPDB];
    // first draw the coastlines and mark land as seen/unseen
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
            const gridX = ~~(x / gridSize);
            const gridY = ~~(y / gridSize);
            const tile = map[y][x];
            const isSand = tile >= T_SAND && tile < T_SAND + T_SAND_L;
            // if they have this tile unlocked
            if (mapDb[gridY * gridTiles + gridX]) {
                // leave left and top edge clear for coords
                if (blocks(tile)) {
                    // not the most efficient way to draw a single pixel but map is small
                    ctx.drawImage(tiles, T_BLACK * tileSize, 0, 1, 1, x, y, 1, 1);
                }
                // we draw coastlines and seen tiles in white
                else if (seen[y * mapSize + x] || isSand) {
                    ctx.drawImage(tiles, T_LAND * tileSize, 0, 1, 1, x, y, 1, 1);
                }
                // unseen dithered
                else {
                    if ((x % 2 && !(y % 2)) ||
                        (!(x % 2) && y % 2)) {
                        ctx.drawImage(tiles, T_LAND * tileSize, 0, 1, 1, x, y, 1, 1);
                    }
                    else {
                        ctx.drawImage(tiles, T_BLACK * tileSize, 0, 1, 1, x, y, 1, 1);
                    }
                }
            }
            // otherwise static, but leave the left and top edge
            else {
                if (x > fontSize && y > fontSize) {
                    if (randInt(2)) {
                        ctx.drawImage(tiles, T_LAND * tileSize, 0, 1, 1, x, y, 1, 1);
                    }
                    else {
                        ctx.drawImage(tiles, T_BLACK * tileSize, 0, 1, 1, x, y, 1, 1);
                    }
                }
            }
        }
    }
    // now draw icons on the map to show player interesting things
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
            const gridX = ~~(x / gridSize);
            const gridY = ~~(y / gridSize);
            const tile = map[y][x];
            // if they've unlocked this tile
            if (mapDb[gridY * gridTiles + gridX]) {
                // show two states for huts, locked or unlocked
                if (tile === T_HUT) {
                    const currentHut = hutCache[y * mapSize + x];
                    if (currentHut[HUT_UNLOCKED]) {
                        ctx.drawImage(tiles, T_LAND * tileSize, 0, computerIconSize + 2, computerIconSize + 2, x - 4, y - 4, computerIconSize + 2, computerIconSize + 2);
                        ctx.drawImage(computerIcons, C_HUT_UNLOCKED * computerIconSize, 0, computerIconSize, computerIconSize, x - 3, y - 3, computerIconSize, computerIconSize);
                    }
                    else {
                        ctx.drawImage(tiles, T_BLACK * tileSize, 0, computerIconSize + 2, computerIconSize + 2, x - 4, y - 4, computerIconSize + 2, computerIconSize + 2);
                        ctx.drawImage(computerIcons, C_HUT_LOCKED * computerIconSize, 0, computerIconSize, computerIconSize, x - 3, y - 3, computerIconSize, computerIconSize);
                    }
                }
                // show a different state for ruins that are empty vs can still search
                if (tile >= T_RUINS && tile < T_RUINS + T_RUINS_L) {
                    const currentRuins = ruinCache[y * mapSize + x];
                    if (currentRuins.length) {
                        ctx.drawImage(tiles, T_LAND * tileSize, 0, computerIconSize + 2, computerIconSize + 2, x - 4, y - 4, computerIconSize + 2, computerIconSize + 2);
                        ctx.drawImage(computerIcons, C_RUINS_ACTIVE * computerIconSize, 0, computerIconSize, computerIconSize, x - 3, y - 3, computerIconSize, computerIconSize);
                    }
                    else {
                        ctx.drawImage(tiles, T_BLACK * tileSize, 0, computerIconSize + 2, computerIconSize + 2, x - 4, y - 4, computerIconSize + 2, computerIconSize + 2);
                        ctx.drawImage(computerIcons, C_RUINS_EMPTY * computerIconSize, 0, computerIconSize, computerIconSize, x - 3, y - 3, computerIconSize, computerIconSize);
                    }
                }
                // fixed vs offline
                if (tile === T_SATELLITE) {
                    if (satelliteFixed) {
                        ctx.drawImage(tiles, T_LAND * tileSize, 0, computerIconSize + 2, computerIconSize + 2, x - 4, y - 4, computerIconSize + 2, computerIconSize + 2);
                        ctx.drawImage(computerIcons, C_SATELLITE_ACTIVE * computerIconSize, 0, computerIconSize, computerIconSize, x - 3, y - 3, computerIconSize, computerIconSize);
                    }
                    else {
                        ctx.drawImage(tiles, T_BLACK * tileSize, 0, computerIconSize + 2, computerIconSize + 2, x - 4, y - 4, computerIconSize + 2, computerIconSize + 2);
                        ctx.drawImage(computerIcons, C_SATELLITE_OFFLINE * computerIconSize, 0, computerIconSize, computerIconSize, x - 3, y - 3, computerIconSize, computerIconSize);
                    }
                }
                // portal, not yet deactivated
                if (tile === T_PORTAL) {
                    ctx.drawImage(tiles, T_LAND * tileSize, 0, computerIconSize + 2, computerIconSize + 2, x - 4, y - 4, computerIconSize + 2, computerIconSize + 2);
                    ctx.drawImage(computerIcons, C_PORTAL_ACTIVE * computerIconSize, 0, computerIconSize, computerIconSize, x - 3, y - 3, computerIconSize, computerIconSize);
                }
                // offline portal
                if (tile === T_PORTAL_OFFLINE) {
                    ctx.drawImage(tiles, T_LAND * tileSize, 0, computerIconSize + 2, computerIconSize + 2, x - 4, y - 4, computerIconSize + 2, computerIconSize + 2);
                    ctx.drawImage(computerIcons, C_PORTAL_OFFLINE * computerIconSize, 0, computerIconSize, computerIconSize, x - 3, y - 3, computerIconSize, computerIconSize);
                }
            }
        }
    }
    // mark current location on the map, always show even in locked tiles
    ctx.drawImage(tiles, T_LAND * tileSize, 0, computerIconSize + 2, computerIconSize + 2, playerX - 4, playerY - 4, computerIconSize + 2, computerIconSize + 2);
    ctx.drawImage(computerIcons, C_PLAYER * computerIconSize, 0, computerIconSize, computerIconSize, playerX - 3, playerY - 3, computerIconSize, computerIconSize);
    /*
      map coordinates - if we had room left we were going to have quests where
      notes from ranger told player to go to certain places
    */
    // draw numbers down the left edge
    for (let y = 0; y < gridSize; y++) {
        ctx.drawImage(font, (16 + y) * fontSize, 0, fontSize, fontSize, 0, y * gridSize + ~~(gridSize / 2), fontSize, fontSize);
    }
    // draw letters along the top edge
    for (let x = 0; x < gridSize; x++) {
        ctx.drawImage(font, (33 + x) * fontSize, 0, fontSize, fontSize, x * gridSize + ~~(gridSize / 2), 0, fontSize, fontSize);
    }
};
// handle keyboard when moving on map - supports WADS and arrows
const keyHandlerMap = e => {
    // left
    if (e.keyCode === 65 || e.keyCode === 37) {
        api[API_MOVE](-1, 0);
    }
    // right
    if (e.keyCode === 68 || e.keyCode === 39) {
        api[API_MOVE](1, 0);
    }
    // up
    if (e.keyCode === 87 || e.keyCode === 38) {
        api[API_MOVE](0, -1);
    }
    // down
    if (e.keyCode === 83 || e.keyCode === 40) {
        api[API_MOVE](0, 1);
    }
};
// initialize everything
const ctx = c.getContext('2d');
let font;
let tiles;
let player;
let splash;
let computerIcons;
let api = Game();
// decide what the key press is for
document.onkeyup = e => {
    const displayItem = api[API_STATE]()[ST_DISPLAY_ITEM];
    // map, must be moving
    if (displayItem[DISPLAY_TYPE] === DTYPE_MAP) {
        keyHandlerMap(e);
    }
    // a screen that can be dismissed
    if (displayItem[DISPLAY_TYPE] === DTYPE_IMAGE ||
        displayItem[DISPLAY_TYPE] === DTYPE_MESSAGE ||
        displayItem[DISPLAY_TYPE] === DTYPE_COMPUTER_MAP) {
        // space or esc or enter
        if (e.keyCode === 32 || e.keyCode === 27 || e.keyCode === 13) {
            api[API_CLOSE]();
        }
    }
    // a screen with options
    if (displayItem[DISPLAY_TYPE] === DTYPE_SCREEN) {
        const screen = displayItem;
        // esc
        if (e.keyCode === 27) {
            api[API_CLOSE]();
        }
        // up
        if (e.keyCode === 87 || e.keyCode === 38) {
            if (screen[SCREEN_SELECTION] > 0) {
                api[API_SELECT](screen[SCREEN_SELECTION] - 1);
            }
        }
        // down
        if (e.keyCode === 83 || e.keyCode === 40) {
            if (screen[SCREEN_SELECTION] < screen[SCREEN_OPTIONS].length - 1) {
                api[API_SELECT](screen[SCREEN_SELECTION] + 1);
            }
        }
        // space or enter
        if (e.keyCode === 32 || e.keyCode === 13) {
            api[API_CONFIRM_SELECT]();
        }
    }
};
// handle mouse and touch events
const clickOrTouch = ([x, y]) => {
    const displayItem = api[API_STATE]()[ST_DISPLAY_ITEM];
    // we need to know what the browser has sized the canvas to to get the coords
    const tileSize = c.getBoundingClientRect().width / canvasTiles;
    const tx = ~~((x - c.getBoundingClientRect().left) / tileSize) - 1;
    const ty = ~~((y - c.getBoundingClientRect().top) / tileSize) - 1;
    if (displayItem[DISPLAY_TYPE] === DTYPE_MAP) {
        // tapped on player
        if (tx === centerTile && ty === centerTile) {
            return;
        }
        //tapped an interface tile
        if (tx < 0 || ty < 0) {
            return;
        }
        /*
          figure out roughly which way player wants to move according to how far
          from center they clicked/tapped horizontally or vertically
        */
        const dx = delta(tx, centerTile);
        const dy = delta(ty, centerTile);
        let x = 0;
        let y = 0;
        if (dx > dy) {
            x = tx > centerTile ? 1 : -1;
        }
        else if (dx < dy) {
            y = ty > centerTile ? 1 : -1;
        }
        api[API_MOVE](x, y);
    }
    // screen with no options, click or tap anywhere to close
    if (displayItem[DISPLAY_TYPE] === DTYPE_IMAGE ||
        displayItem[DISPLAY_TYPE] === DTYPE_MESSAGE ||
        displayItem[DISPLAY_TYPE] === DTYPE_COMPUTER_MAP) {
        api[API_CLOSE]();
    }
    // screen with options
    if (displayItem[DISPLAY_TYPE] === DTYPE_SCREEN) {
        const screen = displayItem;
        const optionOffset = screen[SCREEN_MESSAGE].length % 2 ? 1 : 0;
        const selectionStartY = (screen[SCREEN_MESSAGE].length + optionOffset) / 2;
        const selectionSize = screen[SCREEN_OPTIONS].length;
        const selection = ty - selectionStartY + 1;
        // tapped the top, close
        if (ty < 0) {
            api[API_CLOSE]();
        }
        // no options, anywhere to close
        if (!selectionSize) {
            api[API_CLOSE]();
        }
        /*
          if they tapped a different selection to current selection, change to it
          if they tapped the existing selection, consider it a confirm
        */
        if (selection >= 0 && selection < selectionSize) {
            if (selection === screen[SCREEN_SELECTION]) {
                api[API_CONFIRM_SELECT]();
            }
            else {
                api[API_SELECT](selection);
            }
        }
    }
};
c.ontouchend = e => {
    e.preventDefault();
    // just handle every touch
    for (let i = 0; i < e.changedTouches.length; i++) {
        clickOrTouch([e.changedTouches[i].clientX, e.changedTouches[i].clientY]);
    }
};
c.onclick = e => {
    e.preventDefault();
    clickOrTouch([e.clientX, e.clientY]);
};
// let's kick this thing off
loadImages('f.gif', 't.gif', 'p.gif', 's.png', 'c.gif').then(imgs => {
    // set the predefined globals
    [font, tiles, player, splash, computerIcons] = imgs;
    requestAnimationFrame(draw);
});
};s()