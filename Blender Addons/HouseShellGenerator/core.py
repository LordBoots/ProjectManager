"""House Shell Generator - core logic.

Pure generation logic plus the placement layer:
  - data model (Slot / Edge / Shell)
  - name parsing for wall/pillar objects and collections
  - model index (grouped by height pool / style / width / category)
  - width subdivision (2.5m + 1.25m slots)
  - geometry helpers (winding, outward normal -> rotation)
  - shell realization (instancing walls/pillars, parenting) and door post-processing

Random Grid mode and Blueprint mode both produce a CCW list of footprint
vertices and feed the SAME realization pipeline (realize_shell).
"""

import math
import re

import bpy
from mathutils import Vector

# --- constants ---------------------------------------------------------------

FULL_WIDTH = 2.5
HALF_WIDTH = 1.25
GRID = 1.25            # blueprint grid cell / snap increment (half-wall width)
MIN_SIDE = 2.5        # a wall side must be at least two... actually >= 1 full wall

GENERATED_COLLECTION = "Generated_Shells"

# Type-name keyword -> category. Anything not matched is treated as a window.
PLAIN_KEYWORD = "Plain"
HALF_KEYWORD = "Half"
DOOR_KEYWORD = "Door"


# --- data model --------------------------------------------------------------

class Slot:
    """A single wall position within an edge."""
    __slots__ = ("width", "category", "style", "source", "obj")

    def __init__(self, width, category, style, source):
        self.width = width          # 2.5 or 1.25
        self.category = category    # 'Plain' | 'Window' | 'Half' | 'Door'
        self.style = style
        self.source = source        # source bpy object to instance
        self.obj = None             # the placed instance (filled during realize)


class Edge:
    """One straight wall side of a shell footprint."""
    __slots__ = ("start", "end", "direction", "length", "slots")

    def __init__(self, start, end, direction, length):
        self.start = start          # (x, y)
        self.end = end              # (x, y)
        self.direction = direction  # 'X+' | 'X-' | 'Y+' | 'Y-'
        self.length = length
        self.slots = []


class Shell:
    """A generated shell: an ordered edge loop plus chosen height pool."""
    __slots__ = ("name", "loop", "height_pool", "edges", "empty", "walls")

    def __init__(self, name, loop, height_pool):
        self.name = name
        self.loop = loop            # CCW list of (x, y) vertices
        self.height_pool = height_pool
        self.edges = []
        self.empty = None
        self.walls = []             # list of placed Slot objects (for door step)


# --- name parsing ------------------------------------------------------------

_BRACKET_RE = re.compile(r"^\[(.*)\]$")


def _strip_brackets(name):
    m = _BRACKET_RE.match(name.strip())
    return m.group(1) if m else name.strip()


def parse_wall_collection(name):
    """[Walls_<Height>_<Style>] -> (height, style) or None."""
    inner = _strip_brackets(name)
    parts = inner.split("_")
    if len(parts) >= 3 and parts[0] == "Walls":
        return parts[1], parts[2]
    return None


def parse_pillar_collection(name):
    """[Pillars_<Height>] -> height or None."""
    inner = _strip_brackets(name)
    parts = inner.split("_")
    if len(parts) >= 2 and parts[0] == "Pillars":
        return parts[1]
    return None


def parse_wall_object(name):
    """Parse a wall or door source object name -> dict or None.

    Wall objects: [Wall_<Height>_<Style>_<Type>_<Index>]
    Door objects: [Door_<Height>_<Style>_<Index>] or
                  [Door_<Height>_<Style>_Door_<Index>]

    Returns {height, style, type_name, category, width}.
    Style is assumed to be a single token (no underscores), which matches the
    naming convention in the plan.
    """
    inner = _strip_brackets(name)
    parts = inner.split("_")
    if len(parts) < 4:
        return None

    if parts[0] == "Wall":
        height = parts[1]
        style = parts[2]
        type_name = parts[-2]
        category = _category_from_type(type_name)
        width = HALF_WIDTH if HALF_KEYWORD.lower() in type_name.lower() else FULL_WIDTH
    elif parts[0] == "Door":
        height = parts[1]
        style = parts[2]
        type_name = parts[-2] if len(parts) >= 5 else DOOR_KEYWORD
        category = "Door"
        width = FULL_WIDTH
    else:
        return None

    return {
        "height": height,
        "style": style,
        "type_name": type_name,
        "category": category,
        "width": width,
    }


