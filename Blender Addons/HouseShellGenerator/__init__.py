bl_info = {
    "name": "House Shell Generator",
    "author": "ProjectManager",
    "version": (0, 1, 0),
    "blender": (4, 2, 0),
    "location": "View3D > Sidebar (N) > Shells",
    "description": "Generate house shells from random grids or a hand-drawn blueprint.",
    "category": "Add Mesh",
}

import importlib
import random

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
from bpy.types import Operator, Panel, PropertyGroup

from . import core, blueprint

# Support Blender's "Reload Scripts" during development.
if "_already_loaded" in locals():
    importlib.reload(core)
    importlib.reload(blueprint)
_already_loaded = True


# --- property groups ---------------------------------------------------------

class HSG_CollectionItem(PropertyGroup):
    name: StringProperty()
    use: BoolProperty(default=False)


class HSG_Settings(PropertyGroup):
    generation_mode: EnumProperty(
        name="Mode",
        items=[
            ('GRID', "Random Grid", "Generate random rectangular shells in a grid"),
            ('BLUEPRINT', "Blueprint", "Generate shells from a hand-drawn floor plan"),
        ],
        default='GRID',
    )

    # toggles
    connect_shells: BoolProperty(name="Connect Shells", default=False)
    use_corner_pillars: BoolProperty(name="Corner Pillars", default=False)
    use_seam_pillars: BoolProperty(name="Seam Pillars", default=False)
    ensure_door: BoolProperty(name="Ensure Door", default=True)
    mix_styles: BoolProperty(name="Mix Styles", default=False)
    replace_previous: BoolProperty(name="Replace Previous", default=True)

    # dimensions (meters, snapped to 1.25)
    width_min: FloatProperty(name="Width Min", default=5.0, min=2.5, soft_max=50.0)
    width_max: FloatProperty(name="Width Max", default=10.0, min=2.5, soft_max=50.0)
    length_min: FloatProperty(name="Length Min", default=5.0, min=2.5, soft_max=50.0)
    length_max: FloatProperty(name="Length Max", default=10.0, min=2.5, soft_max=50.0)

    seed: IntProperty(name="Seed", default=0)

    # probabilities
    wall_style_probability: FloatProperty(
        name="Style Probability", default=0.5, min=0.0, max=1.0)
    wall_type_probability: FloatProperty(
        name="Plain Wall Weight", default=0.6, min=0.0, max=1.0,
        description="Higher = more plain walls, fewer windows")

    # grid
    columns: IntProperty(name="Columns", default=2, min=1, soft_max=20)
    rows: IntProperty(name="Rows", default=2, min=1, soft_max=20)
    spacing: FloatProperty(name="Spacing", default=2.0, min=0.0, soft_max=50.0)

    wall_collections: CollectionProperty(type=HSG_CollectionItem)
    pillar_collections: CollectionProperty(type=HSG_CollectionItem)


# --- collection scanning -----------------------------------------------------

def _rescan(settings):
    prev_walls = {i.name: i.use for i in settings.wall_collections}
    prev_pillars = {i.name: i.use for i in settings.pillar_collections}
    settings.wall_collections.clear()
    settings.pillar_collections.clear()
    for coll in bpy.data.collections:
        if core.parse_wall_collection(coll.name):
            item = settings.wall_collections.add()
            item.name = coll.name
            item.use = prev_walls.get(coll.name, False)
        elif core.parse_pillar_collection(coll.name):
            item = settings.pillar_collections.add()
            item.name = coll.name
            item.use = prev_pillars.get(coll.name, False)


class HSG_OT_rescan(Operator):
    """Rescan the file for [Walls_*] and [Pillars_*] collections"""
    bl_idname = "hsg.rescan_collections"
    bl_label = "Rescan Collections"
    bl_options = {'REGISTER'}

    def execute(self, context):
        _rescan(context.scene.hsg_settings)
        return {'FINISHED'}


# --- generation --------------------------------------------------------------

