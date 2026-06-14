"""Subdivide edge lengths into wall slot widths."""

from __future__ import annotations

import random

from .constants import WALL_WIDTH_FULL, WALL_WIDTH_HALF, WIDTH_STEP
from .utils import is_fillable_length


def subdivide_length(length: float, rng: random.Random) -> list[float]:
    if not is_fillable_length(length):
        raise ValueError(f"Length {length} is not fillable in {WIDTH_STEP}m steps.")

    units = int(round(length / WIDTH_STEP))
    partitions = _partition_units(units, rng)
    return [
        WALL_WIDTH_FULL if unit_count == 2 else WALL_WIDTH_HALF
        for unit_count in partitions
    ]


def _partition_units(units: int, rng: random.Random) -> list[int]:
    """Partition quarter-units (1.25m) into chunks of 2 (2.5m) or 1 (1.25m)."""
    if units <= 0:
        raise ValueError("Edge length must be positive.")

    results: list[int] = []
    remaining = units
    while remaining > 0:
        if remaining == 1:
            results.append(1)
            remaining -= 1
            continue
        if remaining == 2:
            results.append(2)
            remaining -= 2
            continue
        if remaining == 3:
            if rng.random() < 0.5:
                results.extend([2, 1])
            else:
                results.extend([1, 2])
            remaining = 0
            continue
        if rng.random() < 0.75:
            results.append(2)
            remaining -= 2
        else:
            results.append(1)
            remaining -= 1
    return results
