"""Blender operators."""

from __future__ import annotations

import random

import bpy
from bpy.types import Operator

from .connection import apply_shell_connections, layout_shell_grid
from .doors import apply_doors
from .geometry import build_rectangle_edges
from .model_index import build_index_from_pool_names
from .placement import clear_generated_output, place_shell
from .properties import (
    get_enabled_pillar_pool_names,
    get_enabled_styles,
    get_enabled_wall_pool_names,
    rescan_collection_lists,
)
from .shell_builder import build_random_shell, fill_shell_edges
from .utils import random_dimension, snap_range


class HSG_OT_rescan_collections(Operator):
    bl_idname = "hsg.rescan_collections"
    bl_label = "Rescan Collections"
    bl_description = "Refresh wall and pillar collection lists"
    bl_options = {"REGISTER"}

    def execute(self, context):
        wall_count, pillar_count = rescan_collection_lists(context.scene)
        self.report(
            {"INFO"},
            f"Rescan complete: {wall_count} wall collection(s), {pillar_count} pillar collection(s).",
        )
        return {"FINISHED"}


class HSG_OT_generate_shells(Operator):
    bl_idname = "hsg.generate_shells"
    bl_label = "Generate Shells"
    bl_description = "Generate house shells using the current settings"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        scene = context.scene
        props = scene.hsg_props
        warnings: list[str] = []

        if props.generation_mode == "BLUEPRINT":
            self.report({"ERROR"}, "From Blueprint mode is not implemented yet.")
            return {"CANCELLED"}

        wall_pool_names = get_enabled_wall_pool_names(scene)
        pillar_pool_names = get_enabled_pillar_pool_names(scene)

        if not wall_pool_names:
            self.report({"ERROR"}, "Select at least one wall collection.")
            return {"CANCELLED"}

        if (props.use_corner_pillars or props.use_seam_pillars) and not pillar_pool_names:
            self.report({"ERROR"}, "Pillar collections are required when pillar options are enabled.")
            return {"CANCELLED"}

        width_min, width_max = snap_range(props.width_min, props.width_max)
        length_min, length_max = snap_range(props.length_min, props.length_max)

        index, index_warnings = build_index_from_pool_names(wall_pool_names, pillar_pool_names)
        warnings.extend(index_warnings)

        if not index.walls:
            self.report({"ERROR"}, "No valid wall models found in selected collections.")
            return {"CANCELLED"}

        if props.replace_previous:
            clear_generated_output()

        rng = random.Random(props.seed)
        total = props.grid_columns * props.grid_rows
        shells = []

        available_heights = sorted({key[0] for key in index.walls.keys()})
        if not available_heights:
            self.report({"ERROR"}, "No height pools found in wall index.")
            return {"CANCELLED"}

        for cell_index in range(total):
            row = cell_index // props.grid_columns
            col = cell_index % props.grid_columns
            cell_rng = random.Random(props.seed + cell_index + 1)

            width = random_dimension(cell_rng, width_min, width_max)
            length = random_dimension(cell_rng, length_min, length_max)
            height_pool = cell_rng.choice(available_heights)

            styles = get_enabled_styles(props, height_pool)
            if not styles:
                styles = index.styles_for_height(height_pool)
            if not styles:
                self.report({"ERROR"}, f"No styles available for {height_pool} walls.")
                return {"CANCELLED"}

            shell_style = cell_rng.choice(styles)
            shell_id = f"{row}_{col}"
            edges = build_rectangle_edges(width, length)
            shell = build_random_shell(
                shell_id=shell_id,
                origin=(0.0, 0.0, 0.0),
                width=width,
                length=length,
                height_pool=height_pool,
                shell_style=shell_style,
                edges=edges,
            )

            mix_styles = props.mix_styles
            fill_warnings = fill_shell_edges(
                shell=shell,
                index=index,
                rng=cell_rng,
                mix_styles=mix_styles,
                enabled_styles=styles,
                window_probability=props.wall_type_probability,
            )
            warnings.extend(fill_warnings)
            shells.append(shell)

        layout_shell_grid(
            shells=shells,
            columns=props.grid_columns,
            spacing=props.grid_spacing,
            width_pitch=width_max,
            length_pitch=length_max,
            connect_shells=props.connect_shells,
        )

        for shell in shells:
            _warnings = place_shell(
                shell=shell,
                index=index,
                use_corner_pillars=props.use_corner_pillars,
                use_seam_pillars=props.use_seam_pillars,
            )
            warnings.extend(_warnings[1])

        if props.connect_shells:
            apply_shell_connections(shells, props.grid_columns)
            for shell in shells:
                root = bpy.data.objects.get(shell.root_empty_name)
                if root is not None:
                    from .registry import write_shell_to_empty

                    write_shell_to_empty(root, shell)

        for shell in shells:
            door_warnings = apply_doors(
                shell=shell,
                index=index,
                rng=random.Random(props.seed + 1000 + hash(shell.shell_id)),
                ensure_door=props.ensure_door,
            )
            warnings.extend(door_warnings)

        if warnings:
            self.report({"WARNING"}, f"Generated {len(shells)} shell(s) with {len(warnings)} warning(s).")
            for message in warnings[:5]:
                print(f"[HouseShellGenerator] {message}")
        else:
            self.report({"INFO"}, f"Generated {len(shells)} shell(s).")
        return {"FINISHED"}


classes = (
    HSG_OT_rescan_collections,
    HSG_OT_generate_shells,
)
