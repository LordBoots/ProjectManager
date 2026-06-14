"""Door post-processing."""

from __future__ import annotations

import random

import bpy

from .constants import MAX_DOORS_PER_SHELL, WALL_WIDTH_FULL
from .data_models import Shell
from .geometry import outward_rotation_z, slot_center
from .model_index import ModelIndex
from .registry import write_shell_to_empty


def apply_doors(
    shell: Shell,
    index: ModelIndex,
    rng: random.Random,
    ensure_door: bool,
) -> list[str]:
    warnings: list[str] = []
    if not ensure_door:
        return warnings

    root = bpy.data.objects.get(shell.root_empty_name)
    if root is None:
        warnings.append(f"Shell root empty missing for {shell.shell_id}.")
        return warnings

    candidates: list[tuple[int, int]] = []
    for edge_index, edge in enumerate(shell.edges):
        if not edge.is_exterior:
            continue
        for slot_index, slot in enumerate(edge.slots):
            if slot.is_door or slot.is_window:
                continue
            if slot.width != WALL_WIDTH_FULL:
                continue
            if "Plain" not in slot.wall_type and "Half" not in slot.wall_type:
                continue
            candidates.append((edge_index, slot_index))

    if not candidates:
        warnings.append(f"No swappable plain walls for doors on {shell.shell_id}.")
        return warnings

    rng.shuffle(candidates)
    placed_doors = 0
    used_edges: set[int] = set()

    for edge_index, slot_index in candidates:
        if placed_doors >= MAX_DOORS_PER_SHELL:
            break
        if edge_index in used_edges:
            continue

        edge = shell.edges[edge_index]
        slot = edge.slots[slot_index]
        door_source = index.any_door(shell.height_pool, slot.style, slot.width)
        if door_source is None:
            warnings.append(
                f"No door model for {shell.height_pool}/{slot.style}/{slot.width} on {shell.shell_id}."
            )
            continue

        old_name = slot.instance_name
        old_obj = bpy.data.objects.get(old_name)
        if old_obj is None:
            warnings.append(f"Missing wall instance {old_name} for door swap.")
            continue

        from .naming import parse_wall_name

        parsed_door = parse_wall_name(door_source.name)
        door_type = parsed_door.wall_type if parsed_door else door_source.name

        collection = old_obj.users_collection[0] if old_obj.users_collection else bpy.context.scene.collection
        door_obj = door_source.copy()
        door_obj.data = door_source.data
        door_obj.location = slot_center(edge, slot.slot_index, slot.width, shell.origin)
        door_obj.rotation_euler[2] = outward_rotation_z(edge.direction, edge.start, edge.end)
        door_obj.parent = root
        collection.objects.link(door_obj)
        bpy.data.objects.remove(old_obj, do_unlink=True)

        slot.instance_name = door_obj.name
        slot.is_door = True
        slot.wall_type = door_type
        used_edges.add(edge_index)
        placed_doors += 1

    write_shell_to_empty(root, shell)
    return warnings
