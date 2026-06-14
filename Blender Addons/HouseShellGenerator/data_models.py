"""Edge-based shell data structures."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class Slot:
    slot_index: int
    width: float
    style: str
    wall_type: str
    instance_name: str = ""
    is_door: bool = False
    is_window: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "slot_index": self.slot_index,
            "width": self.width,
            "style": self.style,
            "wall_type": self.wall_type,
            "instance_name": self.instance_name,
            "is_door": self.is_door,
            "is_window": self.is_window,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Slot":
        return cls(
            slot_index=int(data["slot_index"]),
            width=float(data["width"]),
            style=str(data["style"]),
            wall_type=str(data["wall_type"]),
            instance_name=str(data.get("instance_name", "")),
            is_door=bool(data.get("is_door", False)),
            is_window=bool(data.get("is_window", False)),
        )


@dataclass
class Edge:
    edge_id: int
    start: tuple[float, float]
    end: tuple[float, float]
    direction: str
    length: float
    slots: list[Slot] = field(default_factory=list)
    corner_pillar_name: str = ""
    seam_pillar_names: list[str] = field(default_factory=list)
    is_exterior: bool = True

    def to_dict(self) -> dict[str, Any]:
        return {
            "edge_id": self.edge_id,
            "start": list(self.start),
            "end": list(self.end),
            "direction": self.direction,
            "length": self.length,
            "slots": [slot.to_dict() for slot in self.slots],
            "corner_pillar_name": self.corner_pillar_name,
            "seam_pillar_names": list(self.seam_pillar_names),
            "is_exterior": self.is_exterior,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Edge":
        return cls(
            edge_id=int(data["edge_id"]),
            start=(float(data["start"][0]), float(data["start"][1])),
            end=(float(data["end"][0]), float(data["end"][1])),
            direction=str(data["direction"]),
            length=float(data["length"]),
            slots=[Slot.from_dict(item) for item in data.get("slots", [])],
            corner_pillar_name=str(data.get("corner_pillar_name", "")),
            seam_pillar_names=list(data.get("seam_pillar_names", [])),
            is_exterior=bool(data.get("is_exterior", True)),
        )


@dataclass
class Shell:
    shell_id: str
    origin: tuple[float, float, float]
    height_pool: str
    shell_style: str
    width: float
    length: float
    edges: list[Edge] = field(default_factory=list)
    blueprint_source: str = ""
    root_empty_name: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "shell_id": self.shell_id,
            "origin": list(self.origin),
            "height_pool": self.height_pool,
            "shell_style": self.shell_style,
            "width": self.width,
            "length": self.length,
            "edges": [edge.to_dict() for edge in self.edges],
            "blueprint_source": self.blueprint_source,
            "root_empty_name": self.root_empty_name,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Shell":
        return cls(
            shell_id=str(data["shell_id"]),
            origin=(
                float(data["origin"][0]),
                float(data["origin"][1]),
                float(data["origin"][2]),
            ),
            height_pool=str(data["height_pool"]),
            shell_style=str(data["shell_style"]),
            width=float(data["width"]),
            length=float(data["length"]),
            edges=[Edge.from_dict(item) for item in data.get("edges", [])],
            blueprint_source=str(data.get("blueprint_source", "")),
            root_empty_name=str(data.get("root_empty_name", "")),
        )
