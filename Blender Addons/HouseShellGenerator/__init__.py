bl_info = {
    "name": "House Shell Generator",
    "author": "Hogan",
    "version": (0, 1, 6),
    "blender": (4, 2, 0),
    "location": "View3D > Sidebar > House Shells",
    "description": "Generate procedural house shells from wall and pillar model collections",
    "category": "Object",
}

import bpy
from bpy.props import PointerProperty

from . import operators, panel, properties


classes = (
    properties.HSG_CollectionItem,
    properties.HSG_StyleItem,
    properties.HSG_SceneProperties,
    *operators.classes,
    *panel.classes,
)


def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.hsg_props = PointerProperty(type=properties.HSG_SceneProperties)


def unregister():
    del bpy.types.Scene.hsg_props
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)


if __name__ == "__main__":
    import bpy

    register()