def parse_pillar_object(name):
    """[Pillar_<Height>_<Type>_<Index>] -> dict or None."""
    inner = _strip_brackets(name)
    parts = inner.split("_")
    if len(parts) < 3 or parts[0] != "Pillar":
        return None
    return {"height": parts[1], "type_name": parts[2]}


def _category_from_type(type_name):
    low = type_name.lower()
    if low.startswith(PLAIN_KEYWORD.lower()):
        return "Plain"
    if low.startswith(HALF_KEYWORD.lower()):
        return "Half"
    if low.startswith(DOOR_KEYWORD.lower()):
        return "Door"
    return "Window"


# --- model index -------------------------------------------------------------

class ModelIndex:
    """Indexes the selected wall/pillar collections for fast lookup.

    walls[height][style][width] = {category: [bpy_object, ...]}
    doors[height][style][width] = [bpy_object, ...]
    pillars[height][type_name]  = [bpy_object, ...]    (type_name: Corner/Seam)
    """

    def __init__(self):
        self.walls = {}
        self.doors = {}
        self.pillars = {}
        self.errors = []

    # -- build ----------------------------------------------------------------
    def add_wall_collection(self, collection):
        parsed = parse_wall_collection(collection.name)
        if not parsed:
            self.errors.append("Could not parse wall collection: %s" % collection.name)
            return
        height, style = parsed
        for obj in collection.all_objects:
            info = parse_wall_object(obj.name)
            if not info:
                self.errors.append("Could not parse wall object: %s" % obj.name)
                continue
            # trust the collection's height/style as authoritative
            h, s, w, cat = height, style, info["width"], info["category"]
            if cat == "Door":
                self.doors.setdefault(h, {}).setdefault(s, {}).setdefault(w, []).append(obj)
            else:
                bucket = (self.walls.setdefault(h, {})
                          .setdefault(s, {})
                          .setdefault(w, {}))
                bucket.setdefault(cat, []).append(obj)

    def add_pillar_collection(self, collection):
        height = parse_pillar_collection(collection.name)
        if not height:
            self.errors.append("Could not parse pillar collection: %s" % collection.name)
            return
        for obj in collection.all_objects:
            info = parse_pillar_object(obj.name)
            if not info:
                self.errors.append("Could not parse pillar object: %s" % obj.name)
                continue
            self.pillars.setdefault(height, {}).setdefault(info["type_name"], []).append(obj)

    # -- queries --------------------------------------------------------------
    def height_pools(self):
        return [h for h in self.walls.keys()]

    def styles_for_height(self, height):
        return list(self.walls.get(height, {}).keys())

    def wall_bucket(self, height, style, width):
        return self.walls.get(height, {}).get(style, {}).get(width, {})

    def pick_wall(self, rng, height, style, width, want_window, window_room):
        """Pick a wall source object and return (object, category).

        For HALF width returns a 'Half' object. For FULL width chooses between
        Plain and Window per want_window/window_room with graceful fallback.
        """
        bucket = self.wall_bucket(height, style, width)
        if width == HALF_WIDTH:
            lst = bucket.get("Half") or bucket.get("Plain")
            if lst:
                return rng.choice(lst), "Half"
            return None, "Half"

        plains = bucket.get("Plain", [])
        windows = bucket.get("Window", [])
        if want_window and windows and window_room >= width:
            return rng.choice(windows), "Window"
        if plains:
            return rng.choice(plains), "Plain"
        if windows:
            return rng.choice(windows), "Window"
        return None, "Plain"

    def pick_door(self, rng, height, style, width):
        lst = self.doors.get(height, {}).get(style, {}).get(width)
        if lst:
            return rng.choice(lst)
        # fall back to any style of the same height/width
        for s, by_width in self.doors.get(height, {}).items():
            if by_width.get(width):
                return rng.choice(by_width[width])
        return None

    def pick_pillar(self, rng, height, type_name):
        lst = self.pillars.get(height, {}).get(type_name)
        if lst:
            return rng.choice(lst)
        # fall back to any pillar type for the height
        for t, objs in self.pillars.get(height, {}).items():
            if objs:
                return rng.choice(objs)
        return None

    def has_walls(self):
        return bool(self.walls)


def build_model_index(wall_collections, pillar_collections):
    idx = ModelIndex()
    for coll in wall_collections:
        idx.add_wall_collection(coll)
    for coll in pillar_collections:
        idx.add_pillar_collection(coll)
    return idx


