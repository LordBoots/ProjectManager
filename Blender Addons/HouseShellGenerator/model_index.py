"""Build indexes from Blender collections and objects."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

import bpy

from .naming import parse_pillar_collection_name, parse_pillar_name, parse_wall_collection_name, parse_wall_name


@dataclass
class ModelIndex:
    walls: dict = field(default_factory=dict)
    doors: dict = field(default_factory=dict)
    pillars: dict = field(default_factory=dict)

    def wall(self, height: str, style: str, width: float, wall_type: str) -> Optional[bpy.types.Object]:
        return self.walls.get((height, style, width, wall_type))

    def door(self, height: str, style: str, width: float, door_type: str) -> Optional[bpy.types.Object]:
        return self.doors.get((height, style, width, door_type))

    def any_door(self, height: str, style: str, width: float) -> Optional[bpy.types.Object]:
        for key, obj in self.doors.items():
            if key[0] == height and key[1] == style and key[2] == width:
                return obj
        return None

    def pillar(self, height: str, pillar_type: str) -> Optional[bpy.types.Object]:
        return self.pillars.get((height, pillar_type))

    def plain_types(self, height: str, style: str, width: float) -> list[str]:
        results = []
        for key, _obj in self.walls.items():
            h, s, w, wall_type = key
            if h != height or s != style or w != width:
                continue
            if "Window" in wall_type or "Door" in wall_type:
                continue
            results.append(wall_type)
        return sorted(set(results))

    def window_types(self, height: str, style: str, width: float) -> list[str]:
        results = []
        for key, _obj in self.walls.items():
            h, s, w, wall_type = key
            if h != height or s != style or w != width:
                continue
            if "Window" not in wall_type:
                continue
            results.append(wall_type)
        return sorted(set(results))

    def styles_for_height(self, height: str) -> list[str]:
        styles = set()
        for key in self.walls.keys():
            if key[0] == height:
                styles.add(key[1])
        return sorted(styles)


def _index_wall_object(index: ModelIndex, obj: bpy.types.Object, warnings: list[str]) -> None:
    parsed = parse_wall_name(obj.name)
    if parsed is None:
        warnings.append(f"Could not parse wall object name: {obj.name}")
        return
    key = (parsed.height_pool, parsed.style, parsed.width, parsed.wall_type)
    if parsed.is_door:
        index.doors[key] = obj
    else:
        index.walls[key] = obj


def _index_pillar_object(index: ModelIndex, obj: bpy.types.Object, warnings: list[str]) -> None:
    parsed = parse_pillar_name(obj.name)
    if parsed is None:
        warnings.append(f"Could not parse pillar object name: {obj.name}")
        return
    index.pillars[(parsed.height_pool, parsed.pillar_type)] = obj


def _objects_for_wall_pool(pool_name: str) -> list[bpy.types.Object]:
    """Objects from [Walls_H_S] collection, or all [Wall_H_S_*] objects if pool collection is absent."""
    collection = bpy.data.collections.get(pool_name)
    if collection is not None:
        return [obj for obj in collection.all_objects if obj.type == "MESH" and obj.library is None]

    parsed = parse_wall_collection_name(pool_name)
    if parsed is None:
        return []
    height_pool, style = parsed
    results = []
    for obj in bpy.data.objects:
        if obj.type != "MESH" or obj.library is not None:
            continue
        wall = parse_wall_name(obj.name)
        if wall and wall.height_pool == height_pool and wall.style == style:
            results.append(obj)
    return results


def _objects_for_pillar_pool(pool_name: str) -> list[bpy.types.Object]:
    collection = bpy.data.collections.get(pool_name)
    if collection is not None:
        return [obj for obj in collection.all_objects if obj.type == "MESH" and obj.library is None]

    height_pool = parse_pillar_collection_name(pool_name)
    if height_pool is None:
        return []
    results = []
    for obj in bpy.data.objects:
        if obj.type != "MESH" or obj.library is not None:
            continue
        pillar = parse_pillar_name(obj.name)
        if pillar and pillar.height_pool == height_pool:
            results.append(obj)
    return results


def build_index_from_pool_names(
    wall_pool_names: list[str],
    pillar_pool_names: list[str],
) -> tuple[ModelIndex, list[str]]:
    index = ModelIndex()
    warnings: list[str] = []

    for pool_name in wall_pool_names:
        objects = _objects_for_wall_pool(pool_name)
        if not objects:
            warnings.append(f"No wall objects found for pool {pool_name}.")
        for obj in objects:
            _index_wall_object(index, obj, warnings)

    for pool_name in pillar_pool_names:
        objects = _objects_for_pillar_pool(pool_name)
        if not objects:
            warnings.append(f"No pillar objects found for pool {pool_name}.")
        for obj in objects:
            _index_pillar_object(index, obj, warnings)

    return index, warnings
