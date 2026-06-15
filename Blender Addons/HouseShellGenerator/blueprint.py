"""House Shell Generator - Blueprint mode (core feature).

Persistent split-pane editor: a dedicated 3D viewport shows only the GPU grid
overlay (scene objects hidden per-viewport), locked top ortho, with input scoped
to that pane so the work viewport and N-panel stay fully usable. Generate Shells
reads blueprint_data at any time — no enter/exit mode step.
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

BLUEPRINT_VIEW_LAYER = "HSG_Blueprint"

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

_OBJECT_TYPE_FLAGS = (
    "show_object_viewport_mesh",
    "show_object_viewport_curve",
    "show_object_viewport_surf",
    "show_object_viewport_meta",
    "show_object_viewport_font",
    "show_object_viewport_hair",
    "show_object_viewport_pointcloud",
    "show_object_viewport_volume",
    "show_object_viewport_gpencil",
    "show_object_viewport_armature",
    "show_object_viewport_lattice",
    "show_object_viewport_empty",
    "show_object_viewport_light",
    "show_object_viewport_camera",
    "show_object_viewport_speaker",
)


# --- public API used by the generate operator --------------------------------

def clear_blueprint():
    blueprint_data["points"] = []
    blueprint_data["edges"] = []
    blueprint_data["selected_point"] = None


def has_blueprint():
    return bool(blueprint_data["points"]) and bool(blueprint_data["edges"])


def get_blueprint_loops():
    """Return a list of CCW vertex loops extracted from the drawn graph."""
    points = [(p[0], p[1]) for p in blueprint_data["points"]]
    edges = blueprint_data["edges"]
    return _extract_loops(points, edges)


def blueprint_editor_active():
    session = _get_session()
    return session is not None and session.is_active()


def _extract_loops(points, edges):
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
                continue
            merged = _merge_collinear(verts)
            if len(merged) >= 3:
                loops.append(core.ensure_ccw(merged))
    return loops


def _merge_collinear(verts):
    n = len(verts)
    out = []
    for i in range(n):
        prev = verts[(i - 1) % n]
        cur = verts[i]
        nxt = verts[(i + 1) % n]
        d1 = (cur[0] - prev[0], cur[1] - prev[1])
        d2 = (nxt[0] - cur[0], nxt[1] - cur[1])
        cross = d1[0] * d2[1] - d1[1] * d2[0]
        if abs(cross) > 1e-6:
            out.append(cur)
    return out


# --- view layer (optional separate-window workflow) --------------------------

def ensure_blueprint_view_layer(scene):
    """View layer with every collection excluded — for a dedicated window."""
    if BLUEPRINT_VIEW_LAYER in scene.view_layers:
        return scene.view_layers[BLUEPRINT_VIEW_LAYER]
    view_layer = scene.view_layers.new(BLUEPRINT_VIEW_LAYER)
    _exclude_layer_collection_tree(view_layer.layer_collection)
    return view_layer


def _exclude_layer_collection_tree(layer_collection):
    layer_collection.exclude = True
    for child in layer_collection.children:
        _exclude_layer_collection_tree(child)


# --- blueprint pane setup ----------------------------------------------------

def _window_region(area):
    for region in area.regions:
        if region.type == 'WINDOW':
            return region
    return None


def _configure_blueprint_viewport(context, area):
    """Top ortho, no scene clutter — only our GPU overlay remains visible."""
    space = area.spaces.active
    if space.type != 'VIEW_3D':
        return

    region = _window_region(area)
    if region is not None:
        override = context.copy()
        override["window"] = context.window
        override["screen"] = context.screen
        override["area"] = area
        override["region"] = region
        override["space_data"] = space
        with context.temp_override(**override):
            bpy.ops.view3d.view_axis(type='TOP')

    rv3d = space.region_3d
    if rv3d is not None:
        rv3d.view_perspective = 'ORTHO'
        rv3d.view_distance = GRID_RANGE * GRID * 1.15
        if hasattr(rv3d, "lock_rotation"):
            rv3d.lock_rotation = True

    if hasattr(space, "show_gizmo"):
        space.show_gizmo = False

    overlay = space.overlay
    overlay.show_floor = False
    overlay.show_ortho_grid = False
    overlay.show_axis_x = False
    overlay.show_axis_y = False
    overlay.show_axis_z = False
    overlay.show_outline_selected = False
    overlay.show_extras = False
    overlay.show_relationship_lines = False

    for flag in _OBJECT_TYPE_FLAGS:
        if hasattr(space, flag):
            setattr(space, flag, False)


# --- drawing (GPU) -----------------------------------------------------------

def _draw_grid(shader):
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
    axis = [(-extent, 0, 0), (extent, 0, 0), (0, -extent, 0), (0, extent, 0)]
    batch = batch_for_shader(shader, 'LINES', {"pos": axis})
    shader.bind()
    shader.uniform_float("color", AXIS_COLOR)
    batch.draw(shader)


def _draw_edges(shader):
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


def _circle(cx, cy, radius, segments=16):
    return [(cx + radius * math.cos(2 * math.pi * i / segments),
             cy + radius * math.sin(2 * math.pi * i / segments), 0.0)
            for i in range(segments)]


def _draw_points(shader):
    for i, p in enumerate(blueprint_data["points"]):
        selected = (i == blueprint_data["selected_point"])
        color = SELECTED_COLOR if selected else POINT_COLOR
        radius = POINT_RADIUS * (1.5 if selected else 1.0)
        coords = _circle(p[0], p[1], radius)
        mode = 'TRI_FAN' if selected else 'LINE_LOOP'
        batch = batch_for_shader(shader, mode, {"pos": coords})
        shader.bind()
        shader.uniform_float("color", color)
        batch.draw(shader)


def _draw_hud(region):
    width = region.width if region else 1920
    height = region.height if region else 1080

    panel_w = min(760, max(320, width - 32))
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
    blf.draw(font_id, "Blueprint  |  Points: %d   Edges: %d   Loops: %d   Grid: %.2fm"
             % (len(blueprint_data["points"]), len(blueprint_data["edges"]),
                len(loops), GRID))
    blf.size(font_id, 13)
    blf.position(font_id, tx, y_top - 50, 0)
    blf.draw(font_id, "Blue = 2.5m   Orange = 1.25m   Red = invalid")
    blf.position(font_id, tx, y_top - 72, 0)
    blf.draw(font_id, "LMB: place/connect   RMB: delete   X: deselect   C: clear")


# --- input helpers -----------------------------------------------------------

def _mouse_to_grid(area, event):
    region = _window_region(area)
    space = area.spaces.active
    if region is None or space.type != 'VIEW_3D':
        return None
    rv3d = space.region_3d
    if rv3d is None:
        return None
    coord = (event.mouse_x - region.x, event.mouse_y - region.y)
    view_vec = view3d_utils.region_2d_to_vector_3d(region, rv3d, coord)
    origin = view3d_utils.region_2d_to_origin_3d(region, rv3d, coord)
    if abs(view_vec.z) < 1e-9:
        return None
    t = -origin.z / view_vec.z
    world = origin + view_vec * t
    x = round(world.x / GRID) * GRID
    y = round(world.y / GRID) * GRID
    return (x, y)


def _point_index_at(pos):
    for i, p in enumerate(blueprint_data["points"]):
        if math.hypot(pos[0] - p[0], pos[1] - p[1]) < PICK_THRESHOLD:
            return i
    return None


def _handle_click(area, event):
    pos = _mouse_to_grid(area, event)
    if pos is None:
        return
    idx = _point_index_at(pos)
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
            blueprint_data["selected_point"] = idx
    else:
        blueprint_data["points"].append([pos[0], pos[1], 0.0])
        new_idx = len(blueprint_data["points"]) - 1
        if sel is not None:
            edge = (sel, new_idx) if sel < new_idx else (new_idx, sel)
            if edge not in blueprint_data["edges"]:
                blueprint_data["edges"].append(edge)
        blueprint_data["selected_point"] = new_idx


def _delete_at_mouse(area, event):
    pos = _mouse_to_grid(area, event)
    if pos is None:
        return
    idx = _point_index_at(pos)
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


# --- persistent split-pane session -------------------------------------------

_session = None


def _get_session():
    return _session


class BlueprintViewSession:
    def __init__(self, area):
        self.area_ptr = area.as_pointer()
        self.draw_handle_3d = None
        self.draw_handle_ui = None
        self.stop_requested = False

    def get_area(self):
        for window in bpy.context.window_manager.windows:
            for area in window.screen.areas:
                if area.as_pointer() == self.area_ptr:
                    return area
        return None

    def is_active(self):
        area = self.get_area()
        return area is not None and area.type == 'VIEW_3D'

    def mouse_in_window_region(self, event):
        area = self.get_area()
        if area is None:
            return False
        region = _window_region(area)
        if region is None:
            return False
        return (region.x <= event.mouse_x < region.x + region.width and
                region.y <= event.mouse_y < region.y + region.height)

    def draw_callback_3d(self, context):
        session = _get_session()
        if session is None or context.area is None:
            return
        if context.area.as_pointer() != session.area_ptr:
            return
        try:
            shader = gpu.shader.from_builtin('UNIFORM_COLOR')
            gpu.state.blend_set('ALPHA')
            _draw_grid(shader)
            _draw_edges(shader)
            _draw_points(shader)
            gpu.state.blend_set('NONE')
        except Exception as exc:
            print("Blueprint 3D draw error:", exc)

    def draw_callback_ui(self, context):
        session = _get_session()
        if session is None or context.area is None:
            return
        if context.area.as_pointer() != session.area_ptr:
            return
        if context.region is None or context.region.type != 'WINDOW':
            return
        try:
            _draw_hud(context.region)
        except Exception as exc:
            print("Blueprint UI draw error:", exc)

    def register_handlers(self):
        self.draw_handle_3d = bpy.types.SpaceView3D.draw_handler_add(
            self.draw_callback_3d, (bpy.context,), 'WINDOW', 'POST_VIEW')
        self.draw_handle_ui = bpy.types.SpaceView3D.draw_handler_add(
            self.draw_callback_ui, (bpy.context,), 'WINDOW', 'POST_PIXEL')

    def unregister_handlers(self):
        if self.draw_handle_3d is not None:
            bpy.types.SpaceView3D.draw_handler_remove(self.draw_handle_3d, 'WINDOW')
            self.draw_handle_3d = None
        if self.draw_handle_ui is not None:
            bpy.types.SpaceView3D.draw_handler_remove(self.draw_handle_ui, 'WINDOW')
            self.draw_handle_ui = None
        area = self.get_area()
        if area is not None:
            area.tag_redraw()

    def close(self):
        self.stop_requested = True
        self.unregister_handlers()


def open_blueprint_view(context):
    global _session
    if _session is not None and _session.is_active():
        return None, "Blueprint editor is already open."

    if context.area is None or context.area.type != 'VIEW_3D':
        return None, "Open the blueprint editor from a 3D Viewport."

    ensure_blueprint_view_layer(context.scene)

    screen = context.screen
    original_ptr = context.area.as_pointer()
    before = {area.as_pointer() for area in screen.areas}

    override = context.copy()
    override["window"] = context.window
    override["screen"] = screen
    override["area"] = context.area
    override["region"] = context.region
    with context.temp_override(**override):
        bpy.ops.screen.area_split(direction='VERTICAL', factor=0.55)

    blueprint_area = None
    for area in screen.areas:
        if area.type == 'VIEW_3D' and area.as_pointer() not in before:
            blueprint_area = area
            break
    if blueprint_area is None:
        return None, "Could not create blueprint viewport."

    _configure_blueprint_viewport(context, blueprint_area)

    _session = BlueprintViewSession(blueprint_area)
    _session.register_handlers()
    blueprint_area.tag_redraw()

    bpy.ops.hsg.blueprint_input('INVOKE_DEFAULT')
    return blueprint_area, None


def close_blueprint_view():
    global _session
    if _session is None:
        return False
    _session.close()
    _session = None
    return True


# --- operators ---------------------------------------------------------------

class HSG_OT_open_blueprint_view(bpy.types.Operator):
    """Open a split blueprint editor pane (top ortho, grid overlay only)"""
    bl_idname = "hsg.open_blueprint_view"
    bl_label = "Open Blueprint View"
    bl_options = {'REGISTER'}

    def execute(self, context):
        _, err = open_blueprint_view(context)
        if err:
            self.report({'ERROR'}, err)
            return {'CANCELLED'}
        self.report({'INFO'}, "Blueprint editor open — draw anytime, generate without closing.")
        return {'FINISHED'}


class HSG_OT_close_blueprint_view(bpy.types.Operator):
    """Close the split blueprint editor pane"""
    bl_idname = "hsg.close_blueprint_view"
    bl_label = "Close Blueprint View"
    bl_options = {'REGISTER'}

    @classmethod
    def poll(cls, context):
        return blueprint_editor_active()

    def execute(self, context):
        if close_blueprint_view():
            self.report({'INFO'}, "Blueprint editor closed. Drawing data kept.")
            return {'FINISHED'}
        self.report({'WARNING'}, "Blueprint editor is not open.")
        return {'CANCELLED'}


class HSG_OT_blueprint_input(bpy.types.Operator):
    """Region-scoped blueprint input (internal — started by open view)"""
    bl_idname = "hsg.blueprint_input"
    bl_label = "Blueprint Input"
    bl_options = {'REGISTER'}

    def modal(self, context, event):
        session = _get_session()
        if session is None or session.stop_requested:
            return {'CANCELLED'}

        area = session.get_area()
        if area is None:
            close_blueprint_view()
            return {'CANCELLED'}

        area.tag_redraw()

        if not session.mouse_in_window_region(event):
            return {'PASS_THROUGH'}

        if event.type in {'MIDDLEMOUSE', 'WHEELUPMOUSE', 'WHEELDOWNMOUSE'}:
            return {'PASS_THROUGH'}

        if event.type == 'LEFTMOUSE' and event.value == 'PRESS':
            _handle_click(area, event)
            return {'RUNNING_MODAL'}

        if event.type == 'RIGHTMOUSE' and event.value == 'PRESS':
            _delete_at_mouse(area, event)
            return {'RUNNING_MODAL'}

        if event.type == 'C' and event.value == 'PRESS':
            clear_blueprint()
            return {'RUNNING_MODAL'}

        if event.type == 'X' and event.value == 'PRESS':
            blueprint_data["selected_point"] = None
            return {'RUNNING_MODAL'}

        return {'PASS_THROUGH'}

    def invoke(self, context, event):
        context.window_manager.modal_handler_add(self)
        return {'RUNNING_MODAL'}


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
    HSG_OT_open_blueprint_view,
    HSG_OT_close_blueprint_view,
    HSG_OT_blueprint_input,
    HSG_OT_clear_blueprint,
)
