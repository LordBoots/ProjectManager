"""House Shell Generator - Blueprint mode (core feature).

A modal viewport editor (modeled on the working Floor Plan editor) that lets the
user draw a grid-snapped floor plan. The grid cell is fixed at 1.25m (half-wall
width) so every point and edge lands on a valid wall boundary.

Edges are colour-coded so the user sees how each wall run subdivides BEFORE
generating:
  - full 2.5m increments -> FULL_COLOR
  - the leftover 1.25m half-wall increment (odd spans) -> HALF_COLOR
  - diagonal / off-axis edges -> INVALID_COLOR

On finish the drawn graph is converted into one or more closed rectilinear
loops; each loop becomes a shell footprint fed to the same placement pipeline.
"""

import math

import bpy
import blf
import gpu
from gpu_extras.batch import batch_for_shader
from bpy_extras import view3d_utils

from . import core

# Persisted between editor sessions so "Generate Shells" can read the result.
blueprint_data = {
    "points": [],          # list of [x, y, 0]
    "edges": [],           # list of (i, j) index pairs
    "selected_point": None,  # index into points, or None
}

GRID = core.GRID                      # 1.25m
GRID_RANGE = 24                       # how many cells to draw each way
POINT_RADIUS = 0.18
PICK_THRESHOLD = GRID * 0.45

GRID_COLOR = (0.30, 0.30, 0.30, 0.45)
AXIS_COLOR = (0.45, 0.45, 0.55, 0.7)
FULL_COLOR = (0.20, 0.60, 1.00, 1.0)   # full 2.5m wall segments
HALF_COLOR = (1.00, 0.55, 0.10, 1.0)   # leftover 1.25m half-wall segment
INVALID_COLOR = (1.00, 0.15, 0.15, 1.0)  # diagonal / off-grid edges
POINT_COLOR = (0.0, 1.0, 0.5, 1.0)
SELECTED_COLOR = (1.0, 0.0, 0.0, 1.0)


# --- public API used by the generate operator --------------------------------

def clear_blueprint():
    blueprint_data["points"] = []
    blueprint_data["edges"] = []
    blueprint_data["selected_point"] = None


def has_blueprint():
    return bool(blueprint_data["points"]) and bool(blueprint_data["edges"])


def get_blueprint_loops():
    """Return a list of CCW vertex loops extracted from the drawn graph.

    Uses a planar face-finding traversal so internal/shared walls (degree-3+
    junctions) are handled: every enclosed cell becomes its own loop. Collinear
    vertices are merged so each loop edge is one wall side.
    """
    points = [(p[0], p[1]) for p in blueprint_data["points"]]
    edges = blueprint_data["edges"]
    return _extract_loops(points, edges)


def _extract_loops(points, edges):
    """Find every minimal enclosed face of the (planar) drawn graph.

    Method: build directed half-edges and, at each vertex, sort neighbors by
    angle. Walking a half-edge u->v, the next face edge is the neighbor of v
    immediately clockwise from the reverse direction (v->u). This carves out
    each interior face (CCW / positive signed area). Each connected component's
    single outer boundary comes out clockwise (negative) and is discarded.
    """
    if not edges:
        return []

    adj = {}
    for a, b in edges:
        if a == b:
            continue
        adj.setdefault(a, [])
        adj.setdefault(b, [])
        if b not in adj[a]:
            adj[a].append(b)
        if a not in adj[b]:
            adj[b].append(a)

    def angle(u, v):
        return math.atan2(points[v][1] - points[u][1],
                          points[v][0] - points[u][0])

    for u in adj:
        adj[u].sort(key=lambda v, u=u: angle(u, v))

    def next_half_edge(u, v):
        # at v, find where we came from (u) and step to the previous neighbor
        # in CCW order -> the most clockwise turn -> traces interior faces CW.
        nbrs = adj[v]
        i = nbrs.index(u)
        return v, nbrs[(i - 1) % len(nbrs)]

    visited = set()
    loops = []
    for a, b in edges:
        if a == b:
            continue
        for u0, v0 in ((a, b), (b, a)):
            if (u0, v0) in visited:
                continue
            face = []
            u, v = u0, v0
            guard = 0
            limit = 4 * len(edges) + 8
            while (u, v) not in visited:
                visited.add((u, v))
                face.append(u)
                u, v = next_half_edge(u, v)
                guard += 1
                if guard > limit:
                    face = []
                    break
            if len(face) < 3:
                continue
            verts = [points[i] for i in face]
            if core.signed_area(verts) <= 1e-9:
                continue  # outer boundary (CW) / degenerate -> skip
            merged = _merge_collinear(verts)
            if len(merged) >= 3:
                loops.append(core.ensure_ccw(merged))
    return loops