# --- width subdivision -------------------------------------------------------

def snap_to_grid(value):
    return round(value / GRID) * GRID


def subdivide_side(length, rng):
    """Return a list of slot widths (2.5 / 1.25) summing to length.

    Fills the side with as many full 2.5m panels as possible and uses a single
    1.25m half panel only to fill the leftover gap when the side is an odd
    multiple of 1.25m. The half's position along the side is randomized.
    length must be a multiple of 1.25m.
    """
    units = int(round(length / HALF_WIDTH))  # number of 1.25m units
    if units <= 0:
        return []
    halves = units % 2          # 0 or 1: only used to fill an odd leftover gap
    fulls = (units - halves) // 2
    widths = [FULL_WIDTH] * fulls + [HALF_WIDTH] * halves
    rng.shuffle(widths)
    return widths


# --- geometry ----------------------------------------------------------------

def signed_area(loop):
    area = 0.0
    n = len(loop)
    for i in range(n):
        x1, y1 = loop[i]
        x2, y2 = loop[(i + 1) % n]
        area += x1 * y2 - x2 * y1
    return area * 0.5


def ensure_ccw(loop):
    """Return the loop wound counter-clockwise (positive signed area)."""
    if signed_area(loop) < 0:
        return list(reversed(loop))
    return list(loop)


def direction_label(travel):
    x, y = travel
    if abs(x) >= abs(y):
        return "X+" if x >= 0 else "X-"
    return "Y+" if y >= 0 else "Y-"


def outward_rotation_z(travel):
    """Z rotation so the model's feature side faces outward.

    Assumes a CCW loop: outward normal = travel rotated -90deg -> (ty, -tx).
    The models' visible features (windows/doors) sit on local -Y, so we rotate
    so local -Y points outward (i.e. local +Y faces the shell interior).
    """
    ox, oy = travel[1], -travel[0]
    return math.atan2(-ox, oy) + math.pi


# --- placement ---------------------------------------------------------------

def get_generated_collection():
    coll = bpy.data.collections.get(GENERATED_COLLECTION)
    if coll is None:
        coll = bpy.data.collections.new(GENERATED_COLLECTION)
        bpy.context.scene.collection.children.link(coll)
    return coll


def clear_generated_collection():
    coll = bpy.data.collections.get(GENERATED_COLLECTION)
    if coll is None:
        return
    for obj in list(coll.all_objects):
        bpy.data.objects.remove(obj, do_unlink=True)


def _instance(source, name, location, rot_z, collection):
    """Create a linked duplicate (shared mesh data) of source."""
    new = source.copy()  # shares .data by default -> linked duplicate
    new.name = name
    new.location = (location[0], location[1], 0.0)
    new.rotation_euler = (0.0, 0.0, rot_z)
    collection.objects.link(new)
    return new


def replace_placed_part(target, source):
    """Delete a placed part and instance the source at the same world transform.

    Returns (new_object, error_message). error_message is None on success.
    """
    if target.type != 'MESH':
        return None, "Target must be a mesh object."
    if source.type != 'MESH':
        return None, "Source must be a mesh object."
    if target == source:
        return None, "Target and source must be different objects."

    parent = target.parent
    matrix = target.matrix_world.copy()
    name = target.name
    collections = list(target.users_collection)

    bpy.data.objects.remove(target, do_unlink=True)

    new = source.copy()
    new.name = name
    for coll in collections:
        if new.name not in coll.objects:
            coll.objects.link(new)
    if parent:
        new.parent = parent
    new.matrix_world = matrix
    return new, None


def describe_part(obj):
    """Human-readable summary from a wall/door/pillar object name, or None."""
    if obj is None:
        return None
    info = parse_wall_object(obj.name)
    if info:
        return "%s / %s / %s m / %s" % (
            info["height"], info["style"], info["width"], info["category"])
    info = parse_pillar_object(obj.name)
    if info:
        return "%s / %s" % (info["height"], info["type_name"])
    return None


def _parent_keep_transform(child, parent):
    child.parent = parent
    child.matrix_parent_inverse = parent.matrix_world.inverted()


