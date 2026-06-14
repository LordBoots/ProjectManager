"""Rectangle shell edge construction and placement math."""

from __future__ import annotations

import math

from .constants import DIRECTIONS
from .data_models import Edge
from .utils import is_fillable_length


def build_rectangle_edges(width: float, length: float) -> list[Edge]:
    if not is_fillable_length(width) or not is_fillable_length(length):
        raise ValueError("Rectangle width and length must be fillable in 1.25m steps.")

    specs = [
        ((0.0, 0.0), (width, 0.0), "X+", width),
        ((width, 0.0), (width, length), "Y+", length),
        ((width, length), (0.0, length), "X-", width),
        ((0.0, length), (0.0, 0.0), "Y-", length),
    ]
    edges: list[Edge] = []
    for edge_id, (start, end, direction, edge_length) in enumerate(specs):
        edges.append(
            Edge(
                edge_id=edge_id,
                start=start,
                end=end,
                direction=direction,
                length=edge_length,
            )
        )
    return edges


def outward_rotation_z(direction: str, start: tuple[float, float], end: tuple[float, float]) -> float:
    """Return Z rotation so authored wall details face away from shell interior."""
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    if direction == "X+":
        return _flip_front(math.pi if dy >= 0 else 0.0)
    if direction == "X-":
        return _flip_front(0.0 if dy >= 0 else math.pi)
    if direction == "Y+":
        return _flip_front(-math.pi / 2 if dx >= 0 else math.pi / 2)
    if direction == "Y-":
        return _flip_front(math.pi / 2 if dx >= 0 else -math.pi / 2)
    raise ValueError(f"Unknown direction: {direction}")


def _flip_front(rotation_z: float) -> float:
    """The authored asset front is opposite the original placement assumption."""
    return rotation_z + math.pi


def slot_center(
    edge: Edge,
    slot_index: int,
    slot_width: float,
    shell_origin: tuple[float, float, float],
) -> tuple[float, float, float]:
    offset = sum(slot.width for slot in edge.slots[:slot_index])
    sx, sy = edge.start
    ox, oy, oz = shell_origin

    if edge.direction == "X+":
        x = sx + offset + slot_width * 0.5
        y = sy
    elif edge.direction == "X-":
        x = sx - offset - slot_width * 0.5
        y = sy
    elif edge.direction == "Y+":
        x = sx
        y = sy + offset + slot_width * 0.5
    elif edge.direction == "Y-":
        x = sx
        y = sy - offset - slot_width * 0.5
    else:
        raise ValueError(f"Unknown direction: {edge.direction}")

    return (ox + x, oy + y, oz)


def edge_end_point(edge: Edge, shell_origin: tuple[float, float, float]) -> tuple[float, float, float]:
    ox, oy, oz = shell_origin
    return (ox + edge.end[0], oy + edge.end[1], oz)


def seam_point(
    edge: Edge,
    boundary_index: int,
    shell_origin: tuple[float, float, float],
) -> tuple[float, float, float]:
    """Point on the edge between slot boundary_index-1 and boundary_index."""
    offset = sum(slot.width for slot in edge.slots[:boundary_index])
    sx, sy = edge.start
    ox, oy, oz = shell_origin

    if edge.direction == "X+":
        return (ox + sx + offset, oy + sy, oz)
    if edge.direction == "X-":
        return (ox + sx - offset, oy + sy, oz)
    if edge.direction == "Y+":
        return (ox + sx, oy + sy + offset, oz)
    if edge.direction == "Y-":
        return (ox + sx, oy + sy - offset, oz)
    raise ValueError(f"Unknown direction: {edge.direction}")


def validate_axis_aligned(edge: Edge, epsilon: float = 1e-4) -> bool:
    dx = edge.end[0] - edge.start[0]
    dy = edge.end[1] - edge.start[1]
    if abs(dx) > epsilon and abs(dy) > epsilon:
        return False
    if edge.direction not in DIRECTIONS:
        return False
    return True
