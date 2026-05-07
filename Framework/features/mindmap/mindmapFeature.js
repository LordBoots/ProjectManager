import { BusEvents } from "../../core/EventBus.js";
import { showContextMenu } from "../../core/contextMenu.js";
import { resolveWikiPageIconUrl } from "../wiki/wikiPageIcons.js";

const PLANE_W = 2400,
  PLANE_H = 1800,
  GRID = 16,
  HIST = 48;
const WIKI_LINK_NODE_W = 200;
const WIKI_LINK_NODE_H = 76;
const FRAME_INNER_PAD = 10;
const FRAME_CREATE_PAD = 28;

/** Font size presets for mind map node text styling (dropdown values match stored style strings). */
const MM_FONT_SIZE_CHOICES = [
  ["11", "11"],
  ["12", "12"],
  ["13", "13"],
  ["14", "14"],
  ["16", "16"],
  ["18", "18"],
  ["20", "20"],
  ["22", "22"],
  ["24", "24"],
];

function nid() {
  return "n-" + Math.random().toString(36).slice(2, 8);
}
function fid() {
  return "f-" + Math.random().toString(36).slice(2, 8);
}
function snapShot(mm) {
  return {
    nodes: structuredClone(mm.nodes || []),
    edges: structuredClone(mm.edges || []),
    frames: structuredClone(mm.frames || []),
  };
}
function defStyles() {
  return {
    bg: "#ffffff",
    borderColor: "#4a5870",
    topBand: "",
    shadow: "1",
    radius: "12",
    fontSize: "16",
    fontWeight: "400",
    fontStyle: "normal",
    textAlign: "left",
    textDecoration: "none",
    fontColor: "#1a1d24",
    fontFamily: "inherit",
    imageHasTitle: "",
    imageTitlePos: "top",
    imageTitleAlign: "center",
    textHasHeader: "",
    headerFontSize: "17",
  };
}
function stylesOf(n) {
  return { ...defStyles(), ...(n.styles && typeof n.styles === "object" ? n.styles : {}) };
}
function isNote(n) {
  return String(n.type) === "note";
}
function isWikiLink(n) {
  return String(n.type) === "wikiLink";
}
/** paintShell uses 14px top border when topBand is set; other sides stay 2px — border-box shrinks wiki body by this amount without extra outer height. */
const WIKI_TOP_BAND_EXTRA_H = 14 - 2;
function defaultNodeW(n) {
  return isWikiLink(n) ? WIKI_LINK_NODE_W : 140;
}
function defaultNodeH(n) {
  return isWikiLink(n) ? WIKI_LINK_NODE_H : 80;
}
function storedNodeW(n) {
  return +n.w || defaultNodeW(n);
}
function storedNodeH(n) {
  return +n.h || defaultNodeH(n);
}
function wikiTopBandExtraH(n) {
  return isWikiLink(n) && stylesOf(n).topBand ? WIKI_TOP_BAND_EXTRA_H : 0;
}
function renderedNodeW(n) {
  return storedNodeW(n);
}
function renderedNodeH(n) {
  return storedNodeH(n) + wikiTopBandExtraH(n);
}
/** Notes and wiki link nodes never participate in graph edges. */
function rejectsMindmapEdges(n) {
  return isNote(n) || isWikiLink(n);
}
function mindmapAllowsEdge(a, b) {
  return !!(a && b && !rejectsMindmapEdges(a) && !rejectsMindmapEdges(b));
}

const MM_EDGE_CLIP_EPS = 1e-6;

/** Liang–Barsky: portion of segment P→Q lying inside axis-aligned rectangle [rx, ry, rw, rh]. Returns param interval [t0,t1] on the segment (0=P, 1=Q), or null. */
function segmentClipRect(px, py, qx, qy, rx, ry, rw, rh) {
  const xmin = rx,
    ymin = ry,
    xmax = rx + rw,
    ymax = ry + rh;
  let u0 = 0,
    u1 = 1;
  const dx = qx - px,
    dy = qy - py;

  const clip = (p, q) => {
    if (Math.abs(p) < MM_EDGE_CLIP_EPS) return q >= -MM_EDGE_CLIP_EPS;
    const r = q / p;
    if (p < 0) {
      if (r > u1 + MM_EDGE_CLIP_EPS) return false;
      if (r > u0) u0 = r;
    } else {
      if (r < u0 - MM_EDGE_CLIP_EPS) return false;
      if (r < u1) u1 = r;
    }
    return true;
  };

  if (!clip(-dx, px - xmin)) return null;
  if (!clip(dx, xmax - px)) return null;
  if (!clip(-dy, py - ymin)) return null;
  if (!clip(dy, ymax - py)) return null;

  return u0 <= u1 + MM_EDGE_CLIP_EPS ? { t0: u0, t1: Math.min(u1, 1) } : null;
}

/**
 * Directed link from parent `from` to child `to`, using creation order stored as from→to.
 * Segment is trimmed so it leaves the parent's box and stops on the child's border (arrow lands on child edge).
 */
function directedMindmapEdgeSegment(from, to) {
  const wF = renderedNodeW(from),
    hF = renderedNodeH(from),
    wT = renderedNodeW(to),
    hT = renderedNodeH(to);
  const px = +from.x + wF / 2,
    py = +from.y + hF / 2;
  const cx = +to.x + wT / 2,
    cy = +to.y + hT / 2;

  const clipFrom = segmentClipRect(px, py, cx, cy, +from.x, +from.y, wF, hF);
  const clipTo = segmentClipRect(px, py, cx, cy, +to.x, +to.y, wT, hT);

  let tStart = clipFrom ? clipFrom.t1 : 0;
  let tEnd = clipTo ? clipTo.t0 : 1;

  const parentCenterInsideChild =
    px >= +to.x - MM_EDGE_CLIP_EPS &&
    px <= +to.x + wT + MM_EDGE_CLIP_EPS &&
    py >= +to.y - MM_EDGE_CLIP_EPS &&
    py <= +to.y + hT + MM_EDGE_CLIP_EPS;
  /** Parent center overlaps child's box (stacked UI); arrow meets child border facing the parent vector. */
  if (parentCenterInsideChild && clipFrom) {
    const crBorder = segmentClipRect(cx, cy, px, py, +to.x, +to.y, wT, hT);
    const tBd = crBorder && crBorder.t1 > MM_EDGE_CLIP_EPS ? Math.min(crBorder.t1 - MM_EDGE_CLIP_EPS, crBorder.t1 * 0.999) : 0.015;
    const x2 = cx + (px - cx) * tBd,
      y2 = cy + (py - cy) * tBd,
      x1 = px + tStart * (cx - px),
      y1 = py + tStart * (cy - py);
    if (Math.hypot(x2 - x1, y2 - y1) < 4) {
      const dx = px - cx,
        dy = py - cy,
        d = Math.hypot(dx, dy) || 1,
        k = Math.min(24 / d, 0.45);
      return { x1: px, y1: py, x2: cx + dx * k, y2: cy + dy * k };
    }
    return { x1, y1, x2, y2 };
  }

  if (tEnd <= tStart + MM_EDGE_CLIP_EPS) {
    if (clipTo) {
      tEnd = clipTo.t0;
      const segLen = Math.hypot(cx - px, cy - py) || 1;
      const retreat = Math.min(28 / segLen, Math.max(MM_EDGE_CLIP_EPS, tEnd * 0.45));
      tStart = Math.max(0, tEnd - retreat);
    } else {
      tStart = 0;
      tEnd = 1;
    }
  }

  tStart = Math.max(0, Math.min(tStart, 1));
  tEnd = Math.max(MM_EDGE_CLIP_EPS, Math.min(tEnd, 1));
  if (tEnd <= tStart + MM_EDGE_CLIP_EPS) tEnd = Math.min(1, tStart + MM_EDGE_CLIP_EPS + 1e-3);

  const x1 = px + tStart * (cx - px),
    y1 = py + tStart * (cy - py);
  const x2 = px + tEnd * (cx - px),
    y2 = py + tEnd * (cy - py);

  return { x1, y1, x2, y2 };
}

function paintShell(el, n) {
  const s = stylesOf(n);
  el.style.backgroundColor = s.bg;
  el.style.borderRadius = (Number(s.radius) || 12) + "px";
  el.style.borderStyle = "solid";
  el.style.borderWidth = "2px";
  if (s.topBand) {
    el.style.borderTopWidth = "14px";
    el.style.borderTopColor = s.topBand;
    el.style.borderColor = s.borderColor;
  } else {
    el.style.borderColor = s.borderColor;
    el.style.borderTopColor = s.borderColor;
  }
  el.style.boxShadow = s.shadow === "1" ? "0 8px 20px rgba(0,0,0,0.12)" : "none";
}

function nodeCenter(n) {
  const w = renderedNodeW(n),
    h = renderedNodeH(n);
  return { x: +n.x + w / 2, y: +n.y + h / 2 };
}

function centerInsideFrame(n, fr) {
  const { x, y } = nodeCenter(n);
  const fx = +fr.x,
    fy = +fr.y,
    fw = +fr.w,
    fh = +fr.h;
  return x >= fx && x <= fx + fw && y >= fy && y <= fy + fh;
}

