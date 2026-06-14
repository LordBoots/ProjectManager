"""Persist shell graphs on Blender objects."""

from __future__ import annotations

import json

import bpy

from .data_models import Shell

SHELL_DATA_KEY = "hsg_shell_data"


def write_shell_to_empty(empty: bpy.types.Object, shell: Shell) -> None:
    shell.root_empty_name = empty.name
    empty[SHELL_DATA_KEY] = json.dumps(shell.to_dict())


def read_shell_from_empty(empty: bpy.types.Object) -> Shell | None:
    raw = empty.get(SHELL_DATA_KEY)
    if not raw:
        return None
    try:
        return Shell.from_dict(json.loads(raw))
    except (json.JSONDecodeError, KeyError, TypeError, ValueError):
        return None
