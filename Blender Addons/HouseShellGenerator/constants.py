"""Shared constants for House Shell Generator."""

BLENDER_VERSION = (4, 2, 0)

WALL_WIDTH_FULL = 2.5
WALL_WIDTH_HALF = 1.25
WIDTH_STEP = 1.25
MIN_SHELL_DIMENSION = 5.0

GENERATED_ROOT_COLLECTION = "[Generated_Shells]"

# Exact collection name prefixes (including brackets) per Plan.md
WALL_POOL_PREFIX = "[Walls_"
PILLAR_POOL_PREFIX = "[Pillars_"

HEIGHT_TALL = "Tall"
HEIGHT_SHORT = "Short"

TALL_STYLES = ("BrickWoodBottom", "Brick", "Wood", "Stucco")
SHORT_STYLES = (
    "BrickWoodBottom",
    "Brick",
    "BrickFancy",
    "BrickBrickBottom",
    "Wood",
    "WoodFancy",
    "WoodBrickBottom",
    "Stucco",
    "StuccoFancy",
)

WINDOW_TYPE_KEYWORD = "Window"
DOOR_TYPE_KEYWORD = "Door"
HALF_TYPE_KEYWORD = "Half"

MAX_DOORS_PER_SHELL = 2
MAX_DOORS_PER_EDGE = 1
MAX_WINDOW_SLOT_RATIO = 0.8

DIRECTIONS = ("X+", "X-", "Y+", "Y-")

DIRECTION_ROTATION_Z = {
    "X+": 1.5707963267948966,
    "X-": -1.5707963267948966,
    "Y+": 0.0,
    "Y-": 3.141592653589793,
}

def wall_pool_name(height_pool: str, style: str) -> str:
    return f"[Walls_{height_pool}_{style}]"


def pillar_pool_name(height_pool: str) -> str:
    return f"[Pillars_{height_pool}]"
