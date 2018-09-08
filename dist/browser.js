const s = () => {const tileSize = 16;
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
const gridTiles = 5;
const gridSize = ~~(mapSize / gridTiles);
const initialMonsterCount = ~~(mapSize / 3);
const sunrise = 6;
const sunset = 18;

const loadImage = (path) => new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = path;
});
const loadImages = (...paths) => Promise.all(paths.map(loadImage));
const pick = (arr) => arr[randInt(arr.length)];
const randInt = (exclMax, min = 0) => ~~(Math.random() * exclMax) + min;
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
const S_SKELETON = 4;
const S_BOAT_LEFT = 5;
const S_BOAT_RIGHT = 6;
const S_MONSTER = 7;
const C_HUT = 0;
const C_RUINS = 1;
const C_SATELLITE = 2;
const C_PLAYER = 3;
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
const DATA_RESTORE_BACKUPS = 41;
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
// hut state
const HUT_UNLOCKED = 0;
const HUT_COMPUTER_FIXED = 1;

const delta = (i, j) => Math.max(i, j) - Math.min(i, j);
const immediateNeighbours = ([x, y]) => [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1]
];
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
const getImmediateNeighbours = (tiles, p, tileIndex) => immediateNeighbours(p).filter(p => tiles[p[Y]][p[X]] === tileIndex);
const withinDist = (tiles, [x, y], min, max) => {
    const candidates = tiles.filter(([tx, ty]) => {
        return delta(tx, x) >= min &&
            delta(ty, y) >= min &&
            delta(tx, x) <= max &&
            delta(ty, y) <= max;
    });
    return pick(candidates);
};
const dist = ([x1, y1], [x2, y2]) => Math.hypot(delta(x1, x2), delta(y1, y2));
const nearest = (p1, points) => {
    let d = mapSize * mapSize;
    let p;
    for (let i = 0; i < points.length; i++) {
        const currentDist = dist(p1, points[i]);
        if (currentDist < d) {
            d = currentDist;
            p = points[i];
        }
    }
    return p;
};
const sortByDistance = (p, points) => points.slice().sort((p1, p2) => dist(p, p1) - dist(p, p2));
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
    console.log('unique', points.length, result.length);
    return result;
};
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
const findTile = (tiles, [x, y]) => {
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i][X] === x && tiles[i][Y] === y)
            return tiles[i];
    }
};
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
const randomPoint = () => [randInt(mapSize), randInt(mapSize)];
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
const randomPointInLandBorder = () => [
    randInt(mapSize - landBorder * 2, landBorder),
    randInt(mapSize - landBorder * 2, landBorder)
];
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
const hasPoint = (tiles, [x, y]) => {
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i][X] === x && tiles[i][Y] === y)
            return true;
    }
    return false;
};
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
const inBounds = ([x, y]) => x >= 0 &&
    x <= mapSize - 1 &&
    y >= 0 &&
    y <= mapSize - 1;
const inWaterBorder = ([x, y]) => x >= waterBorder &&
    x <= mapSize - waterBorder &&
    y >= waterBorder &&
    y <= mapSize - waterBorder;
