const s = () => {const tileSize = 16;
const viewTiles = 9;
const canvasTiles = viewTiles + 1;
const centerTile = ~~(viewTiles / 2);
const mapSize = 128;
const animTime = 500;
const waterBorder = ~~(mapSize / 16);
const landBorder = ~~(mapSize / 6);
const gridTiles = 10;
const gridSize = ~~(mapSize / gridTiles);
const initialMonsterCount = ~~(mapSize / 3);

const loadImage = (path) => new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = path;
});
const loadImages = (...paths) => Promise.all(paths.map(loadImage));
const pick = (arr) => arr[randInt(arr.length)];
const randInt = (exclMax, min = 0) => ~~(Math.random() * exclMax) + min;



// sprite indices
const T_SEA = 0;
const T_WATER = 1;
const T_LAND = 2;
const T_GRASS = 3;
const T_GRASS_L = 5;
const T_TREE = 8;
const T_FOOD = 9;
const T_HEALTH = 10;
const T_PATH = 11;
const T_PATH_L = 3;
const T_SAND = 14;
const T_SAND_L = 3;
const T_HUT = 17;
const T_COMPUTER = 18;
const T_SYNTH = 19;
const T_BED = 20;
const T_HUT_L = 21;
const T_HUT_M = 22;
const T_HUT_R = 23;
const T_BLACK = 24;
const S_SKELETON = 4;
const S_BOAT_LEFT = 5;
const S_BOAT_RIGHT = 6;
const S_MONSTER = 7;
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
// api indices
const API_STATE = 0;
const API_RESET = 1;
const API_TIMESTR = 2;
const API_INCTIME = 3;
const API_MOVE = 4;
const API_CLOSE = 5;
// display item types
const DTYPE_IMAGE = 0;
const DTYPE_MESSAGE = 1;
const DTYPE_SCREEN = 2;
const DTYPE_MAP = 3;
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
// map data indices
const MAP_PLAYERX = 1;
const MAP_PLAYERY = 2;
const MAP_TILES = 3;
const MAP_TYPE = 4;
const MAP_STARTX = 5;
const MAP_STARTY = 6;
// map type indices
const MT_ISLAND = 0;
const MT_HUT = 1;
// display item indices
const DISPLAY_TYPE = 0;
const DISPLAY_NAME = 1;
const DISPLAY_MESSAGE = 1;
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
        cache[y * mapSize + x] = true;
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
    const step = ([x, y]) => {
        if (!hasPoint(steps, [x, y]))
            steps.push([x, y]);
        if (x === x2 && y === y2)
            return;
        step(Math.random() < drunkenness ?
            pick(immediateNeighbours([x, y]).filter(allowed)) || [x, y] :
            towards([x, y], [x2, y2]));
    };
    step([x1, y1]);
    return steps;
};
const expandLand = (mapTiles, landTiles, tileCount = ~~((mapSize * mapSize) * 0.25)) => {
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
const decorate = (tiles, clear) => {
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
            if (tiles[y][x] === T_LAND) {
                const neighbours = getImmediateNeighbours(tiles, [x, y], T_SEA);
                if (neighbours.length) {
                    tiles[y][x] = randInt(T_SAND_L) + T_SAND;
                }
                else {
                    if (hasPoint(clear, [x, y])) {
                        // no trees
                        tiles[y][x] = randInt(6) + T_LAND;
                    }
                    else {
                        // all land tiles including trees
                        tiles[y][x] = randInt(7) + T_LAND;
                    }
                }
            }
            if (tiles[y][x] === T_WATER) {
                tiles[y][x] = randInt(2) + (T_TREE - 1);
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
const createIsland = () => {
    const tiles = createMap();
    const clearwayCount = randInt(15, 10);
    const clearways = [
        randomLandEdge(TOP),
        randomLandEdge(RIGHT),
        randomLandEdge(BOTTOM),
        randomLandEdge(LEFT)
    ];
    for (let i = 4; i < clearwayCount; i++) {
        clearways.push(randomPointInLandBorder());
    }
    for (let i = 1; i < clearwayCount; i++) {
        const steps = drunkenWalk(clearways[i - 1], clearways[i], inWaterBorder);
        drawTilesToMap(tiles, steps, () => T_LAND);
    }
    const land = findTilePoints(tiles, T_LAND);
    const clear = land.slice();
    expandLand(tiles, land);
    const sea = floodFill([0, 0], ([tx, ty]) => tiles[ty][tx] === T_WATER);
    drawTilesToMap(tiles, sea, () => T_SEA);
    decorate(tiles, clear);
    const [playerX, playerY] = leftMost(land);
    let r;
    while (!r) {
        r = withinDist(clear, [playerX, playerY], randInt(5) + 10, randInt(5) + 20);
    }
    const [rangerX, rangerY] = r;
    const [hutX, hutY] = withinDist(clear, [rangerX, rangerY], randInt(5) + 10, randInt(5) + 20);
    const waypoints = [
        [playerX, playerY],
        [rangerX, rangerY],
        [hutX, hutY]
    ];
    const waypointCount = 15;
    while (waypoints.length < waypointCount) {
        const [px, py] = pick(waypoints);
        const gx = randInt(gridTiles) * gridSize;
        const gy = randInt(gridTiles) * gridSize;
        const w = withinDist(clear, [gx, gy], 1, gridSize);
        const flood = floodFill([px, py], ([tx, ty]) => tiles[ty][tx] !== T_SEA);
        if (w && flood.length) {
            const pathToNext = findPath(flood, w);
            waypoints.push(w);
            drawTilesToMap(tiles, pathToNext, ([wx, wy]) => {
                if (tiles[wy][wx] >= T_SAND && tiles[wy][wx] < T_SAND + T_SAND_L) {
                    return tiles[wy][wx];
                }
                return T_LAND;
            });
        }
    }
    for (let i = 2; i < waypointCount; i++) {
        const [wx, wy] = waypoints[i];
        // const neighbours = allNeighbours( [ wx, wy ] )
        // for( let n = 0; n < neighbours.length; n++ ){
        //   const [ nx, ny ] = neighbours[ n ]
        //   if( blocks( tiles[ ny ][ nx ] ) ) tiles[ ny ][ nx ] = T_LAND
        // }
        tiles[wy][wx] = T_HUT;
    }
    return [DTYPE_MAP, playerX, playerY, tiles, MT_ISLAND, playerX, playerY];
};
const blocks = i => i < 2 || i === T_TREE || i === T_HUT || i === T_BLACK || i === T_HUT_L ||
    i === T_HUT_M || i === T_HUT_R || i === T_COMPUTER || i === T_SYNTH ||
    i === T_BED;





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
            '',
            'ERROR:',
            ' SYSTEM OFFLINE',
            '',
            'EMERGENCY OPS:',
            ''
        ],
        [
            ['DIAGNOSTICS', DATA_C_DIAGNOSTICS],
            ['SYNTHESIZE', DATA_C_SYNTH]
        ]
    ],
    // DATA_C_DIAGNOSTICS
    [
        DTYPE_SCREEN,
        [
            'DIAGNOSTICS',
            '',
            'MAIN SYSTEM:',
            ' OFFLINE',
            '',
            ' PROBLEM:',
            '  6 CAPS BLOWN',
            '',
            'SYNTHESIZE:',
            ' ONLINE'
        ],
        []
    ],
    // DATA_C_SYNTH
    [
        DTYPE_SCREEN,
        [
            'SYNTHESIZE',
            '',
            'SYNTHDB:',
            ' OFFLINE',
            '',
            'EMERGENCY OPS:',
            ''
        ],
        [
            ['BASIC RATIONS', DATA_C_MAIN] // need to implement
        ]
    ],
    // DATA_ISLAND
    createIsland(),
    // DATA_INVESTIGATE
    [
        DTYPE_MESSAGE,
        [
            'I should',
            'investigate'
        ]
    ]
];
const Game = () => {
    let playerFacing;
    let playerFood;
    let playerHealth;
    let playerMaxHealth;
    let hours;
    let minutes;
    let color;
    let displayStack;
    let monsters;
    const reset = () => {
        playerFacing = 0;
        playerFood = 5;
        playerHealth = 2;
        playerMaxHealth = 10;
        hours = 17;
        minutes = 55;
        gameData[DATA_ISLAND] = createIsland();
        displayStack = [
            gameData[DATA_ISLAND],
            gameData[DATA_INTRO],
            gameData[DATA_SPLASH]
        ];
        color = '';
        monsters = [];
        while (monsters.length < initialMonsterCount) {
            const x = randInt(mapSize);
            const y = randInt(mapSize);
            const facing = randInt(2);
            const health = randInt(2) + 1;
            const mapItem = gameData[DATA_ISLAND];
            const mapTile = mapItem[MAP_TILES][y][x];
            const playerX = mapItem[MAP_PLAYERX];
            const playerY = mapItem[MAP_PLAYERY];
            if (!blocks(mapTile) && !hasPoint(monsters, [x, y]) && !(playerX === x && playerY === y))
                monsters.push([x, y, facing, health]);
        }
    };
    const currentColor = () => {
        if (displayStack[displayStack.length - 1][DISPLAY_TYPE] === DTYPE_IMAGE)
            return 'g';
        if (displayStack[displayStack.length - 1][DISPLAY_TYPE] === DTYPE_MESSAGE)
            return 'g';
        if (displayStack[displayStack.length - 1][DISPLAY_TYPE] === DTYPE_SCREEN)
            return 'a';
        return color;
    };
    const state = () => [
        playerFacing, playerFood, playerHealth, playerMaxHealth, hours, minutes,
        currentColor(),
        displayStack[displayStack.length - 1],
        monsters
    ];
    const close = () => {
        // can use this to toggle inventory for map
        displayStack.pop();
        if (!displayStack.length)
            displayStack = [gameData[DATA_ISLAND]];
    };
    const incTime = () => {
        minutes++;
        if (minutes === 60) {
            minutes = 0;
            hours++;
            if (hours === 6) {
                color = '';
                displayStack.push(gameData[DATA_SUNRISE]);
            }
            if (hours === 18) {
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
            }
        }
        if (hours === 24) {
            hours = 0;
        }
        for (let i = 0; i < monsters.length; i++) {
            const monster = monsters[i];
            const x = monster[MON_X];
            const y = monster[MON_Y];
            const mapItem = gameData[DATA_ISLAND];
            const playerX = mapItem[MAP_PLAYERX];
            const playerY = mapItem[MAP_PLAYERY];
            const newLocation = [x, y];
            if (Math.random() < 0.66) {
                const toPlayer = towards([x, y], [playerX, playerY]);
                newLocation[X] = toPlayer[X];
                newLocation[Y] = toPlayer[Y];
            }
            else {
                if (randInt(2)) {
                    newLocation[X] = x + (randInt(3) - 1);
                }
                else {
                    newLocation[Y] = y + (randInt(3) - 1);
                }
            }
            const mapTile = mapItem[MAP_TILES][newLocation[Y]][newLocation[X]];
            if (!blocks(mapTile) &&
                !hasPoint(monsters, [newLocation[X], newLocation[Y]]) &&
                !(playerX === newLocation[X] && playerY === newLocation[Y])) {
                monster[MON_X] = newLocation[X];
                monster[MON_Y] = newLocation[Y];
                if (newLocation[X] < x) {
                    monster[MON_FACING] = 1;
                }
                if (newLocation[X] > x) {
                    monster[MON_FACING] = 0;
                }
            }
            if (playerX === newLocation[X] && playerY === newLocation[Y] && randInt(2) && playerHealth > 0 && monster[MON_HEALTH] > 0) {
                playerHealth--;
            }
        }
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
        if (map[MAP_TYPE] === MT_ISLAND) {
            for (let i = 0; i < monsters.length; i++) {
                if (monsters[i][MON_X] === x && monsters[i][MON_Y] === y && monsters[i][MON_HEALTH] > 0) {
                    monsterHere = monsters[i];
                }
            }
        }
        if (playerHealth > 0 && inBounds([x, y]) && !blocks(map[MAP_TILES][y][x]) && !monsterHere) {
            map[MAP_PLAYERX] = x;
            map[MAP_PLAYERY] = y;
        }
        // bumps
        if (map[MAP_TYPE] === MT_ISLAND) {
            if (map[MAP_TILES][y][x] === T_HUT) {
                displayStack.push(createHut());
            }
            if (y === map[MAP_STARTY]) {
                if (x === map[MAP_STARTX] - 1) {
                    displayStack.push(gameData[DATA_INVESTIGATE]);
                }
            }
            if (monsterHere && randInt(2)) {
                monsterHere[MON_HEALTH]--;
            }
        }
        if (map[MAP_TYPE] === MT_HUT) {
            if (map[MAP_TILES][y][x] === T_HUT_R) {
                displayStack.pop();
            }
        }
    };
    reset();
    return [state, reset, timeStr, incTime, move, close];
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
    requestAnimationFrame(draw);
};
const drawChar = (ch = '', tx = 0, ty = 0) => ctx.drawImage(font, (ch.charCodeAt(0) - 32) * 8, 0, 8, 8, tx * 8, ty * 8, 8, 8);
const drawText = (str = '', tx = 0, ty = 0) => {
    for (let i = 0; i < str.length; i++)
        drawChar(str[i], tx + i, ty);
};
const drawMessage = (lines) => {
    const dy = ~~((canvasTiles * 2 - lines.length) / 2);
    for (let y = 0; y < lines.length; y++) {
        const dx = ~~((canvasTiles * 2 - lines[y].length) / 2);
        drawText(lines[y], dx, dy + y);
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
    const isNight = api[API_STATE]()[ST_HOURS] >= 18 || api[API_STATE]()[ST_HOURS] < 6;
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
    drawText(`RANGER DOWN   ${api[API_TIMESTR]()}`, 0.5, 0.5);
    ctx.drawImage(tiles, T_HEALTH * tileSize, 0, tileSize, tileSize, 0, tileSize, tileSize, tileSize);
    drawText(`${playerHealth}`, playerHealth < 10 ? 0.5 : 0, 4);
    ctx.drawImage(tiles, T_FOOD * tileSize, 0, tileSize, tileSize, 0, tileSize * 3, tileSize, tileSize);
    drawText(`${playerFood}`, playerFood < 10 ? 0.5 : 0, 8);
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
let api = Game();
document.onkeyup = e => {
    const displayItem = api[API_STATE]()[ST_DISPLAY_ITEM];
    if (displayItem[DISPLAY_TYPE] === DTYPE_MAP) {
        keyHandlerMap(e);
    }
    if (displayItem[DISPLAY_TYPE] === DTYPE_IMAGE || displayItem[DISPLAY_TYPE] === DTYPE_MESSAGE) {
        if (e.keyCode === 32 || e.keyCode === 27 || e.keyCode === 13) {
            api[API_CLOSE]();
        }
    }
    if (displayItem[DISPLAY_TYPE] === DTYPE_SCREEN) {
        // close, change selection, confirm selection
    }
};
c.ontouchend = e => {
    const displayItem = api[API_STATE]()[ST_DISPLAY_ITEM];
    if (displayItem[DISPLAY_TYPE] === DTYPE_MAP) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const tileSize = c.getBoundingClientRect().width / canvasTiles;
            const tx = ~~(e.changedTouches[i].clientX / tileSize) - 1;
            const ty = ~~(e.changedTouches[i].clientY / tileSize) - 1;
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
        return;
    }
    if (displayItem[DISPLAY_TYPE] === DTYPE_IMAGE || displayItem[DISPLAY_TYPE] === DTYPE_MESSAGE) {
        api[API_CLOSE]();
    }
    if (displayItem[DISPLAY_TYPE] === DTYPE_SCREEN) {
        // close, change selection, confirm selection
    }
};
loadImages('f.gif', 't.gif', 'p.gif', 's.png').then(imgs => {
    [font, tiles, player, splash] = imgs;
    requestAnimationFrame(draw);
});
};s()