function hullOfMemberIds(mids, nm) {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  let any = false;
  for (const id of mids) {
    const n = nm.get(id);
    if (!n) continue;
    any = true;
    const w = renderedNodeW(n),
      h = renderedNodeH(n);
    x0 = Math.min(x0, +n.x);
    y0 = Math.min(y0, +n.y);
    x1 = Math.max(x1, +n.x + w);
    y1 = Math.max(y1, +n.y + h);
  }
  if (!any) return { x0: 0, y0: 0, x1: 96, y1: 64 };
  return { x0, y0, x1, y1 };
}

function minFrameSizeForMembers(mids, nm) {
  const { x0, y0, x1, y1 } = hullOfMemberIds(mids, nm);
  const minW = Math.max(48, x1 - x0 + 2 * FRAME_INNER_PAD);
  const minH = Math.max(36, y1 - y0 + 2 * FRAME_INNER_PAD);
  return { minW, minH, x0, y0, x1, y1 };
}

function reconcileFrameMembership(m) {
  const nm = new Map((m.nodes || []).map((nn) => [nn.id, nn]));
  for (const fr of m.frames || []) {
    const next = new Set();
    for (const mid of fr.memberIds || []) {
      const nn = nm.get(mid);
      if (nn && centerInsideFrame(nn, fr)) next.add(mid);
    }
    for (const nn of m.nodes || []) {
      if (centerInsideFrame(nn, fr)) next.add(nn.id);
    }
    fr.memberIds = [...next];
  }
}

