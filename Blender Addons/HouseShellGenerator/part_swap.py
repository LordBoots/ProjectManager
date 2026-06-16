"""Part Swap — replace a placed shell part with another mesh from the scene."""

import bpy
from bpy.types import Operator, Panel

from . import core


class HSG_OT_pick_swap_target(Operator):
    """Store the active object as the part to replace"""
    bl_idname = "hsg.pick_swap_target"
    bl_label = "Pick Target"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        obj = context.active_object
        if obj is None:
            self.report({'ERROR'}, "Select a placed part to replace.")
            return {'CANCELLED'}
        if obj.type != 'MESH':
            self.report({'ERROR'}, "Target must be a mesh object.")
            return {'CANCELLED'}
        context.scene.hsg_settings.swap_target = obj
        self.report({'INFO'}, "Target set to %s." % obj.name)
        return {'FINISHED'}


class HSG_OT_clear_swap_target(Operator):
    """Clear the stored swap target"""
    bl_idname = "hsg.clear_swap_target"
    bl_label = "Clear Target"
    bl_options = {'REGISTER'}

    def execute(self, context):
        context.scene.hsg_settings.swap_target = None
        return {'FINISHED'}


class HSG_OT_replace_part(Operator):
    """Replace the stored target with a duplicate of the active object"""
    bl_idname = "hsg.replace_part"
    bl_label = "Replace Part"
    bl_options = {'REGISTER', 'UNDO'}

    @classmethod
    def poll(cls, context):
        s = context.scene.hsg_settings
        return (s.swap_target is not None
                and context.active_object is not None
                and context.active_object.type == 'MESH')

    def execute(self, context):
        s = context.scene.hsg_settings
        target = s.swap_target
        source = context.active_object

        if target is None:
            self.report({'ERROR'}, "No target part. Pick a placed part first.")
            return {'CANCELLED'}
        try:
            if target.name not in bpy.data.objects:
                s.swap_target = None
                self.report({'ERROR'}, "Target no longer exists.")
                return {'CANCELLED'}
        except ReferenceError:
            s.swap_target = None
            self.report({'ERROR'}, "Target no longer exists.")
            return {'CANCELLED'}

        new_obj, err = core.replace_placed_part(target, source)
        if err:
            self.report({'ERROR'}, err)
            return {'CANCELLED'}

        s.swap_target = new_obj
        bpy.ops.object.select_all(action='DESELECT')
        new_obj.select_set(True)
        context.view_layer.objects.active = new_obj
        self.report({'INFO'}, "Replaced with %s." % source.name)
        return {'FINISHED'}


class HSG_PT_part_swap(Panel):
    bl_label = "Part Swap"
    bl_idname = "HSG_PT_part_swap"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "Shells"

    def draw(self, context):
        layout = self.layout
        s = context.scene.hsg_settings
        active = context.active_object

        box = layout.box()
        box.label(text="1. Select a placed part, then:", icon='INFO')
        row = box.row(align=True)
        row.operator("hsg.pick_swap_target", icon='EYEDROPPER')
        row.operator("hsg.clear_swap_target", text="", icon='X')

        target = s.swap_target
        if target:
            col = box.column(align=True)
            col.label(text="Target: " + target.name, icon='OBJECT_DATA')
            info = core.describe_part(target)
            if info:
                col.label(text=info, icon='NONE')
        else:
            box.label(text="Target: (none)", icon='OBJECT_DATA')

        layout.separator()

        box = layout.box()
        box.label(text="2. Select replacement source (active):", icon='INFO')
        if active and active.type == 'MESH':
            col = box.column(align=True)
            col.label(text=active.name, icon='OUTLINER_OB_MESH')
            info = core.describe_part(active)
            if info:
                col.label(text=info, icon='NONE')
        elif active:
            box.label(text=active.name + " (not a mesh)", icon='ERROR')
        else:
            box.label(text="(none)", icon='OUTLINER_OB_MESH')

        layout.separator()
        layout.operator("hsg.replace_part", icon='FILE_REFRESH')


classes = (
    HSG_OT_pick_swap_target,
    HSG_OT_clear_swap_target,
    HSG_OT_replace_part,
    HSG_PT_part_swap,
)
