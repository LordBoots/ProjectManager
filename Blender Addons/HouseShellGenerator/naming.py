"""Parse wall and pillar names using exact Plan.md bracket conventions."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional

from .constants import (
    DOOR_TYPE_KEYWORD,
    HALF_TYPE_KEYWORD,
    HEIGHT_SHORT,
    HEIGHT_TALL,
    WALL_WIDTH_FULL,
    WALL_WIDTH_HALF,
    WINDOW_TYPE_KEYWORD,
    pillar_pool_name,
    wall_pool_name,
)

# Pool collections: [Walls_Short_BrickFancy]
_WALL_POOL_PATTERN = re.compile(r"^\[Walls_(Tall|Short)_([^\]]+)\]$")

# Wall objects: [Wall_Short_Brick_Plain_1]
# Door replacement models: [Door_Tall_BrickWoodBottom_Door_2]
_WALL_OBJECT_PATTERN = re.compile(r"^\[(Wall|Door)_(Tall|Short)_(.+?)_(.+?)\](?:\.\d{3})?$")

# Pillar pool collections: [Pillars_Tall]  [Pillars_Short]
_PILLAR_POOL_PATTERN = re.compile(r"^\[Pillars_(Tall|Short)\]$")

# Pillar objects: [Pillar_Tall_Corner_1]
_PILLAR_OBJECT_PATTERN = re.compile(r"^\[Pillar_(Tall|Short)_(Corner|Seam)_\d+\]$")


@dataclass(frozen=True)
class ParsedWallName:
    height_pool: str
    style: str
    wall_type: str
    width: float
    is_door: bool
    is_window: bool


@dataclass(frozen=True)
class ParsedPillarName:
    height_pool: str
    pillar_type: str


def _normalize_height(value: str) -> str:
    value = value.strip().title()
    if value not in (HEIGHT_TALL, HEIGHT_SHORT):
        raise ValueError(f"Unknown height pool: {value}")
    return value


def is_wall_pool_collection(name: str) -> bool:
    return _WALL_POOL_PATTERN.match(name.strip()) is not None


def is_pillar_pool_collection(name: str) -> bool:
    return _PILLAR_POOL_PATTERN.match(name.strip()) is not None


def parse_wall_name(name: str) -> Optional[ParsedWallName]:
    match = _WALL_OBJECT_PATTERN.match(name.strip())
    if not match:
        return None
    part_type = match.group(1)
    height_pool = _normalize_height(match.group(2))
    style = match.group(3)
    wall_type = match.group(4)
    is_door = part_type == "Door" or DOOR_TYPE_KEYWORD.lower() in wall_type.lower()
    is_window = WINDOW_TYPE_KEYWORD.lower() in wall_type.lower()
    width = WALL_WIDTH_HALF if HALF_TYPE_KEYWORD.lower() in wall_type.lower() else WALL_WIDTH_FULL
    return ParsedWallName(
        height_pool=height_pool,
        style=style,
        wall_type=wall_type,
        width=width,
        is_door=is_door,
        is_window=is_window,
    )


def parse_pillar_name(name: str) -> Optional[ParsedPillarName]:
    match = _PILLAR_OBJECT_PATTERN.match(name.strip())
    if not match:
        return None
    return ParsedPillarName(
        height_pool=_normalize_height(match.group(1)),
        pillar_type=match.group(2).title(),
    )


def parse_wall_collection_name(name: str) -> Optional[tuple[str, str]]:
    """Return (height_pool, style) from [Walls_Short_Brick]."""
    match = _WALL_POOL_PATTERN.match(name.strip())
    if not match:
        return None
    try:
        return _normalize_height(match.group(1)), match.group(2)
    except ValueError:
        return None


def parse_pillar_collection_name(name: str) -> Optional[str]:
    """Return height pool from [Pillars_Tall]."""
    match = _PILLAR_POOL_PATTERN.match(name.strip())
    if not match:
        return None
    try:
        return _normalize_height(match.group(1))
    except ValueError:
        return None


def discover_wall_pools_from_objects() -> list[str]:
    """Build [Walls_Height_Style] pool names from [Wall_...] objects in the file."""
    pools: set[tuple[str, str]] = set()
    import bpy

    for obj in bpy.data.objects:
        parsed = parse_wall_name(obj.name)
        if parsed is None or parsed.is_door:
            continue
        pools.add((parsed.height_pool, parsed.style))

    return sorted(wall_pool_name(height, style) for height, style in pools)


def discover_pillar_pools_from_objects() -> list[str]:
    """Build [Pillars_Tall] / [Pillars_Short] from [Pillar_...] objects when pools are missing."""
    pools: set[str] = set()
    import bpy

    for obj in bpy.data.objects:
        parsed = parse_pillar_name(obj.name)
        if parsed is None:
            continue
        pools.add(pillar_pool_name(parsed.height_pool))

    return sorted(pools)