class HSG_OT_generate(Operator):
    """Generate shells with the current settings"""
    bl_idname = "hsg.generate_shells"
    bl_label = "Generate Shells"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        s = context.scene.hsg_settings

        wall_colls = [bpy.data.collections.get(i.name)
                      for i in s.wall_collections if i.use]
        wall_colls = [c for c in wall_colls if c is not None]
        pillar_colls = [bpy.data.collections.get(i.name)
                        for i in s.pillar_collections if i.use]
        pillar_colls = [c for c in pillar_colls if c is not None]

        if not wall_colls:
            self.report({'ERROR'}, "Select at least one wall collection.")
            return {'CANCELLED'}
        if (s.use_corner_pillars or s.use_seam_pillars) and not pillar_colls:
            self.report({'ERROR'}, "Pillars enabled but no pillar collection selected.")
            return {'CANCELLED'}

        midx = core.build_model_index(wall_colls, pillar_colls)
        if not midx.has_walls():
            self.report({'ERROR'}, "No usable wall models found in the selection.")
            return {'CANCELLED'}
        for err in midx.errors[:5]:
            self.report({'WARNING'}, err)

        if s.replace_previous:
            core.clear_generated_collection()
        collection = core.get_generated_collection()

        if s.generation_mode == 'BLUEPRINT':
            count = self._generate_blueprint(s, midx, collection)
        else:
            count = self._generate_grid(s, midx, collection)

        if count == 0:
            self.report({'WARNING'}, "No shells were generated.")
        else:
            self.report({'INFO'}, "Generated %d shell(s)." % count)
        return {'FINISHED'}

    # -- grid mode ------------------------------------------------------------
    def _generate_grid(self, s, midx, collection):
        col_step = core.snap_to_grid(s.width_max) + s.spacing
        row_step = core.snap_to_grid(s.length_max) + s.spacing
        count = 0
        for r in range(s.rows):
            row_shells = []
            row_length = None
            x_cursor = 0.0
            for c in range(s.columns):
                rng = random.Random(s.seed + r * 1000 + c)
                width = core.pick_dimension(rng, s.width_min, s.width_max)
                if s.connect_shells:
                    if row_length is None:
                        row_length = core.pick_dimension(rng, s.length_min, s.length_max)
                    length = row_length
                    ox, oy = x_cursor, r * row_step
                    x_cursor += width
                else:
                    length = core.pick_dimension(rng, s.length_min, s.length_max)
                    ox, oy = c * col_step, r * row_step

                loop = core.rectangle_loop(ox, oy, width, length)
                height, styles = self._pick_height_styles(midx, rng)
                if not styles:
                    continue
                name = "[Generated_Shell_%d_%d]" % (r, c)
                shell = core.realize_shell(loop, height, styles, s, rng, midx,
                                           name, collection)
                if s.ensure_door:
                    core.apply_doors(shell, s, rng,
                                     midx, lambda m: self.report({'WARNING'}, m))
                row_shells.append(shell)
                count += 1

            if s.connect_shells and len(row_shells) > 1:
                self._merge_row(row_shells)
        return count

    @staticmethod
    def _merge_row(row_shells):
        """Delete back-to-back walls between consecutive flush shells in a row.

        Rectangle CCW edge order: 0=bottom(X+) 1=right/East(Y+) 2=top(X-) 3=left/West(Y-).
        """
        for j in range(1, len(row_shells)):
            left = row_shells[j - 1]
            right = row_shells[j]
            for meta in list(left.walls):
                if meta["side"] == 1 and meta["slot"].obj is not None:
                    bpy.data.objects.remove(meta["slot"].obj, do_unlink=True)
                    left.walls.remove(meta)
            for meta in list(right.walls):
                if meta["side"] == 3 and meta["slot"].obj is not None:
                    bpy.data.objects.remove(meta["slot"].obj, do_unlink=True)
                    right.walls.remove(meta)

    # -- blueprint mode -------------------------------------------------------
    def _generate_blueprint(self, s, midx, collection):
        loops = blueprint.get_blueprint_loops()
        if not loops:
            self.report({'ERROR'},
                        "No closed blueprint loops. Use 'Draw Blueprint' first.")
            return 0
        count = 0
        for n, loop in enumerate(loops):
            rng = random.Random(s.seed + 7919 * (n + 1))
            height, styles = self._pick_height_styles(midx, rng)
            if not styles:
                continue
            name = "[Generated_Shell_BP_%d]" % n
            shell = core.realize_shell(loop, height, styles, s, rng, midx,
                                       name, collection)
            if s.ensure_door:
                core.apply_doors(shell, s, rng,
                                 midx, lambda m: self.report({'WARNING'}, m))
            count += 1
        return count

    @staticmethod
    def _pick_height_styles(midx, rng):
        pools = midx.height_pools()
        if not pools:
            return None, []
        height = rng.choice(pools)
        return height, midx.styles_for_height(height)


