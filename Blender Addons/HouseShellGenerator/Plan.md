# House Shell Generator — Plan

Addon location: `/Blender Addons/HouseShellGenerator`

# Concept:
    A Blender addon that places collections of wall models with known dimensions to create house shells.
    A house shell is a single level of a house with all walls and pillars in place.
    The user can edit shells afterward, then stack them manually for multi-story buildings. Multi-story generation is out of scope.
    All walls are placed in one of 4 coordinate directions (X+, X-, Y+, Y-). No odd angles — 90° only.
    Walls within an edge are placed with no spacing between them.
    Wall thickness is irrelevant. All models are authored to snap together; only width (X) matters for layout.
    Shells have no inherent front/back. The user orients them by rotating in the viewport.

    Collections use the format `[PartType_<HeightPool>_<Style>]` so the addon can auto-scan for wall and pillar pools.

    Output is a grid of building shells (or shells derived from blueprints) that can be stacked or connected into larger buildings.
    The goal is shell components, not fully formed buildings — to reduce time on asset assembly.

# Core architecture — edge-based:
    Building logic is edge-based from the start. A shell is not hard-coded as four sides; it is a ordered list of edges that form a closed perimeter.

    This is the internal data structure the addon uses during generation and keeps after placement. Random rectangular shells and blueprint-derived shapes are both just different ways to produce that edge list.

    ## Shell (in-memory, persisted on the shell empty):
        - shell_id: e.g. generated_shell_2_3
        - origin: world position of the shell root empty
        - height_pool: Tall | Short (one per shell)
        - styles: single style, or per-edge/per-slot style when mix_styles is on
        - blueprint_source: optional reference to the source mesh object (from_blueprint mode only)
        - edges: ordered list of Edge records (see below)

    ## Edge:
        - edge_id: stable index within the shell
        - start / end: 2D world-space points (X, Y) on the floor plane
        - direction: X+ | X- | Y+ | Y- (derived from start → end)
        - length: meters, snapped to 1.25m increments
        - slots: ordered list of Slot records that sum exactly to length
        - corner_pillar: optional ref to placed pillar at this edge's end (where direction changes)
        - seam_pillars: optional refs at slot boundaries within the edge

    ## Slot:
        - slot_index: position along the edge (0-based)
        - width: 2.5 | 1.25
        - style: wall style for this slot (when mix_styles is on)
        - wall_type: Plain_1, SimpleWindow_1, etc. (never Door during initial build)
        - instance: ref to the placed Blender object (linked duplicate)
        - is_door: false until door post processing sets it

    ## Door pool (separate index, not part of slot assignment during initial build):
        - Models with the "Door" keyword in the name, indexed by height_pool, style, width.
        - Used only in the door post processing step.

    ## Why edge-based from day one:
        - Random mode: a rectangle is 4 edges — a special case, not a separate code path for placement.
        - from_blueprint mode: perimeter extraction produces the same edge list.
        - Future: per-edge wall regeneration, per-edge pillar regeneration, per-edge door swap, engine export — all operate on Edge/Slot records without re-parsing the scene.

# Generation modes:
    ## Random grid (initial release):
        For each cell in rows × columns:
        - Pick random width and length within min/max (snapped to 1.25m, minimum 5m per dimension).
        - Build 4 edges forming a rectangle.
        - Run shared placement pipeline (subdivide edges → assign types → place instances → pillars → doors).

    ## from_blueprint (design now, implement after random mode is stable):
        Input: a selected Blender mesh — a set of planes connected edge-to-edge, representing a floor plan (top-down, on the floor plane).
        (for example: user starts with a square, subdivides an edge and then extrudes a section to create a new plane representing a new room or extension of the existing room)

        Steps:
        1. Read mesh geometry in world space (floor plane = X/Y, Z ignored for perimeter).
        2. Detect the outer perimeter: find boundary edges (edges belonging to only one face, or the outer loop of connected planes).
        3. Merge collinear segments that share the same direction into single Edge records (e.g. three 2.5m coplanar X+ segments → one 7.5m X+ edge).
        4. Snap edge lengths to 1.25m increments. Reject or warn on edges that cannot be exactly filled.
        5. Pass the resulting edge list into the same shared placement pipeline as random mode.

        Panel: blueprint object picker (or "use active object"), plus the same style/pillar/probability/door toggles as random mode. No dimension min/max — dimensions come from the mesh.

        Validation:
        - Mesh must be manifold-ish for perimeter extraction (connected planes, no holes unless intentional).
        - All perimeter edge directions must be axis-aligned (90° only). Reject diagonals.
        - Every edge length must be fillable with 2.5m and 1.25m walls.

