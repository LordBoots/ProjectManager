"""Viewport panel UI."""

from __future__ import annotations

import bpy
from bpy.types import Panel, UIList


class HSG_UL_wall_collections(UIList):
    bl_idname = "HSG_UL_wall_collections"

    def draw_item(self, context, layout, data, item, icon, active_data, active_propname, index):
        if self.layout_type in {"DEFAULT", "COMPACT"}:
            layout.prop(item, "enabled", text=item.collection_name, toggle=True)
        elif self.layout_type == "GRID":
            layout.alignment = "CENTER"
            layout.label(text="")


class HSG_UL_pillar_collections(UIList):
    bl_idname = "HSG_UL_pillar_collections"

    def draw_item(self, context, layout, data, item, icon, active_data, active_propname, index):
        if self.layout_type in {"DEFAULT", "COMPACT"}:
            layout.prop(item, "enabled", text=item.collection_name, toggle=True)
        elif self.layout_type == "GRID":
            layout.alignment = "CENTER"
            layout.label(text="")


class HSG_UL_tall_styles(UIList):
    bl_idname = "HSG_UL_tall_styles"

    def draw_item(self, context, layout, data, item, icon, active_data, active_propname, index):
        if self.layout_type in {"DEFAULT", "COMPACT"}:
            layout.prop(item, "enabled", text=item.style_name, toggle=True)


class HSG_UL_short_styles(UIList):
    bl_idname = "HSG_UL_short_styles"

    def draw_item(self, context, layout, data, item, icon, active_data, active_propname, index):
        if self.layout_type in {"DEFAULT", "COMPACT"}:
            layout.prop(item, "enabled", text=item.style_name, toggle=True)


class HSG_PT_main_panel(Panel):
    bl_label = "House Shell Generator"
    bl_idname = "HSG_PT_main_panel"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "House Shells"

    def draw(self, context):
        layout = self.layout
        props = context.scene.hsg_props

        layout.prop(props, "generation_mode")
        layout.operator("hsg.rescan_collections", icon="FILE_REFRESH")

        if len(props.wall_collections) == 0 and len(props.pillar_collections) == 0:
            layout.label(text="No collections listed — click Rescan", icon="INFO")

        box = layout.box()
        box.label(text="Collections", icon="OUTLINER_COLLECTION")
        row = box.row()
        row.template_list("HSG_UL_wall_collections", "", props, "wall_collections", props, "active_wall_index", rows=3)
        col = row.column(align=True)
        col.label(text="Walls")

        row = box.row()
        row.template_list(
            "HSG_UL_pillar_collections", "", props, "pillar_collections", props, "active_pillar_index", rows=2
        )
        col = row.column(align=True)
        col.label(text="Pillars")

        box = layout.box()
        box.label(text="Options", icon="SETTINGS")
        box.prop(props, "connect_shells")
        box.prop(props, "use_corner_pillars")
        box.prop(props, "use_seam_pillars")
        box.prop(props, "ensure_door")
        box.prop(props, "mix_styles")
        box.prop(props, "replace_previous")

        if props.mix_styles:
            styles = box.box()
            styles.label(text="Tall Styles")
            styles.template_list("HSG_UL_tall_styles", "", props, "tall_styles", props, "active_wall_index", rows=3)
            styles.label(text="Short Styles")
            styles.template_list("HSG_UL_short_styles", "", props, "short_styles", props, "active_wall_index", rows=3)
            styles.prop(props, "wall_style_probability")

        if props.generation_mode == "RANDOM":
            dims = layout.box()
            dims.label(text="Dimensions", icon="DRIVER_DISTANCE")
            row = dims.row(align=True)
            row.prop(props, "width_min")
            row.prop(props, "width_max")
            row = dims.row(align=True)
            row.prop(props, "length_min")
            row.prop(props, "length_max")
            dims.prop(props, "seed")

            grid = layout.box()
            grid.label(text="Grid", icon="MESH_GRID")
            row = grid.row(align=True)
            row.prop(props, "grid_columns")
            row.prop(props, "grid_rows")
            grid.prop(props, "grid_spacing")

        probs = layout.box()
        probs.label(text="Probabilities", icon="MOD_PARTICLES")
        probs.prop(props, "wall_type_probability")

        layout.operator("hsg.generate_shells", icon="HOME")


classes = (
    HSG_UL_wall_collections,
    HSG_UL_pillar_collections,
    HSG_UL_tall_styles,
    HSG_UL_short_styles,
    HSG_PT_main_panel,
)
