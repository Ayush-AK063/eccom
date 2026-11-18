// Category tree helpers (API: GET /api/category → roots with nested children)

export const LEVELS = { 1: "Main", 2: "Sub", 3: "Third level" };

// Tree ko flat list mein: har node ke saath depth, path, parent chain
export const flattenTree = (roots = []) => {
  const out = [];
  const walk = (nodes, depth, trail) => {
    nodes.forEach((n) => {
      const path = [...trail, n];
      out.push({
        ...n,
        depth,
        path: path.map((p) => p.name),
        rootImage: path[0]?.images?.[0] || "",
        ancestors: trail.map((p) => p._id),
        descendants: countDescendants(n),
      });
      if (n.children?.length) walk(n.children, depth + 1, path);
    });
  };
  walk(roots, 1, []);
  return out;
};

export const countDescendants = (n) =>
  (n.children || []).reduce((sum, c) => sum + 1 + countDescendants(c), 0);

export const findNode = (roots, id) => flattenTree(roots).find((n) => n._id === id) || null;