# Panel and Inputs:
    The addon uses a panel in the 3D Viewport sidebar (N-panel).

    Mode:
    - generation_mode: Random Grid | From Blueprint

    Bool:
    - connect_shells:
        If off: grid spacing separates shells; each shell is independent.
        If on: build the next shell flush against the previous on a randomly chosen shared side, then delete all walls along the shared edge so footprints merge.
    - use_corner_pillars:
        Place a pillar at each corner (where edge direction changes). Pillar origin is center bottom — drops at the exact end of the last segment, snaps in place.
    - use_seam_pillars:
        Place a pillar at each seam between adjacent wall slots within an edge. Same snap behavior.
    - ensure_door:
        If on: post processing guarantees at least one door per shell (up to 2 total).
        Doors are never part of the initial build — always applied by swapping a placed plain wall after build completes.
    - mix_styles:
        If off: one style per shell.
        If on: per-slot style selection from user-checked styles, weighted by style probability.
    - replace_previous:
        If on: delete previous `[Generated_Shells]` output before generating again.

    Style selection (ignored unless mix_styles is on):
    - Tall wall styles (checkboxes)
    - Short wall styles (checkboxes)

    Model collections (auto-populated via rescan):
    - Wall collections: prefix `[Walls_<HeightPool>_<Style>]`
    - Pillar collections: prefix `[Pillars_<HeightPool>_<Type>]` (Corner / Seam)
    - "Rescan Collections" button

    Int (random grid mode only):
    - width_min, width_max, length_min, length_max (meters; floor 2.5m; snap to 1.25m increments)
    - seed: repeatable RNG

    Float:
    - wall_style_probability
    - wall_type_probability (plain vs windows only — doors excluded)

    Grid options (random grid mode only):
    - columns, rows (total shells = columns × rows)
    - spacing (meters; ignored when connect_shells is on)

    From blueprint (from_blueprint mode only):
    - blueprint_object: mesh object picker (default: active object)

    Operator:
    - "Generate Shells"

# Model configuration:
## Wall models:
    Name example: `[Walls_Tall_BrickWoodBottom_Plain_1]`
    Default width: 2.5m. Exceptions identified by keyword:
    - "Half" → 1.25m wide
    - "Door" → door; excluded from initial build pools

    Name parts: PartType (Walls) · HeightPool (Tall/Short) · Style · Type

    Heights:
    - Tall:  2.5m × 3.98m,  1.25m × 3.98m
    - Short: 2.5m × 3.2m,   1.25m × 3.2m

    Styles — Tall: BrickWoodBottom, Brick, Wood, Stucco
    Styles — Short: BrickWoodBottom, Brick, BrickFancy, BrickBrickBottom, Wood, WoodFancy, WoodBrickBottom, Stucco, StuccoFancy

    Types: (Directly correspond to the actual model names in the collections)
        Short Walls:
            - Plain_1
            - Plain_2
            - Plain_3
            - Plain_4
            - Half_1
            - Half_2
            - SmallWindow_1
            - SimpleWindow_1
            - ArchedWindow_1
            - ArchedWindow_2
            - ShutteredWindow_1
            - ShutteredWindow_2
            - BayWindow_1
            - BayWindow_2
            - BayWindow_3
            - Door_1
            - Door_2
        Tall Walls:
            - Plain_1
            - Plain_2
            - Plain_3
            - Plain_4
            - Half_1
            - Half_2
            - SmallWindow_1
            - SimpleWindow_1
            - ArchedWindow_1
            - ArchedWindow_2
            - ShutteredWindow_1
            - ShutteredWindow_2
            - BayWindow_1
            - BayWindow_2
            - BayWindow_3
            - Door_1
            - Door_2
            - Door_3
            - Door_4
