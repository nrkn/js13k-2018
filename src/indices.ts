// sprite indices
export const T_SEA = 0
export const T_WATER = 1
export const T_LAND = 2
export const T_GRASS = 3
export const T_GRASS_L = 8
export const T_TREE = 11
export const T_TREE_L = 4
export const T_FOOD = 15
export const T_HEALTH = 16
export const T_SAND = 17
export const T_SAND_L = 3
export const T_HUT = 20
export const T_COMPUTER = 21
export const T_SYNTH = 22
export const T_BED = 23
export const T_HUT_L = 24
export const T_HUT_M = 25
export const T_HUT_R = 26
export const T_BLACK = 27
export const T_RUINS = 28
export const T_RUINS_L = 3
export const T_MOUNTAINS = 31
export const T_MOUNTAINS_L = 3
export const T_SATELLITE = 34
export const T_PORTAL = 36
export const T_RANGER  = 38
export const T_KEY = 39
export const T_DISK = 40
export const T_CHIP = 41
export const T_FOG = 42
export const T_PORTAL_OFFLINE = 43
export const T_PORTAL_DAY = 44
export const S_SKELETON = 4
export const S_BOAT_LEFT = 5
export const S_BOAT_RIGHT = 6
export const S_MONSTER = 7
export const C_HUT_LOCKED = 0
export const C_RUINS_ACTIVE = 1
export const C_SATELLITE_OFFLINE = 2
export const C_PLAYER = 3
export const C_PORTAL_ACTIVE = 4
export const C_HUT_UNLOCKED = 5
export const C_RUINS_EMPTY = 6
export const C_SATELLITE_ACTIVE = 7
export const C_PORTAL_OFFLINE = 8

// state indices
export const ST_PLAYER_FACING = 0
export const ST_PLAYER_FOOD = 1
export const ST_PLAYER_HEALTH = 2
export const ST_PLAYER_MAX_HEALTH = 3
export const ST_HOURS = 4
export const ST_MINUTES = 5
export const ST_COLOR = 6
export const ST_DISPLAY_ITEM = 7
export const ST_MONSTERS = 8
export const ST_PLAYER_KEYS = 9
export const ST_PLAYER_CHIPS = 10
export const ST_PLAYER_DISKS = 11
export const ST_SEEN = 12
export const ST_HUTCACHE = 13
export const ST_RUINCACHE = 14
export const ST_PORTALCACHE = 15
export const ST_SATELLITE_FIXED = 16
export const ST_MOD_CHIPS = 17
export const ST_SATELLITE_CHIPS = 18

// api indices
export const API_STATE = 0
export const API_RESET = 1
export const API_TIMESTR = 2
export const API_INCTIME = 3
export const API_MOVE = 4
export const API_CLOSE = 5
export const API_SELECT = 6
export const API_CONFIRM_SELECT = 7

// display item types
export const DTYPE_IMAGE = 0
export const DTYPE_MESSAGE = 1
export const DTYPE_SCREEN = 2
export const DTYPE_MAP = 3
export const DTYPE_ACTION = 4
export const DTYPE_COMPUTER_MAP = 5