def _merge_collinear(verts):
    """Merge consecutive collinear vertices in a closed loop."""
    n = len(verts)
    out = []
    for i in range(n):
        prev = verts[(i - 1) % n]
        cur = verts[i]
        nxt = verts[(i + 1) % n]
        d1 = (cur[0] - prev[0], cur[1] - prev[1])
        d2 = (nxt[0] - cur[0], nxt[1] - cur[1])
        cross = d1[0] * d2[1] - d1[1] * d2[0]
        if abs(cross) > 1e-6:  # direction changes here -> keep corner
            out.append(cur)
    return out


# --- modal operator ----------------------------------------------------------

class HSG_OT_draw_blueprint(bpy.types.Operator):
    """Draw a grid-snapped floor plan for Blueprint mode"""
    bl_idname = "hsg.draw_blueprint"
    bl_label = "Draw Blueprint"
    bl_options = {'REGISTER'}

    _draw_handle_3d = None
    _draw_handle_ui = None

    def modal(self, context, event):
        if context.area:
            context.area.tag_redraw()

        if event.type in {'ESC', 'RET', 'NUMPAD_ENTER'} and event.value == 'PRESS':
            self.finish(context)
            return {'FINISHED'}

        # Let the user navigate the viewport.
        if event.type in {'MIDDLEMOUSE', 'WHEELUPMOUSE', 'WHEELDOWNMOUSE'}:
            return {'PASS_THROUGH'}

        if event.type == 'LEFTMOUSE' and event.value == 'PRESS':
            self.handle_click(context, event)
            return {'RUNNING_MODAL'}

        if event.type == 'RIGHTMOUSE' and event.value == 'PRESS':
            self.delete_at_mouse(context, event)
            return {'RUNNING_MODAL'}

        if event.type == 'C' and event.value == 'PRESS':
            clear_blueprint()
            return {'RUNNING_MODAL'}

        if event.type == 'X' and event.value == 'PRESS':
            blueprint_data["selected_point"] = None
            return {'RUNNING_MODAL'}

        return {'PASS_THROUGH'}

    # -- input -> world position ---------------------------------------------
    def mouse_to_grid(self, context, event):
        region = context.region
        rv3d = context.region_data
        if region is None or rv3d is None:
            return None
        coord = (event.mouse_region_x, event.mouse_region_y)
        view_vec = view3d_utils.region_2d_to_vector_3d(region, rv3d, coord)
        origin = view3d_utils.region_2d_to_origin_3d(region, rv3d, coord)
        if abs(view_vec.z) < 1e-9:
            return None
        t = -origin.z / view_vec.z
        world = origin + view_vec * t
        x = round(world.x / GRID) * GRID
        y = round(world.y / GRID) * GRID
        return (x, y)

    def point_index_at(self, pos):
        for i, p in enumerate(blueprint_data["points"]):
            if math.hypot(pos[0] - p[0], pos[1] - p[1]) < PICK_THRESHOLD:
                return i
        return None

    def handle_click(self, context, event):
        pos = self.mouse_to_grid(context, event)
        if pos is None:
            return
        idx = self.point_index_at(pos)
        sel = blueprint_data["selected_point"]
        if idx is not None:
            if sel is None:
                blueprint_data["selected_point"] = idx
            elif sel == idx:
                blueprint_data["selected_point"] = None
            else:
                edge = (sel, idx) if sel < idx else (idx, sel)
                if edge not in blueprint_data["edges"]:
                    blueprint_data["edges"].append(edge)
                blueprint_data["selected_point"] = idx  # chain drawing
        else:
            blueprint_data["points"].append([pos[0], pos[1], 0.0])
            new_idx = len(blueprint_data["points"]) - 1
            if sel is not None:
                edge = (sel, new_idx) if sel < new_idx else (new_idx, sel)
                if edge not in blueprint_data["edges"]:
                    blueprint_data["edges"].append(edge)
            blueprint_data["selected_point"] = new_idx  # chain drawing

    def delete_at_mouse(self, context, event):
        pos = self.mouse_to_grid(context, event)
        if pos is None:
            return
        idx = self.point_index_at(pos)
        if idx is None:
            return
        blueprint_data["points"].pop(idx)
        kept = []
        for a, b in blueprint_data["edges"]:
            if a == idx or b == idx:
                continue
            a = a - 1 if a > idx else a
            b = b - 1 if b > idx else b
            kept.append((a, b) if a < b else (b, a))
        blueprint_data["edges"] = kept
        sel = blueprint_data["selected_point"]
        if sel == idx:
            blueprint_data["selected_point"] = None
        elif sel is not None and sel > idx:
            blueprint_data["selected_point"] = sel - 1

    # -- drawing --------------------------------------------------------------
    def draw_callback_3d(self, context):
        try:
            shader = gpu.shader.from_builtin('UNIFORM_COLOR')
            gpu.state.blend_set('ALPHA')
            self.draw_grid(shader)
            self.draw_edges(shader)
            self.draw_points(shader)
            gpu.state.blend_set('NONE')
        except Exception as exc:  # never let a draw error kill the modal
            print("Blueprint 3D draw error:", exc)

    def draw_grid(self, shader):
        coords = []
        extent = GRID_RANGE * GRID
        for i in range(-GRID_RANGE, GRID_RANGE + 1):
            coords.append((i * GRID, -extent, 0.0))
            coords.append((i * GRID, extent, 0.0))
            coords.append((-extent, i * GRID, 0.0))
            coords.append((extent, i * GRID, 0.0))
        batch = batch_for_shader(shader, 'LINES', {"pos": coords})
        shader.bind()
        shader.uniform_float("color", GRID_COLOR)
        batch.draw(shader)
        # axes
        axis = [(-extent, 0, 0), (extent, 0, 0), (0, -extent, 0), (0, extent, 0)]
        batch = batch_for_shader(shader, 'LINES', {"pos": axis})
        shader.bind()
        shader.uniform_float("color", AXIS_COLOR)
        batch.draw(shader)

    def draw_edges(self, shader):
        full_seg = []
        half_seg = []
        invalid_seg = []
        pts = blueprint_data["points"]
        for a, b in blueprint_data["edges"]:
            if a >= len(pts) or b >= len(pts):
                continue
            p1 = pts[a]
            p2 = pts[b]
            dx = p2[0] - p1[0]
            dy = p2[1] - p1[1]
            if abs(dx) > 1e-6 and abs(dy) > 1e-6:
                invalid_seg.extend([(p1[0], p1[1], 0.0), (p2[0], p2[1], 0.0)])
                continue
            length = math.hypot(dx, dy)
            units = int(round(length / GRID))
            if units <= 0:
                continue
            ux = dx / units if units else 0.0
            uy = dy / units if units else 0.0
            has_half = units % 2 == 1
            for k in range(units):
                s = (p1[0] + ux * k, p1[1] + uy * k, 0.0)
                e = (p1[0] + ux * (k + 1), p1[1] + uy * (k + 1), 0.0)
                if has_half and k == units - 1:
                    half_seg.extend([s, e])
                else:
                    full_seg.extend([s, e])

        for seg, color in ((full_seg, FULL_COLOR),
                           (half_seg, HALF_COLOR),
                           (invalid_seg, INVALID_COLOR)):
            if not seg:
                continue
            gpu.state.line_width_set(3.0)
            batch = batch_for_shader(shader, 'LINES', {"pos": seg})
            shader.bind()
            shader.uniform_float("color", color)
            batch.draw(shader)
        gpu.state.line_width_set(1.0)

    def draw_points(self, shader):
        for i, p in enumerate(blueprint_data["points"]):
            selected = (i == blueprint_data["selected_point"])
            color = SELECTED_COLOR if selected else POINT_COLOR
            radius = POINT_RADIUS * (1.5 if selected else 1.0)
            coords = self._circle(p[0], p[1], radius)
            mode = 'TRI_FAN' if selected else 'LINE_LOOP'
            batch = batch_for_shader(shader, mode, {"pos": coords})
            shader.bind()
            shader.uniform_float("color", color)
            batch.draw(shader)

    @staticmethod
    def _circle(cx, cy, radius, segments=16):
        return [(cx + radius * math.cos(2 * math.pi * i / segments),
                 cy + radius * math.sin(2 * math.pi * i / segments), 0.0)
                for i in range(segments)]

    def draw_callback_ui(self, context):
        try:
            self._draw_hud(context)
        except Exception as exc:
            print("Blueprint UI draw error:", exc)

    def _draw_hud(self, context):
        region = context.region
        width = region.width if region else 1920
        height = region.height if region else 1080

        panel_w = 760
        panel_h = 96
        x0 = 16
        y_top = height - 16

        shader = gpu.shader.from_builtin('UNIFORM_COLOR')
        gpu.state.blend_set('ALPHA')
        bg = [(x0, y_top), (x0 + panel_w, y_top),
              (x0 + panel_w, y_top - panel_h), (x0, y_top - panel_h)]
        batch = batch_for_shader(shader, 'TRI_FAN', {"pos": bg})
        shader.bind()
        shader.uniform_float("color", (0.08, 0.08, 0.08, 0.82))
        batch.draw(shader)
        gpu.state.blend_set('NONE')

        font_id = 0
        loops = get_blueprint_loops()
        tx = x0 + 14
        blf.color(font_id, 1, 1, 1, 1)
        blf.size(font_id, 18)
        blf.position(font_id, tx, y_top - 26, 0)
        blf.draw(font_id, "Blueprint  |  Points: %d   Edges: %d   Closed loops: %d   Grid: %.2fm"
                 % (len(blueprint_data["points"]), len(blueprint_data["edges"]),
                    len(loops), GRID))
        blf.size(font_id, 13)
        blf.position(font_id, tx, y_top - 50, 0)
        blf.draw(font_id, "Blue = full 2.5m   Orange = half 1.25m   Red = invalid (diagonal)")
        blf.position(font_id, tx, y_top - 72, 0)
        blf.draw(font_id, "LMB: place / connect   RMB: delete   X: deselect   C: clear   ESC/Enter: finish")

    # -- lifecycle ------------------------------------------------------------
    def invoke(self, context, event):
        if context.area is None or context.area.type != 'VIEW_3D':
            self.report({'WARNING'}, "Blueprint editor must be started in a 3D Viewport.")
            return {'CANCELLED'}
        self._draw_handle_3d = bpy.types.SpaceView3D.draw_handler_add(
            self.draw_callback_3d, (context,), 'WINDOW', 'POST_VIEW')
        self._draw_handle_ui = bpy.types.SpaceView3D.draw_handler_add(
            self.draw_callback_ui, (context,), 'WINDOW', 'POST_PIXEL')
        context.window_manager.modal_handler_add(self)
        context.area.tag_redraw()
        return {'RUNNING_MODAL'}

    def finish(self, context):
        if self._draw_handle_3d is not None:
            bpy.types.SpaceView3D.draw_handler_remove(self._draw_handle_3d, 'WINDOW')
            self._draw_handle_3d = None
        if self._draw_handle_ui is not None:
            bpy.types.SpaceView3D.draw_handler_remove(self._draw_handle_ui, 'WINDOW')
            self._draw_handle_ui = None
        if context.area:
            context.area.tag_redraw()
        loops = get_blueprint_loops()
        self.report({'INFO'}, "Blueprint captured: %d closed loop(s)." % len(loops))


class HSG_OT_clear_blueprint(bpy.types.Operator):
    """Clear the stored blueprint drawing"""
    bl_idname = "hsg.clear_blueprint"
    bl_label = "Clear Blueprint"
    bl_options = {'REGISTER'}

    def execute(self, context):
        clear_blueprint()
        self.report({'INFO'}, "Blueprint cleared.")
        return {'FINISHED'}


classes = (
    HSG_OT_draw_blueprint,
    HSG_OT_clear_blueprint,
)