def realize_shell(loop, height_pool, styles, settings, rng, midx, shell_name, collection):
    """Instance walls and pillars for one footprint loop. Returns a Shell."""
    loop = ensure_ccw(loop)
    shell = Shell(shell_name, loop, height_pool)

    cx = sum(p[0] for p in loop) / len(loop)
    cy = sum(p[1] for p in loop) / len(loop)

    empty = bpy.data.objects.new(shell_name, None)
    empty.empty_display_type = 'PLAIN_AXES'
    empty.location = (cx, cy, 0.0)
    collection.objects.link(empty)
    shell.empty = empty

    single_style = None if settings.mix_styles else (styles[0] if len(styles) == 1 else rng.choice(styles))

    n = len(loop)
    for i in range(n):
        v1 = loop[i]
        v2 = loop[(i + 1) % n]
        dx, dy = (v2[0] - v1[0]), (v2[1] - v1[1])
        length = math.hypot(dx, dy)
        if length < 1e-6:
            continue
        travel = (dx / length, dy / length)
        edge = Edge(v1, v2, direction_label(travel), length)
        rot_z = outward_rotation_z(travel)

        widths = subdivide_side(length, rng)
        window_budget = 0.8 * length      # windows must be < 80% of a side
        window_used = 0.0
        cum = 0.0
        for si, w in enumerate(widths):
            style = single_style if single_style else rng.choice(styles)
            want_window = (rng.random() > settings.wall_type_probability)
            room = window_budget - window_used - 1e-6
            source, category = midx.pick_wall(rng, height_pool, style, w, want_window, room)
            slot = Slot(w, category, style, source)
            if source is not None:
                center = (v1[0] + travel[0] * (cum + w / 2.0),
                          v1[1] + travel[1] * (cum + w / 2.0))
                inst = _instance(source, "[%s_W]" % shell_name.strip("[]"),
                                 center, rot_z, collection)
                _parent_keep_transform(inst, empty)
                slot.obj = inst
                slot_meta = {
                    "slot": slot,
                    "side": i,
                    "width": w,
                    "category": category,
                    "style": style,
                }
                shell.walls.append(slot_meta)
                if category == "Window":
                    window_used += w
            edge.slots.append(slot)
            cum += w

            # seam pillar between this slot and the next
            if settings.use_seam_pillars and si < len(widths) - 1:
                src = midx.pick_pillar(rng, height_pool, "Seam")
                if src:
                    pt = (v1[0] + travel[0] * cum, v1[1] + travel[1] * cum)
                    p = _instance(src, "[%s_P]" % shell_name.strip("[]"), pt, rot_z, collection)
                    _parent_keep_transform(p, empty)

        # corner pillar at the edge start vertex
        if settings.use_corner_pillars:
            src = midx.pick_pillar(rng, height_pool, "Corner")
            if src:
                p = _instance(src, "[%s_P]" % shell_name.strip("[]"), v1, rot_z, collection)
                _parent_keep_transform(p, empty)

        shell.edges.append(edge)

    return shell


# --- door post-processing ----------------------------------------------------

def apply_doors(shell, settings, rng, midx, report):
    """Swap up to two placed plain (2.5m) walls for doors of the same spec."""
    candidates = [m for m in shell.walls
                  if m["category"] == "Plain" and m["width"] == FULL_WIDTH]
    if not candidates:
        report("Shell %s has no plain walls to convert to a door." % shell.name)
        return 0

    rng.shuffle(candidates)
    used_sides = set()
    placed = 0
    for meta in candidates:
        if placed >= 2:
            break
        if meta["side"] in used_sides:
            continue
        door_src = midx.pick_door(rng, shell.height_pool, meta["style"], FULL_WIDTH)
        if door_src is None:
            continue
        obj = meta["slot"].obj
        obj.data = door_src.data
        meta["slot"].category = "Door"
        meta["category"] = "Door"
        used_sides.add(meta["side"])
        placed += 1

    if placed == 0:
        report("Shell %s: no compatible door models found." % shell.name)
    return placed


# --- footprint producers -----------------------------------------------------

def rectangle_loop(origin_x, origin_y, width, length):
    """CCW rectangle vertices."""
    return [
        (origin_x, origin_y),
        (origin_x + width, origin_y),
        (origin_x + width, origin_y + length),
        (origin_x, origin_y + length),
    ]


def pick_dimension(rng, lo, hi):
    """Pick a 1.25m-snapped dimension within [lo, hi], min one full wall."""
    lo = max(FULL_WIDTH, snap_to_grid(lo))
    hi = max(lo, snap_to_grid(hi))
    units_lo = int(round(lo / GRID))
    units_hi = int(round(hi / GRID))
    return rng.randint(units_lo, units_hi) * GRID
