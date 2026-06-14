# Concept:
    A Blender addon that allows me to input collections of wall models with known dimensions and place them to create house shells.
    In this context a house shell refers to a single level of a house with all the walls and pillars in place.
    The user can then edit the shells to fix any oddities or make changes to the walls and pillars.
    The user will then stack these to make multi-story buildings if they desire. Multi-story builds are out of scope for this addon.
    All building walls are placed in one of the 4 coordinate directions. (X+, X-, Y+, Y-). There are no odd angles (only 90 degree angles).
    Walls are placed with no spacing between them within a wall side.
    Collections to be used are always formatted as '[PartType_<HeightPool>_<Style>]'. This is so the addon can auto-scan for collections that start with the correct prefixex.
    The Shells themselves do not have a "front" or "back" side. The user can orient the shells to the desired direction by rotating them in the viewport.
        
    The output should be a grid of "building shells" that can be used to create larger buildings by stacking or connecting them.
    The goal is not to output fully formed buildings, but rather to output the building shell components that can be used to create larger buildings to reduce stress and time on asset assembly.

    Addon to be built in the /Blender Addons/HouseShellGenerator folder.

# Panel and Inputs:
    The addon will use a panel in the Blender interface (3D Viewport sidebar / N-panel) to allow the user to input various settings such as:
    Bool:
    - connect_shells: 
        Should the shells be connected to each other?
         - If not the grid spacing is applied. They are considered separate house shells.
         - If so they are connected randomly by building the next shell next to the current shell and then deleting the overlapping walls.
         For instance with it on, given a request for 2 7.5mx7.5m dimensional shells using only 2.5m wide walls, the output would be 2 7.5mx7.5m sized shells with the shells connected to each other resulting in 15mx7.5m sized shell consisting of 15 2.5m wide walls.    
    - use_corner_pillars: 
        Should the shells use pillar models?
         - If not, pillars are not used at all.
         - if selected a pillar is used at each corner of the shell or wherever a wall orientation changes from the last (definition of a corner in this context).
    - use_seam_pillars:
        Should the shells use pillar models at the seams between the walls?
         - If not, pillars are not used at the seams between the walls.
         - if selected a pillar is used at the seams between the walls.
    - ensure_door:
        Should the shells always have at least one door per shell?
         - If not, the shells may have no doors.
         - if selected, the shells will always have at least one door per shell.
         Note: doors are never part of the initial build. They are applied in a post processing step after the shell is generated, by selecting a placed plain wall and swapping it for a door of the same style/width.
    - mix_styles:
        Should the shells use a mix of wall styles?
         - If not, all walls in the shell will be the same style.
         - if selected, the walls in the shell will be a mix of the selected wall styles.
    - Style selection:
        - Ignored unless mix_styles is selected.
        - Contains two sub sections:
            - Tall Walls styles
            - Short Walls styles
    
    Model collections:
    Collections are seperated by style. So for instance all BrickWoodBottom walls will be in the same collection, all Brick walls will be in the same collection, etc.
    - The collection or collections of wall models to use. (list of checkboxes, auto-populated from the '[PartType_<HeightPool>_<Style>]' prefix scan)
    - The collection or collections of pillar models to use. (list of checkboxes, auto-populated from the '[PartType_<HeightPool>_<Style>]' prefix scan)
    - A "Rescan Collections" button to refresh the lists after the user adds/renames collections.

    Int:
    - the dimensions range of the building. (width, length. in meters) the floor of this range is assumed to be 2.5 metres (A single full wall width)
        - width_min: The minimum width of the buildings.
        - width_max: The maximum width of the buildings.
        - length_min: The minimum length of the buildings.
        - length_max: The maximum length of the buildings.
        (All dimensions are snapped to the nearest 1.25m increment, since every wall side must be exactly fillable with 2.5m and 1.25m wide walls.)
    - seed: Random seed for repeatable generation. Same inputs + same seed = same output.

    Float:
    - Probability fields:
    (Doors are excluded from the probability fields and from the wall type pools entirely during the initial build. With ensure_door selected, post processing will add up to two doors randomly by swapping placed plain walls.)
     - Wall style probability: The probability of a wall style being selected. (The user can select multiple styles and the probability will be calculated based on the number of styles selected.)
     - Wall type probability: The probability of a wall type being selected. (Weighting between plain walls and windows only. e.g. higher plain-wall weight produces fewer windows.)

    Grid options:
    Total number of shells generated is the number of columns multiplied by the number of rows.
    - The number of columns in the grid.
    - The number of rows in the grid.
    - The spacing between the shells. (in meters, ignored when connect_shells is on)

    Operator:
    - A "Generate Shells" button that runs the generation with the current settings.

