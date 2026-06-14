"""Place shell instances into the Blender scene."""

from __future__ import annotations

import bpy
from mathutils import Vector

from .constants import GENERATED_ROOT_COLLECTION
from .data_models import Shell
from .geometry import edge_end_point, outward_rotation_z, seam_point, slot_center
from .model_index import ModelIndex
from .registry import write_shell_to_empty


def ensure_output_collections(shell: Shell) -> tuple[bpy.types.Collection, bpy.types.Collection]:
    root = bpy.data.collections.get(GENERATED_ROOT_COLLECTION)
    if root is None:
        root = bpy.data.collections.new(GENERATED_ROOT_COLLECTION)
        bpy.context.scene.collection.children.link(root)

    shell_col_name = f"[Generated_Shell_{shell.shell_id}]"
    shell_col = bpy.data.collections.get(shell_col_name)
    if shell_col is None:
        shell_col = bpy.data.collections.new(shell_col_name)
        root.children.link(shell_col)
    return root, shell_col


def clear_generated_output() -> None:
    root = bpy.data.collections.get(GENERATED_ROOT_COLLECTION)
    if root is None:
        return
    for child in list(root.children):
        for obj in list(child.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(child)
    bpy.data.collections.remove(root)


def place_shell(
    shell: Shell,
    index: ModelIndex,
    use_corner_pillars: bool,
    use_seam_pillars: bool,
) -> tuple[bpy.types.Object, list[str]]:
    warnings: list[str] = []
    _root, shell_col = ensure_output_collections(shell)

    empty = bpy.data.objects.new(f"HSG_{shell.shell_id}", None)
    empty.empty_display_size = 0.5
    empty.location = shell.origin
    shell_col.objects.link(empty)
    shell.root_empty_name = empty.name

    placed: list[bpy.types.Object] = []

    for edge in shell.edges:
        for slot in edge.slots:
            source = index.wall(shell.height_pool, slot.style, slot.width, slot.wall_type)
            if source is None:
                warnings.append(
                    f"Missing wall model {shell.height_pool}/{slot.style}/{slot.width}/{slot.wall_type}"
                )
                continue
            obj = _duplicate_linked(source, shell_col)
            obj.location = slot_center(edge, slot.slot_index, slot.width, shell.origin)
            obj.rotation_euler[2] = outward_rotation_z(edge.direction, edge.start, edge.end)
            obj.parent = empty
            slot.instance_name = obj.name
            placed.append(obj)

        if use_corner_pillars:
            pillar = index.pillar(shell.height_pool, "Corner")
            if pillar is None:
                warnings.append(f"Missing corner pillar for {shell.height_pool}.")
            else:
                pillar_obj = _duplicate_linked(pillar, shell_col)
                pillar_obj.location = edge_end_point(edge, shell.origin)
                pillar_obj.rotation_euler[2] = outward_rotation_z(edge.direction, edge.start, edge.end)
                pillar_obj.parent = empty
                edge.corner_pillar_name = pillar_obj.name
                placed.append(pillar_obj)

        if use_seam_pillars and len(edge.slots) > 1:
            pillar = index.pillar(shell.height_pool, "Seam")
            if pillar is None:
                warnings.append(f"Missing seam pillar for {shell.height_pool}.")
            else:
                for boundary in range(1, len(edge.slots)):
                    pillar_obj = _duplicate_linked(pillar, shell_col)
                    pillar_obj.location = seam_point(edge, boundary, shell.origin)
                    pillar_obj.rotation_euler[2] = outward_rotation_z(edge.direction, edge.start, edge.end)
                    pillar_obj.parent = empty
                    edge.seam_pillar_names.append(pillar_obj.name)
                    placed.append(pillar_obj)

    write_shell_to_empty(empty, shell)
    return empty, warnings


def _duplicate_linked(source: bpy.types.Object, collection: bpy.types.Collection) -> bpy.types.Object:
    obj = source.copy()
    obj.data = source.data
    collection.objects.link(obj)
    return obj


def delete_objects_by_name(names: list[str]) -> None:
    for name in names:
        obj = bpy.data.objects.get(name)
        if obj is not None:
            bpy.data.objects.remove(obj, do_unlink=True)


def recenter_shell_empty(shell: Shell) -> None:
    empty = bpy.data.objects.get(shell.root_empty_name)
    if empty is None:
        return

    children = [child for child in empty.children if child.type != "EMPTY"]
    if not children:
        return

    world_matrices = {child.name: child.matrix_world.copy() for child in children}
    center = Vector((0.0, 0.0, 0.0))
    for child in children:
        center += child.matrix_world.translation
    center /= len(children)

    empty.location = center

    # Keep generated components visually fixed while moving the parent origin.
    for child in children:
        child.matrix_world = world_matrices[child.name]
