"""Blender RNA properties."""

import bpy
from bpy.props import (
    BoolProperty,
    CollectionProperty,
    EnumProperty,
    FloatProperty,
    IntProperty,
    PointerProperty,
    StringProperty,
)
from bpy.types import PropertyGroup

from .constants import HEIGHT_SHORT, HEIGHT_TALL, MIN_SHELL_DIMENSION


class HSG_CollectionItem(PropertyGroup):
    # Must not use "name" — conflicts with RNA struct name and values are not stored reliably.
    collection_name: StringProperty(name="Collection")
    enabled: BoolProperty(name="Use", default=True)


class HSG_StyleItem(PropertyGroup):
    style_name: StringProperty(name="Style")
    enabled: BoolProperty(name="Use", default=True)


class HSG_SceneProperties(PropertyGroup):
    generation_mode: EnumProperty(
        name="Mode",
        items=[
            ("RANDOM", "Random Grid", "Generate shells on a grid with random dimensions"),
            ("BLUEPRINT", "From Blueprint", "Generate from a floor-plan mesh (not yet implemented)"),
        ],
        default="RANDOM",
    )

    connect_shells: BoolProperty(name="Connect Shells", default=False)
    use_corner_pillars: BoolProperty(name="Corner Pillars", default=True)
    use_seam_pillars: BoolProperty(name="Seam Pillars", default=False)
    ensure_door: BoolProperty(name="Ensure Door", default=True)
    mix_styles: BoolProperty(name="Mix Styles", default=False)
    replace_previous: BoolProperty(name="Replace Previous", default=True)

    width_min: FloatProperty(name="Width Min", default=5.0, min=2.5, soft_max=50.0, unit="LENGTH")
    width_max: FloatProperty(name="Width Max", default=10.0, min=2.5, soft_max=50.0, unit="LENGTH")
    length_min: FloatProperty(name="Length Min", default=5.0, min=2.5, soft_max=50.0, unit="LENGTH")
    length_max: FloatProperty(name="Length Max", default=10.0, min=2.5, soft_max=50.0, unit="LENGTH")
    seed: IntProperty(name="Seed", default=1, min=0)

    wall_style_probability: FloatProperty(
        name="Style Mix Weight",
        description="Used when mix styles is enabled",
        default=0.5,
        min=0.0,
        max=1.0,
    )
    wall_type_probability: FloatProperty(
        name="Window Probability",
        description="Probability of picking a window instead of a plain wall",
        default=0.35,
        min=0.0,
        max=1.0,
    )

    grid_columns: IntProperty(name="Columns", default=2, min=1, max=20)
    grid_rows: IntProperty(name="Rows", default=2, min=1, max=20)
    grid_spacing: FloatProperty(name="Spacing", default=2.0, min=0.0, soft_max=50.0, unit="LENGTH")

    blueprint_object: PointerProperty(name="Blueprint", type=bpy.types.Object)

    wall_collections: CollectionProperty(type=HSG_CollectionItem)
    short_wall_collections: CollectionProperty(type=HSG_CollectionItem)
    tall_wall_collections: CollectionProperty(type=HSG_CollectionItem)
    pillar_collections: CollectionProperty(type=HSG_CollectionItem)
    tall_styles: CollectionProperty(type=HSG_StyleItem)
    short_styles: CollectionProperty(type=HSG_StyleItem)

    active_wall_index: IntProperty(default=0)
    active_short_wall_index: IntProperty(default=0)
    active_tall_wall_index: IntProperty(default=0)
    active_pillar_index: IntProperty(default=0)


def get_enabled_wall_pool_names(scene: bpy.types.Scene) -> list[str]:
    props = scene.hsg_props
    names = [item.collection_name for item in props.short_wall_collections if item.enabled]
    names.extend(item.collection_name for item in props.tall_wall_collections if item.enabled)
    return names


def get_enabled_pillar_pool_names(scene: bpy.types.Scene) -> list[str]:
    props = scene.hsg_props
    return [item.collection_name for item in props.pillar_collections if item.enabled]


def get_enabled_styles(props: HSG_SceneProperties, height_pool: str) -> list[str]:
    source = props.tall_styles if height_pool == HEIGHT_TALL else props.short_styles
    enabled = [item.style_name for item in source if item.enabled]
    return enabled


def rescan_collection_lists(scene: bpy.types.Scene) -> tuple[int, int]:
    from .collection_scan import find_pillar_pool_names, find_wall_pool_names
    from .constants import SHORT_STYLES, TALL_STYLES
    from .naming import parse_wall_collection_name, parse_wall_name

    props = scene.hsg_props
    props.wall_collections.clear()
    props.short_wall_collections.clear()
    props.tall_wall_collections.clear()
    props.pillar_collections.clear()

    wall_pool_names = find_wall_pool_names()
    pillar_pool_names = find_pillar_pool_names()

    for pool_name in wall_pool_names:
        height_pool = _height_pool_for_wall_collection(pool_name)
        if height_pool == HEIGHT_SHORT:
            item = props.short_wall_collections.add()
        elif height_pool == HEIGHT_TALL:
            item = props.tall_wall_collections.add()
        else:
            item = props.wall_collections.add()
        item.collection_name = pool_name
        item.enabled = True

    for pool_name in pillar_pool_names:
        item = props.pillar_collections.add()
        item.collection_name = pool_name
        item.enabled = True

    known_tall = set()
    known_short = set()
    for pool_name in wall_pool_names:
        parsed = parse_wall_collection_name(pool_name)
        if parsed is not None:
            height, style = parsed
            if height == HEIGHT_TALL:
                known_tall.add(style)
            else:
                known_short.add(style)
            continue

        collection = bpy.data.collections.get(pool_name)
        if collection is None:
            continue
        for obj in collection.all_objects:
            wall = parse_wall_name(obj.name)
            if wall is None:
                continue
            if wall.height_pool == HEIGHT_TALL:
                known_tall.add(wall.style)
            else:
                known_short.add(wall.style)

    props.tall_styles.clear()
    for style in TALL_STYLES:
        if style in known_tall:
            item = props.tall_styles.add()
            item.style_name = style
            item.enabled = True

    props.short_styles.clear()
    for style in SHORT_STYLES:
        if style in known_short:
            item = props.short_styles.add()
            item.style_name = style
            item.enabled = True

    return len(wall_pool_names), len(pillar_pool_names)


def _height_pool_for_wall_collection(pool_name: str) -> str | None:
    from .naming import parse_wall_collection_name, parse_wall_name

    parsed = parse_wall_collection_name(pool_name)
    if parsed is not None:
        return parsed[0]

    collection = bpy.data.collections.get(pool_name)
    if collection is None:
        return None

    for obj in collection.all_objects:
        wall = parse_wall_name(obj.name)
        if wall is not None:
            return wall.height_pool
    return None