## Pillar models:
    Name example: `[Pillars_Tall_Corner_1]`
    Parts: PartType (Pillars) · HeightPool · Type (Corner | Seam)
    Matched to shell height pool. Placed at segment end points; do not consume wall width.
    Only one style per height pool currently available:
    collection: [Pillars_Tall]
     - [Pillar_Tall_Corner_1]
     - [Pillar_Tall_Seam_1]
    collection: [Pillars_Short]
     - [Pillar_Short_Corner_1]
     - [Pillar_Short_Seam_1]

## Orientation:
    Origin: center, absolute bottom (walls and pillars).
    Default orientation: long axis parallel to world X; model front faces Y+.

# Hard constraints:
    - Axis-aligned edges only (X+, X-, Y+, Y-).
    - One height pool per shell.
    - Every edge length exactly fillable with 2.5m and 1.25m slots. No gaps, overlaps, or scaling.
    - Doors excluded from initial build and from wall type probability pools.
    - Door post processing: min 1 door per shell if ensure_door; max 1 door per edge; max 2 doors per shell; exterior edges only.
    - Windows < 80% of slots on any single edge.

# Logic flow:
    1. Scan & select:
        Rescan wall/pillar collections. User sets mode, toggles, probabilities, grid or blueprint input. Press Generate.

    2. Validate:
        At least one wall collection selected. Pillars required if pillar toggles on.
        Parse models into indexes: height_pool × style × type × width. Doors → separate door pool.
        Random mode: snap dimension ranges.
        Blueprint mode: extract perimeter → edge list; validate axis alignment and fillable lengths.

    3. Build shell graph (per shell):
        Random mode: pick dimensions, emit 4 rectangle edges.
        Blueprint mode: use extracted edge list.
        Pick height pool. Pick style(s). Store Shell + Edge records in addon state linked to the shell empty.

    4. Fill edges (shared pipeline):
        For each edge: subdivide length into 2.5m/1.25m slots.
        Assign wall types per slot (plain/windows only, respect window cap).
        Write Slot records on each Edge.

    5. Placement:
        Linked-duplicate instances into the scene.
        Walk each edge sequentially; step by slot width; rotate to edge direction; front faces outward.
        Corner pillars at direction changes; seam pillars at slot boundaries if enabled.
        Link each placed object's ref back to its Slot / Edge in the shell data.

    6. Shell connection (random grid + connect_shells only):
        Place shells flush; delete instances on shared edges; remove those edges from the merged shell's exterior set (interior edges are not re-filled).

    7. Door post processing:
        After build and connection. Random eligible plain slots on exterior edges only.
        Swap instance for matching door from door pool. Update Slot.is_door and instance ref.
        enforce_door: guarantee ≥1 door; cap at 2 per shell, 1 per edge.

    8. Output:
        Parent all shell objects to a root empty at shell origin.
        Collection: `[Generated_Shells]` containing `[Generated_Shell_<row>_<col>]` (or blueprint name suffix).
        Shell data structure remains on the empty (custom properties or addon registry keyed by shell_id) for future per-edge tools.

# Out of scope (initial release):
    - Multi-story stacking, roofs, floors, ceilings, interiors
    - Non-90° angles or curved walls
    - In-viewport editing/repair tools (user uses normal Blender tools)
    - Engine export and wall-swap UI (see Future expansion)

# Future expansion:
    ## Engine export:
        Export one JSON/BLF file per shell from the edge/slot data structure (not by re-scanning the scene).
        Godot MultiMeshInstance workflow; models in a single GLB PackedScene library.

    ## Wall swap component:
        User selects a placed wall; panel reads Slot from shell data; shows compatible replacements (same height, width; optionally same style); swap instance in one click; update Slot record.

    ## Per-edge regeneration:
        Re-roll wall types for a single edge, or re-place pillars/door on one edge, using the persisted Edge/Slot graph.