export function createMindmapFeature(ctx) {
  const NS = "http://www.w3.org/2000/svg";
  const dev = () => ctx.permissions.canEditMindMap();
  const mm = () => ctx.store.getState().mindmap;
  const undo = [],
    redo = [],
    sel = new Set(),
    selEdges = new Set(),
    selFrames = new Set();
  let editing = null,
    linkA = null,
    linkDraft = null,
    vx = 0,
    vy = 0,
    sc = 1,
    dragN = null,
    dragP = null,
    dragR = null,
    dragF = null,
    dragFR = null,
    boxSel = null,
    clipboard = null;

  const root = document.createElement("div");
  root.className = "pm-mm-page";
  const tip = document.createElement("div");
  tip.className = "pm-toolbar pm-muted";
  const strip = document.createElement("div");
  strip.className = "pm-mm-styles-strip";
  const shell = document.createElement("div");
  shell.className = "pm-mm-wrap";
  const inner = document.createElement("div");
  inner.className = "pm-mm-canvas-inner";
  inner.tabIndex = 0;
  const plane = document.createElement("div");
  plane.className = "pm-mm-plane";
  Object.assign(plane.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: PLANE_W + "px",
    height: PLANE_H + "px",
    transformOrigin: "0 0",
  });
  const svg = document.createElementNS(NS, "svg");
  svg.classList.add("pm-svg-edges");
  svg.setAttribute("width", String(PLANE_W));
  svg.setAttribute("height", String(PLANE_H));
  plane.appendChild(svg);
  const framesWrap = document.createElement("div");
  framesWrap.className = "pm-mm-frames-layer";
  plane.appendChild(framesWrap);

  inner.appendChild(plane);
  shell.appendChild(inner);
  root.append(tip, strip, shell);
  const linkDropHint = document.createElement("div");
  linkDropHint.className = "pm-mm-link-drop-hint";
  plane.appendChild(linkDropHint);

  /** Drawn last in `draw()` so titles sit above nodes; hit targets have `pointer-events: auto`. */
  const frameTitlesLayer = document.createElement("div");
  frameTitlesLayer.className = "pm-mm-frame-titles-layer";

  function snapFn() {
    return mm().snapGrid === true ? (x) => Math.round(x / GRID) * GRID : (x) => x;
  }
  function tipUp() {
    const g = mm().snapGrid ? "ON" : "off";
    tip.textContent = dev()
      ? `Snap ${g} Alt+S · Shift or middle-drag pan · Wheel/↑↓ · box · multiselect · group drag · F · Ctrl+N · dbl-click text · Ctrl+E · Del · Ctrl+D · Ctrl+C/V · Undo/Redo · Ctrl+S · links · Ctrl+link · Frames (board RMB) · Esc`
      : "Viewer — Shift or middle-drag pan · wheel zoom";
  }
  function mut() {
    if (!dev()) return;
    undo.push(snapShot(mm()));
    if (undo.length > HIST) undo.shift();
    redo.length = 0;
  }
  function doUndo() {
    if (!dev() || !undo.length) return;
    redo.push(snapShot(mm()));
    const p = undo.pop();
    ctx.store.updateMindmap((m) => {
      m.nodes = p.nodes;
      m.edges = p.edges;
      m.frames = p.frames ?? [];
    });
    draw();
  }
  function doRedo() {
    if (!dev() || !redo.length) return;
    undo.push(snapShot(mm()));
    const p = redo.pop();
    ctx.store.updateMindmap((m) => {
      m.nodes = p.nodes;
      m.edges = p.edges;
      m.frames = p.frames ?? [];
    });
    draw();
  }
  function persistV() {
    ctx.store.updateMindmap((m) => {
      m.view = { x: vx, y: vy, scale: sc };
    });
  }
  function tf() {
    plane.style.transform = `translate(${vx}px,${vy}px) scale(${sc})`;
  }
  function planeFromClient(cx, cy) {
    const r = inner.getBoundingClientRect();
    return { x: (cx - r.left - vx) / sc, y: (cy - r.top - vy) / sc };
  }
  function hitNodePlane(px, py, excludeId) {
    const nodes = (mm().nodes || []).slice();
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (n.id === excludeId) continue;
      const ww = renderedNodeW(n),
        hh = renderedNodeH(n);
      if (px >= +n.x && px <= +n.x + ww && py >= +n.y && py <= +n.y + hh) return n;
    }
    return null;
  }
  function syncLinkDropHint() {
    if (!linkDraft || !linkDraft.hoverTargetId) {
      linkDropHint.style.visibility = "hidden";
      return;
    }
    const n = (mm().nodes || []).find((x) => x.id === linkDraft.hoverTargetId);
    if (!n || rejectsMindmapEdges(n)) {
      linkDropHint.style.visibility = "hidden";
      return;
    }
    linkDropHint.style.left = +n.x + (+n.w || 140) / 2 + "px";
    linkDropHint.style.top = +n.y + (+n.h || 80) / 2 + "px";
    linkDropHint.style.visibility = "visible";
  }
  function pruneStored() {
    ctx.store.updateMindmap((m) => {
      const nm = Object.fromEntries((m.nodes || []).map((x) => [x.id, x]));
      const next = (m.edges || []).filter((e) => {
        const a = nm[e.fromNodeId],
          b = nm[e.toNodeId];
        return mindmapAllowsEdge(a, b);
      });
      if (JSON.stringify(next) === JSON.stringify(m.edges || [])) return;
      m.edges = next;
    });
  }

  function drawEdges() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const defs = document.createElementNS(NS, "defs");
    function mkMarker(id, fill) {
      const marker = document.createElementNS(NS, "marker");
      marker.setAttribute("id", id);
      marker.setAttribute("markerUnits", "userSpaceOnUse");
      marker.setAttribute("markerWidth", "10");
      marker.setAttribute("markerHeight", "9");
      marker.setAttribute("refX", "10");
      marker.setAttribute("refY", "4.5");
      marker.setAttribute("orient", "auto");
      marker.setAttribute("viewBox", "0 0 10 9");
      const arrowPath = document.createElementNS(NS, "path");
      arrowPath.setAttribute("d", "M 10 4.5 L 0 0 L 0 9 Z");
      arrowPath.setAttribute("fill", fill);
      marker.appendChild(arrowPath);
      defs.appendChild(marker);
    }
    mkMarker("pm-mm-arrow-end", "#7d869a");
    mkMarker("pm-mm-arrow-end-sel", "#6c8cff");
    svg.appendChild(defs);

    const M = mm(),
      nm = Object.fromEntries((M.nodes || []).map((x) => [x.id, x]));
    for (const e of M.edges || []) {
      const A = nm[e.fromNodeId],
        B = nm[e.toNodeId];
      if (!A || !B || rejectsMindmapEdges(A) || rejectsMindmapEdges(B)) continue;
      const { x1: xa, y1: ya, x2: xb, y2: yb } = directedMindmapEdgeSegment(A, B);
      const selected = selEdges.has(e.id);
      const hit = document.createElementNS(NS, "line");
      hit.setAttribute("class", "pm-mm-edge-hit");
      hit.setAttribute("pointer-events", "stroke");
      hit.setAttribute("x1", String(xa));
      hit.setAttribute("y1", String(ya));
      hit.setAttribute("x2", String(xb));
      hit.setAttribute("y2", String(yb));
      hit.setAttribute("stroke", "#303030");
      hit.setAttribute("stroke-opacity", "0");
      hit.setAttribute("stroke-width", "20");
      hit.setAttribute("stroke-linecap", "round");
      const vis = document.createElementNS(NS, "line");
      vis.setAttribute("pointer-events", "none");
      vis.setAttribute("x1", String(xa));
      vis.setAttribute("y1", String(ya));
      vis.setAttribute("x2", String(xb));
      vis.setAttribute("y2", String(yb));
      vis.setAttribute("stroke", selected ? "#6c8cff" : "#7d869a");
      vis.setAttribute("stroke-width", selected ? "3" : "2");
      vis.setAttribute("marker-end", `url(#pm-mm-arrow-end${selected ? "-sel" : ""})`);
      svg.appendChild(hit);
      svg.appendChild(vis);
      hit.addEventListener("mousedown", (ev) => {
        ev.stopPropagation();
        if (ev.button !== 0 || !dev()) return;
        if (ev.shiftKey) selEdges.has(e.id) ? selEdges.delete(e.id) : selEdges.add(e.id);
        else {
          sel.clear();
          selEdges.clear();
          selFrames.clear();
          selEdges.add(e.id);
        }
        endMindmapEditing();
        linkA = null;
        rebuildStrip();
        draw();
      });
    }
    if (linkDraft) {
      const dl = document.createElementNS(NS, "line");
      dl.setAttribute("pointer-events", "none");
      dl.setAttribute("x1", String(linkDraft.x1));
      dl.setAttribute("y1", String(linkDraft.y1));
      dl.setAttribute("x2", String(linkDraft.x2));
      dl.setAttribute("y2", String(linkDraft.y2));
      dl.setAttribute("stroke", "#6c8cff");
      dl.setAttribute("stroke-width", "3");
      dl.setAttribute("stroke-dasharray", "8 5");
      svg.appendChild(dl);
    }
  }

  function fillBody(w, n) {
    w.replaceChildren();
    const s = stylesOf(n);
    if (n.type === "wikiLink") {
      const wrap = document.createElement("div");
      wrap.className = "pm-mm-wikilink-inner pm-mm-node-inner";
      const wikiState = ctx.store.getState().wiki;
      const pages = Array.isArray(wikiState?.pages) ? wikiState.pages : [];
      const page = n.wikiPageId ? pages.find((p) => p.id === n.wikiPageId) : null;
      const fromPageTitle = typeof page?.title === "string" ? page.title.trim() : "";
      const titleText =
        fromPageTitle || (typeof n.text === "string" ? String(n.text).trim() : "") || (n.wikiPageId ? "(Missing wiki page)" : "Wiki");

      const badge = document.createElement("div");
      badge.className = "pm-mm-wikilink-badge";
      const kind = document.createElement("div");
      kind.className = "pm-mm-wikilink-kind";
      kind.textContent = "Wiki";

      const iconWrap = document.createElement("div");
      iconWrap.className = "pm-mm-wikilink-icon";
      const rawIcon = page && typeof page.icon === "string" ? page.icon : "📄";
      const iconUrl = resolveWikiPageIconUrl(rawIcon);
      if (iconUrl) {
        const img = document.createElement("img");
        img.src = iconUrl;
        img.alt = "";
        img.draggable = false;
        iconWrap.appendChild(img);
      } else {
        const sp = document.createElement("span");
        sp.textContent = rawIcon?.trim() || "📄";
        iconWrap.appendChild(sp);
      }

      badge.append(kind, iconWrap);

      const lbl = document.createElement("div");
      lbl.className = "pm-mm-wikilink-title";
      lbl.textContent = titleText;

      wrap.append(badge, lbl);

      if (!dev() && n.wikiPageId) {
        wrap.classList.add("pm-mm-wikilink-inner--clickable");
        wrap.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          if (typeof ctx.router?.setRoute === "function") ctx.router.setRoute(`wiki:${n.wikiPageId}`);
        });
      }

      w.appendChild(wrap);
      return;
    }
    if (n.type === "image" && n.src) {
      const st = document.createElement("div");
      st.className = "pm-mm-node-inner";
      const cap = document.createElement("div");
      cap.className = "pm-mm-img-title";
      cap.textContent = (n.text || "Image").trim() || "Image";
      cap.style.textAlign = s.imageTitleAlign || "center";
      const im = document.createElement("img");
      im.src = n.src;
      im.alt = "";
      im.draggable = false;
      im.addEventListener("dragstart", (e) => e.preventDefault());
      const imWrap = document.createElement("div");
      imWrap.className = "pm-mm-img-wrap";
      imWrap.appendChild(im);
      if (s.imageTitlePos === "bottom") {
        st.append(imWrap);
        if (s.imageHasTitle === "1") st.append(cap);
      } else {
        if (s.imageHasTitle === "1") st.append(cap);
        st.append(imWrap);
      }
      w.appendChild(st);
      return;
    }

    if (n.type === "text") {
      const hasHeader = s.textHasHeader === "1";
      const align = s.textAlign || "left";
      /** @param {HTMLElement} el */
      const face = (el) => {
        el.style.textAlign = align;
        el.style.fontStyle = s.fontStyle || "normal";
        el.style.textDecoration = s.textDecoration || "none";
        el.style.color = s.fontColor || "#1a1d24";
        el.style.fontFamily = "inherit";
      };

      if (dev() && editing === n.id) {
        const wrap = document.createElement("div");
        wrap.className = "pm-mm-node-inner pm-mm-node-text-stack";

        /** @param {Record<string, unknown>} patch */
        const patchNode = (patch) => {
          ctx.store.updateMindmap((mm2) => {
            const o = (mm2.nodes || []).find((z) => z.id === n.id);
            if (!o || String(o.type) !== "text") return;
            Object.assign(o, patch);
          }, { silent: true });
          draw();
        };

        /** @param {HTMLTextAreaElement} te */
        const armTa = (te) => {
          te.classList.add("pm-mm-node-edit");
          te.addEventListener("mousedown", (e) => e.stopPropagation());
          te.addEventListener("pointerdown", (e) => e.stopPropagation());
          te.addEventListener("keydown", (ev) => {
            if (ev.code === "Escape") {
              ev.preventDefault();
              ev.stopPropagation();
              endMindmapEditing();
              rebuildStrip();
              draw();
              inner.focus();
            }
          });
        };

        if (hasHeader) {
          const hi = document.createElement("textarea");
          hi.className = "pm-mm-node-edit pm-mm-node-edit-header";
          hi.value = typeof n.header === "string" ? n.header : "";
          hi.rows = 2;
          face(hi);
          hi.style.fontSize = (Number(s.headerFontSize) || 17) + "px";
          hi.style.fontWeight = "600";
          hi.style.lineHeight = "1.25";
          hi.addEventListener("input", () => patchNode({ header: hi.value }));
          armTa(hi);
          wrap.appendChild(hi);

          const bi = document.createElement("textarea");
          bi.className = "pm-mm-node-edit pm-mm-node-edit-body";
          bi.value = n.text ?? "";
          bi.rows = 3;
          face(bi);
          bi.style.fontSize = (Number(s.fontSize) || 16) + "px";
          bi.style.fontWeight = String(s.fontWeight || 400);
          bi.style.lineHeight = "1.35";
          bi.addEventListener("input", () => patchNode({ text: bi.value }));
          armTa(bi);
          wrap.appendChild(bi);
        } else {
          const ta = document.createElement("textarea");
          ta.className = "pm-mm-node-edit pm-mm-node-edit-single";
          ta.value = n.text ?? "";
          ta.rows = 4;
          face(ta);
          ta.style.fontSize = (Number(s.fontSize) || 16) + "px";
          ta.style.fontWeight = String(s.fontWeight || 400);
          ta.style.lineHeight = "1.35";
          ta.addEventListener("input", () => patchNode({ text: ta.value }));
          armTa(ta);
          wrap.appendChild(ta);
        }
        w.appendChild(wrap);
        return;
      }

      if (hasHeader) {
        const wrap = document.createElement("div");
        wrap.className = "pm-mm-node-inner pm-mm-node-text-stack";
        const hEl = document.createElement("div");
        hEl.className = "pm-mm-node-heading";
        hEl.textContent = typeof n.header === "string" ? n.header : "";
        face(hEl);
        hEl.style.whiteSpace = "pre-wrap";
        hEl.style.fontSize = (Number(s.headerFontSize) || 17) + "px";
        hEl.style.fontWeight = "600";
        hEl.style.lineHeight = "1.25";
        hEl.style.flexShrink = "0";

        const bEl = document.createElement("div");
        bEl.className = "pm-mm-node-bodytext pm-mm-node-text";
        bEl.textContent = n.text ?? "";
        face(bEl);
        bEl.style.whiteSpace = "pre-wrap";
        bEl.style.fontSize = (Number(s.fontSize) || 16) + "px";
        bEl.style.fontWeight = String(s.fontWeight || 400);
        bEl.style.lineHeight = "1.35";
        bEl.style.flex = "1";
        bEl.style.minHeight = "0";
        bEl.style.overflow = "auto";

        wrap.append(hEl, bEl);
        w.appendChild(wrap);
        return;
      }

      const te = document.createElement("div");
      te.className = "pm-mm-node-text pm-mm-node-inner";
      te.textContent = n.text ?? "";
      face(te);
      te.style.whiteSpace = "pre-wrap";
      te.style.fontSize = (Number(s.fontSize) || 16) + "px";
      te.style.fontWeight = String(s.fontWeight || 400);
      te.style.lineHeight = "1.35";
      w.appendChild(te);
      return;
    }

    const t = document.createElement("div");
    t.className = "pm-mm-node-text pm-mm-node-inner";
    t.textContent = n.text ?? "";
    t.style.textAlign = s.textAlign || "left";
    t.style.fontSize = (s.fontSize || 16) + "px";
    t.style.fontWeight = String(s.fontWeight || 400);
    t.style.fontStyle = s.fontStyle || "normal";
    t.style.textDecoration = s.textDecoration || "none";
    t.style.color = s.fontColor || "#1a1d24";
    w.appendChild(t);
  }

  /** Persist in-DOM text node editors before redraw removes their textareas. */
  function flushTextNodeEditors() {
    if (!editing || !dev()) return;
    const nid = editing;
    const node = (mm().nodes || []).find((z) => z.id === nid);
    if (!node || String(node.type) !== "text") return;
    const pane = plane.querySelector(`[data-node-id="${nid}"]`);
    if (!pane) return;
    const hdr = pane.querySelector(".pm-mm-node-edit-header");
    const body = pane.querySelector(".pm-mm-node-edit-body");
    const single = pane.querySelector(".pm-mm-node-edit-single");
    if (hdr && body) {
      ctx.store.updateMindmap((mm2) => {
        const o = (mm2.nodes || []).find((z) => z.id === nid);
        if (!o) return;
        o.header = hdr.value;
        o.text = body.value;
      }, { silent: true });
    } else if (single) {
      ctx.store.updateMindmap((mm2) => {
        const o = (mm2.nodes || []).find((z) => z.id === nid);
        if (!o) return;
        o.text = single.value;
      }, { silent: true });
    }
  }

  function endMindmapEditing() {
    flushTextNodeEditors();
    editing = null;
  }

  function rebuildStrip() {
    strip.replaceChildren();
    const on = editing !== null;
    strip.classList.toggle("pm-mm-styles-visible", on);
    if (!on) return;
    const n = (mm().nodes || []).find((x) => x.id === editing);
    if (!n) {
      endMindmapEditing();
      strip.classList.remove("pm-mm-styles-visible");
      return;
    }
    const cur = stylesOf(n);
    const row = (lab, el) => {
      const r = document.createElement("div");
      r.className = "pm-mm-style-field";
      const l = document.createElement("label");
      l.textContent = lab;
      r.append(l, el);
      strip.appendChild(r);
    };
    const setk = (k, v) => {
      ctx.store.updateMindmap((m) => {
        const o = (m.nodes || []).find((z) => z.id === editing);
        if (o) o.styles = { ...stylesOf(o), [k]: v };
      });
      draw();
    };
    const mkSel = (pairs, k, val) => {
      const x = document.createElement("select");
      x.className = "pm-select";
      pairs.forEach(([a, b]) => {
        const o = document.createElement("option");
        o.value = a;
        o.textContent = b;
        x.appendChild(o);
      });
      x.value = val;
      if (![...x.options].some((o) => o.value === x.value)) x.value = pairs[0][0];
      x.addEventListener("change", () => setk(k, x.value));
      return x;
    };
    const col = (k, fallback) => {
      const i = document.createElement("input");
      i.type = "color";
      i.value = /^#/.test(cur[k] || "") ? cur[k] : fallback;
      i.addEventListener("input", () => setk(k, i.value));
      return i;
    };
    row("Fill", col("bg", "#ffffff"));
    row("Border", col("borderColor", "#4a5870"));
    row("Top", col("topBand", "#6c8cff"));
    row("Shadow", mkSel(
      [
        ["1", "On"],
        ["0", "Off"],
      ],
      "shadow",
      cur.shadow
    ));
    row("Radius", mkSel(
      [
        ["8", "8"],
        ["12", "12"],
        ["20", "20"],
      ],
      "radius",
      cur.radius
    ));
    if (n.type === "text") {
      const hc = document.createElement("input");
      hc.type = "checkbox";
      hc.checked = cur.textHasHeader === "1";
      hc.addEventListener("change", () => {
        const on = hc.checked;
        ctx.store.updateMindmap((m2) => {
          const o = (m2.nodes || []).find((z) => z.id === editing);
          if (!o) return;
          o.styles = { ...stylesOf(o), textHasHeader: on ? "1" : "" };
          if (on && typeof o.header !== "string") o.header = "";
        });
        draw();
      });
      row("Show header", hc);
      if (cur.textHasHeader === "1") {
        row(
          "Header size",
          mkSel(MM_FONT_SIZE_CHOICES, "headerFontSize", String(Number(cur.headerFontSize) || 17))
        );
      }
      row(
        cur.textHasHeader === "1" ? "Body size" : "Size",
        mkSel(MM_FONT_SIZE_CHOICES, "fontSize", String(Number(cur.fontSize) || 16))
      );
      row(
        "Align",
        mkSel(
          [
            ["left", "L"],
            ["center", "C"],
            ["right", "R"],
          ],
          "textAlign",
          cur.textAlign
        )
      );
    } else if (n.type === "note") {
      row("Size", mkSel(MM_FONT_SIZE_CHOICES, "fontSize", String(Number(cur.fontSize) || 16)));
      row(
        "Align",
        mkSel(
          [
            ["left", "L"],
            ["center", "C"],
            ["right", "R"],
          ],
          "textAlign",
          cur.textAlign
        )
      );
    }
    if (n.type === "image") {
      row("Title", mkSel(
        [
          ["", "Off"],
          ["1", "On"],
        ],
        "imageHasTitle",
        cur.imageHasTitle || ""
      ));
      row("T-pos", mkSel(
        [
          ["top", "Top"],
          ["bottom", "Bot"],
        ],
        "imageTitlePos",
        cur.imageTitlePos
      ));
    }
    const done = document.createElement("button");
    done.type = "button";
    done.className = "pm-btn";
    done.textContent = "Done";
    done.addEventListener("click", () => {
      endMindmapEditing();
      rebuildStrip();
      draw();
    });
    row("", done);
  }

  /** Camera: fit viewport to selected node bounds (F key); not MindMap frames. */
  function fitViewToSel() {
    const nodes = mm().nodes || [],
      list = [...sel].map((id) => nodes.find((x) => x.id === id)).filter(Boolean);
    if (!list.length) return;
    let x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;
    for (const n of list) {
      x0 = Math.min(x0, +n.x);
      y0 = Math.min(y0, +n.y);
      x1 = Math.max(x1, +n.x + renderedNodeW(n));
      y1 = Math.max(y1, +n.y + renderedNodeH(n));
    }
    const tcx = (x0 + x1) / 2,
      tcy = (y0 + y1) / 2,
      r = shell.getBoundingClientRect();
    vx = r.width / 2 - tcx * sc;
    vy = r.height / 2 - tcy * sc;
    tf();
    persistV();
    draw();
  }

  function openAdd(cb) {
    const bk = document.createElement("div");
    bk.className = "pm-overlay";
    const box = document.createElement("div");
    box.className = "pm-modal";
    const title = document.createElement("p");
    title.className = "pm-pane-title";
    title.style.margin = "0 0 0.75rem";
    title.textContent = "Add node";
    const row = document.createElement("div");
    row.className = "pm-toolbar";
    const imageBlock = document.createElement("div");
    imageBlock.className = "pm-stack";
    imageBlock.hidden = true;
    const urlLab = document.createElement("span");
    urlLab.className = "pm-label";
    urlLab.textContent = "Image URL";
    const urlIn = document.createElement("input");
    urlIn.className = "pm-input";
    urlIn.placeholder = "https://...";
    const uploadLab = document.createElement("span");
    uploadLab.className = "pm-label";
    uploadLab.textContent = "Upload from disk";
    const fileIn = document.createElement("input");
    fileIn.type = "file";
    fileIn.accept = "image/*";
    fileIn.className = "pm-mm-add-file-input";
    const fileBtn = document.createElement("button");
    fileBtn.type = "button";
    fileBtn.className = "pm-btn";
    fileBtn.textContent = "Browse…";
    let uploadedSrc = null;
    fileIn.addEventListener("change", () => {
      const f = fileIn.files?.[0];
      if (!f) {
        uploadedSrc = null;
        return;
      }
      const fr = new FileReader();
      fr.onload = () => {
        uploadedSrc = String(fr.result || "");
      };
      fr.readAsDataURL(f);
    });
    fileBtn.addEventListener("click", () => fileIn.click());
    const uploadRow = document.createElement("div");
    uploadRow.className = "pm-toolbar";
    uploadRow.style.marginBottom = "0";
    uploadRow.append(uploadLab, fileBtn);
    imageBlock.append(urlLab, urlIn, uploadRow, fileIn);
    const wikiBlock = document.createElement("div");
    wikiBlock.className = "pm-stack";
    wikiBlock.hidden = true;
    const wikiLab = document.createElement("span");
    wikiLab.className = "pm-label";
    wikiLab.textContent = "Wiki page";
    const wikiSel = document.createElement("select");
    wikiSel.className = "pm-select";
    wikiBlock.append(wikiLab, wikiSel);

    const wikiPages = Array.isArray(ctx.store.getState().wiki?.pages) ? [...ctx.store.getState().wiki.pages] : [];
    wikiPages.sort((a, b) => String(a.title || a.id || "").localeCompare(String(b.title || b.id || "")));
    for (const p of wikiPages) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = String(p.title || p.id || "Untitled");
      wikiSel.appendChild(opt);
    }

    let pick = "text";
    const typeBtns = [];
    let wikiTypeBtn = null;

    function setPick(k) {
      if (k === "wikiLink" && !wikiPages.length) return;
      pick = k;
      typeBtns.forEach(([key, btn]) => {
        btn.classList.toggle("pm-mm-add-type--selected", key === pick);
      });
      imageBlock.hidden = k !== "image";
      wikiBlock.hidden = k !== "wikiLink";
      if (k !== "image") {
        uploadedSrc = null;
        fileIn.value = "";
      }
    }
    for (const [k, lab] of [
      ["text", "Text"],
      ["note", "Note"],
      ["image", "Image"],
      ["wikiLink", "Wiki link"],
    ]) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pm-btn pm-mm-add-type";
      b.textContent = lab;
      b.addEventListener("click", () => setPick(k));
      typeBtns.push([k, b]);
      row.appendChild(b);
      if (k === "wikiLink") wikiTypeBtn = b;
    }
    if (wikiTypeBtn) wikiTypeBtn.disabled = wikiPages.length === 0;

    setPick("text");
    const act = document.createElement("div");
    act.className = "pm-toolbar";
    act.style.marginTop = "0.5rem";
    const ok = document.createElement("button");
    ok.className = "pm-btn pm-btn-primary";
    ok.textContent = "Create";
    ok.addEventListener("click", () => {
      if (!pick) return;
      if (pick === "wikiLink") {
        const wikiPageId = wikiSel.value;
        if (!wikiPageId) return;
        const pg = wikiPages.find((p) => p.id === wikiPageId);
        const wikiTitle = typeof pg?.title === "string" ? pg.title.trim() : "";
        bk.remove();
        cb({ type: "wikiLink", wikiPageId, wikiTitle: wikiTitle || "Wiki" });
        return;
      }
      let src = "";
      if (pick === "image") {
        src = uploadedSrc || urlIn.value.trim();
        if (!src) return;
      }
      bk.remove();
      cb({ type: pick, src });
    });
    const cx = document.createElement("button");
    cx.className = "pm-btn";
    cx.textContent = "Cancel";
    cx.addEventListener("click", () => bk.remove());
    act.append(ok, cx);
    box.append(title, row, imageBlock, wikiBlock, act);
    bk.append(box);
    document.body.appendChild(bk);
  }

  function createFrameAroundSelection() {
    if (!dev() || !sel.size) return;
    const nodes = mm().nodes || [],
      nm = new Map(nodes.map((n) => [n.id, n]));
    let x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;
    for (const sid of sel) {
      const n = nm.get(sid);
      if (!n) continue;
      x0 = Math.min(x0, +n.x);
      y0 = Math.min(y0, +n.y);
      x1 = Math.max(x1, +n.x + renderedNodeW(n));
      y1 = Math.max(y1, +n.y + renderedNodeH(n));
    }
    if (x0 === Infinity) return;
    const SF = snapFn();
    mut();
    const id = fid();
    const x = SF(x0 - FRAME_CREATE_PAD);
    const y = SF(y0 - FRAME_CREATE_PAD);
    const w = SF(Math.max(80, x1 - x0 + 2 * FRAME_CREATE_PAD));
    const h = SF(Math.max(56, y1 - y0 + 2 * FRAME_CREATE_PAD));
    const memberIds = [...sel];
    ctx.store.updateMindmap((m) => {
      m.frames = [...(m.frames || []), { id, x, y, w, h, memberIds, title: "" }];
    });
    sel.clear();
    selEdges.clear();
    selFrames.clear();
    selFrames.add(id);
    draw();
  }

  /**
   * Frames render under nodes; backdrop hits (plane/svg) rarely reach the `.pm-mm-frame` div.
   * Pick a frame under the pointer when the hit target isn't a node or edge stripe.
   */
  function tryMindmapFramePointerDown(ev) {
    if (ev.shiftKey) return false;
    if (!plane.contains(/** @type {Node} */ (ev.target))) return false;
    const t = ev.target;
    if (t.closest && t.closest(".pm-mm-frame-title-host")) return false;
    if (t.closest && (t.closest(".pm-mm-node") || t.closest(".pm-mm-edge-hit"))) return false;
    const p = planeFromClient(ev.clientX, ev.clientY);
    if (hitNodePlane(p.x, p.y)) return false;

    const framesRev = [...(mm().frames || [])].reverse();
    const tol = Math.max(6, 14 / sc);
    const nm = new Map((mm().nodes || []).map((n) => [n.id, n]));

    for (const fr of framesRev) {
      const fx = +fr.x,
        fy = +fr.y,
        fw = +fr.w,
        fh = +fr.h;
      const rdx = Math.abs(p.x - (fx + fw)),
        rdy = Math.abs(p.y - (fy + fh));
      const nearSe = rdx < tol && rdy < tol;
      const insideBody = p.x >= fx && p.x <= fx + fw && p.y >= fy && p.y <= fy + fh;
      if (!nearSe && !insideBody) continue;

      if (nearSe) {
        const { minW, minH } = minFrameSizeForMembers(fr.memberIds || [], nm);
        mut();
        sel.clear();
        selEdges.clear();
        selFrames.clear();
        selFrames.add(fr.id);
        endMindmapEditing();
        rebuildStrip();
        dragFR = {
          fid: fr.id,
          fx0: +fr.x,
          fy0: +fr.y,
          fw0: +fr.w,
          fh0: +fr.h,
          minW,
          minH,
          cx: ev.clientX,
          cy: ev.clientY,
        };
        draw();
        return true;
      }

      mut();
      sel.clear();
      selEdges.clear();
      selFrames.clear();
      selFrames.add(fr.id);
      endMindmapEditing();
      rebuildStrip();
      const orig = new Map();
      orig.set("__frame__", { x: +fr.x, y: +fr.y });
      for (const mid of [...(fr.memberIds || [])]) {
        const n = nm.get(mid);
        if (n) orig.set(mid, { x: +n.x, y: +n.y });
      }
      dragF = {
        fid: fr.id,
        cx: ev.clientX,
        cy: ev.clientY,
        orig,
      };
      draw();
      return true;
    }
    return false;
  }

  function paintFrameWidget(fr) {
    const nm = new Map((mm().nodes || []).map((n) => [n.id, n]));
    const mids = [...(fr.memberIds || [])];

    const box = document.createElement("div");
    box.className = "pm-mm-frame" + (selFrames.has(fr.id) ? " pm-mm-frame-sel" : "");
    box.dataset.frameId = fr.id;
    Object.assign(box.style, {
      position: "absolute",
      left: +fr.x + "px",
      top: +fr.y + "px",
      width: +fr.w + "px",
      height: +fr.h + "px",
    });

    if (dev()) {
      const rh = document.createElement("div");
      rh.className = "pm-mm-frame-res-h";
      rh.title = "Resize frame";
      rh.addEventListener("mousedown", (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        const { minW, minH } = minFrameSizeForMembers(fr.memberIds || [], nm);
        mut();
        dragFR = {
          fid: fr.id,
          fx0: +fr.x,
          fy0: +fr.y,
          fw0: +fr.w,
          fh0: +fr.h,
          minW,
          minH,
          cx: ev.clientX,
          cy: ev.clientY,
        };
      });
      box.appendChild(rh);
      box.addEventListener("mousedown", (ev) => {
        if (ev.button !== 0) return;
        ev.stopPropagation();
        if (ev.shiftKey) {
          selEdges.clear();
          sel.clear();
          selFrames.has(fr.id) ? selFrames.delete(fr.id) : selFrames.add(fr.id);
          endMindmapEditing();
          rebuildStrip();
          draw();
          return;
        }
        if (ev.target !== box) return;
        mut();
        sel.clear();
        selEdges.clear();
        selFrames.clear();
        selFrames.add(fr.id);
        const orig = new Map();
        orig.set("__frame__", { x: +fr.x, y: +fr.y });
        for (const mid of mids) {
          const n = nm.get(mid);
          if (n) orig.set(mid, { x: +n.x, y: +n.y });
        }
        dragF = {
          fid: fr.id,
          cx: ev.clientX,
          cy: ev.clientY,
          orig,
        };
      });
      box.addEventListener("contextmenu", (ev) => {
        ev.preventDefault();
      });
    }
    framesWrap.appendChild(box);
  }

  function paintFrameTitleOverlays() {
    const ae = document.activeElement;
    if (ae instanceof HTMLInputElement && ae.classList.contains("pm-mm-frame-title-input")) {
      const host = ae.closest(".pm-mm-frame-title-host");
      const fid = host?.dataset?.frameId;
      if (fid) {
        const nextVal = ae.value.trim();
        const prevF = (mm().frames || []).find((ff) => ff.id === fid);
        const prevVal = typeof prevF?.title === "string" ? prevF.title.trim() : "";
        if (nextVal !== prevVal) {
          mut();
          ctx.store.updateMindmap((mm2) => {
            const f = (mm2.frames || []).find((ff) => ff.id === fid);
            if (f) f.title = nextVal;
          }, { silent: true });
        }
      }
    }

    frameTitlesLayer.replaceChildren();
    for (const fr of mm().frames || []) {
      const stored = typeof fr.title === "string" ? fr.title.trim() : "";
      if (!dev() && !stored) continue;

      const fx = +fr.x,
        fy = +fr.y;

      const host = document.createElement("div");
      host.className = "pm-mm-frame-title-host";
      host.dataset.frameId = fr.id;
      host.style.left = fx + 8 + "px";
      host.style.top = fy + "px";

      const hit = document.createElement("div");
      hit.className = "pm-mm-frame-title-hit";
      hit.title = dev() ? "Frame title" : stored;

      const lab = document.createElement("span");
      lab.className = "pm-mm-frame-title-text" + (!stored ? " pm-mm-frame-title-text--empty" : "");
      lab.textContent = stored || "Add title";

      hit.appendChild(lab);

      if (dev()) {
        hit.addEventListener("mousedown", (e) => e.stopPropagation());
        hit.addEventListener("pointerdown", (e) => e.stopPropagation());
        hit.addEventListener("dblclick", (e) => e.stopPropagation());

        hit.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!dev() || hit.querySelector(".pm-mm-frame-title-input")) return;

          const prevSnapshot = (typeof fr.title === "string" ? fr.title : "").trim();

          lab.style.display = "none";
          const inp = document.createElement("input");
          inp.type = "text";
          inp.className = "pm-mm-frame-title-input pm-input";
          inp.placeholder = "Frame title";
          inp.value = typeof fr.title === "string" ? fr.title : "";
          hit.appendChild(inp);
          inp.focus();
          inp.select();

          const finalize = (commit) => {
            const inpEl = hit.querySelector("input.pm-mm-frame-title-input");
            if (!inpEl) return;
            const nextVal = inpEl.value.trim();
            inpEl.remove();
            lab.style.display = "";
            const shown = commit ? nextVal : prevSnapshot;
            lab.textContent = shown || "Add title";
            lab.classList.toggle("pm-mm-frame-title-text--empty", !shown);

            if (commit && nextVal !== prevSnapshot) {
              mut();
              const fid = fr.id;
              ctx.store.updateMindmap((mm2) => {
                const f = (mm2.frames || []).find((ff) => ff.id === fid);
                if (!f) return;
                f.title = nextVal;
              });
              draw();
            }
          };

          inp.addEventListener("blur", () => finalize(true));
          inp.addEventListener("keydown", (ev) => {
            if (ev.key === "Escape") {
              ev.preventDefault();
              ev.stopPropagation();
              finalize(false);
            } else if (ev.key === "Enter") {
              ev.preventDefault();
              inp.blur();
            }
          });
        });
      }

      host.appendChild(hit);
      frameTitlesLayer.appendChild(host);
    }

    plane.appendChild(frameTitlesLayer);
  }

  function draw() {
    flushTextNodeEditors();

    /** Capture focused text field before DOM is replaced (edit mode + live store updates). */
    let taSnap = null;
    if (editing !== null && dev()) {
      const pane = plane.querySelector(`[data-node-id="${editing}"]`);
      const ae = document.activeElement;
      if (pane && ae instanceof HTMLTextAreaElement && pane.contains(ae)) {
        taSnap = {
          nid: editing,
          kind: ae.classList.contains("pm-mm-node-edit-header")
            ? "h"
            : ae.classList.contains("pm-mm-node-edit-body")
              ? "b"
              : "s",
          start: ae.selectionStart,
          end: ae.selectionEnd,
        };
      }
    }

    const m = mm();
    for (const eid of [...selEdges]) {
      if (!(m.edges || []).some((ed) => ed.id === eid)) selEdges.delete(eid);
    }
    for (const fid of [...selFrames]) {
      if (!(m.frames || []).some((fr) => fr.id === fid)) selFrames.delete(fid);
    }
    vx = typeof m.view?.x === "number" ? m.view.x : vx;
    vy = typeof m.view?.y === "number" ? m.view.y : vy;
    sc = typeof m.view?.scale === "number" ? Math.min(3.5, Math.max(0.15, m.view.scale)) : Math.min(3.5, Math.max(0.15, sc));
    tf();
    plane.querySelectorAll(".pm-mm-node").forEach((e) => e.remove());
    framesWrap.replaceChildren();
    const SF = snapFn();
    for (const fr of m.frames || []) paintFrameWidget(fr);

    for (const n of m.nodes || []) {
      const pad = document.createElement("div");
      pad.dataset.nodeId = n.id;
      pad.className =
        "pm-mm-node" +
        (String(n.type) === "image" ? " pm-mm-node-image" : "") +
        (isNote(n) ? " pm-mm-node-note" : "") +
        (isWikiLink(n) ? " pm-mm-node-wikilink" : "");
      pad.style.left = +n.x + "px";
      pad.style.top = +n.y + "px";
      pad.style.width = storedNodeW(n) + "px";
      pad.style.height = renderedNodeH(n) + "px";
      pad.style.display = "flex";
      pad.style.flexDirection = "column";
      paintShell(pad, n);
      if (sel.has(n.id)) {
        pad.classList.add("pm-highlight");
        pad.style.outline = "2px solid var(--pm-accent)";
      }
      const body = document.createElement("div");
      body.style.flex = "1";
      body.style.minHeight = "0";
      body.style.width = "100%";
      pad.appendChild(body);
      fillBody(body, n);

      pad.addEventListener("mouseenter", () => ctx.bus.emit(BusEvents.ENTITY_HOVER, { type: "mindmapNode", id: n.id }));
      pad.addEventListener("mousedown", (ev) => {
        ev.stopPropagation();
        /** Clicks on the text-edit stack bubble to pad; skipping this would call inner.focus() and endMindmapEditing(), nuking textarea focus/caret (header vs body especially). */
        const onActiveTextEditor =
          !ev.shiftKey &&
          dev() &&
          editing === n.id &&
          String(n.type) === "text" &&
          ev.target instanceof Element &&
          ev.target.closest(".pm-mm-node-text-stack");

        if (!onActiveTextEditor && !ev.shiftKey) inner.focus();
        if (!dev()) {
          selEdges.clear();
          selFrames.clear();
          sel.clear();
          sel.add(n.id);
          draw();
          return;
        }
        if (ev.button !== 0) return;
        if (ev.shiftKey) {
          selEdges.clear();
          sel.has(n.id) ? sel.delete(n.id) : sel.add(n.id);
          selFrames.clear();
          endMindmapEditing();
          rebuildStrip();
          draw();
          return;
        }
        selEdges.clear();
        selFrames.clear();
        if (!sel.has(n.id)) {
          sel.clear();
          sel.add(n.id);
        }
        if (!onActiveTextEditor) {
          endMindmapEditing();
          rebuildStrip();
        }
        if (ev.ctrlKey || ev.metaKey) {
          if (rejectsMindmapEdges(n)) {
            linkA = null;
            draw();
            return;
          }
          if (!linkA) linkA = n.id;
          else {
            if (linkA !== n.id && !rejectsMindmapEdges(n)) {
              mut();
              ctx.store.updateMindmap((mm2) => {
                const dup = (mm2.edges || []).some((e) => e.fromNodeId === linkA && e.toNodeId === n.id);
                if (!dup) (mm2.edges = mm2.edges || []).push({ id: "e-" + nid(), fromNodeId: linkA, toNodeId: n.id });
              });
            }
            linkA = null;
          }
          draw();
          return;
        }
        mut();
        const dragOrig = new Map();
        for (const sid of sel) {
          const pn = (mm().nodes || []).find((z) => z.id === sid);
          if (pn) dragOrig.set(sid, { x: +pn.x, y: +pn.y });
        }
        dragN = { cx: ev.clientX, cy: ev.clientY, orig: dragOrig };
      });

      pad.addEventListener("contextmenu", (ev) => {
        ev.preventDefault();
        showContextMenu({
          x: ev.clientX,
          y: ev.clientY,
          items: [
            {
              label: dev() ? "Dev note" : "Suggest",
              onClick: () =>
                ctx.bus.emit(BusEvents.OPEN_SUGGESTION_FORM, {
                  type: "mindmapNode",
                  id: n.id,
                  kind: dev() ? "devNote" : "suggestion",
                }),
            },
          ],
        });
      });
      pad.addEventListener("dblclick", (ev) => {
        if (!dev()) return;
        if (isWikiLink(n)) return;
        ev.stopPropagation();
        if (n.type === "text") {
          mut();
          editing = n.id;
          selEdges.clear();
          selFrames.clear();
          if (!sel.has(n.id)) {
            sel.clear();
            sel.add(n.id);
          }
          rebuildStrip();
          draw();
          requestAnimationFrame(() => {
            const pane = plane.querySelector(`[data-node-id="${n.id}"]`);
            const focusEl =
              pane?.querySelector(".pm-mm-node-edit-header") ??
              pane?.querySelector(".pm-mm-node-edit-single") ??
              pane?.querySelector(".pm-mm-node-edit-body");
            focusEl?.focus?.();
          });
          return;
        }
        const nt = prompt("Edit label", String(n.text || ""));
        if (nt === null) return;
        mut();
        ctx.store.updateMindmap((mm2) => {
          const o = (mm2.nodes || []).find((z) => z.id === n.id);
          if (o) o.text = nt;
        });
        draw();
      });

      if (dev() && sel.size === 1 && sel.has(n.id) && !rejectsMindmapEdges(n)) {
        for (const side of ["n", "e", "s", "w"]) {
          const prt = document.createElement("div");
          prt.className = "pm-mm-link-port pm-mm-link-port--" + side;
          prt.addEventListener("mousedown", (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            const w = +n.w || 140,
              h = +n.h || 80,
              x = +n.x,
              y = +n.y;
            const o = { n: [x + w / 2, y], e: [x + w, y + h / 2], s: [x + w / 2, y + h], w: [x, y + h / 2] };
            const xy = o[side];
            linkDraft = { fromNodeId: n.id, x1: xy[0], y1: xy[1], x2: xy[0], y2: xy[1], hoverTargetId: null };
            drawEdges();
            syncLinkDropHint();
          });
          pad.appendChild(prt);
        }
      }

      if (dev() && sel.size === 1 && sel.has(n.id) && !isWikiLink(n)) {
        const h = document.createElement("div");
        h.className = "pm-mm-resize-h";
        h.addEventListener("mousedown", (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          mut();
          dragR = { nid: n.id, w0: +n.w || 140, h0: +n.h || 80, cx: ev.clientX, cy: ev.clientY };
        });
        pad.appendChild(h);
      }
      plane.appendChild(pad);
    }
    drawEdges();
    tipUp();
    syncLinkDropHint();

    paintFrameTitleOverlays();

    if (taSnap) {
      const snap = taSnap;
      requestAnimationFrame(() => {
        const pane = plane.querySelector(`[data-node-id="${snap.nid}"]`);
        if (!pane) return;
        const te =
          snap.kind === "h"
            ? pane.querySelector(".pm-mm-node-edit-header")
            : snap.kind === "b"
              ? pane.querySelector(".pm-mm-node-edit-body")
              : pane.querySelector(".pm-mm-node-edit-single");
        if (!te || !(te instanceof HTMLTextAreaElement)) return;
        te.focus();
        try {
          const a = Math.max(0, Math.min(snap.start, te.value.length));
          const b = Math.max(0, Math.min(snap.end, te.value.length));
          te.setSelectionRange(a, b);
        } catch (_) {}
      });
    }
  }

  inner.addEventListener(
    "wheel",
    (ev) => {
      ev.preventDefault();
      const r = shell.getBoundingClientRect(),
        mx = ev.clientX - r.left,
        my = ev.clientY - r.top;
      const k = Math.exp(-ev.deltaY * 0.001);
      const ns = Math.min(3.5, Math.max(0.15, sc * k));
      vx = mx - ((mx - vx) / sc) * ns;
      vy = my - ((my - vy) / sc) * ns;
      sc = ns;
      tf();
      persistV();
    },
    { passive: false }
  );

  inner.addEventListener(
    "mousedown",
    (ev) => {
      if (ev.button === 1) {
        ev.preventDefault();
        ev.stopPropagation();
        inner.focus();
        dragP = { sx: ev.clientX, sy: ev.clientY, vx, vy };
        return;
      }
      if (ev.shiftKey && ev.button === 0) {
        const t = ev.target;
        if (
          t.closest &&
          !(
            t.closest(".pm-mm-node") ||
            t.closest(".pm-mm-edge-hit") ||
            t.closest(".pm-mm-frame") ||
            t.closest(".pm-mm-frame-title-host")
          )
        )
          dragP = { sx: ev.clientX, sy: ev.clientY, vx, vy };
        return;
      }
      if (!dev()) return;
      if (ev.button !== 0) return;
      if (tryMindmapFramePointerDown(ev)) return;
      if (ev.target !== inner && ev.target !== plane) return;
      const r = inner.getBoundingClientRect();
      const el = document.createElement("div");
      el.className = "pm-mm-marquee";
      el.style.left = ev.clientX - r.left + "px";
      el.style.top = ev.clientY - r.top + "px";
      el.style.width = "0";
      el.style.height = "0";
      inner.appendChild(el);
      boxSel = { lx: ev.clientX - r.left, ly: ev.clientY - r.top, el };
    },
    true
  );

  inner.addEventListener("contextmenu", (ev) => {
    if (!dev()) return;
    const t = ev.target;
    const onBoard =
      t.closest &&
      !t.closest(".pm-mm-node") &&
      !t.closest(".pm-mm-frame") &&
      !t.closest(".pm-mm-frame-res-h") &&
      !t.closest(".pm-mm-frame-title-host") &&
      !t.closest(".pm-mm-edge-hit");
    if (!onBoard || !sel.size) return;
    ev.preventDefault();
    showContextMenu({
      x: ev.clientX,
      y: ev.clientY,
      items: [
        {
          label: "Frame selection",
          onClick: () => createFrameAroundSelection(),
        },
      ],
    });
  });

  shell.addEventListener("mouseleave", () => ctx.bus.emit(BusEvents.ENTITY_HOVER_END, {}));

  window.addEventListener("mousemove", (ev) => {
    if (linkDraft) {
      const p = planeFromClient(ev.clientX, ev.clientY);
      linkDraft.x2 = p.x;
      linkDraft.y2 = p.y;
      const hit = hitNodePlane(p.x, p.y, linkDraft.fromNodeId);
      linkDraft.hoverTargetId = hit && !rejectsMindmapEdges(hit) ? hit.id : null;
      drawEdges();
      syncLinkDropHint();
      return;
    }
    if (boxSel) {
      const r = inner.getBoundingClientRect();
      const x1 = Math.max(0, ev.clientX - r.left);
      const y1 = Math.max(0, ev.clientY - r.top);
      const lx = Math.min(boxSel.lx, x1),
        ly = Math.min(boxSel.ly, y1);
      const ww = Math.abs(x1 - boxSel.lx),
        hh = Math.abs(y1 - boxSel.ly);
      Object.assign(boxSel.el.style, { left: lx + "px", top: ly + "px", width: ww + "px", height: hh + "px" });
      return;
    }
    if (dragP) {
      vx = dragP.vx + (ev.clientX - dragP.sx);
      vy = dragP.vy + (ev.clientY - dragP.sy);
      tf();
      persistV();
      return;
    }
    if (!dev()) return;
    const SF = snapFn();

    if (dragFR) {
      const dw = (ev.clientX - dragFR.cx) / sc,
        dh = (ev.clientY - dragFR.cy) / sc;
      const nw = SF(Math.max(dragFR.minW, dragFR.fw0 + dw)),
        nh = SF(Math.max(dragFR.minH, dragFR.fh0 + dh));
      ctx.store.updateMindmap((mm2) => {
        const fr = (mm2.frames || []).find((f) => f.id === dragFR.fid);
        if (fr) {
          fr.w = nw;
          fr.h = nh;
        }
      });
      draw();
      return;
    }

    if (dragF) {
      const dx = (ev.clientX - dragF.cx) / sc,
        dy = (ev.clientY - dragF.cy) / sc;
      ctx.store.updateMindmap((mm2) => {
        const fr = (mm2.frames || []).find((f) => f.id === dragF.fid);
        if (!fr) return;
        const fb = dragF.orig.get("__frame__");
        if (fb) {
          fr.x = SF(fb.x + dx);
          fr.y = SF(fb.y + dy);
        }
        const nm = new Map((mm2.nodes || []).map((nn) => [nn.id, nn]));
        for (const mid of dragF.orig.keys()) {
          if (mid === "__frame__") continue;
          const tgt = nm.get(mid);
          const po = dragF.orig.get(mid);
          if (tgt && po) {
            tgt.x = SF(po.x + dx);
            tgt.y = SF(po.y + dy);
          }
        }
      });
      draw();
      return;
    }

    if (dragN) {
      const dx = (ev.clientX - dragN.cx) / sc,
        dy = (ev.clientY - dragN.cy) / sc;
      ctx.store.updateMindmap((mm2) => {
        for (const [id, pos] of dragN.orig) {
          const c = (mm2.nodes || []).find((z) => z.id === id);
          if (c) {
            c.x = SF(pos.x + dx);
            c.y = SF(pos.y + dy);
          }
        }
      });
      draw();
      return;
    }
    if (dragR) {
      ctx.store.updateMindmap((mm2) => {
        const c = (mm2.nodes || []).find((z) => z.id === dragR.nid);
        if (!c || isWikiLink(c)) return;
        let nw = Math.max(48, dragR.w0 + (ev.clientX - dragR.cx) / sc),
          nh = Math.max(36, dragR.h0 + (ev.clientY - dragR.cy) / sc);
        nw = SF(nw);
        nh = SF(nh);
        c.w = nw;
        c.h = nh;
      });
      draw();
    }
  });

  window.addEventListener(
    "mouseup",
    (ev) => {
      const hadDragNodes = !!dragN;
      const hadFrameResize = !!dragFR;
      const hadDragFrame = !!dragF;

      if (linkDraft !== null) {
        const d = linkDraft;
        linkDraft = null;
        syncLinkDropHint();
        const p = planeFromClient(ev.clientX, ev.clientY);
        const tgt = hitNodePlane(p.x, p.y, d.fromNodeId);
        if (tgt && !rejectsMindmapEdges(tgt) && tgt.id !== d.fromNodeId) {
          mut();
          ctx.store.updateMindmap((mm2) => {
            const dup = (mm2.edges || []).some((e) => e.fromNodeId === d.fromNodeId && e.toNodeId === tgt.id);
            if (!dup) (mm2.edges = mm2.edges || []).push({ id: "e-" + nid(), fromNodeId: d.fromNodeId, toNodeId: tgt.id });
          });
        }
        selEdges.clear();
        draw();
      }

      if (boxSel && boxSel.el && boxSel.el.isConnected && ev.button === 0) {
        const rsel = boxSel.el.getBoundingClientRect();
        sel.clear();
        selEdges.clear();
        selFrames.clear();
        inner.querySelectorAll(".pm-mm-node").forEach((el) => {
          const rr = el.getBoundingClientRect();
          if (!(rr.right < rsel.left || rr.left > rsel.right || rr.bottom < rsel.top || rr.top > rsel.bottom))
            sel.add(el.dataset.nodeId || "");
        });
        boxSel.el.remove();
        boxSel = null;
        draw();
      }
      dragN = dragP = dragR = dragF = dragFR = null;
      persistV();

      if ((hadDragNodes || hadFrameResize || hadDragFrame) && dev())
        ctx.store.updateMindmap((m) => reconcileFrameMembership(m));
    },
    true
  );

  inner.addEventListener("keydown", (ev) => {
    const tag = (ev.target && ev.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    if (ev.code === "Escape" && editing !== null && dev()) {
      ev.preventDefault();
      endMindmapEditing();
      rebuildStrip();
      draw();
      return;
    }

    if (ev.code === "Escape" && linkDraft) {
      ev.preventDefault();
      linkDraft = null;
      syncLinkDropHint();
      draw();
      return;
    }
    if (ev.code === "Escape" && selEdges.size) {
      ev.preventDefault();
      selEdges.clear();
      draw();
      return;
    }
    if (ev.code === "Escape" && selFrames.size) {
      ev.preventDefault();
      selFrames.clear();
      draw();
      return;
    }

    if (ev.altKey && ev.code === "KeyS") {
      ctx.store.updateMindmap((m2) => {
        m2.snapGrid = !m2.snapGrid;
      });
      tipUp();
      return;
    }

    if (ev.code === "ArrowUp") {
      ev.preventDefault();
      const r = shell.getBoundingClientRect(),
        tcx = r.width / 2,
        tcy = r.height / 2;
      const ns = Math.min(3.5, sc * 1.08);
      vx = tcx - ((tcx - vx) / sc) * ns;
      vy = tcy - ((tcy - vy) / sc) * ns;
      sc = ns;
      tf();
      persistV();
      return;
    }
    if (ev.code === "ArrowDown") {
      ev.preventDefault();
      const r = shell.getBoundingClientRect(),
        tcx = r.width / 2,
        tcy = r.height / 2;
      const ns = Math.max(0.15, sc / 1.08);
      vx = tcx - ((tcx - vx) / sc) * ns;
      vy = tcy - ((tcy - vy) / sc) * ns;
      sc = ns;
      tf();
      persistV();
      return;
    }

    if (ev.code === "KeyF") {
      ev.preventDefault();
      fitViewToSel();
      return;
    }

    if (!dev()) return;

    if (ev.code === "Delete" || ((ev.ctrlKey || ev.metaKey) && ev.code === "Backspace")) {
      ev.preventDefault();

      if (selFrames.size) {
        mut();
        ctx.store.updateMindmap((mm2) => {
          mm2.frames = (mm2.frames || []).filter((f) => !selFrames.has(f.id));
        });
        selFrames.clear();
        draw();
        return;
      }

      if (selEdges.size) {
        mut();
        ctx.store.updateMindmap((mm2) => {
          mm2.edges = (mm2.edges || []).filter((x) => !selEdges.has(x.id));
        });
        selEdges.clear();
        draw();
        return;
      }

      if (!sel.size) return;

      mut();
      ctx.store.updateMindmap((mm2) => {
        const rm = new Set(sel);
        mm2.nodes = (mm2.nodes || []).filter((nn) => !rm.has(nn.id));
        mm2.edges = (mm2.edges || []).filter((e) => !rm.has(e.fromNodeId) && !rm.has(e.toNodeId));
        for (const fr of mm2.frames || []) {
          fr.memberIds = (fr.memberIds || []).filter((mid) => !rm.has(mid));
        }
      });
      sel.clear();
      endMindmapEditing();
      rebuildStrip();
      draw();
      return;
    }

    if ((ev.ctrlKey || ev.metaKey) && ev.code === "KeyZ" && !ev.shiftKey) {
      ev.preventDefault();
      doUndo();
      return;
    }
    if ((ev.ctrlKey || ev.metaKey) && ((ev.shiftKey && ev.code === "KeyZ") || ev.code === "KeyY")) {
      ev.preventDefault();
      doRedo();
      return;
    }
    if ((ev.ctrlKey || ev.metaKey) && ev.code === "KeyS") {
      ev.preventDefault();
      ctx.persistence?.saveImmediate?.();
      return;
    }
    if ((ev.ctrlKey || ev.metaKey) && ev.code === "KeyE") {
      ev.preventDefault();
      const f = [...sel][0];
      if (!f) return;
      if (editing === f) endMindmapEditing();
      else editing = f;
      rebuildStrip();
      draw();
      return;
    }
    if ((ev.ctrlKey || ev.metaKey) && ev.code === "KeyN") {
      ev.preventDefault();
      openAdd((payload) => {
        mut();
        const { type, src, wikiPageId, wikiTitle } = payload;
        ctx.store.updateMindmap((mm2) => {
          const id = nid();
          let node;
          if (type === "image") node = { id, type: "image", text: "Caption", src, x: 100, y: 100, w: 200, h: 140, styles: {} };
          else if (type === "note") node = { id, type: "note", text: "Note", x: 100, y: 100, w: 96, h: 44, styles: {} };
          else if (type === "wikiLink") {
            const ttl = typeof wikiTitle === "string" && wikiTitle.trim() ? wikiTitle.trim() : "Wiki";
            node = {
              id,
              type: "wikiLink",
              wikiPageId: wikiPageId || "",
              text: ttl,
              x: 100,
              y: 100,
              w: WIKI_LINK_NODE_W,
              h: WIKI_LINK_NODE_H,
              styles: {},
            };
          } else node = { id, type: "text", header: "", text: "Node", x: 100, y: 100, w: 180, h: 100, styles: {} };
          mm2.nodes = [...(mm2.nodes || []), node];
        });
        draw();
      });
      return;
    }
    if ((ev.ctrlKey || ev.metaKey) && ev.code === "KeyD") {
      ev.preventDefault();
      if (!sel.size) return;
      mut();
      const olds = [...sel];
      const nm0 = Object.fromEntries((mm().nodes || []).map((nn) => [nn.id, nn]));
      const idMap = new Map();
      ctx.store.updateMindmap((mm2) => {
        for (const oid of olds) {
          const o = (mm2.nodes || []).find((z) => z.id === oid);
          if (!o) continue;
          const c = structuredClone(o);
          c.id = nid();
          c.x = +o.x + 28;
          c.y = +o.y + 28;
          idMap.set(oid, c.id);
          mm2.nodes.push(c);
        }
        const more = [];
        for (const ed of mm2.edges || []) {
          if (!idMap.has(ed.fromNodeId) || !idMap.has(ed.toNodeId)) continue;
          const fo = nm0[ed.fromNodeId],
            to = nm0[ed.toNodeId];
          if (!mindmapAllowsEdge(fo, to)) continue;
          more.push({ id: "e-" + nid(), fromNodeId: idMap.get(ed.fromNodeId), toNodeId: idMap.get(ed.toNodeId) });
        }
        mm2.edges = [...(mm2.edges || []), ...more];
      });
      sel.clear();
      idMap.forEach((nid2) => sel.add(nid2));
      draw();
      return;
    }
    if ((ev.ctrlKey || ev.metaKey) && ev.code === "KeyC") {
      ev.preventDefault();
      if (!sel.size) return;
      const M = mm();
      const sub = new Set(sel);
      clipboard = {
        nodes: structuredClone((M.nodes || []).filter((nn) => sub.has(nn.id))),
        edges: structuredClone((M.edges || []).filter((e) => sub.has(e.fromNodeId) && sub.has(e.toNodeId))),
      };
      return;
    }
    if ((ev.ctrlKey || ev.metaKey) && ev.code === "KeyV") {
      ev.preventDefault();
      if (!clipboard || !clipboard.nodes.length) return;
      mut();
      const cmap = Object.fromEntries(clipboard.nodes.map((nn) => [nn.id, nn]));
      const idMap = new Map();
      ctx.store.updateMindmap((mm2) => {
        const news = clipboard.nodes.map((o) => {
          const c = structuredClone(o);
          const oid = c.id;
          c.id = nid();
          c.x = +o.x + 40;
          c.y = +o.y + 40;
          idMap.set(oid, c.id);
          return c;
        });
        mm2.nodes = [...(mm2.nodes || []), ...news];
        const ne = (clipboard.edges || [])
          .map((e) => {
            const a = idMap.get(e.fromNodeId),
              b = idMap.get(e.toNodeId);
            if (!a || !b) return null;
            const fo = cmap[e.fromNodeId],
              tt = cmap[e.toNodeId];
            if (!mindmapAllowsEdge(fo, tt)) return null;
            return { id: "e-" + nid(), fromNodeId: a, toNodeId: b };
          })
          .filter(Boolean);
        mm2.edges = [...(mm2.edges || []), ...ne];
      });
      sel.clear();
      idMap.forEach((v) => sel.add(v));
      draw();
      return;
    }
  });

  const unsub = ctx.store.subscribe(draw);
  pruneStored();
  setTimeout(pruneStored, 0);

  return {
    root,
    focusNode(id) {
      inner.focus();
      const n = (mm().nodes || []).find((x) => x.id === id);
      if (!n) return;
      selEdges.clear();
      selFrames.clear();
      sel.clear();
      sel.add(id);
      const cx = +n.x + renderedNodeW(n) / 2,
        cy = +n.y + renderedNodeH(n) / 2,
        r = shell.getBoundingClientRect();
      vx = r.width / 2 - cx * sc;
      vy = r.height / 2 - cy * sc;
      tf();
      persistV();
      draw();
    },
    unmount() {
      unsub();
    },
  };
}