# --- panel -------------------------------------------------------------------

class HSG_PT_panel(Panel):
    bl_label = "House Shell Generator"
    bl_idname = "HSG_PT_panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "Shells"

    def draw(self, context):
        layout = self.layout
        s = context.scene.hsg_settings

        layout.prop(s, "generation_mode", expand=True)

        if s.generation_mode == 'BLUEPRINT':
            box = layout.box()
            box.label(text="Blueprint", icon='GREASEPENCIL')
            box.operator("hsg.draw_blueprint", icon='PLAY')
            row = box.row()
            row.operator("hsg.clear_blueprint", icon='TRASH')
            loops = blueprint.get_blueprint_loops()
            box.label(text="Closed loops: %d   Points: %d"
                      % (len(loops), len(blueprint.blueprint_data["points"])))
        else:
            box = layout.box()
            box.label(text="Dimensions (m)", icon='FIXED_SIZE')
            row = box.row(align=True)
            row.prop(s, "width_min")
            row.prop(s, "width_max")
            row = box.row(align=True)
            row.prop(s, "length_min")
            row.prop(s, "length_max")

            box = layout.box()
            box.label(text="Grid", icon='MESH_GRID')
            row = box.row(align=True)
            row.prop(s, "columns")
            row.prop(s, "rows")
            box.prop(s, "spacing")

        box = layout.box()
        box.label(text="Options", icon='SETTINGS')
        box.prop(s, "connect_shells")
        box.prop(s, "use_corner_pillars")
        box.prop(s, "use_seam_pillars")
        box.prop(s, "ensure_door")
        box.prop(s, "mix_styles")
        box.prop(s, "replace_previous")

        box = layout.box()
        box.label(text="Randomness", icon='MOD_NOISE')
        box.prop(s, "seed")
        box.prop(s, "wall_type_probability")
        if s.mix_styles:
            box.prop(s, "wall_style_probability")

        box = layout.box()
        row = box.row()
        row.label(text="Wall Collections", icon='OUTLINER_COLLECTION')
        row.operator("hsg.rescan_collections", text="", icon='FILE_REFRESH')
        if not s.wall_collections:
            box.label(text="Press rescan to populate", icon='INFO')
        for item in s.wall_collections:
            box.prop(item, "use", text=item.name)

        if s.use_corner_pillars or s.use_seam_pillars:
            box = layout.box()
            box.label(text="Pillar Collections", icon='OUTLINER_COLLECTION')
            if not s.pillar_collections:
                box.label(text="Press rescan to populate", icon='INFO')
            for item in s.pillar_collections:
                box.prop(item, "use", text=item.name)

        layout.separator()
        layout.operator("hsg.generate_shells", icon='MOD_BUILD')


# --- registration ------------------------------------------------------------

classes = (
    HSG_CollectionItem,
    HSG_Settings,
    HSG_OT_rescan,
    HSG_OT_generate,
    HSG_PT_panel,
)


def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    for cls in blueprint.classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.hsg_settings = PointerProperty(type=HSG_Settings)


def unregister():
    del bpy.types.Scene.hsg_settings
    for cls in reversed(blueprint.classes):
        bpy.utils.unregister_class(cls)
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)


if __name__ == "__main__":
    register()
