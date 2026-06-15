import sys, os, random
sys.path.insert(0, os.path.join("Blender Addons", "HouseShellGenerator"))
import core

ok = True
def check(label, cond):
    global ok
    print(("PASS" if cond else "FAIL"), label)
    ok = ok and cond

# --- parsing ---
w = core.parse_wall_object("[Wall_Tall_BrickWoodBottom_Plain_1]")
check("wall plain parse", w and w.height=="Tall" and w.style=="BrickWoodBottom" and w.wall_type=="Plain_1" and w.width==2.5 and not w.is_door and not w.is_window)
h = core.parse_wall_object("[Wall_Short_Brick_Half_2]")
check("wall half parse", h and h.width==1.25 and h.wall_type=="Half_2")
win = core.parse_wall_object("[Wall_Tall_Stucco_ShutteredWindow_1]")
check("wall window parse", win and win.is_window and win.wall_type=="ShutteredWindow_1")
d = core.parse_wall_object("[Door_Tall_Brick_Door_1]")
check("door parse", d and d.is_door and d.wall_type=="Door_1")
dsuf = core.parse_wall_object("[Wall_Short_Wood_BayWindow_2].001")
check("blender suffix tolerated", dsuf and dsuf.wall_type=="BayWindow_2")
check("non-wall rejected", core.parse_wall_object("Cube") is None)
p = core.parse_pillar_object("[Pillar_Tall_Corner_1]")
check("pillar parse", p and p.height=="Tall" and p.pillar_type=="Corner")
check("pillar pool no style", core.parse_pillar_pool("[Pillars_Tall]")=="Tall")
check("pillar pool w style rejected", core.parse_pillar_pool("[Pillars_Tall_Brick]") is None)
check("wall pool parse", core.parse_wall_pool("[Walls_Short_BrickFancy]")==("Short","BrickFancy"))

# --- subdivision sums exactly ---
rng = random.Random(1)
for length in (2.5, 5.0, 7.5, 10.0, 6.25, 11.25):
    for _ in range(50):
        widths = core.subdivide_length(length, rng)
        assert abs(sum(widths)-length) < 1e-9, (length, widths)
check("subdivision sums exact", True)

# --- rectangle edges form a closed CCW loop with 4 directions ---
edges = core.build_rectangle_edges(10.0, 5.0)
dirs = [e.direction for e in edges]
check("rectangle 4 directions", dirs == ["X+","Y+","X-","Y-"])

# --- slot centers wrap the rectangle (not a straight line) ---
for e in edges:
    n = int(round(e.length / core.WALL_FULL))
    e.slots = [core.Slot(i, core.WALL_FULL, "Brick", "Plain_1") for i in range(n)]
pts = []
for e in edges:
    for s in e.slots:
        c = core.slot_center(e, s.index, s.width, (0,0,0))
        pts.append((round(c[0],2), round(c[1],2)))
xs = {p[0] for p in pts}; ys = {p[1] for p in pts}
check("walls span 2D (not a row)", len(xs) > 1 and len(ys) > 1)
# bottom row at y=0, top row at y=5, sides at x=0 and x=10
check("bottom edge y=0", all(c[1]==0 for c in [core.slot_center(edges[0], s.index, s.width,(0,0,0)) for s in edges[0].slots]))
check("right edge x=10", all(round(c[0],2)==10 for c in [core.slot_center(edges[1], s.index, s.width,(0,0,0)) for s in edges[1].slots]))

# --- rotations are 4 distinct outward angles ---
rots = {d: round(core.rotation_for(d),4) for d in core.DIRECTIONS}
check("4 distinct rotations", len(set(rots.values()))==4)

# --- blueprint perimeter (rectangle) yields same 4 edges ---
bp = core.edges_from_perimeter([(0,0),(10,0),(10,5),(0,5)])
check("blueprint rectangle -> 4 edges", [e.direction for e in bp]==["X+","Y+","X-","Y-"])
# L-shape merges collinear, stays axis-aligned
lshape = core.edges_from_perimeter([(0,0),(10,0),(10,5),(5,5),(5,10),(0,10)])
check("L-shape -> 6 edges", len(lshape)==6 and all(e.direction in core.DIRECTIONS for e in lshape))

# --- model index + planning ---
idx = core.ModelIndex()
for t in ("Plain_1","Plain_2","SimpleWindow_1"):
    pw = core.parse_wall_object(f"[Wall_Tall_Brick_{t}]")
    idx.add_wall(f"obj_{t}", pw)
for t in ("Half_1",):
    pw = core.parse_wall_object(f"[Wall_Tall_Brick_{t}]")
    idx.add_wall(f"obj_{t}", pw)
shell = core.Shell("0_0",(0,0,0),"Tall","Brick",10.0,5.0, core.build_rectangle_edges(10.0,5.0))
warns = core.plan_shell(shell, idx, random.Random(3), False, ["Brick"], 0.5)
check("plan no warnings (models exist)", warns==[])
filled = all(len(e.slots)>0 for e in shell.edges)
check("all edges filled", filled)
windows = sum(1 for e in shell.edges for s in e.slots if s.is_window)
total = sum(len(e.slots) for e in shell.edges)
check("window cap respected per edge", all(
    sum(1 for s in e.slots if s.is_window) < len(e.slots) or len(e.slots)==1 for e in shell.edges))

# --- doors: only full-width, max 2, max 1/edge ---
doors = core.plan_doors(shell, random.Random(5), ensure_door=True)
check("doors <=2", len(doors)<=2)
check("doors full width only", all(slot.width==core.WALL_FULL for _,slot in doors))
check("doors >=1 when ensured", len(doors)>=1)

print()
print("ALL PASS" if ok else "SOME FAILED")
sys.exit(0 if ok else 1)
