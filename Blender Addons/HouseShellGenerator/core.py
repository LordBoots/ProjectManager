"""House Shell Generator - pure generation logic (no bpy).

This module holds everything that does NOT need Blender: the edge-based data
model, name parsing, width subdivision, geometry/placement math, the model
index, and the per-shell planning step. Keeping it bpy-free makes the math
testable on its own. The Blender glue lives in __init__.py.
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass, field
from typing import Any, Optional

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

WALL_FULL = 2.5
WALL_HALF = 1.25
STEP = 1.25
MIN_DIMENSION = 5.0  # two full walls
MAX_WINDOW_RATIO = 0.8
MAX_DOORS_PER_SHELL = 2
MAX_DOORS_PER_EDGE = 1

HEIGHTS = ("Tall", "Short")
DIRECTIONS = ("X+", "X-", "Y+", "Y-")

# Outward-facing Z rotation per edge direction, for a CCW perimeter.
# (Authored model "front" ends up facing away from the shell interior.)
DIRECTION_ROTATION = {
    "X+": 0.0,
    "Y+": math.pi / 2,
    "X-": math.pi,
    "Y-": -math.pi / 2,
}

TALL_STYLES = ("BrickWoodBottom", "Brick", "Wood", "Stucco")
SHORT_STYLES = (
    "BrickWoodBottom",
    "Brick",
    "BrickFancy",
    "BrickBrickBottom",
    "Wood",
    "WoodFancy",
    "WoodBrickBottom",
    "Stucco",
)

# ---------------------------------------------------------------------------
# Name parsing  (collections plural, objects singular)
# ---------------------------------------------------------------------------

# Collections (pools)
_WALL_POOL_RE = re.compile(r"^\[Walls_(Tall|Short)_([A-Za-z]+)\]$")
_PILLAR_POOL_RE = re.compile(r"^\[Pillars_(Tall|Short)\]$")

# Objects  (tolerate Blender's .001 duplicate suffix)
_WALL_OBJ_RE = re.compile(r"^\[(Wall|Door)_(Tall|Short)_([A-Za-z]+)_([A-Za-z]+)_(\d+)\](?:\.\d{3})?$")
_PILLAR_OBJ_RE = re.compile(r"^\[Pillar_(Tall|Short)_(Corner|Seam)_(\d+)\](?:\.\d{3})?$")


@dataclass(frozen=True)
class ParsedWall:
    height: str
    style: str
    wall_type: str  # e.g. "Plain_1", "SimpleWindow_1", "Door_2"
    width: float
    is_door: bool
    is_window: bool


@dataclass(frozen=True)
class ParsedPillar:
    height: str
    pillar_type: str  # "Corner" or "Seam"


def parse_wall_pool(name: str) -> Optional[tuple[str, str]]:
    m = _WALL_POOL_RE.match(name.strip())
    return (m.group(1), m.group(2)) if m else None


def parse_pillar_pool(name: str) -> Optional[str]:
    m = _PILLAR_POOL_RE.match(name.strip())
    return m.group(1) if m else None


def parse_wall_object(name: str) -> Optional[ParsedWall]:
    m = _WALL_OBJ_RE.match(name.strip())
    if not m:
        return None
    part, height, style, type_name, index = m.groups()
    wall_type = f"{type_name}_{index}"
    is_door = part == "Door" or type_name == "Door"
    is_window = "Window" in type_name
    width = WALL_HALF if type_name == "Half" else WALL_FULL
    return ParsedWall(height, style, wall_type, width, is_door, is_window)


def parse_pillar_object(name: str) -> Optional[ParsedPillar]:
    m = _PILLAR_OBJ_RE.match(name.strip())
    if not m:
        return None
    return ParsedPillar(m.group(1), m.group(2))


def looks_like_wall_token(name: str) -> bool:
    s = name.strip()
    return s.startswith("[Wall_") or s.startswith("[Door_")


def looks_like_pillar_token(name: str) -> bool:
    return name.strip().startswith("[Pillar_")


# ---------------------------------------------------------------------------
# Data model  (edge-based)
# ---------------------------------------------------------------------------


@dataclass
class Slot:
    index: int
    width: float
    style: str
    wall_type: str
    instance_name: str = ""
    is_door: bool = False
    is_window: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "index": self.index,
            "width": self.width,
            "style": self.style,
            "wall_type": self.wall_type,
            "instance_name": self.instance_name,
            "is_door": self.is_door,
            "is_window": self.is_window,
        }

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> "Slot":
        return cls(
            index=int(d["index"]),
            width=float(d["width"]),
            style=str(d["style"]),
            wall_type=str(d["wall_type"]),
            instance_name=str(d.get("instance_name", "")),
            is_door=bool(d.get("is_door", False)),
            is_window=bool(d.get("is_window", False)),
        )


@dataclass
class Edge:
    index: int
    start: tuple[float, float]
    end: tuple[float, float]
    direction: str
    length: float
    slots: list[Slot] = field(default_factory=list)
    is_exterior: bool = True
    corner_pillar_name: str = ""
    seam_pillar_names: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "index": self.index,
            "start": list(self.start),
            "end": list(self.end),
            "direction": self.direction,
            "length": self.length,
            "slots": [s.to_dict() for s in self.slots],
            "is_exterior": self.is_exterior,
            "corner_pillar_name": self.corner_pillar_name,
            "seam_pillar_names": list(self.seam_pillar_names),
        }

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> "Edge":
        return cls(
            index=int(d["index"]),
            start=(float(d["start"][0]), float(d["start"][1])),
            end=(float(d["end"][0]), float(d["end"][1])),
            direction=str(d["direction"]),
            length=float(d["length"]),
            slots=[Slot.from_dict(s) for s in d.get("slots", [])],
            is_exterior=bool(d.get("is_exterior", True)),
            corner_pillar_name=str(d.get("corner_pillar_name", "")),
            seam_pillar_names=list(d.get("seam_pillar_names", [])),
        )


@dataclass
class Shell:
    shell_id: str
    origin: tuple[float, float, float]
    height: str
    style: str
    width: float
    length: float
    edges: list[Edge] = field(default_factory=list)
    source: str = "random"  # "random" or "blueprint:<name>"
    root_empty_name: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "shell_id": self.shell_id,
            "origin": list(self.origin),
            "height": self.height,
            "style": self.style,
            "width": self.width,
            "length": self.length,
            "edges": [e.to_dict() for e in self.edges],
            "source": self.source,
            "root_empty_name": self.root_empty_name,
        }

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> "Shell":
        return cls(
            shell_id=str(d["shell_id"]),
            origin=(float(d["origin"][0]), float(d["origin"][1]), float(d["origin"][2])),
            height=str(d["height"]),
            style=str(d["style"]),
            width=float(d["width"]),
            length=float(d["length"]),
            edges=[Edge.from_dict(e) for e in d.get("edges", [])],
            source=str(d.get("source", "random")),
            root_empty_name=str(d.get("root_empty_name", "")),
        )


# ---------------------------------------------------------------------------
# Dimension helpers
# ---------------------------------------------------------------------------


def snap(value: float, minimum: float = MIN_DIMENSION) -> float:
    steps = max(1, round(value / STEP))
    return max(minimum, steps * STEP)


def snap_range(low: float, high: float) -> tuple[float, float]:
    lo = snap(low, minimum=MIN_DIMENSION)
    hi = snap(high, minimum=lo)
    return (hi, lo) if lo > hi else (lo, hi)


def random_dimension(rng, low: float, high: float) -> float:
    lo, hi = snap_range(low, high)
    if lo == hi:
        return lo
    steps = int(round((hi - lo) / STEP))
    return lo + rng.randint(0, steps) * STEP


def is_fillable(length: float, eps: float = 1e-6) -> bool:
    units = length / STEP
    return length >= STEP and abs(units - round(units)) < eps


def subdivide_length(length: float, rng) -> list[float]:
    """Split a side length into 2.5m / 1.25m slot widths that sum exactly."""
    if not is_fillable(length):
        raise ValueError(f"Length {length} is not a multiple of {STEP}m.")
    units = int(round(length / STEP))  # number of 1.25m quarters
    widths: list[float] = []
    remaining = units
    while remaining > 0:
        if remaining == 1:
            widths.append(WALL_HALF)
            remaining -= 1
        elif remaining == 2:
            widths.append(WALL_FULL)
            remaining -= 2
        elif remaining == 3:
            if rng.random() < 0.5:
                widths.extend([WALL_FULL, WALL_HALF])
            else:
                widths.extend([WALL_HALF, WALL_FULL])
            remaining = 0
        else:
            if rng.random() < 0.75:
                widths.append(WALL_FULL)
                remaining -= 2
            else:
                widths.append(WALL_HALF)
                remaining -= 1
    return widths


# ---------------------------------------------------------------------------
# Geometry  (edge producers + placement math)
# ---------------------------------------------------------------------------


def build_rectangle_edges(width: float, length: float) -> list[Edge]:
    """4 edges of a rectangle, wound counter-clockwise from (0,0)."""
    if not is_fillable(width) or not is_fillable(length):
        raise ValueError("Rectangle sides must be fillable in 1.25m steps.")
    specs = [
        ((0.0, 0.0), (width, 0.0), "X+", width),
        ((width, 0.0), (width, length), "Y+", length),
        ((width, length), (0.0, length), "X-", width),
        ((0.0, length), (0.0, 0.0), "Y-", length),
    ]
    return [Edge(i, s, e, d, ln) for i, (s, e, d, ln) in enumerate(specs)]


def edges_from_perimeter(points: list[tuple[float, float]]) -> list[Edge]:
    """Build axis-aligned edges from an ordered, closed perimeter loop.

    Consecutive collinear segments are merged. Used by blueprint mode; the
    output feeds the exact same placement pipeline as rectangle edges.
    """
    if len(points) < 4:
        raise ValueError("Perimeter needs at least 4 points.")
    if _signed_area(points) < 0.0:
        points = list(reversed(points))

    raw: list[list] = []
    for i, start in enumerate(points):
        end = points[(i + 1) % len(points)]
        direction, length = _axis_dir_len(start, end)
        raw.append([start, end, direction, length])

    merged: list[list] = []
    for start, end, direction, length in raw:
        if merged and merged[-1][2] == direction:
            merged[-1][1] = end
            merged[-1][3] += length
        else:
            merged.append([start, end, direction, length])
    # wrap-around merge
    if len(merged) > 1 and merged[0][2] == merged[-1][2]:
        merged[0][0] = merged[-1][0]
        merged[0][3] += merged[-1][3]
        merged.pop()

    edges: list[Edge] = []
    for i, (start, end, direction, length) in enumerate(merged):
        edges.append(Edge(i, start, end, direction, snap(length, minimum=STEP)))
    return edges


def _axis_dir_len(start, end, eps: float = 1e-3) -> tuple[str, float]:
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    if abs(dx) > eps and abs(dy) > eps:
        raise ValueError(f"Edge {start}->{end} is not axis-aligned.")
    if abs(dx) <= eps and abs(dy) <= eps:
        raise ValueError("Zero-length edge.")
    if abs(dx) > eps:
        return ("X+" if dx > 0 else "X-"), abs(dx)
    return ("Y+" if dy > 0 else "Y-"), abs(dy)


def _signed_area(points: list[tuple[float, float]]) -> float:
    total = 0.0
    for i, p in enumerate(points):
        q = points[(i + 1) % len(points)]
        total += p[0] * q[1] - q[0] * p[1]
    return total * 0.5


def rotation_for(direction: str) -> float:
    return DIRECTION_ROTATION[direction]


def slot_center(edge: Edge, slot_index: int, slot_width: float, origin) -> tuple[float, float, float]:
    offset = sum(s.width for s in edge.slots[:slot_index])
    sx, sy = edge.start
    ox, oy, oz = origin
    if edge.direction == "X+":
        return (ox + sx + offset + slot_width / 2, oy + sy, oz)
    if edge.direction == "X-":
        return (ox + sx - offset - slot_width / 2, oy + sy, oz)
    if edge.direction == "Y+":
        return (ox + sx, oy + sy + offset + slot_width / 2, oz)
    if edge.direction == "Y-":
        return (ox + sx, oy + sy - offset - slot_width / 2, oz)
    raise ValueError(edge.direction)


def edge_end_point(edge: Edge, origin) -> tuple[float, float, float]:
    ox, oy, oz = origin
    return (ox + edge.end[0], oy + edge.end[1], oz)


def seam_point(edge: Edge, boundary: int, origin) -> tuple[float, float, float]:
    offset = sum(s.width for s in edge.slots[:boundary])
    sx, sy = edge.start
    ox, oy, oz = origin
    if edge.direction == "X+":
        return (ox + sx + offset, oy + sy, oz)
    if edge.direction == "X-":
        return (ox + sx - offset, oy + sy, oz)
    if edge.direction == "Y+":
        return (ox + sx, oy + sy + offset, oz)
    if edge.direction == "Y-":
        return (ox + sx, oy + sy - offset, oz)
    raise ValueError(edge.direction)


# ---------------------------------------------------------------------------
# Model index
# ---------------------------------------------------------------------------


class ModelIndex:
    """Maps parsed model keys to whatever value the caller stores (bpy object
    or, in tests, a name string)."""

    def __init__(self) -> None:
        self.walls: dict[tuple, Any] = {}   # (height, style, width, wall_type)
        self.doors: dict[tuple, Any] = {}   # (height, style, width, wall_type)
        self.pillars: dict[tuple, Any] = {}  # (height, pillar_type)

    def add_wall(self, value: Any, parsed: ParsedWall) -> None:
        key = (parsed.height, parsed.style, parsed.width, parsed.wall_type)
        if parsed.is_door:
            self.doors[key] = value
        else:
            self.walls[key] = value

    def add_pillar(self, value: Any, parsed: ParsedPillar) -> None:
        self.pillars[(parsed.height, parsed.pillar_type)] = value

    def wall(self, height, style, width, wall_type) -> Any:
        return self.walls.get((height, style, width, wall_type))

    def pillar(self, height, pillar_type) -> Any:
        return self.pillars.get((height, pillar_type))

    def styles_for_height(self, height: str) -> list[str]:
        return sorted({k[1] for k in self.walls if k[0] == height})

    def heights(self) -> list[str]:
        return sorted({k[0] for k in self.walls})

    def plain_types(self, height, style, width) -> list[str]:
        return sorted({
            k[3] for k in self.walls
            if k[0] == height and k[1] == style and k[2] == width
            and "Window" not in k[3] and "Door" not in k[3]
        })

    def window_types(self, height, style, width) -> list[str]:
        return sorted({
            k[3] for k in self.walls
            if k[0] == height and k[1] == style and k[2] == width and "Window" in k[3]
        })

    def door_for(self, height, style, width) -> Any:
        for k, v in self.doors.items():
            if k[0] == height and k[1] == style and k[2] == width:
                return v
        return None


# ---------------------------------------------------------------------------
# Per-shell planning  (fill edges with slots + wall types)
# ---------------------------------------------------------------------------


def plan_shell(
    shell: Shell,
    index: ModelIndex,
    rng,
    mix_styles: bool,
    styles: list[str],
    window_probability: float,
) -> list[str]:
    """Subdivide each edge and assign a wall type to every slot. Returns warnings."""
    warnings: list[str] = []
    usable_styles = list(styles) or [shell.style]

    for edge in shell.edges:
        if not edge.is_exterior:
            continue
        widths = subdivide_length(edge.length, rng)
        slots: list[Slot] = []
        for i, width in enumerate(widths):
            style = rng.choice(usable_styles) if mix_styles else shell.style
            wall_type = _pick_wall_type(index, shell.height, style, width, rng, window_probability)
            if wall_type is None:
                warnings.append(f"No wall model for {shell.height}/{style}/{width}m on shell {shell.shell_id}.")
                wall_type = "Plain_1"
            slots.append(Slot(
                index=i,
                width=width,
                style=style,
                wall_type=wall_type,
                is_window="Window" in wall_type,
            ))
        _enforce_window_cap(slots, index, shell.height, rng)
        edge.slots = slots
    return warnings


def _pick_wall_type(index, height, style, width, rng, window_probability) -> Optional[str]:
    plains = index.plain_types(height, style, width)
    windows = index.window_types(height, style, width)
    if not plains and not windows:
        return None
    if windows and plains and rng.random() < window_probability:
        return rng.choice(windows)
    if plains:
        return rng.choice(plains)
    return rng.choice(windows)


def _enforce_window_cap(slots: list[Slot], index, height, rng) -> None:
    if not slots:
        return
    cap = int(len(slots) * MAX_WINDOW_RATIO)
    if cap >= len(slots):
        cap = len(slots) - 1 if len(slots) > 1 else 0
    window_idx = [i for i, s in enumerate(slots) if s.is_window]
    while len(window_idx) > cap:
        i = rng.choice(window_idx)
        plains = index.plain_types(height, slots[i].style, slots[i].width)
        if not plains:
            break
        slots[i].wall_type = rng.choice(plains)
        slots[i].is_window = False
        window_idx.remove(i)


def plan_doors(shell: Shell, rng, ensure_door: bool) -> list[tuple[Edge, Slot]]:
    """Choose which placed plain FULL-width walls become doors.

    Returns (edge, slot) pairs to swap. Honors max 1/edge, max 2/shell, and
    only swaps full-width plain (non-window) exterior slots.
    """
    candidates: list[tuple[Edge, Slot]] = []
    for edge in shell.edges:
        if not edge.is_exterior:
            continue
        for slot in edge.slots:
            if slot.width == WALL_FULL and not slot.is_window and not slot.is_door:
                candidates.append((edge, slot))
    if not candidates:
        return []

    rng.shuffle(candidates)
    chosen: list[tuple[Edge, Slot]] = []
    used_edges: set[int] = set()
    target = MAX_DOORS_PER_SHELL if ensure_door else rng.randint(0, MAX_DOORS_PER_SHELL)
    for edge, slot in candidates:
        if len(chosen) >= target:
            break
        if edge.index in used_edges:
            continue
        chosen.append((edge, slot))
        used_edges.add(edge.index)
    if ensure_door and not chosen and candidates:
        chosen.append(candidates[0])
    return chosen
