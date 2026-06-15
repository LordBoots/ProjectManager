bl_info = {
    "name": "Floor Plan Layout",
    "blender": (4, 3, 0),
    "category": "Add Mesh",
    "version": (0, 1),
    "author": "Layout Tool",
    "description": "Modal floor plan layout editor with grid and point-edge drawing"
}

import bpy
import json
from mathutils import Vector
from bpy_extras import view3d_utils
import gpu
from gpu_extras.batch import batch_for_shader

# Global data storage
layout_data = {
    "points": [],
    "edges": [],
    "selected_point": None,
    "grid_size": 1.0,
    "snap_to_grid": True
}

class FloorPlanLayout(bpy.types.Operator):
    """Modal floor plan layout editor"""
    bl_idname = "wm.floor_plan_layout"
    bl_label = "Floor Plan Layout Editor"
    
    _timer = None
    _draw_handle_3d = None
    _draw_handle_ui = None
    
    def modal(self, context, event):
        if event.type == 'ESC':
            self.finish(context)
            return {'FINISHED'}
        
        if event.type == 'TIMER':
            for area in context.screen.areas:
                if area.type == 'VIEW_3D':
                    area.tag_redraw()
        
        if event.type == 'LEFTMOUSE' and event.value == 'PRESS':
            self.handle_click(context, event)
        
        if event.type == 'RIGHTMOUSE' and event.value == 'PRESS':
            self.delete_point_at_mouse(context, event)
        
        if event.type == 'MIDDLEMOUSE' and event.value == 'PRESS':
            layout_data["selected_point"] = None
        
        if event.type == 'KEY_G' and event.value == 'PRESS':
            layout_data["grid_size"] += 0.5
            print(f"Grid size: {layout_data['grid_size']}")
        
        if event.type == 'KEY_H' and event.value == 'PRESS':
            layout_data["grid_size"] = max(0.1, layout_data["grid_size"] - 0.5)
            print(f"Grid size: {layout_data['grid_size']}")
        
        if event.type == 'KEY_S' and event.value == 'PRESS':
            layout_data["snap_to_grid"] = not layout_data["snap_to_grid"]
            print(f"Snap to grid: {layout_data['snap_to_grid']}")
        
        if event.type == 'KEY_E' and event.value == 'PRESS':
            self.export_layout()
        
        if event.type == 'KEY_C' and event.value == 'PRESS':
            layout_data["points"] = []
            layout_data["edges"] = []
            layout_data["selected_point"] = None
            print("Layout cleared")
        
        return {'RUNNING_MODAL'}
    
    def handle_click(self, context, event):
        region = context.region
        rv3d = context.region_data
        
        if region is None or rv3d is None:
            return
        
        mouse_pos = (event.mouse_region_x, event.mouse_region_y)
        
        # Get world coordinates from mouse position
        view_vector = view3d_utils.region_2d_to_vector_3d(region, rv3d, mouse_pos)
        ray_origin = view3d_utils.region_2d_to_origin_3d(region, rv3d, mouse_pos)
        
        # Project onto Z=0 plane
        if view_vector.z != 0:
            t = -ray_origin.z / view_vector.z
            world_pos = ray_origin + view_vector * t
        else:
            world_pos = ray_origin
        
        # Snap to grid if enabled
        if layout_data["snap_to_grid"]:
            gs = layout_data["grid_size"]
            world_pos.x = round(world_pos.x / gs) * gs
            world_pos.y = round(world_pos.y / gs) * gs
        
        # Check if clicking on existing point
        clicked_point = self.get_point_at_position(world_pos)
        
        if clicked_point is not None:
            if layout_data["selected_point"] is None:
                layout_data["selected_point"] = clicked_point
            elif layout_data["selected_point"] == clicked_point:
                layout_data["selected_point"] = None
            else:
                # Create edge between two points
                p1_idx = layout_data["points"].index(layout_data["selected_point"])
                p2_idx = layout_data["points"].index(clicked_point)
                
                edge = tuple(sorted([p1_idx, p2_idx]))
                if edge not in layout_data["edges"]:
                    layout_data["edges"].append(edge)
                
                layout_data["selected_point"] = None
        else:
            # Create new point
            new_point = [world_pos.x, world_pos.y, 0]
            layout_data["points"].append(new_point)
    
    def delete_point_at_mouse(self, context, event):
        region = context.region
        rv3d = context.region_data
        
        if region is None or rv3d is None:
            return
        
        mouse_pos = (event.mouse_region_x, event.mouse_region_y)
        view_vector = view3d_utils.region_2d_to_vector_3d(region, rv3d, mouse_pos)
        ray_origin = view3d_utils.region_2d_to_origin_3d(region, rv3d, mouse_pos)
        
        if view_vector.z != 0:
            t = -ray_origin.z / view_vector.z
            world_pos = ray_origin + view_vector * t
        else:
            world_pos = ray_origin
        
        point = self.get_point_at_position(world_pos)
        if point is not None:
            idx = layout_data["points"].index(point)
            layout_data["points"].pop(idx)
            
            # Remove edges connected to this point
            layout_data["edges"] = [e for e in layout_data["edges"] 
                                   if idx not in e]
            
            # Update edge indices
            layout_data["edges"] = [tuple(sorted([
                e[0] if e[0] < idx else e[0] - 1,
                e[1] if e[1] < idx else e[1] - 1
            ])) for e in layout_data["edges"]]
    
    def get_point_at_position(self, world_pos, threshold=0.3):
        for point in layout_data["points"]:
            dist = ((world_pos.x - point[0])**2 + (world_pos.y - point[1])**2)**0.5
            if dist < threshold:
                return point
        return None
    
    def draw_callback_3d(self, context):
        """Draw 3D content (grid, edges, points)"""
        try:
            # Draw grid
            self.draw_grid(context)
            
            # Draw edges
            self.draw_edges(context)
            
            # Draw points
            self.draw_points(context)
        except Exception as e:
            print(f"3D draw error: {e}")
    
    def draw_callback_ui(self, context):
        """Draw 2D UI (text and panel)"""
        try:
            self.draw_ui_text()
        except Exception as e:
            print(f"UI draw error: {e}")
    
    def draw_grid(self, context):
        shader = gpu.shader.from_builtin('UNIFORM_COLOR')
        
        grid_range = 20
        gs = layout_data["grid_size"]
        
        coords = []
        for i in range(-grid_range, grid_range + 1):
            coords.append((i * gs, -grid_range * gs, 0))
            coords.append((i * gs, grid_range * gs, 0))
            coords.append((-grid_range * gs, i * gs, 0))
            coords.append((grid_range * gs, i * gs, 0))
        
        batch = batch_for_shader(shader, 'LINES', {"pos": coords})
        shader.bind()
        shader.uniform_float("color", (0.3, 0.3, 0.3, 0.5))
        batch.draw(shader)
    
    def draw_edges(self, context):
        if not layout_data["edges"]:
            return
        
        shader = gpu.shader.from_builtin('UNIFORM_COLOR')
        
        coords = []
        for edge in layout_data["edges"]:
            p1 = layout_data["points"][edge[0]]
            p2 = layout_data["points"][edge[1]]
            coords.append((p1[0], p1[1], 0))
            coords.append((p2[0], p2[1], 0))
        
        batch = batch_for_shader(shader, 'LINES', {"pos": coords})
        shader.bind()
        shader.uniform_float("color", (1.0, 1.0, 1.0, 1.0))
        batch.draw(shader)
    
    def draw_points(self, context):
        if not layout_data["points"]:
            return
        
        shader = gpu.shader.from_builtin('UNIFORM_COLOR')
        point_radius = 0.2
        
        # Draw regular points as circles
        for point in layout_data["points"]:
            coords = self.circle_coords(point[0], point[1], point_radius, segments=16)
            batch = batch_for_shader(shader, 'LINE_LOOP', {"pos": coords})
            shader.bind()
            shader.uniform_float("color", (0.0, 1.0, 0.5, 1.0))
            batch.draw(shader)
        
        # Draw selected point (larger, filled)
        if layout_data["selected_point"] is not None:
            coords = self.circle_coords(layout_data["selected_point"][0], 
                                       layout_data["selected_point"][1], 
                                       point_radius * 1.5, segments=16)
            batch = batch_for_shader(shader, 'TRI_FAN', {"pos": coords})
            shader.bind()
            shader.uniform_float("color", (1.0, 0.0, 0.0, 1.0))
            batch.draw(shader)
    
    def circle_coords(self, cx, cy, radius, segments=16):
        """Generate coordinates for a circle"""
        coords = []
        import math
        for i in range(segments):
            angle = 2.0 * math.pi * i / segments
            x = cx + radius * math.cos(angle)
            y = cy + radius * math.sin(angle)
            coords.append((x, y, 0))
        return coords
    
    def draw_ui_text(self):
        import blf
        import gpu
        from gpu_extras.batch import batch_for_shader
        
        # Draw background panel
        shader = gpu.shader.from_builtin('UNIFORM_COLOR')
        
        # Panel coordinates (top-left corner, 20px from edges)
        panel_x = 20
        panel_y_top = -60  # From top of viewport
        panel_width = 800
        panel_height = 130
        
        # Get actual viewport dimensions
        region_width = bpy.context.region.width if bpy.context.region else 1920
        region_height = bpy.context.region.height if bpy.context.region else 1080
        
        # Convert to screen space (top-left is 0,0)
        screen_y_top = region_height + panel_y_top
        
        # Panel corners in screen space
        coords = [
            (panel_x, screen_y_top),
            (panel_x + panel_width, screen_y_top),
            (panel_x + panel_width, screen_y_top - panel_height),
            (panel_x, screen_y_top - panel_height),
        ]
        
        batch = batch_for_shader(shader, 'TRI_FAN', {"pos": coords})
        shader.bind()
        shader.uniform_float("color", (0.1, 0.1, 0.1, 0.8))
        batch.draw(shader)
        
        # Draw border
        border_coords = [
            (panel_x, screen_y_top),
            (panel_x + panel_width, screen_y_top),
            (panel_x + panel_width, screen_y_top - panel_height),
            (panel_x, screen_y_top - panel_height),
            (panel_x, screen_y_top),
        ]
        
        batch = batch_for_shader(shader, 'LINE_STRIP', {"pos": border_coords})
        shader.bind()
        shader.uniform_float("color", (0.5, 0.5, 0.5, 1.0))
        batch.draw(shader)
        
        # Draw text inside panel
        font_id = 0
        text_x = panel_x + 15
        text_y_base = screen_y_top - 30
        
        # Line 1: Stats
        blf.position(font_id, text_x, text_y_base, 0)
        blf.size(font_id, 20)
        blf.draw(font_id, f"Points: {len(layout_data['points'])} | Edges: {len(layout_data['edges'])}")
        
        # Line 2: Grid info
        blf.position(font_id, text_x, text_y_base - 30, 0)
        blf.size(font_id, 16)
        text = f"Grid: {layout_data['grid_size']:.1f} | Snap: {'ON' if layout_data['snap_to_grid'] else 'OFF'}"
        blf.draw(font_id, text)
        
        # Line 3: Controls
        blf.position(font_id, text_x, text_y_base - 60, 0)
        blf.size(font_id, 13)
        blf.draw(font_id, "LMB: Place/Connect | RMB: Delete | MMB: Deselect | G/H: Grid | S: Snap | E: Export | C: Clear | ESC: Exit")
    
    def export_layout(self):
        data = {
            "points": layout_data["points"],
            "edges": layout_data["edges"]
        }
        
        filepath = bpy.path.abspath("//floor_plan_layout.json")
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"Layout exported to {filepath}")
    
    def execute(self, context):
        wm = context.window_manager
        self._timer = wm.event_timer_add(0.016, window=context.window)
        wm.modal_handler_add(self)
        
        # Register 3D drawing (world space)
        self._draw_handle_3d = bpy.types.SpaceView3D.draw_handler_add(
            self.draw_callback_3d, (context,), 'WINDOW', 'POST_VIEW')
        
        # Register UI drawing (screen space)
        self._draw_handle_ui = bpy.types.SpaceView3D.draw_handler_add(
            self.draw_callback_ui, (context,), 'WINDOW', 'POST_PIXEL')
        
        return {'RUNNING_MODAL'}
    
    def finish(self, context):
        wm = context.window_manager
        wm.event_timer_remove(self._timer)
        bpy.types.SpaceView3D.draw_handler_remove(self._draw_handle_3d, 'WINDOW')
        bpy.types.SpaceView3D.draw_handler_remove(self._draw_handle_ui, 'WINDOW')


def menu_func(self, context):
    self.layout.operator(FloorPlanLayout.bl_idname, text="Floor Plan Layout Editor")


def register():
    bpy.utils.register_class(FloorPlanLayout)
    bpy.types.VIEW3D_MT_object.append(menu_func)


def unregister():
    bpy.utils.unregister_class(FloorPlanLayout)
    bpy.types.VIEW3D_MT_object.remove(menu_func)


if __name__ == "__main__":
    register()