// game data indices
export const DATA_SPLASH = 0
export const DATA_INTRO = 1
export const DATA_SUNRISE = 2
export const DATA_SUNSET = 3
export const DATA_C_MAIN = 4
export const DATA_C_DIAGNOSTICS = 5
export const DATA_C_SYNTH = 6
export const DATA_ISLAND = 7
export const DATA_INVESTIGATE = 8
export const DATA_BED = 9
export const DATA_NOT_TIRED = 10
export const DATA_SLEEP = 11
export const DATA_HUNGRY = 12
export const DATA_DEAD = 13
export const DATA_RANGER = 14
export const DATA_LOCKED_NOKEYS = 15
export const DATA_LOCKED_UNLOCK = 16
export const DATA_UNLOCK = 17
export const DATA_RUINS = 18
export const DATA_SEARCH_RUINS = 19
export const DATA_COMPUTER = 20
export const DATA_USE_COMPUTER = 21
export const DATA_FIXABLE_COMPUTER = 22
export const DATA_FIX_COMPUTER = 23
export const DATA_C_FIXED = 24
export const DATA_C_SYNTH_CHARGING = 25
export const DATA_CREATE_FOOD = 26
export const DATA_SYNTH = 27
export const DATA_DB = 28
export const DATA_COMMS = 29
export const DATA_SECURITY = 30
export const DATA_MAP = 31
export const DATA_C_DIAGNOSTICS_FIXED = 32
export const DATA_C_DB_INTRO = 33
export const DATA_C_DB_PORTALS = 34
export const DATA_C_DB_GHOSTS = 35
export const DATA_C_DB_ERRORS = 36
export const DATA_C_DB_SHUTDOWN_PORTALS = 37
export const DATA_C_DB_SECURITY = 38
export const DATA_C_DB_FIX_SATELLITE = 39
export const DATA_C_DB_RESCUE_TEAM = 40
export const DATA_C_DB_L = 8
export const DATA_RESTORE_BACKUPS = 41
export const DATA_DIAGNOSTICS = 42
export const DATA_MODCHIPS = 43
export const DATA_SATELLITE_CHIP = 44
export const DATA_DISTRESS_SIGNAL = 45

// map data indices
export const MAP_PLAYERX = 1
export const MAP_PLAYERY = 2
export const MAP_TILES = 3
export const MAP_TYPE = 4
export const MAP_STARTX = 5
export const MAP_STARTY = 6
export const COMPUTER_MAP_MAPDB = 4

// map type indices
export const MT_ISLAND = 0
export const MT_HUT = 1

// display item indices
export const DISPLAY_TYPE = 0
export const DISPLAY_NAME = 1
export const DISPLAY_MESSAGE = 1

// actions
export const ACTION_INDEX = 1

// screen indices
export const SCREEN_MESSAGE = 1
export const SCREEN_OPTIONS = 2
export const SCREEN_SELECTION = 3
export const SCREEN_COLOR = 4
export const OPTION_MESSAGE = 0
export const OPTION_DATA_INDEX = 1

// point
export const X = 0
export const Y = 1

// edges
export const TOP = 0
export const RIGHT = 1
export const BOTTOM = 2
export const LEFT = 3

//monster
export const MON_X = 0
export const MON_Y = 1
export const MON_FACING = 2
export const MON_HEALTH = 3

// actions
export const ACTION_SLEEP = 0
export const ACTION_UNLOCK = 1
export const ACTION_SEARCH = 2
export const ACTION_USE_COMPUTER = 3
export const ACTION_FIX_COMPUTER = 4
export const ACTION_CREATE_FOOD = 5
export const ACTION_SHOW_SYNTH = 6
export const ACTION_SHOW_DB = 7
export const ACTION_SHOW_COMMS = 8
export const ACTION_SHOW_SECURITY = 9
export const ACTION_SHOW_MAP = 10
export const ACTION_RESTORE_BACKUPS = 11
export const ACTION_DIAGNOSTICS = 12
export const ACTION_CREATE_MODCHIP = 13
export const ACTION_CREATE_SATELLITE_CHIP = 14
export const ACTION_DISTRESS_SIGNAL = 15

// hut state
export const HUT_UNLOCKED = 0
export const HUT_COMPUTER_FIXED = 1
export const HUT_SYNTH_CHARGING = 2

// ruin item
export const ITEM_KEY = 0
export const ITEM_CHIP = 1
export const ITEM_DISK = 2
export const ITEM_FOOD = 3

// quest location
export const QUEST_RANGER = 0
export const QUEST_HUT = 1
export const QUEST_RUINS = 2
export const QUEST_PORTAL = 3
export const QUEST_SATELLITE = 4
export const QUEST_BLANK = 5