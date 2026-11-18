// Category tree mein id dhoondo + upar ke parents ki list (root → us category tak)
export const findPath = (tree, id, trail = []) => {
  for (const c of tree || []) {
    const next = [...trail, c];
    if (c._id === id) return next;
    const found = findPath(c.children, id, next);
    if (found) return found;
  }
  return null;
};

// Product ke liye: cat + sub + third ke saare attributes (parent pehle, same key dobara nahi)
export const mergedAttributes = (tree, ids = []) => {
  const seen = new Set();
  const out = [];
  for (const id of ids.filter(Boolean)) {
    const path = findPath(tree, id) || [];
    for (const c of path) {
      for (const a of c.attributes || []) {
        if (seen.has(a.key)) continue;
        seen.add(a.key);
        out.push({ ...a, from: c.name });
      }
    }
  }
  return out;
};

export const keyOf = (label) => String(label || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
