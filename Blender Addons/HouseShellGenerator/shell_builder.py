"""Fill shell edges with slots and assign wall types."""

from __future__ import annotations

import random
from typing import Iterable

from .constants import MAX_WINDOW_SLOT_RATIO
from .data_models import Edge, Shell, Slot
from .model_index import ModelIndex
from .subdivision import subdivide_length


def build_random_shell(
    shell_id: str,
    origin: tuple[float, float, float],
    width: float,
    length: float,
    height_pool: str,
    shell_style: str,
    edges: list[Edge],
) -> Shell:
    return Shell(
        shell_id=shell_id,
        origin=origin,
        height_pool=height_pool,
        shell_style=shell_style,
        width=width,
        length=length,
        edges=edges,
    )


def fill_shell_edges(
    shell: Shell,
    index: ModelIndex,
    rng: random.Random,
    mix_styles: bool,
    enabled_styles: Iterable[str],
    window_probability: float,
) -> list[str]:
    warnings: list[str] = []
    styles = list(enabled_styles)
    if not styles:
        styles = [shell.shell_style]

    for edge in shell.edges:
        widths = subdivide_length(edge.length, rng)
        slots: list[Slot] = []
        for slot_index, width in enumerate(widths):
            style = shell.shell_style
            if mix_styles:
                style = rng.choice(styles)
            wall_type = _pick_wall_type(
                index=index,
                height_pool=shell.height_pool,
                style=style,
                width=width,
                rng=rng,
                window_probability=window_probability,
            )
            if wall_type is None:
                warnings.append(
                    f"No wall type found for {shell.height_pool}/{style}/{width} on {shell.shell_id}."
                )
                wall_type = _fallback_plain(index, shell.height_pool, style, width) or "Plain_1"
            slots.append(
                Slot(
                    slot_index=slot_index,
                    width=width,
                    style=style,
                    wall_type=wall_type,
                    is_window="Window" in wall_type,
                )
            )
        _enforce_window_cap(slots, index, shell.height_pool, rng)
        edge.slots = slots
    return warnings


def _pick_wall_type(
    index: ModelIndex,
    height_pool: str,
    style: str,
    width: float,
    rng: random.Random,
    window_probability: float,
) -> str | None:
    plain_types = index.plain_types(height_pool, style, width)
    window_types = index.window_types(height_pool, style, width)
    if not plain_types and not window_types:
        return None
    if not window_types or rng.random() > window_probability:
        if plain_types:
            return rng.choice(plain_types)
        return rng.choice(window_types)
    return rng.choice(window_types)


def _fallback_plain(
    index: ModelIndex,
    height_pool: str,
    style: str,
    width: float,
) -> str | None:
    plain_types = index.plain_types(height_pool, style, width)
    return plain_types[0] if plain_types else None


def _enforce_window_cap(slots: list[Slot], index: ModelIndex, height_pool: str, rng: random.Random) -> None:
    if not slots:
        return
    max_windows = int(len(slots) * MAX_WINDOW_SLOT_RATIO)
    if max_windows >= len(slots):
        max_windows = len(slots) - 1 if len(slots) > 1 else 0

    window_indices = [i for i, slot in enumerate(slots) if slot.is_window]
    while len(window_indices) > max_windows:
        replace_index = rng.choice(window_indices)
        slot = slots[replace_index]
        plain = _fallback_plain(index, height_pool, slot.style, slot.width)
        if plain is None:
            break
        slot.wall_type = plain
        slot.is_window = False
        window_indices.remove(replace_index)
