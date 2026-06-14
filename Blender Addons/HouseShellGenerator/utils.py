"""Utility helpers."""

from __future__ import annotations

import random

from .constants import MIN_SHELL_DIMENSION, WIDTH_STEP


def snap_dimension(value: float, minimum: float = MIN_SHELL_DIMENSION) -> float:
    steps = max(1, round(value / WIDTH_STEP))
    snapped = steps * WIDTH_STEP
    return max(minimum, snapped)


def snap_range(min_value: float, max_value: float) -> tuple[float, float]:
    low = snap_dimension(min_value, minimum=WIDTH_STEP * 2)
    high = snap_dimension(max_value, minimum=low)
    if low > high:
        low, high = high, low
    return low, high


def random_dimension(rng: random.Random, min_value: float, max_value: float) -> float:
    low, high = snap_range(min_value, max_value)
    if low == high:
        return low
    steps = int(round((high - low) / WIDTH_STEP))
    pick = rng.randint(0, steps)
    return low + pick * WIDTH_STEP


def is_fillable_length(length: float, epsilon: float = 1e-6) -> bool:
    units = length / WIDTH_STEP
    return abs(units - round(units)) < epsilon and length >= WIDTH_STEP