const inLandBorder = ([x, y]) => x >= landBorder &&
    x <= mapSize - landBorder &&
    y >= landBorder &&
    y <= mapSize - landBorder;






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
const drawTilesToMap = (tiles, points, getTileIndex) => {
    for (let i = 0; i < points.length; i++) {
        const [px, py] = points[i];
        tiles[py][px] = getTileIndex([px, py]);
    }
};
const addBiomes = (tiles) => {
    let i = 0;
    const oneOfEachBiome = shuffle([0, 3, 6, 9]);
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
            if (tiles[y][x] === T_WATER) {
                const flood = floodFill([x, y], ([tx, ty]) => tiles[ty][tx] === T_WATER);
                let biome = 0;
                if (flood.length > 5) {
                    if (i < 4) {
                        biome = oneOfEachBiome[i];
                    }
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
                else {
                    drawTilesToMap(tiles, flood, () => T_SEA);
                }
            }
        }
    }
};
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
const createHut = () => {
    const tiles = createMap();
    const black = floodFill([0, 0], ([tx, ty]) => tiles[ty][tx] === T_WATER);
    drawTilesToMap(tiles, black, () => T_BLACK);
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
const createIsland = (hutCache) => {
    const tiles = createMap();
    // choose clearways (waypoints)
    const clearwayCount = randInt(10, 40);
    const clearways = [
        randomLandEdge(TOP),
        randomLandEdge(RIGHT),
        randomLandEdge(BOTTOM),
        randomLandEdge(LEFT)
    ];
    while (clearways.length < clearwayCount) {
        const clearway = randomPointInLandBorder();
        const near = nearest(clearway, clearways);
        if (dist(clearway, near) > 10) {
            clearways.push(clearway);
        }
    }
    // make paths between them
    const paths = [];
    const pathSegs = clearways.slice();
    let current = pathSegs.pop();
    const start = current;
    while (pathSegs.length) {
        const near = nearest(current, pathSegs);
        const steps = drunkenWalk(current, near, inWaterBorder, 0.33);
        paths.push(...steps);
        current = pathSegs.pop();
    }
    const steps = drunkenWalk(current, start, inWaterBorder, 0.33);
    paths.push(...steps);
    for (let i = 0; i < 10; i++) {
        const steps = drunkenWalk(pick(clearways), pick(clearways), inWaterBorder, 0.33);
        paths.push(...steps);
    }
    const clearings = [];
    for (let i = 0; i < clearways.length; i++) {
        clearings.push(...allNeighbours(clearways[i]));
    }
    const land = unique([...clearways, ...clearings, ...paths]);
    const expandedLand = expanded(land);
    const [playerX, playerY] = leftMost(expandedLand);
    drawTilesToMap(tiles, expandedLand, () => T_LAND);
    const sea = floodFill([0, 0], ([tx, ty]) => tiles[ty][tx] === T_WATER);
    drawTilesToMap(tiles, sea, () => T_SEA);
    const waypoints = sortByDistance([playerX, playerY], clearways);
    const playerSteps = drunkenWalk([playerX, playerY], waypoints[0], inWaterBorder, 0.33);
    paths.push(...playerSteps);
    addBiomes(tiles);
    decorate(tiles);
    drawTilesToMap(tiles, paths, ([wx, wy]) => {
        if (tiles[wy][wx] >= T_SAND && tiles[wy][wx] < T_SAND + T_SAND_L) {
            return tiles[wy][wx];
        }
        return T_LAND;
    });
    drawTilesToMap(tiles, clearings, ([wx, wy]) => {
        if (tiles[wy][wx] >= T_SAND && tiles[wy][wx] < T_SAND + T_SAND_L) {
            return tiles[wy][wx];
        }
        return randInt(T_GRASS_L + 1) + T_LAND;
    });
    // insert various quest elements here instead of just hut
    for (let i = 0; i < waypoints.length; i++) {
        const [wx, wy] = waypoints[i];
        const type = randInt(10);
        // dead ranger
        if (i === 0) {
            tiles[wy][wx] = T_RANGER;
        }
        // hut
        else if (i === 1) {
            tiles[wy][wx] = T_HUT;
            hutCache[wy * mapSize + wx] = [0, 0];
        }
        // ruins
        else if (i === 2) {
            tiles[wy][wx] = randInt(T_RUINS_L) + T_RUINS;
        }
        // satellite
        else if (i === waypoints.length - 1) {
            tiles[wy][wx] = T_SATELLITE;
        }
        // ruins, 0 1 2 3 4 5
        else if (type < 6) {
            tiles[wy][wx] = randInt(T_RUINS_L) + T_RUINS;
        }
        // hut 6 7 8
        else if (type < 9) {
            tiles[wy][wx] = T_HUT;
            hutCache[wy * mapSize + wx] = [0, 0];
        }
        // portal 9
        else {
            tiles[wy][wx] = T_PORTAL;
        }
    }
    return [DTYPE_MAP, playerX, playerY, tiles, MT_ISLAND, playerX, playerY];
};
const blocks = i => i < 2 || (i >= T_TREE && i < T_TREE + T_TREE_L) || i === T_HUT ||
    i === T_BLACK || i === T_HUT_L || i === T_HUT_M || i === T_HUT_R ||
    i === T_COMPUTER || i === T_SYNTH || i === T_BED ||
    (i >= T_RUINS && i < T_RUINS + T_RUINS_L) ||
    (i >= T_MOUNTAINS && i < T_MOUNTAINS + T_MOUNTAINS_L);






const gameData = [
    // DATA_SPLASH
    [DTYPE_IMAGE, 's.png'],
    // DATA_INTRO
    [DTYPE_MESSAGE,
        [
            'Lost contact with',
            'RANGER. Take boat',
            'and investigate.'
        ]
    ],
    // DATA_SUNRISE
    [
        DTYPE_MESSAGE,
        [
            'Sunrise'
        ]
    ],
    // DATA_SUNSET
    [
        DTYPE_MESSAGE,
        [
            'Sunset'
        ]
    ],
    // DATA_C_MAIN
    [
        DTYPE_SCREEN,
        [
            'RSOS v3.27',
            '--------------------',
            'MAIN MENU',
            '',
            'ERROR:',
            ' MAIN SYSTEM OFFLINE',
            '',
            'EMERGENCY OPS:',
            ''
        ],
        [
            ['DIAGNOSTICS', DATA_C_DIAGNOSTICS],
            ['SYNTHESIZE', DATA_SYNTH]
        ],
        0,
        'a'
    ],
    // DATA_C_DIAGNOSTICS
    [
        DTYPE_SCREEN,
        [
            'RSOS v3.27',
            '--------------------',
            'DIAGNOSTICS MENU',
            '',
            'MAIN SYSTEM:',
            ' OFFLINE',
            '  6 BAD CHIPS',
            'SYNTHESIZE:',
            ' ONLINE',
            '  DB ERRORS',
            'COMMS:',
            ' OFFLINE',
            '  UNKNOWN ERROR',
            'SECURITY:',
            ' OFFLINE',
            '  DB ERRORS',
            'MAP:',
            ' OFFLINE',
            '  DB ERRORS'
        ],
        [],
        0,
        'a'
    ],
    // DATA_C_SYNTH
    [
        DTYPE_SCREEN,
        [
            'RSOS v3.27',
            '--------------------',
            'SYNTHESIZER MENU',
            '',
            'SYNTHDB:',
            ' OFFLINE',
            '  USE RESTORE DISK',
            'POWER:',
            ' FULL',
            '',
            'EMERGENCY OPS:',
            ''
        ],
        [
            ['BASIC RATIONS', DATA_CREATE_FOOD]
        ],
        0,
        'a'
    ],
    // DATA_ISLAND - placeholder
    [DTYPE_MAP, 0, 0, [[]], MT_ISLAND, 0, 0],
    // DATA_INVESTIGATE
    [
        DTYPE_MESSAGE,
        [
            'I should',
            'investigate'
        ]
    ],
    // DATA_BED
    [
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
    ],
    // DATA_NOT_TIRED
    [
        DTYPE_MESSAGE,
        [
            `I'm not tired!`
        ]
    ],
    // DATA_SLEEP
    [
        DTYPE_ACTION,
        ACTION_SLEEP
    ],
    // DATA_HUNGRY
    [
        DTYPE_MESSAGE,
        [
            `I'm hungry!`
        ]
    ],
    // DATA_DEAD
    [
        DTYPE_MESSAGE,
        [
            'You died'
        ]
    ],
    // DATA_RANGER
    [
        DTYPE_MESSAGE,
        [
            `It's RANGER!`,
            '',
            `RANGER is DEAD!`,
            '',
            `Found keycard`
        ]
    ],
    // DATA_LOCKED_NOKEYS
    [
        DTYPE_MESSAGE,
        [
            `It's locked!`
        ]
    ],
    // DATA_LOCKED_UNLOCK
    [
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
    ],
    // DATA_UNLOCK
    [
        DTYPE_ACTION,
        ACTION_UNLOCK
    ],
    // DATA_RUINS
    [
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
    ],
    // DATA_SEARCH_RUINS
    [
        DTYPE_ACTION,
        ACTION_SEARCH
    ],
    // DATA_COMPUTER
    [
        DTYPE_SCREEN,
        [
            `A computer`,
            '',
        ],
        [
            ['Use', DATA_USE_COMPUTER]
        ],
        0,
        'g'
    ],
    // DATA_USE_COMPUTER
    [
        DTYPE_ACTION,
        ACTION_USE_COMPUTER
    ],
    // DATA_FIXABLE_COMPUTER
    [
        DTYPE_SCREEN,
        [
            `A computer`,
            '',
        ],
        [
            ['Use', DATA_USE_COMPUTER],
            ['Fix Chips', DATA_FIX_COMPUTER],
            ['Restore Backups', DATA_RESTORE_BACKUPS]
        ],
        0,
        'g'
    ],
    // DATA_FIX_COMPUTER
    [
        DTYPE_ACTION,
        ACTION_FIX_COMPUTER
    ],
    // DATA_C_FIXED
    [
        DTYPE_SCREEN,
        [
            'RSOS v3.27',
            '--------------------',
            'MAIN MENU',
            '',
            'OPS:',
            ''
        ],
        [
            ['DIAGNOSTICS', DATA_C_DIAGNOSTICS_FIXED],
            ['SYNTHESIZE', DATA_C_SYNTH],
            ['DATABASE', DATA_DB],
            ['COMMS', DATA_COMMS],
            ['SECURITY', DATA_SECURITY],
            ['MAP', DATA_MAP]
        ],
        0,
        'a'
    ],
    // DATA_C_SYNTH_CHARGING
    [
        DTYPE_SCREEN,
        [
            'RSOS v3.27',
            '--------------------',
            'SYNTHESIZER MENU',
            '',
            'SYNTHDB:',
            ' OFFLINE',
            '  USE RESTORE DISK',
            'POWER:',
            ' CHARGING',
            '',
        ],
        [],
        0,
        'a'
    ],
    // DATA_CREATE_FOOD
    [
        DTYPE_ACTION,
        ACTION_CREATE_FOOD
    ],
    // DATA_SYNTH
    [
        DTYPE_ACTION,
        ACTION_SHOW_SYNTH
    ],
    // DATA_DB
    [
        DTYPE_ACTION,
        ACTION_SHOW_DB
    ],
    // DATA_COMMS
    [
        DTYPE_ACTION,
        ACTION_SHOW_COMMS
    ],
    // DATA_SECURITY
    [
        DTYPE_ACTION,
        ACTION_SHOW_SECURITY
    ],
    // DATA_MAP
    [
        DTYPE_ACTION,
        ACTION_SHOW_MAP
    ],
    // DATA_C_DIAGNOSTICS_FIXED
    [
        DTYPE_SCREEN,
        [
            'RSOS v3.27',
            '--------------------',
            'DIAGNOSTICS MENU',
            '',
            'MAIN SYSTEM:',
            ' ONLINE',
            'SYNTHESIZE:',
            ' ONLINE',
            '  DB ERRORS',
            'COMMS:',
            ' OFFLINE',
            '  UNKNOWN ERROR',
            'SECURITY:',
            ' OFFLINE',
            '  DB ERRORS',
            'MAP:',
            ' OFFLINE',
            '  DB ERRORS'
        ],
        [],
        0,
        'a'
    ],
    // DATA_C_DB_INTRO
    [
        DTYPE_SCREEN,
        [
            'RSOS v3.27',
            '--------------------',
            'DATABASE ENTRY 1',
            '',
            'USER: RANGER',
            '',
            'Sent to investigate',
            'ruins. Found strange',
            'technology'
        ],
        [],
        0,
        'a'
    ],
    // DATA_C_DB_PORTALS
    [
        DTYPE_SCREEN,
        [
            'RSOS v3.27',
            '--------------------',
            'DATABASE ENTRY 2',
            '',
            'USER: RANGER',
            '',
            'Was testing strange',
            'technology. Portals',
            'appeared!'
        ],
        [],
        0,
        'a'
    ],
    // DATA_C_DB_GHOSTS
    [
        DTYPE_SCREEN,
        [
            'RSOS v3.27',
            '--------------------',
            'DATABASE ENTRY 3',
            '',
            'USER: RANGER',
            '',
            'Monsters coming out',
            'of portals! Made it',
            'back to hut. They',
            'only come out at',
            'night'
        ],
        [],
        0,
        'a'
    ],
    // DATA_C_DB_ERRORS
    [
        DTYPE_SCREEN,
        [
            'RSOS v3.27',
            '--------------------',
            'DATABASE ENTRY 4',
            '',
            'USER: RANGER',
            '',
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
    ],
    // DATA_C_DB_SHUTDOWN_PORTALS
    [
        DTYPE_SCREEN,
        [
            'RSOS v3.27',
            '--------------------',
            'DATABASE ENTRY 5',
            '',
            'USER: RANGER',
            '',
            'Found way to use',
            'synth to alter chip',
            'to shut down portal',
            'but computer went',
            'offline! There are',
            'more of them every',
            'night'
        ],
        [],
        0,
        'a'
    ],
    // DATA_C_DB_SECURITY
    [
        DTYPE_SCREEN,
        [
            'RSOS v3.27',
            '--------------------',
            'DATABASE ENTRY 6',
            '',
            'USER: RANGER',
            '',
            'Got computer online.',
            'Still has errors.',
            'Security system',
            'should be able to',
            'deal with monsters',
            'if can get it online'
        ],
        [],
        0,
        'a'
    ],
    // DATA_C_DB_FIX_SATELLITE
    [
        DTYPE_SCREEN,
        [
            'RSOS v3.27',
            '--------------------',
            'DATABASE ENTRY 7',
            '',
            'USER: RANGER',
            '',
            'Comms damaged beyond',
            'repair but can send',
            'a distress signal if',
            'repair the satellite',
            'transmitter with',
            'some chips. Not sure',
            'where the dish is',
            'on island and maps',
            'are offline'
        ],
        [],
        0,
        'a'
    ],
    // DATA_C_DB_RESCUE_TEAM
    [
        DTYPE_SCREEN,
        [
            'RSOS v3.27',
            '--------------------',
            'DATABASE ENTRY 8',
            '',
            'USER: RANGER',
            '',
            'No way to warn',
            'rescue team of',
            'monsters with comms',
            `offline. Can't send`,
            'distress signal',
            'until deal with',
            'monsters!'
        ],
        [],
        0,
        'a'
    ],
    // DATA_RESTORE_BACKUPS
    [
        DTYPE_ACTION,
        ACTION_RESTORE_BACKUPS
    ]
];

const Game = () => {
    // state
    let hutCache;
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
    // internal state
    let seenRangerMessage;
    let currentHut;
    let madeFoodToday;
    let notesDb;
    let mapDb;
    const reset = () => {
        hutCache = [];
        playerFacing = 0;
        playerFood = 20;
        playerHealth = 20;
        playerMaxHealth = 20;
        playerKeys = 0;
        playerChips = 5;
        playerDisks = 0;
        hours = 17;
        minutes = 55;
        gameData[DATA_ISLAND] = createIsland(hutCache);
        displayStack = [
            gameData[DATA_ISLAND],
            gameData[DATA_INTRO],
            gameData[DATA_SPLASH]
        ];
        color = '';
        monsters = [];
        seenRangerMessage = 0;
        madeFoodToday = 0;
        notesDb = [DATA_C_DB_INTRO];
        mapDb = [];
        const mapItem = gameData[DATA_ISLAND];
        const playerX = mapItem[MAP_PLAYERX];
        const playerY = mapItem[MAP_PLAYERY];
        const gridX = ~~(playerX / gridSize);
        const gridY = ~~(playerY / gridSize);
        mapDb[gridY * gridTiles + gridX] = 1;
        createMonsters();
    };
    const currentColor = () => {
        if (displayStack[displayStack.length - 1][DISPLAY_TYPE] === DTYPE_IMAGE)
            return 'g';
        if (displayStack[displayStack.length - 1][DISPLAY_TYPE] === DTYPE_MESSAGE)
            return 'g';
        if (displayStack[displayStack.length - 1][DISPLAY_TYPE] === DTYPE_COMPUTER_MAP)
            return 'a';
        if (displayStack[displayStack.length - 1][DISPLAY_TYPE] === DTYPE_SCREEN)
            return displayStack[displayStack.length - 1][SCREEN_COLOR];
        return color;
    };
    const state = () => [
        playerFacing, playerFood, playerHealth, playerMaxHealth, hours, minutes,
        currentColor(),
        displayStack[displayStack.length - 1],
        monsters,
        playerKeys, playerChips, playerDisks
    ];
    const close = () => {
        // can use this to toggle inventory for map
        displayStack.pop();
        if (!displayStack.length)
            reset();
    };
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
    const createMonsters = () => {
        while (monsters.length < initialMonsterCount) {
            const x = randInt(mapSize);
            const y = randInt(mapSize);
            createMonster([x, y]);
        }
    };
    const updateMonsters = () => {
        const monsterHere = ([x, y]) => {
            for (let i = 0; i < monsters.length; i++) {
                const monster = monsters[i];
                const mx = monster[MON_X];
                const my = monster[MON_Y];
                if (monster[MON_HEALTH] > 0 && x === mx && y === my)
                    return 1;
            }
        };
        for (let i = 0; i < monsters.length; i++) {
            const monster = monsters[i];
            const x = monster[MON_X];
            const y = monster[MON_Y];
            const currentMapItem = displayStack[displayStack.length - 1];
            const mapItem = gameData[DATA_ISLAND];
            const playerX = mapItem[MAP_PLAYERX];
            const playerY = mapItem[MAP_PLAYERY];
            const next = [x, y];
            if ((hours >= sunset || hours < sunrise) && Math.random() < 0.66) {
                const toPlayer = towards([x, y], [playerX, playerY]);
                next[X] = toPlayer[X];
                next[Y] = toPlayer[Y];
            }
            else {
                if (randInt(2)) {
                    next[X] = x + (randInt(3) - 1);
                }
                else {
                    next[Y] = y + (randInt(3) - 1);
                }
            }
            const mapTile = mapItem[MAP_TILES][next[Y]][next[X]];
            if (!blocks(mapTile) &&
                !monsterHere([next[X], next[Y]]) &&
                !(playerX === next[X] && playerY === next[Y])) {
                monster[MON_X] = next[X];
                monster[MON_Y] = next[Y];
                if (next[X] < x) {
                    monster[MON_FACING] = 1;
                }
                if (next[X] > x) {
                    monster[MON_FACING] = 0;
                }
            }
            if (currentMapItem[DISPLAY_TYPE] === DTYPE_MAP &&
                currentMapItem[MAP_TYPE] === MT_ISLAND &&
                (hours >= sunset || hours < sunrise) &&
                playerX === next[X] && playerY === next[Y] &&
                randInt(2) && playerHealth > 0 && monster[MON_HEALTH] > 0) {
                playerHealth--;
            }
        }
    };
    const incTime = (sleeping = 0) => {
        if (playerHealth < 1) {
            displayStack = [gameData[DATA_DEAD]];
            return;
        }
        minutes++;
        if (minutes === 60) {
            minutes = 0;
            hours++;
            if (sleeping) {
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
                    playerFood--;
                    if (playerHealth < playerMaxHealth)
                        playerHealth++;
                }
                else {
                    playerHealth--;
                    displayStack.push(gameData[DATA_HUNGRY]);
                }
            }
        }
        if (hours === 24) {
            madeFoodToday = 0;
            hours = 0;
            const mapItem = gameData[DATA_ISLAND];
            for (let y = 0; y < mapSize; y++) {
                for (let x = 0; x < mapSize; x++) {
                    const mapTile = mapItem[MAP_TILES][y][x];
                    if (mapTile === T_PORTAL) {
                        const neighbours = allNeighbours([x, y]);
                        for (let i = 0; i < neighbours.length; i++) {
                            createMonster(neighbours[i]);
                        }
                    }
                }
            }
        }
        updateMonsters();
    };
    const timeStr = () => `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
    const move = (x, y) => {
        const map = displayStack[displayStack.length - 1];
        if (map[0] !== DTYPE_MAP)
            return;
        incTime();
        if (x === -1) {
            playerFacing = 1;
        }
        if (x === 1) {
            playerFacing = 0;
        }
        x = map[MAP_PLAYERX] + x;
        y = map[MAP_PLAYERY] + y;
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
        if (playerHealth > 0 && inBounds([x, y]) &&
            !blocks(map[MAP_TILES][y][x]) && !monsterHere) {
            map[MAP_PLAYERX] = x;
            map[MAP_PLAYERY] = y;
        }
        // bumps
        if (map[MAP_TYPE] === MT_ISLAND) {
            if (map[MAP_TILES][y][x] === T_HUT) {
                currentHut = hutCache[y * mapSize + x];
                if (currentHut[HUT_UNLOCKED]) {
                    displayStack.push(createHut());
                }
                else {
                    if (playerKeys) {
                        displayStack.push(gameData[DATA_LOCKED_UNLOCK]);
                    }
                    else {
                        displayStack.push(gameData[DATA_LOCKED_NOKEYS]);
                    }
                }
            }
            if (y === map[MAP_STARTY]) {
                if (x === map[MAP_STARTX] - 1) {
                    displayStack.push(gameData[DATA_INVESTIGATE]);
                }
            }
            if (monsterHere && randInt(2)) {
                monsterHere[MON_HEALTH]--;
            }
            if (map[MAP_TILES][y][x] === T_RANGER && !seenRangerMessage) {
                seenRangerMessage = 1;
                displayStack.push(gameData[DATA_RANGER]);
                playerKeys++;
            }
            if (map[MAP_TILES][y][x] >= T_RUINS && map[MAP_TILES][y][x] < T_RUINS + T_RUINS_L) {
                displayStack.push(gameData[DATA_RUINS]);
            }
        }
        if (map[MAP_TYPE] === MT_HUT) {
            if (map[MAP_TILES][y][x] === T_HUT_R) {
                displayStack.pop();
            }
            if (map[MAP_TILES][y][x] === T_COMPUTER) {
                const computerOptions = gameData[DATA_FIXABLE_COMPUTER].slice();
                computerOptions[SCREEN_OPTIONS] = computerOptions[SCREEN_OPTIONS].filter((_o, i) => {
                    if (i === 1 && currentHut[HUT_COMPUTER_FIXED])
                        return 0;
                    if (i === 1 && playerChips < 6)
                        return 0;
                    if (i === 2 && !currentHut[HUT_COMPUTER_FIXED])
                        return 0;
                    if (i === 2 && playerDisks < 1)
                        return 0;
                    return 1;
                });
                displayStack.push(computerOptions);
            }
            if (map[MAP_TILES][y][x] === T_BED) {
                if (hours >= sunset || hours < sunrise) {
                    displayStack.push(gameData[DATA_BED]);
                }
                else {
                    displayStack.push(gameData[DATA_NOT_TIRED]);
                }
            }
        }
    };
    const select = (i) => {
        if (displayStack[displayStack.length - 1][DISPLAY_TYPE] === DTYPE_SCREEN) {
            displayStack[displayStack.length - 1][SCREEN_SELECTION] = i;
        }
    };
    const confirmSelection = () => {
        if (displayStack[displayStack.length - 1][DISPLAY_TYPE] === DTYPE_SCREEN) {
            const screen = displayStack[displayStack.length - 1];
            if (!screen[SCREEN_OPTIONS].length) {
                displayStack.pop();
                return;
            }
            const selected = screen[SCREEN_SELECTION];
            const dataIndex = screen[SCREEN_OPTIONS][selected][OPTION_DATA_INDEX];
            if (dataIndex === -1) {
                close();
            }
            else if (gameData[dataIndex][DISPLAY_TYPE] === DTYPE_ACTION) {
                displayStack.pop();
                actions[gameData[dataIndex][ACTION_INDEX]]();
            }
            else {
                displayStack.push(gameData[dataIndex]);
            }
        }
    };
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
            for (let i = 0; i < 60; i++) {
                incTime();
            }
            if (playerHealth > 0) {
                const found = randInt(16);
                // food 0 1
                if (found < 2) {
                    const food = randInt(3) + 1;
                    displayStack.push([DTYPE_MESSAGE, [`Found ${food} food`]]);
                    playerFood += food;
                }
                // keycard 2 3
                else if (found < 4) {
                    displayStack.push([DTYPE_MESSAGE, ['Found keycard']]);
                    playerKeys++;
                }
                // chip 4 5
                else if (found < 6) {
                    displayStack.push([DTYPE_MESSAGE, ['Found chip']]);
                    playerChips++;
                }
                // disk 6 7
                else if (found < 8) {
                    displayStack.push([DTYPE_MESSAGE, ['Found backup']]);
                    playerDisks++;
                }
                // got hurt 8
                else if (found < 9) {
                    displayStack.push([
                        DTYPE_MESSAGE,
                        [
                            'Rocks fell!',
                            '',
                            'Lost health'
                        ]
                    ]);
                    playerHealth--;
                }
                // nothing
                else {
                    displayStack.push([DTYPE_MESSAGE, ['Found nothing']]);
                }
            }
        },
        // ACTION_USE_COMPUTER
        () => {
            if (currentHut[HUT_COMPUTER_FIXED]) {
                displayStack.push(gameData[DATA_C_FIXED]);
            }
            else {
                displayStack.push(gameData[DATA_C_MAIN]);
            }
        },
        // ACTION_FIX_COMPUTER
        () => {
            displayStack.push([DTYPE_MESSAGE, ['Replaced 6 chips']]);
            playerChips -= 6;
            currentHut[HUT_COMPUTER_FIXED] = 1;
        },
        // ACTION_CREATE_FOOD
        () => {
            const food = randInt(3) + 6;
            madeFoodToday = 1;
            playerFood += food;
            displayStack.push([DTYPE_MESSAGE, [`Synthesized ${food} food`]]);
        },
        // ACTION_SHOW_SYNTH
        () => {
            if (madeFoodToday) {
                displayStack.push(gameData[DATA_C_SYNTH_CHARGING]);
            }
            else {
                displayStack.push(gameData[DATA_C_SYNTH]);
            }
        },
        // ACTION_SHOW_DB
        () => {
            const dbOptions = notesDb.map(i => {
                return [`ENTRY ${i}`, i];
            });
            const dbScreen = [
                DTYPE_SCREEN,
                [
                    'RSOS v3.27',
                    '--------------------',
                    'DATABASE MENU',
                ],
                dbOptions,
                0,
                'a'
            ];
            displayStack.push(dbScreen);
        },
        // ACTION_SHOW_COMMS
        () => {
        },
        // ACTION_SHOW_SECURITY
        () => {
        },
        // ACTION_SHOW_MAP
        () => {
            const mapItem = gameData[DATA_ISLAND];
            const playerX = mapItem[MAP_PLAYERX];
            const playerY = mapItem[MAP_PLAYERY];
            const mapTiles = mapItem[MAP_TILES];
            const computerMap = [DTYPE_COMPUTER_MAP, playerX, playerY, mapTiles, mapDb];
            console.log('showing map', { playerX, playerY });
            displayStack.push(computerMap);
        },
        // ACTION_RESTORE_BACKUPS
        () => {
            playerDisks--;
            const randItem = randInt(2);
            // note
            if (randItem < 1) {
                const nextNoteDb = notesDb.length + DATA_C_DB_INTRO;
                if (nextNoteDb < DATA_RESTORE_BACKUPS) {
                    notesDb.push(nextNoteDb);
                    displayStack.push([DTYPE_MESSAGE, [
                            'Recovered 1 note',
                            'database entry'
                        ]]);
                }
                else {
                    displayStack.push([DTYPE_MESSAGE, [
                            'Could not read disk,',
                            'try again'
                        ]]);
                    playerDisks++;
                }
            }
            // map tile
            else {
                let gridX = randInt(gridTiles);
                let gridY = randInt(gridTiles);
                if (!mapDb[gridY * gridTiles + gridX]) {
                    mapDb[gridY * gridTiles + gridX] = 1;
                    displayStack.push([DTYPE_MESSAGE, [
                            'Recovered 1 map',
                            'database entry'
                        ]]);
                }
                else {
                    displayStack.push([DTYPE_MESSAGE, [
                            'Could not read disk,',
                            'try again'
                        ]]);
                    playerDisks++;
                }
            }
        }
    ];
    reset();
    const api = [
        state, reset, timeStr, incTime, move, close, select, confirmSelection
    ];
    return api;
};

const draw = (time) => {
    const color = api[API_STATE]()[ST_COLOR];
    const displayItem = api[API_STATE]()[ST_DISPLAY_ITEM];
    c.className = color;
    c.width = c.height = tileSize * canvasTiles;
    if (displayItem[DISPLAY_TYPE] === DTYPE_MAP) {
        drawMap(time);
        drawUi();
    }
    if (displayItem[DISPLAY_TYPE] === DTYPE_IMAGE) {
        if (displayItem[DISPLAY_NAME] === 's.png') {
            ctx.drawImage(splash, 0, 0);
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
    requestAnimationFrame(draw);
};
const drawChar = (ch = '', tx = 0, ty = 0) => ctx.drawImage(font, (ch.charCodeAt(0) - 32) * fontSize, 0, fontSize, fontSize, tx * fontSize, ty * fontSize, fontSize, fontSize);
const drawText = (str = '', tx = 0, ty = 0) => {
    for (let i = 0; i < str.length; i++)
        drawChar(str[i], tx + i, ty);
};
const drawMessage = (lines) => {
    const dy = ~~((fontTiles - lines.length) / 2);
    for (let y = 0; y < lines.length; y++) {
        const dx = ~~((fontTiles - lines[y].length) / 2);
        drawText(lines[y], dx, dy + y);
    }
};
const drawScreen = (screen) => {
    for (let y = 0; y < screen[SCREEN_MESSAGE].length; y++) {
        drawText(screen[SCREEN_MESSAGE][y], 0, y);
    }
    drawText('<X>', fontTiles - 3, 0);
    const optionOffset = screen[SCREEN_MESSAGE].length % 2 ? 1 : 0;
    for (let y = 0; y < screen[SCREEN_OPTIONS].length; y++) {
        drawText(`${y + 1} ${y === screen[SCREEN_SELECTION] ? '<' : ' '}${screen[SCREEN_OPTIONS][y][OPTION_MESSAGE]}${y === screen[SCREEN_SELECTION] ? '>' : ' '}`, 0, y * 2 + screen[SCREEN_MESSAGE].length + optionOffset);
    }
};
const drawMap = (time) => {
    const currentFrame = ~~(time / animTime) % 2 ? 0 : 1;
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
    const isNight = api[API_STATE]()[ST_HOURS] >= sunset || api[API_STATE]()[ST_HOURS] < sunrise;
    for (let y = 0; y < viewTiles; y++) {
        for (let x = 0; x < viewTiles; x++) {
            const mapX = (playerX - centerTile) + x;
            const mapY = (playerY - centerTile) + y;
            // assume water, set to either 0 or 1 depending on currentFrame
            let sx = currentFrame * tileSize;
            // bounds check
            if (inBounds([mapX, mapY])) {
                const tileIndex = map[mapY][mapX];
                // if not water, use the tileIndex
                if (tileIndex)
                    sx = tileIndex * tileSize;
            }
            ctx.drawImage(tiles, sx, 0, tileSize, tileSize, (x + 1) * tileSize, (y + 1) * tileSize, tileSize, tileSize);
            if (mapType === MT_ISLAND && isNight) {
                for (let i = 0; i < monsters.length; i++) {
                    const monster = monsters[i];
                    const mx = monster[MON_X];
                    const my = monster[MON_Y];
                    const monsterFacing = monster[MON_FACING];
                    if (mx === mapX && my === mapY && monster[MON_HEALTH] > 0) {
                        sx = ((S_MONSTER + currentFrame) * tileSize) + (monsterFacing * tileSize * 2);
                        ctx.drawImage(player, sx, 0, tileSize, tileSize, (x + 1) * tileSize, (y + 1) * tileSize, tileSize, tileSize);
                    }
                }
            }
            if (x === centerTile && y === centerTile) {
                if (playerHealth) {
                    sx = (currentFrame * tileSize) + (playerFacing * tileSize * 2);
                }
                else {
                    sx = S_SKELETON * tileSize;
                }
                ctx.drawImage(player, sx, 0, tileSize, tileSize, (x + 1) * tileSize, (y + 1) * tileSize, tileSize, tileSize);
            }
            if (mapType === MT_ISLAND && mapX === startX - 2 && mapY === startY) {
                ctx.drawImage(player, S_BOAT_LEFT * tileSize, 0, tileSize, tileSize, (x + 1) * tileSize, (y + 1) * tileSize, tileSize, tileSize);
            }
            if (mapType === MT_ISLAND && mapX === startX - 1 && mapY === startY) {
                ctx.drawImage(player, S_BOAT_RIGHT * tileSize, 0, tileSize, tileSize, (x + 1) * tileSize, (y + 1) * tileSize, tileSize, tileSize);
            }
        }
    }
};
const drawUi = () => {
    const playerFood = api[API_STATE]()[ST_PLAYER_FOOD];
    const playerHealth = api[API_STATE]()[ST_PLAYER_HEALTH];
    const playerKeys = api[API_STATE]()[ST_PLAYER_KEYS];
    const playerChips = api[API_STATE]()[ST_PLAYER_CHIPS];
    const playerDisks = api[API_STATE]()[ST_PLAYER_DISKS];
    drawText(`RANGER DOWN ${api[API_TIMESTR]()}`, 2.5, 0.5);
    ctx.drawImage(tiles, T_HEALTH * tileSize, 0, tileSize, tileSize, 0, 0, tileSize, tileSize);
    drawText(`${playerHealth}`, playerHealth < 10 ? 0.5 : 0, 2);
    ctx.drawImage(tiles, T_FOOD * tileSize, 0, tileSize, tileSize, 0, tileSize * 2, tileSize, tileSize);
    drawText(`${playerFood}`, playerFood < 10 ? 0.5 : 0, 6);
    ctx.drawImage(tiles, T_KEY * tileSize, 0, tileSize, tileSize, 0, tileSize * 4, tileSize, tileSize);
    drawText(`${playerKeys}`, playerKeys < 10 ? 0.5 : 0, 10);
    ctx.drawImage(tiles, T_CHIP * tileSize, 0, tileSize, tileSize, 0, tileSize * 6, tileSize, tileSize);
    drawText(`${playerChips}`, playerChips < 10 ? 0.5 : 0, 14);
    ctx.drawImage(tiles, T_DISK * tileSize, 0, tileSize, tileSize, 0, tileSize * 8, tileSize, tileSize);
    drawText(`${playerDisks}`, playerDisks < 10 ? 0.5 : 0, 18);
};
const drawComputerMap = () => {
    const mapItem = api[API_STATE]()[ST_DISPLAY_ITEM];
    const playerX = mapItem[MAP_PLAYERX];
    const playerY = mapItem[MAP_PLAYERX];
    const map = mapItem[MAP_TILES];
    const mapDb = mapItem[COMPUTER_MAP_MAPDB];
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
            const gridX = ~~(x / gridSize);
            const gridY = ~~(y / gridSize);
            const tile = map[y][x];
            if (mapDb[gridY * gridTiles + gridX]) {
                if (tile === T_SEA) {
                    ctx.drawImage(tiles, T_BLACK * tileSize, 0, 1, 1, x, y, 1, 1);
                }
                else {
                    ctx.drawImage(tiles, T_LAND * tileSize, 0, 1, 1, x, y, 1, 1);
                }
            }
            else {
                if (x > fontSize && y > fontSize && ((x % 2 && !(y % 2)) || (!(x % 2) && y % 2))) {
                    ctx.drawImage(tiles, T_LAND * tileSize, 0, 1, 1, x, y, 1, 1);
                }
            }
        }
    }
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
            const gridX = ~~(x / gridSize);
            const gridY = ~~(y / gridSize);
            const tile = map[y][x];
            if (mapDb[gridY * gridTiles + gridX]) {
                if (tile === T_HUT) {
                    ctx.drawImage(computerIcons, C_HUT * computerIconSize, 0, computerIconSize, computerIconSize, x - 3, y - 3, computerIconSize, computerIconSize);
                }
                if (tile >= T_RUINS && tile < T_RUINS + T_RUINS_L) {
                    ctx.drawImage(computerIcons, C_RUINS * computerIconSize, 0, computerIconSize, computerIconSize, x - 3, y - 3, computerIconSize, computerIconSize);
                }
                if (tile === T_SATELLITE) {
                    ctx.drawImage(computerIcons, C_SATELLITE * computerIconSize, 0, computerIconSize, computerIconSize, x - 3, y - 3, computerIconSize, computerIconSize);
                }
                if (x === playerX && y === playerY) {
                    ctx.drawImage(computerIcons, C_PLAYER * computerIconSize, 0, computerIconSize, computerIconSize, x - 3, y - 3, computerIconSize, computerIconSize);
                }
            }
        }
    }
    for (let y = 0; y < gridSize; y++) {
        ctx.drawImage(font, (16 + y) * fontSize, 0, fontSize, fontSize, 0, y * gridSize + ~~(gridSize / 2), fontSize, fontSize);
    }
    for (let x = 0; x < gridSize; x++) {
        ctx.drawImage(font, (33 + x) * fontSize, 0, fontSize, fontSize, x * gridSize + ~~(gridSize / 2), 0, fontSize, fontSize);
    }
};
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
const ctx = c.getContext('2d');
let font;
let tiles;
let player;
let splash;
let computerIcons;
let api = Game();
document.onkeyup = e => {
    const displayItem = api[API_STATE]()[ST_DISPLAY_ITEM];
    if (displayItem[DISPLAY_TYPE] === DTYPE_MAP) {
        keyHandlerMap(e);
    }
    if (displayItem[DISPLAY_TYPE] === DTYPE_IMAGE ||
        displayItem[DISPLAY_TYPE] === DTYPE_MESSAGE ||
        displayItem[DISPLAY_TYPE] === DTYPE_COMPUTER_MAP) {
        // space or esc or enter
        if (e.keyCode === 32 || e.keyCode === 27 || e.keyCode === 13) {
            api[API_CLOSE]();
        }
    }
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
const clickOrTouch = ([x, y]) => {
    const displayItem = api[API_STATE]()[ST_DISPLAY_ITEM];
    const tileSize = c.getBoundingClientRect().width / canvasTiles;
    const tx = ~~((x - c.getBoundingClientRect().left) / tileSize) - 1;
    const ty = ~~((y - c.getBoundingClientRect().top) / tileSize) - 1;
    if (displayItem[DISPLAY_TYPE] === DTYPE_MAP) {
        if (tx === centerTile && ty === centerTile) {
            // tapped on player
            return;
        }
        if (tx < 0 || ty < 0) {
            //tapped an interface tile
            return;
        }
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
    if (displayItem[DISPLAY_TYPE] === DTYPE_IMAGE ||
        displayItem[DISPLAY_TYPE] === DTYPE_MESSAGE ||
        displayItem[DISPLAY_TYPE] === DTYPE_COMPUTER_MAP) {
        api[API_CLOSE]();
    }
    if (displayItem[DISPLAY_TYPE] === DTYPE_SCREEN) {
        if (ty < 0) {
            api[API_CLOSE]();
        }
        const screen = displayItem;
        const optionOffset = screen[SCREEN_MESSAGE].length % 2 ? 1 : 0;
        const selectionStartY = (screen[SCREEN_MESSAGE].length + optionOffset) / 2;
        const selectionSize = screen[SCREEN_OPTIONS].length;
        const selection = ty - selectionStartY + 1;
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
    for (let i = 0; i < e.changedTouches.length; i++) {
        clickOrTouch([e.changedTouches[i].clientX, e.changedTouches[i].clientY]);
    }
};
c.onclick = e => {
    e.preventDefault();
    clickOrTouch([e.clientX, e.clientY]);
};
loadImages('f.gif', 't.gif', 'p.gif', 's.png', 'c.gif').then(imgs => {
    [font, tiles, player, splash, computerIcons] = imgs;
    requestAnimationFrame(draw);
});
};s()