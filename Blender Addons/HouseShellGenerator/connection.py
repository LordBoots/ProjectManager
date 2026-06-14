"""Shell connection and grid layout."""

from __future__ import annotations

from .data_models import Shell
from .placement import delete_objects_by_name


def layout_shell_grid(
    shells: list[Shell],
    columns: int,
    spacing: float,
    width_pitch: float,
    length_pitch: float,
    connect_shells: bool,
) -> None:
    if connect_shells:
        _layout_connected_origins(shells, columns)
    else:
        _layout_spaced_origins(shells, columns, spacing, width_pitch, length_pitch)


def apply_shell_connections(shells: list[Shell], columns: int) -> None:
    for index in range(1, len(shells)):
        if index % columns == 0:
            continue
        _merge_shared_edge(shells[index - 1], shells[index], merge_axis="vertical")


def _layout_spaced_origins(
    shells: list[Shell],
    columns: int,
    spacing: float,
    width_pitch: float,
    length_pitch: float,
) -> None:
    for index, shell in enumerate(shells):
        row = index // columns
        col = index % columns
        shell.origin = (
            col * (width_pitch + spacing),
            row * (length_pitch + spacing),
            0.0,
        )


def _layout_connected_origins(shells: list[Shell], columns: int) -> None:
    if not shells:
        return

    shells[0].origin = (0.0, 0.0, 0.0)
    for index in range(1, len(shells)):
        previous = shells[index - 1]
        current = shells[index]
        if index % columns != 0:
            current.origin = (
                previous.origin[0] + previous.width,
                previous.origin[1],
                0.0,
            )
        else:
            current.origin = (
                0.0,
                previous.origin[1] + previous.length,
                0.0,
            )


def _merge_shared_edge(left: Shell, right: Shell, merge_axis: str) -> None:
    if merge_axis == "vertical":
        left_edge = _find_edge(left, direction="X+", y=0.0)
        right_edge = _find_edge(right, direction="X-", y=0.0)
    else:
        left_edge = _find_edge(left, direction="Y+", x=0.0)
        right_edge = _find_edge(right, direction="Y-", x=0.0)

    if left_edge is None or right_edge is None:
        return

    names = [slot.instance_name for slot in left_edge.slots if slot.instance_name]
    if left_edge.corner_pillar_name:
        names.append(left_edge.corner_pillar_name)
    names.extend(left_edge.seam_pillar_names)
    delete_objects_by_name(names)

    left_edge.is_exterior = False
    left_edge.slots.clear()
    right_edge.is_exterior = False
    right_edge.slots.clear()


def _find_edge(shell: Shell, direction: str, x: float | None = None, y: float | None = None):
    for edge in shell.edges:
        if edge.direction != direction:
            continue
        if x is not None and abs(edge.start[0] - x) > 1e-4:
            continue
        if y is not None and abs(edge.start[1] - y) > 1e-4:
            continue
        return edge
    return None
