"""Scan Blender collections for wall and pillar model sources."""

from __future__ import annotations

import bpy

from .naming import (
    is_pillar_pool_collection,
    is_wall_pool_collection,
    parse_pillar_name,
    parse_wall_name,
)


def find_wall_pool_collections() -> list[bpy.types.Collection]:
    return sorted(
        [
            col
            for col in bpy.data.collections
            if is_wall_pool_collection(col.name) or collection_contains_wall_models(col)
        ],
        key=lambda col: col.name.lower(),
    )


def find_pillar_pool_collections() -> list[bpy.types.Collection]:
    return sorted(
        [
            col
            for col in bpy.data.collections
            if is_pillar_pool_collection(col.name) or collection_contains_pillar_models(col)
        ],
        key=lambda col: col.name.lower(),
    )


def find_wall_pool_names() -> list[str]:
    """All collection names that can supply wall model objects."""
    return [col.name for col in find_wall_pool_collections()]


def find_pillar_pool_names() -> list[str]:
    """All collection names that can supply pillar model objects."""
    return [col.name for col in find_pillar_pool_collections()]


def collection_contains_wall_models(collection: bpy.types.Collection) -> bool:
    for obj in collection.all_objects:
        if obj.type == "MESH" and parse_wall_name(obj.name) is not None:
            return True
    return False


def collection_contains_pillar_models(collection: bpy.types.Collection) -> bool:
    for obj in collection.all_objects:
        if obj.type == "MESH" and parse_pillar_name(obj.name) is not None:
            return True
    return False