# Model configuration:
## Wall Models:
    Name Example: [Walls_Tall_BrickWoodBottom_Plain_1]
    Everything is considered a 2.5m wide wall apart from the objects listed below:
     - [Wall_Tall_BrickWoodBottom_Half_1] <- These are the 1.25m wide walls. We use the keyword "Half" to identify them. 
     - [Wall_Tall_BrickWoodBottom_Door_1] <- This is a door. We use the keyword "Door" to identify them.
    Name parts explained:
    1. PartType:
        - Walls
        - Pillars
    2. Height Pool:
        - Tall
        - Short
    3. Style:
        - BrickWoodBottom
        - Brick
        - etc.
    4. Type:
        - Plain_1
        - Plain_2
        - Plain_3
        - Half_1
        - Half_2
        - Door_1
        - Door_2
        - etc.

    Walls only come in two HEIGHT POOLS. Each height has two widths:
    (Height Pool is only relevant for wall selection criteria. If we start with a tall wall we can't use a short wall and vice versa. Height is only listed for future expansion of the addon.)
        Tall Walls:
         - X(width): 2.5 meters, Y(height): 3.98 meters
         - X(width): 1.25 meters, Y(height): 3.98 meters
        Short Walls:
         - X(width): 2.5 meters, Y(height): 3.2 meters
         - X(width): 1.25 meters, Y(height): 3.2 meters

    Each pool contains multiple STYLES of walls.
        Tall Walls:
         - BrickWoodBottom
         - Brick
         - Wood
         - Stucco
        Short Walls:
         - BrickWoodBottom
         - Brick
         - BrickFancy
         - BrickBrickBottom
         - Wood
         - WoodFancy
         - WoodBrickBottom
         - Stucco

    Each pool contains multiple TYPES of walls. 
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

## Pillar Models:
    Name Example: [Pillars_Tall_Corner_1]
    Name parts explained:
    1. PartType:
        - Pillars
    2. Height Pool:
        - Tall
        - Short
    3. Type:
        - Corner
        - Seam
    Pillars come in two POOLS:
     Tall Pillars:
     - [Pillar_Tall_Corner_1]
     - [Pillar_Tall_Seam_1]
     Short Pillars:
     - [Pillar_Short_Corner_1]
     - [Pillar_Short_Seam_1]
     Name parts explained:
     1. PartType:
        - Pillars
     2. Height Pool:
        - Tall
        - Short
     3. Type:
        - Corner
        - Seam

    Wall thickness is irrelevant to the placement logic. All models are authored to snap together, so only the width (X) matters for layout. No clearance or thickness compensation is needed.

    The models origins will always be the center, absolute bottom of the model. This is true for both walls and pillars.
    Models from collection pools will always be orientated with the long axis of the model running parallel to the X axis of the Blender world space. So the "front" of the model will face the Y+ axis.
    (pressing numpad 1 should show the model's front side in the viewport if the model is rotated to the correct default orientation.)

# Choices the logic needs to make:
    - The dimensions of each shell. (random within the width/length min/max range, snapped to 1.25m increments with a minimum total of 5m which is two 2.5m wide walls)
    - Which wall height to use. (Tall or Short, one choice per shell)
    - Which wall style to use. (e.g. BrickWoodBottom, Brick, Wood, Stucco. One style per shell, or a mix if mix_styles is on.)
    - Which wall type to use per wall slot. (e.g. PlainWall_1, SimpleWindow_2, weighted by the probability fields and limited by the hard constraints. Doors are excluded from this pool entirely.)
    - How to divide the width of each side of the shell. For instance is it making a 7.5m long wall section out of 3 2.5m wide walls or 2 2.5m wide walls and 2 1.25m wide walls?
    - Where to place doors. (post processing only: which placed plain wall(s) to swap for a door, randomized across sides)

# Hard constraints:
    - The walls must be placed in one of the 4 coordinate directions. (X+, X-, Y+, Y-). There are no odd angles (only 90 degree angles).
    - Walls must be picked from one height pool per shell. (no mixing tall and short walls in the same shell)
    - Every wall side length must be exactly fillable with the available wall widths (2.5m and 1.25m). No gaps, no overlaps, no scaling of models.
    - Doors are never selected during the initial build. They are only introduced by the door post processing step.
    - Each shell can have no more than one door per wall side and no more than 2 doors total. but must always have at least one door per shell if requested with ensure_door. (enforced by the post processing step)
    - Windows must make up less than 80% of a wall side.

# Logic Flow:
    1. Scan & select:
        - On panel draw (or via the rescan button), scan the blend file for collections prefixed with '[Walls_<HeightPool>_<Style>]' and list them as checkboxes.
        - On panel draw (or via the rescan button), scan the blend file for collections prefixed with '[Pillars_<HeightPool>_<Style>]' and list them as checkboxes.
        - The user selects one or more wall collections and (optionally) one or more pillar collections.
        - The user sets the dimension ranges, grid options, probabilities, and toggles, then presses "Generate Shells".

    2. Validate:
        - At least one wall collection is selected. If pillar options are enabled, at least one pillar collection is selected.
        - Dimension ranges are sane (min <= max, min >= 1.25m) and snap all values to 1.25m increments.
        - Parse the selected collections and index the contained models by height pool, style, type, and width (from naming convention and/or measured bounding box). Report any models that fail to parse.
        - Models with the "Door" keyword are set aside in a separate door pool. They are excluded from the general wall type pools and take no part in the initial build.

    3. Per shell (for each cell in the rows x columns grid):
        - Seed the RNG (base seed + cell index) so each shell is independently repeatable.
        - Pick the shell width and length from the min/max ranges.
        - Pick the height pool (Tall or Short).
        - Pick the style. If mix_styles is off, pick a single style for the whole shell. If on, pick per-wall from the user's selected styles using the style probability.
        - For each of the 4 sides, solve the width subdivision: a list of 2.5m and 1.25m slots that sums exactly to the side length.
        - Assign a wall type to each slot using the type probability (plain walls and windows only, doors are not in the pool), while enforcing the window constraint (windows < 80% of a side).

    4. Placement:
        - Instance (linked duplicate) the chosen models rather than copying mesh data, to keep the file light.
        - For each side, place walls sequentially along the side with no spacing, rotated to the side's direction (0/90/180/270 degrees) with the model front facing outwards.
        - Wall thickness is ignored. The models are authored to snap together, so placement only steps along the side by each wall's width.
        - If use_corner_pillars is on, place a pillar at each corner of the shell (wherever the wall orientation changes). The pillar is dropped at the exact end point of the last wall segment and snaps into place thanks to its center-bottom origin.
        - If use_seam_pillars is on, place a pillar at each seam between adjacent walls within a side, again at the exact segment end point with no extra manipulation.

    5. Shell connection / grid layout:
        - If connect_shells is off, offset each shell by its grid cell position plus the spacing setting.
        - If connect_shells is on, build each new shell flush against the previous shell on a randomly chosen shared side, then delete all walls along the shared edge so the shells merge into one larger footprint.

    6. Door post processing:
        - Runs after the initial build (including shell connection) is complete, so doors are never placed on walls that get deleted.
        - If ensure_door is on, each shell gets up to two doors: pick a placed plain wall at random (randomized across sides), and swap it for a door of the same height pool, style, and width from the door pool.
        - Constraints enforced here: at least 1 door per shell, max 1 door per wall side, max 2 doors per shell. Only exterior walls are eligible.
        - If a shell has no plain walls to swap (extremely unlikely), report it and leave the shell doorless.

    7. Output & cleanup:
        - Place each shell's objects in the [Generated_Shells] collection, naming the object with the convention '[Generated_Shell_<row>_<col>]'.
        - Each shell's walls are parented to an empty at the shell origin, so a whole shell can be moved/stacked as one unit.
        - Re-running the generator with "replace previous" enabled deletes the previous '[Generated_Shells]' output first.

# Out of scope:
    - Multi-story stacking. (the user does this manually with the output shells)
    - Roofs, floors, ceilings, and interiors.
    - Non-90-degree angles or curved walls.
    - Editing/repair tools for generated shells. (the user edits the shells with normal Blender tools)

# To consider before starting development:
## from_blueprint mode:
Uses A blender mesh as the blueprint and generates a shell from it
The mesh would be a set of planes connected to each other at their edges, representing a floor plan.

We would then use some sort of shape detection algorithm to find the perimeter of the shape.
We would then extract the individual edge definitions from the shape.
We would then use the existing placement logic to fill in each edge segment.

It would likely be best to start the addon to be "edge based" in that the building logic works on a per-edge basis.
This way we could also later on add expansions like per edge wall regeneration, per edge pillar regeneration, per edge door regeneration, etc.
To do this properly we wouold have to hold a local data structure even after the initial build is complete (internally for now for the addon to track the edges/walls/pillars/doors and their states and to be able to link idividual objects to their specific shell or edge group).

# Future Expansion:
Ignore during initial build/release version.
## Engine Export (Expansion - not required for initial release):
Exports the generated shell to a JSON file that can be imported into the engine so that the engine can procedurally generate them using MultiMeshInstances (Godot Engine). (This is a very common way to handle large numbers of instances in games.)
Each Json file would be a single shell. This would make managing or editing shells post generation much easier than dealing with a monolithic json file.
(we could even change the file extension to BLF for "Building Layout File")
Adding buildings to the game is as simple as dropping in a new BuildingLayout.json/BLF file. 

In engine the models would all be part of a sinlge GLB thaty has been imported into a PackedScene.
The packed Scene would be used as a library of models that can be instantiated and positioned in the world.
This is much simpler than having to import each model into the scene individually. This scene just acts as the source containing the Meshes used as reference for the MultiMeshInstances.

```JSON
{
  "shell_id": "generated_shell_2_3",
  "dimensions": {"width": 7.5, "length": 10.0},
  "height_pool": "Tall",
  "walls": [
    {
      "side": "north",
      "positions": [
        {"model": "Wall_Tall_Brick_Plain_1", "x": 0, "y": 0, "width": 2.5, "rotation": 0},
        {"model": "Wall_Tall_Brick_SimpleWindow_2", "x": 2.5, "y": 0, "width": 2.5, "rotation": 0},
        {"model": "Wall_Tall_Brick_Plain_3", "x": 5.0, "y": 0, "width": 2.5, "rotation": 0}
      ]
    },
    // ... east, south, west sides
  ],
  "pillars": [
    {"model": "Pillar_Tall_Corner_1", "x": 0, "y": 0, "rotation": 0},
    {"model": "Pillar_Tall_Seam_1", "x": 2.5, "y": 0, "rotation": 0},
    // ... other pillars
  ],
  "doors": [
    {"model": "Wall_Tall_Brick_Door_1", "x": 5.0, "y": 7.5, "rotation": 90}
  ]
}
```

## Wall Swap component (Expansion - not required for initial release):
1. User selects a placed wall in the viewport
2. N-panel detects selection and displays:
   - Height Pool (Tall/Short)
   - Style (Brick, Wood, etc.)
   - Width (2.5m or 1.25m)
   - Current Type (Plain_2, SimpleWindow_1, etc.)
3. Panel shows a filtered dropdown of compatible replacements:
   - Same height pool ✓ (can't swap Tall for Short)
   - Same width ✓ (can't swap 2.5m for 1.25m)
   - Optionally same style, or show all styles
4. User picks a variant (e.g., change Plain_2 → ArchedWindow_1)
5. Addon swaps the instance with a single click



# Keepsakes: (Blender Addons)
Only Relevant for user asset handling. AI can ignore this completely. 
Only here to that they don't get lost.

## Rename Set Blender Addon: (Completed)
A simple blender 4.2 script that does the following: 
Goes through selected ojects and tests their X position to find the ascending order.
In ascending order it renames the objects in the following format: [Wall_<prefix>_<style_name>_<list_item>].

```python

import bpy

# ============================================================================
# CONFIGURATION
# ============================================================================
PREFIX = "Short"      # Change this to your desired prefix (e.g., "Short", "Tall", "Medium")
STYLE_NAME = "Brick"  # Change this to your desired style (e.g., "Brick", "BrickFancy")

# Premade list of names in order
name_list = [
    "Plain_1",
    "Plain_2",
    "Plain_3",
    "Plain_4",
    "Half_1",
    "Half_2",
    "BayWindow_1",
    "BayWindow_2",
    "BayWindow_3",
    "SimpleWindow_1",
    "ArchedWindow_1",
    "ArchedWindow_2",
    "ShutteredWindow_1",
    "ShutteredWindow_2",
    "Door_1",
    "Door_2"
]

def rename_objects_by_x_position(prefix, style_name):
    """
    Rename selected objects in ascending X position order.
    Rebuilds names in format: [Wall_{prefix}_{style_name}_{list_item}]
    
    Args:
        prefix: The prefix portion of the name (e.g., "Short", "Tall", "Medium")
        style_name: The style portion of the name (e.g., "Brick", "BrickFancy")
    """
    # Get selected objects
    selected_objects = bpy.context.selected_objects
    
    if not selected_objects:
        print("No objects selected!")
        return
    
    if len(selected_objects) > len(name_list):
        print(f"Warning: You have {len(selected_objects)} objects but only {len(name_list)} names in the list.")
        print("Some objects will not be renamed.")
    
    # Sort objects by X position (ascending)
    sorted_objects = sorted(selected_objects, key=lambda obj: obj.location.x)
    
    # Rename each object
    for index, obj in enumerate(sorted_objects):
        if index >= len(name_list):
            print(f"Skipping {obj.name} - no more names in list")
            break
        
        # Create new name: [Wall_{prefix}_{style_name}_{list_item}]
        new_name = f"[Wall_{prefix}_{style_name}_{name_list[index]}]"
        
        print(f"Renaming '{obj.name}' -> '{new_name}' (X position: {obj.location.x:.2f})")
        obj.name = new_name
    
    print("\nRenaming complete!")

# ============================================================================
# USAGE:
# ============================================================================
# 1. Set PREFIX and STYLE_NAME at the top to your desired values
# 2. Select your objects in Blender
# 3. Run this script
# 4. Objects will be sorted by X position and renamed automatically

# Run the rename function with the configured prefix and style
rename_objects_by_x_position(PREFIX, STYLE_NAME)
```

## Origin Set Addon: (Completed)
Sets the origin of the selected objects to the center of the lowest face found.
```python

import bpy
import bmesh
from mathutils import Vector

def process_selected_objects():
    """
    Iterate through selected objects, find the lowest positioned face,
    set cursor to it, and set the origin to the cursor.
    """
    
    # Get all selected objects
    selected_objects = bpy.context.selected_objects
    
    if not selected_objects:
        print("No objects selected!")
        return
    
    # Store the current world cursor location to restore later if needed
    original_cursor_loc = bpy.context.scene.cursor.location.copy()
    
    for obj in selected_objects:
        print(f"\nProcessing: {obj.name}")
        
        # Make sure object is a mesh
        if obj.type != 'MESH':
            print(f"  Skipping {obj.name} - not a mesh object")
            continue
        
        # Select only this object and make it active
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Get the mesh and bmesh
        mesh = obj.data
        bm = bmesh.from_edit_mesh(mesh)
        
        # Find the lowest positioned face (minimum Z coordinate)
        lowest_face = None
        lowest_z = float('inf')
        lowest_center = None
        
        for face in bm.faces:
            # Get the center of the face in world space
            face_center_local = face.calc_center_bounds()
            face_center_world = obj.matrix_world @ face_center_local
            
            # Check if this is the lowest face (by Z coordinate)
            if face_center_world.z < lowest_z:
                lowest_z = face_center_world.z
                lowest_face = face
                lowest_center = face_center_world
        
        if lowest_face is not None:
            print(f"  Found lowest face at Z: {lowest_z:.4f}")
            
            # Select the lowest face
            lowest_face.select = True
            bm.select_flush_mode()
            
            # Update bmesh
            bmesh.update_edit_mesh(mesh)
            
            # Set cursor to the face center
            bpy.context.scene.cursor.location = lowest_center
            print(f"  Cursor set to: {lowest_center}")
        
        # Return to Object Mode
        bpy.ops.object.mode_set(mode='OBJECT')
        
        # Apply transforms
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        print(f"  Transforms applied")
        
        # Set origin to cursor
        bpy.ops.object.origin_set(type='ORIGIN_CURSOR', center='MEDIAN')
        print(f"  Origin set to cursor")
    
    # Restore selection to all original objects
    for obj in selected_objects:
        obj.select_set(True)
    
    print("\nProcessing complete!")

# Run the script
if __name__ == "__main__":
    process_selected_objects()
```