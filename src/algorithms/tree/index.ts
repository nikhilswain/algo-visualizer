/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  TreeVizData,
  TreeInput,
  TreeNodeViz,
  TreeEdgeViz,
} from "../../components/Tree/presets";

/* ---- Internal BST ---- */

type BSTNode = {
  value: number;
  left: number | null;
  right: number | null;
  parent: number | null;
  height: number;
};

class InternalBST {
  nodes = new Map<number, BSTNode>();
  root: number | null = null;
  private nextId = 0;

  insert(value: number): number {
    const id = this.nextId++;
    this.nodes.set(id, {
      value,
      left: null,
      right: null,
      parent: null,
      height: 1,
    });

    if (this.root === null) {
      this.root = id;
      return id;
    }

    let current = this.root;
    while (true) {
      const node = this.nodes.get(current)!;
      if (value < node.value) {
        if (node.left === null) {
          node.left = id;
          this.nodes.get(id)!.parent = current;
          break;
        }
        current = node.left;
      } else {
        if (node.right === null) {
          node.right = id;
          this.nodes.get(id)!.parent = current;
          break;
        }
        current = node.right;
      }
    }

    this.updateHeights(id);
    return id;
  }

  findNodeId(value: number): number | null {
    let current = this.root;
    while (current !== null) {
      const node = this.nodes.get(current)!;
      if (value === node.value) return current;
      current = value < node.value ? node.left : node.right;
    }
    return null;
  }

  deleteNode(id: number): void {
    const node = this.nodes.get(id)!;

    if (node.left === null && node.right === null) {
      this.replaceInParent(id, null);
      const p = node.parent;
      this.nodes.delete(id);
      if (p !== null) this.updateHeights(p);
    } else if (node.left === null) {
      this.replaceInParent(id, node.right);
      const p = node.parent;
      this.nodes.delete(id);
      if (p !== null) this.updateHeights(p);
    } else if (node.right === null) {
      this.replaceInParent(id, node.left);
      const p = node.parent;
      this.nodes.delete(id);
      if (p !== null) this.updateHeights(p);
    } else {
      let succId = node.right;
      while (this.nodes.get(succId)!.left !== null) {
        succId = this.nodes.get(succId)!.left!;
      }
      node.value = this.nodes.get(succId)!.value;
      this.deleteNode(succId);
    }
  }

  private replaceInParent(id: number, replacement: number | null): void {
    const node = this.nodes.get(id)!;
    if (node.parent === null) {
      this.root = replacement;
    } else {
      const parent = this.nodes.get(node.parent)!;
      if (parent.left === id) parent.left = replacement;
      else parent.right = replacement;
    }
    if (replacement !== null) {
      this.nodes.get(replacement)!.parent = node.parent;
    }
  }

  getHeight(id: number | null): number {
    if (id === null) return 0;
    return this.nodes.get(id)?.height ?? 0;
  }

  getBalance(id: number): number {
    const node = this.nodes.get(id)!;
    return this.getHeight(node.left) - this.getHeight(node.right);
  }

  updateHeights(id: number | null): void {
    let current = id;
    while (current !== null) {
      const node = this.nodes.get(current)!;
      node.height =
        1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
      current = node.parent;
    }
  }

  rotateRight(y: number): number {
    const yNode = this.nodes.get(y)!;
    const x = yNode.left!;
    const xNode = this.nodes.get(x)!;
    const t2 = xNode.right;

    xNode.right = y;
    yNode.left = t2;

    xNode.parent = yNode.parent;
    yNode.parent = x;
    if (t2 !== null) this.nodes.get(t2)!.parent = y;

    if (xNode.parent === null) {
      this.root = x;
    } else {
      const parent = this.nodes.get(xNode.parent)!;
      if (parent.left === y) parent.left = x;
      else parent.right = x;
    }

    yNode.height =
      1 + Math.max(this.getHeight(yNode.left), this.getHeight(yNode.right));
    xNode.height =
      1 + Math.max(this.getHeight(xNode.left), this.getHeight(xNode.right));

    return x;
  }

  rotateLeft(x: number): number {
    const xNode = this.nodes.get(x)!;
    const y = xNode.right!;
    const yNode = this.nodes.get(y)!;
    const t2 = yNode.left;

    yNode.left = x;
    xNode.right = t2;

    yNode.parent = xNode.parent;
    xNode.parent = y;
    if (t2 !== null) this.nodes.get(t2)!.parent = x;

    if (yNode.parent === null) {
      this.root = y;
    } else {
      const parent = this.nodes.get(yNode.parent)!;
      if (parent.left === x) parent.left = y;
      else parent.right = y;
    }

    xNode.height =
      1 + Math.max(this.getHeight(xNode.left), this.getHeight(xNode.right));
    yNode.height =
      1 + Math.max(this.getHeight(yNode.left), this.getHeight(yNode.right));

    return y;
  }

  getLayout(): TreeVizData {
    const SVG_W = 760;
    const SVG_H = 460;
    const PAD = 50;

    if (this.root === null) return { nodes: [], edges: [] };

    let maxDepth = 0;
    let nodeCount = 0;
    const depthOf = new Map<number, number>();

    const findDims = (id: number | null, depth: number) => {
      if (id === null) return;
      const node = this.nodes.get(id);
      if (!node) return;
      depthOf.set(id, depth);
      maxDepth = Math.max(maxDepth, depth);
      nodeCount++;
      findDims(node.left, depth + 1);
      findDims(node.right, depth + 1);
    };
    findDims(this.root, 0);

    let xIdx = 0;
    const xIdxOf = new Map<number, number>();
    const inorder = (id: number | null) => {
      if (id === null) return;
      const node = this.nodes.get(id);
      if (!node) return;
      inorder(node.left);
      xIdxOf.set(id, xIdx);
      xIdx++;
      inorder(node.right);
    };
    inorder(this.root);

    const xSpace =
      nodeCount > 1 ? (SVG_W - 2 * PAD) / (nodeCount - 1) : 0;
    const ySpace = maxDepth > 0 ? Math.min((SVG_H - 2 * PAD) / maxDepth, 90) : 0;

    const vizNodes: TreeNodeViz[] = [];
    const vizEdges: TreeEdgeViz[] = [];

    for (const [id, node] of this.nodes) {
      if (!depthOf.has(id)) continue;
      vizNodes.push({
        id: String(id),
        value: node.value,
        x: nodeCount === 1 ? SVG_W / 2 : PAD + xIdxOf.get(id)! * xSpace,
        y: PAD + depthOf.get(id)! * ySpace,
      });
      if (node.left !== null && this.nodes.has(node.left))
        vizEdges.push({ from: String(id), to: String(node.left) });
      if (node.right !== null && this.nodes.has(node.right))
        vizEdges.push({ from: String(id), to: String(node.right) });
    }

    return { nodes: vizNodes, edges: vizEdges };
  }
}

/* helper to build a tree and return its layout */
export function buildTreeLayout(values: number[]): TreeVizData {
  const tree = new InternalBST();
  for (const v of values) tree.insert(v);
  return tree.getLayout();
}

/* ---- BST Insert ---- */

export function* bstInsert(input: TreeInput): Generator<any> {
  const tree = new InternalBST();
  let comps = 0;
  let ins = 0;

  yield {
    type: "init",
    tree: tree.getLayout(),
    narrate: `BST Insert: inserting ${input.values.length} values one by one.`,
    line: { js: 1, py: 1 },
    comparisons: 0,
    insertions: 0,
  };

  for (const val of input.values) {
    if (tree.root === null) {
      const id = tree.insert(val);
      ins++;
      yield {
        type: "insert",
        nodeId: String(id),
        tree: tree.getLayout(),
        narrate: `Tree is empty — insert ${val} as root.`,
        line: { js: 2, py: 2 },
        comparisons: comps,
        insertions: ins,
      };
      continue;
    }

    let current: number | null = tree.root;
    while (current !== null) {
      const node = tree.nodes.get(current)!;
      comps++;

      if (val < node.value) {
        yield {
          type: "compare",
          nodeId: String(current),
          tree: tree.getLayout(),
          narrate: `${val} < ${node.value} — go left.`,
          line: { js: 3, py: 3 },
          comparisons: comps,
          insertions: ins,
        };
        if (node.left === null) {
          const id = tree.insert(val);
          ins++;
          yield {
            type: "insert",
            nodeId: String(id),
            tree: tree.getLayout(),
            narrate: `Left is empty — insert ${val} as left child of ${node.value}.`,
            line: { js: 4, py: 4 },
            comparisons: comps,
            insertions: ins,
          };
          break;
        }
        current = node.left;
      } else {
        yield {
          type: "compare",
          nodeId: String(current),
          tree: tree.getLayout(),
          narrate: `${val} ≥ ${node.value} — go right.`,
          line: { js: 5, py: 5 },
          comparisons: comps,
          insertions: ins,
        };
        if (node.right === null) {
          const id = tree.insert(val);
          ins++;
          yield {
            type: "insert",
            nodeId: String(id),
            tree: tree.getLayout(),
            narrate: `Right is empty — insert ${val} as right child of ${node.value}.`,
            line: { js: 6, py: 6 },
            comparisons: comps,
            insertions: ins,
          };
          break;
        }
        current = node.right;
      }
    }
  }

  yield {
    type: "done",
    tree: tree.getLayout(),
    narrate: `Done! BST built with ${ins} nodes, ${comps} comparisons.`,
    comparisons: comps,
    insertions: ins,
  };
}

/* ---- BST Search ---- */

export function* bstSearch(input: TreeInput): Generator<any> {
  const tree = new InternalBST();
  for (const v of input.values) tree.insert(v);

  const target = input.target!;
  let comps = 0;

  yield {
    type: "init",
    tree: tree.getLayout(),
    narrate: `BST Search: looking for ${target} in a ${input.values.length}-node tree.`,
    line: { js: 1, py: 1 },
    comparisons: 0,
    insertions: 0,
  };

  let current = tree.root;
  while (current !== null) {
    const node = tree.nodes.get(current)!;
    comps++;

    if (target === node.value) {
      yield {
        type: "found",
        nodeId: String(current),
        tree: tree.getLayout(),
        narrate: `${target} === ${node.value} — found it!`,
        line: { js: 2, py: 2 },
        comparisons: comps,
        insertions: 0,
      };
      yield {
        type: "done",
        tree: tree.getLayout(),
        narrate: `Done! Found ${target} after ${comps} comparisons.`,
        comparisons: comps,
        insertions: 0,
      };
      return;
    }

    if (target < node.value) {
      yield {
        type: "compare",
        nodeId: String(current),
        tree: tree.getLayout(),
        narrate: `${target} < ${node.value} — go left.`,
        line: { js: 3, py: 3 },
        comparisons: comps,
        insertions: 0,
      };
      current = node.left;
    } else {
      yield {
        type: "compare",
        nodeId: String(current),
        tree: tree.getLayout(),
        narrate: `${target} > ${node.value} — go right.`,
        line: { js: 4, py: 4 },
        comparisons: comps,
        insertions: 0,
      };
      current = node.right;
    }
  }

  yield {
    type: "not-found",
    tree: tree.getLayout(),
    narrate: `Reached a null child — ${target} is not in the tree.`,
    line: { js: 1, py: 1 },
    comparisons: comps,
    insertions: 0,
  };

  yield {
    type: "done",
    tree: tree.getLayout(),
    narrate: `Done! ${target} not found after ${comps} comparisons.`,
    comparisons: comps,
    insertions: 0,
  };
}

/* ---- BST Delete ---- */

export function* bstDelete(input: TreeInput): Generator<any> {
  const tree = new InternalBST();
  for (const v of input.values) tree.insert(v);

  const target = input.target!;
  let comps = 0;

  yield {
    type: "init",
    tree: tree.getLayout(),
    narrate: `BST Delete: removing ${target} from a ${input.values.length}-node tree.`,
    line: { js: 1, py: 1 },
    comparisons: 0,
    insertions: 0,
  };

  // Search for the node
  let current = tree.root;
  let foundId: number | null = null;

  while (current !== null) {
    const node = tree.nodes.get(current)!;
    comps++;

    if (target === node.value) {
      foundId = current;
      yield {
        type: "found",
        nodeId: String(current),
        tree: tree.getLayout(),
        narrate: `Found ${target}! Now determine deletion strategy.`,
        line: { js: 2, py: 2 },
        comparisons: comps,
        insertions: 0,
      };
      break;
    }

    if (target < node.value) {
      yield {
        type: "compare",
        nodeId: String(current),
        tree: tree.getLayout(),
        narrate: `${target} < ${node.value} — search left.`,
        line: { js: 3, py: 3 },
        comparisons: comps,
        insertions: 0,
      };
      current = node.left;
    } else {
      yield {
        type: "compare",
        nodeId: String(current),
        tree: tree.getLayout(),
        narrate: `${target} > ${node.value} — search right.`,
        line: { js: 4, py: 4 },
        comparisons: comps,
        insertions: 0,
      };
      current = node.right;
    }
  }

  if (foundId === null) {
    yield {
      type: "not-found",
      tree: tree.getLayout(),
      narrate: `${target} not found in the tree.`,
      line: { js: 1, py: 1 },
      comparisons: comps,
      insertions: 0,
    };
    yield {
      type: "done",
      tree: tree.getLayout(),
      narrate: `Done! ${target} was not in the tree.`,
      comparisons: comps,
      insertions: 0,
    };
    return;
  }

  const node = tree.nodes.get(foundId)!;
  const hasLeft = node.left !== null;
  const hasRight = node.right !== null;

  if (!hasLeft && !hasRight) {
    yield {
      type: "delete-leaf",
      nodeId: String(foundId),
      tree: tree.getLayout(),
      narrate: `${target} is a leaf node — simply remove it.`,
      line: { js: 6, py: 6 },
      comparisons: comps,
      insertions: 0,
    };
    tree.deleteNode(foundId);
  } else if (!hasLeft || !hasRight) {
    const childId = hasLeft ? node.left! : node.right!;
    const childVal = tree.nodes.get(childId)!.value;
    yield {
      type: "delete-one-child",
      nodeId: String(foundId),
      tree: tree.getLayout(),
      narrate: `${target} has one child (${childVal}). Replace ${target} with its child.`,
      line: { js: 7, py: 7 },
      comparisons: comps,
      insertions: 0,
    };
    tree.deleteNode(foundId);
  } else {
    // Two children — find in-order successor
    let succId = node.right!;
    while (tree.nodes.get(succId)!.left !== null) {
      succId = tree.nodes.get(succId)!.left!;
    }
    const succVal = tree.nodes.get(succId)!.value;

    yield {
      type: "find-successor",
      nodeId: String(succId),
      tree: tree.getLayout(),
      narrate: `${target} has two children. In-order successor is ${succVal}. Replace value then delete successor.`,
      line: { js: 9, py: 9 },
      comparisons: comps,
      insertions: 0,
    };

    tree.deleteNode(foundId);
  }

  yield {
    type: "delete-done",
    tree: tree.getLayout(),
    narrate: `Node removed. Tree restructured.`,
    line: { js: 11, py: 11 },
    comparisons: comps,
    insertions: 0,
  };

  yield {
    type: "done",
    tree: tree.getLayout(),
    narrate: `Done! Deleted ${target} from the BST. ${comps} comparisons.`,
    comparisons: comps,
    insertions: 0,
  };
}

/* ---- AVL Insert ---- */

export function* avlInsert(input: TreeInput): Generator<any> {
  const tree = new InternalBST();
  let comps = 0;
  let ins = 0;
  let rots = 0;

  yield {
    type: "init",
    tree: tree.getLayout(),
    narrate: `AVL Insert: inserting ${input.values.length} values with auto-balancing.`,
    line: { js: 1, py: 1 },
    comparisons: 0,
    insertions: 0,
  };

  for (const val of input.values) {
    // Insert like a normal BST
    if (tree.root === null) {
      const id = tree.insert(val);
      ins++;
      yield {
        type: "insert",
        nodeId: String(id),
        tree: tree.getLayout(),
        narrate: `Tree is empty — insert ${val} as root.`,
        line: { js: 2, py: 2 },
        comparisons: comps,
        insertions: ins,
      };
      continue;
    }

    // Traverse to find insert position
    let current: number | null = tree.root;
    while (current !== null) {
      const node = tree.nodes.get(current)!;
      comps++;

      if (val < node.value) {
        yield {
          type: "compare",
          nodeId: String(current),
          tree: tree.getLayout(),
          narrate: `${val} < ${node.value} — go left.`,
          line: { js: 3, py: 3 },
          comparisons: comps,
          insertions: ins,
        };
        if (node.left === null) {
          const id = tree.insert(val);
          ins++;
          yield {
            type: "insert",
            nodeId: String(id),
            tree: tree.getLayout(),
            narrate: `Insert ${val} as left child of ${node.value}.`,
            line: { js: 4, py: 4 },
            comparisons: comps,
            insertions: ins,
          };
          break;
        }
        current = node.left;
      } else {
        yield {
          type: "compare",
          nodeId: String(current),
          tree: tree.getLayout(),
          narrate: `${val} ≥ ${node.value} — go right.`,
          line: { js: 5, py: 5 },
          comparisons: comps,
          insertions: ins,
        };
        if (node.right === null) {
          const id = tree.insert(val);
          ins++;
          yield {
            type: "insert",
            nodeId: String(id),
            tree: tree.getLayout(),
            narrate: `Insert ${val} as right child of ${node.value}.`,
            line: { js: 6, py: 6 },
            comparisons: comps,
            insertions: ins,
          };
          break;
        }
        current = node.right;
      }
    }

    // Check balance up the tree from the new node's parent
    let checkNode = tree.findNodeId(val);
    if (checkNode !== null) {
      let ancestor: number | null = tree.nodes.get(checkNode)!.parent;
      while (ancestor !== null) {
        tree.updateHeights(ancestor);
        const balance = tree.getBalance(ancestor);
        const aNode = tree.nodes.get(ancestor)!;

        if (balance > 1 || balance < -1) {
          yield {
            type: "balance-check",
            nodeId: String(ancestor),
            tree: tree.getLayout(),
            narrate: `Node ${aNode.value} is unbalanced (balance = ${balance}). Rotation needed!`,
            line: { js: 8, py: 8 },
            comparisons: comps,
            insertions: ins,
          };

          if (balance > 1) {
            const leftChild = aNode.left!;
            const leftBal = tree.getBalance(leftChild);
            if (leftBal >= 0) {
              // LL case
              rots++;
              tree.rotateRight(ancestor);
              yield {
                type: "rotate-right",
                nodeId: String(ancestor),
                tree: tree.getLayout(),
                narrate: `LL case — right rotation at ${aNode.value}. Tree rebalanced.`,
                line: { js: 10, py: 10 },
                comparisons: comps,
                insertions: ins,
              };
            } else {
              // LR case
              rots += 2;
              tree.rotateLeft(leftChild);
              yield {
                type: "rotate-left",
                nodeId: String(leftChild),
                tree: tree.getLayout(),
                narrate: `LR case — left rotation at ${tree.nodes.get(leftChild)?.value ?? "?"}.`,
                line: { js: 12, py: 12 },
                comparisons: comps,
                insertions: ins,
              };
              tree.rotateRight(ancestor);
              yield {
                type: "rotate-right",
                nodeId: String(ancestor),
                tree: tree.getLayout(),
                narrate: `Then right rotation at ${aNode.value}. Tree rebalanced.`,
                line: { js: 13, py: 13 },
                comparisons: comps,
                insertions: ins,
              };
            }
          } else {
            const rightChild = aNode.right!;
            const rightBal = tree.getBalance(rightChild);
            if (rightBal <= 0) {
              // RR case
              rots++;
              tree.rotateLeft(ancestor);
              yield {
                type: "rotate-left",
                nodeId: String(ancestor),
                tree: tree.getLayout(),
                narrate: `RR case — left rotation at ${aNode.value}. Tree rebalanced.`,
                line: { js: 11, py: 11 },
                comparisons: comps,
                insertions: ins,
              };
            } else {
              // RL case
              rots += 2;
              tree.rotateRight(rightChild);
              yield {
                type: "rotate-right",
                nodeId: String(rightChild),
                tree: tree.getLayout(),
                narrate: `RL case — right rotation at ${tree.nodes.get(rightChild)?.value ?? "?"}.`,
                line: { js: 14, py: 14 },
                comparisons: comps,
                insertions: ins,
              };
              tree.rotateLeft(ancestor);
              yield {
                type: "rotate-left",
                nodeId: String(ancestor),
                tree: tree.getLayout(),
                narrate: `Then left rotation at ${aNode.value}. Tree rebalanced.`,
                line: { js: 15, py: 15 },
                comparisons: comps,
                insertions: ins,
              };
            }
          }
          break;
        }

        yield {
          type: "balance-ok",
          nodeId: String(ancestor),
          tree: tree.getLayout(),
          narrate: `Node ${aNode.value}: balance = ${balance}. OK.`,
          line: { js: 7, py: 7 },
          comparisons: comps,
          insertions: ins,
        };

        ancestor = aNode.parent;
      }
    }
  }

  yield {
    type: "done",
    tree: tree.getLayout(),
    narrate: `Done! AVL tree built: ${ins} nodes, ${comps} comparisons, ${rots} rotations.`,
    comparisons: comps,
    insertions: ins,
  };
}

/* ---- AVL Delete ---- */

export function* avlDelete(input: TreeInput): Generator<any> {
  const tree = new InternalBST();
  for (const v of input.values) tree.insert(v);

  // Ensure AVL property by doing balance passes
  function balanceUp(startId: number | null) {
    let id = startId;
    while (id !== null) {
      tree.updateHeights(id);
      const bal = tree.getBalance(id);
      const node = tree.nodes.get(id)!;
      if (bal > 1) {
        const leftBal = tree.getBalance(node.left!);
        if (leftBal >= 0) { tree.rotateRight(id); }
        else { tree.rotateLeft(node.left!); tree.rotateRight(id); }
        return;
      } else if (bal < -1) {
        const rightBal = tree.getBalance(node.right!);
        if (rightBal <= 0) { tree.rotateLeft(id); }
        else { tree.rotateRight(node.right!); tree.rotateLeft(id); }
        return;
      }
      id = node.parent;
    }
  }
  // Pre-balance the tree
  for (const [id] of tree.nodes) balanceUp(id);

  const target = input.target!;
  let comps = 0;
  let rots = 0;

  yield {
    type: "init",
    tree: tree.getLayout(),
    narrate: `AVL Delete: removing ${target} from a balanced AVL tree.`,
    line: { js: 1, py: 1 },
    comparisons: 0,
    insertions: 0,
  };

  // Search
  let current = tree.root;
  let foundId: number | null = null;

  while (current !== null) {
    const node = tree.nodes.get(current)!;
    comps++;

    if (target === node.value) {
      foundId = current;
      yield {
        type: "found",
        nodeId: String(current),
        tree: tree.getLayout(),
        narrate: `Found ${target}! Delete it, then rebalance.`,
        line: { js: 2, py: 2 },
        comparisons: comps,
        insertions: 0,
      };
      break;
    }

    yield {
      type: "compare",
      nodeId: String(current),
      tree: tree.getLayout(),
      narrate: `${target} ${target < node.value ? "<" : ">"} ${node.value} — go ${target < node.value ? "left" : "right"}.`,
      line: { js: 3, py: 3 },
      comparisons: comps,
      insertions: 0,
    };
    current = target < node.value ? node.left : node.right;
  }

  if (foundId === null) {
    yield { type: "not-found", tree: tree.getLayout(), narrate: `${target} not found.`, line: { js: 1, py: 1 }, comparisons: comps, insertions: 0 };
    yield { type: "done", tree: tree.getLayout(), narrate: `Done.`, comparisons: comps, insertions: 0 };
    return;
  }

  const delNode = tree.nodes.get(foundId)!;
  const parentBeforeDelete = delNode.parent;

  if (delNode.left === null && delNode.right === null) {
    yield { type: "delete-leaf", nodeId: String(foundId), tree: tree.getLayout(), narrate: `${target} is a leaf — remove it.`, line: { js: 6, py: 6 }, comparisons: comps, insertions: 0 };
  } else if (delNode.left === null || delNode.right === null) {
    yield { type: "delete-one-child", nodeId: String(foundId), tree: tree.getLayout(), narrate: `${target} has one child — replace with child.`, line: { js: 7, py: 7 }, comparisons: comps, insertions: 0 };
  } else {
    let succId = delNode.right!;
    while (tree.nodes.get(succId)!.left !== null) succId = tree.nodes.get(succId)!.left!;
    yield { type: "find-successor", nodeId: String(succId), tree: tree.getLayout(), narrate: `Two children — successor is ${tree.nodes.get(succId)!.value}. Replace & delete successor.`, line: { js: 9, py: 9 }, comparisons: comps, insertions: 0 };
  }

  tree.deleteNode(foundId);

  yield { type: "delete-done", tree: tree.getLayout(), narrate: `Node removed. Now check balance factors up the tree.`, line: { js: 11, py: 11 }, comparisons: comps, insertions: 0 };

  // Rebalance up from deletion point
  let balNode = parentBeforeDelete;
  while (balNode !== null && tree.nodes.has(balNode)) {
    tree.updateHeights(balNode);
    const bal = tree.getBalance(balNode);
    const bNode = tree.nodes.get(balNode)!;

    if (bal > 1 || bal < -1) {
      yield { type: "balance-check", nodeId: String(balNode), tree: tree.getLayout(), narrate: `Node ${bNode.value}: balance = ${bal}. Unbalanced — rotation needed!`, line: { js: 12, py: 12 }, comparisons: comps, insertions: 0 };

      if (bal > 1) {
        const leftChild = bNode.left!;
        const leftBal = tree.getBalance(leftChild);
        if (leftBal >= 0) {
          rots++;
          tree.rotateRight(balNode);
          yield { type: "rotate-right", nodeId: String(balNode), tree: tree.getLayout(), narrate: `LL case — right rotation at ${bNode.value}. Rebalanced.`, line: { js: 13, py: 13 }, comparisons: comps, insertions: 0 };
        } else {
          rots += 2;
          tree.rotateLeft(leftChild);
          yield { type: "rotate-left", nodeId: String(leftChild), tree: tree.getLayout(), narrate: `LR case — left rotation at ${tree.nodes.get(leftChild)?.value ?? "?"}.`, line: { js: 14, py: 14 }, comparisons: comps, insertions: 0 };
          tree.rotateRight(balNode);
          yield { type: "rotate-right", nodeId: String(balNode), tree: tree.getLayout(), narrate: `Then right rotation. Rebalanced.`, line: { js: 13, py: 13 }, comparisons: comps, insertions: 0 };
        }
      } else {
        const rightChild = bNode.right!;
        const rightBal = tree.getBalance(rightChild);
        if (rightBal <= 0) {
          rots++;
          tree.rotateLeft(balNode);
          yield { type: "rotate-left", nodeId: String(balNode), tree: tree.getLayout(), narrate: `RR case — left rotation at ${bNode.value}. Rebalanced.`, line: { js: 13, py: 13 }, comparisons: comps, insertions: 0 };
        } else {
          rots += 2;
          tree.rotateRight(rightChild);
          yield { type: "rotate-right", nodeId: String(rightChild), tree: tree.getLayout(), narrate: `RL case — right rotation at ${tree.nodes.get(rightChild)?.value ?? "?"}.`, line: { js: 14, py: 14 }, comparisons: comps, insertions: 0 };
          tree.rotateLeft(balNode);
          yield { type: "rotate-left", nodeId: String(balNode), tree: tree.getLayout(), narrate: `Then left rotation. Rebalanced.`, line: { js: 13, py: 13 }, comparisons: comps, insertions: 0 };
        }
      }
      // After rotation, the node may have moved — continue from new parent
      balNode = tree.nodes.get(balNode)?.parent ?? null;
    } else {
      yield { type: "balance-ok", nodeId: String(balNode), tree: tree.getLayout(), narrate: `Node ${bNode.value}: balance = ${bal}. OK.`, line: { js: 12, py: 12 }, comparisons: comps, insertions: 0 };
      balNode = bNode.parent;
    }
  }

  yield { type: "done", tree: tree.getLayout(), narrate: `Done! Deleted ${target}. ${comps} comparisons, ${rots} rotations.`, comparisons: comps, insertions: 0 };
}

/* ---- Heap Build + Extract ---- */

function heapLayout(arr: number[], size?: number): TreeVizData {
  const n = size ?? arr.length;
  const SVG_W = 760, SVG_H = 460, PAD = 50;
  if (n === 0) return { nodes: [], edges: [] };

  const totalLevels = Math.floor(Math.log2(n)) + 1;
  const ySpace = Math.min((SVG_H - 2 * PAD) / Math.max(totalLevels - 1, 1), 90);

  const vizNodes: TreeNodeViz[] = [];
  const vizEdges: TreeEdgeViz[] = [];

  for (let i = 0; i < n; i++) {
    const depth = Math.floor(Math.log2(i + 1));
    const posInLevel = i - (Math.pow(2, depth) - 1);
    const x = SVG_W * (2 * posInLevel + 1) / Math.pow(2, depth + 1);
    const y = PAD + depth * ySpace;

    vizNodes.push({ id: String(i), value: arr[i], x, y });
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < n) vizEdges.push({ from: String(i), to: String(left) });
    if (right < n) vizEdges.push({ from: String(i), to: String(right) });
  }
  return { nodes: vizNodes, edges: vizEdges };
}

export function* heapBuildExtract(input: TreeInput): Generator<any> {
  const arr = [...input.values];
  const n = arr.length;
  let comps = 0;
  let swaps = 0;

  yield { type: "init", tree: heapLayout(arr), narrate: `Max Heap: building from ${n} elements using bottom-up heapify.`, line: { js: 1, py: 1 }, comparisons: 0, insertions: 0 };

  // Heapify — sift down from last parent to root
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    let idx = i;
    while (true) {
      let largest = idx;
      const l = 2 * idx + 1;
      const r = 2 * idx + 2;
      comps++;

      if (l < n && arr[l] > arr[largest]) largest = l;
      if (r < n && arr[r] > arr[largest]) largest = r;

      yield { type: "compare", nodeId: String(idx), tree: heapLayout(arr), narrate: `Sift down: compare node ${arr[idx]} with children.${largest !== idx ? ` Child ${arr[largest]} is larger.` : " Already largest."}`, line: { js: 5, py: 5 }, comparisons: comps, insertions: swaps };

      if (largest === idx) break;

      [arr[idx], arr[largest]] = [arr[largest], arr[idx]];
      swaps++;

      yield { type: "swap", nodeId: String(idx), targetId: String(largest), tree: heapLayout(arr), narrate: `Swap ${arr[largest]} and ${arr[idx]}.`, line: { js: 8, py: 8 }, comparisons: comps, insertions: swaps };

      idx = largest;
    }
  }

  yield { type: "build-done", tree: heapLayout(arr), narrate: `Heap built! Max = ${arr[0]}. Now extracting maximums.`, line: { js: 2, py: 2 }, comparisons: comps, insertions: swaps };

  // Extract max 3 times
  let heapSize = n;
  const extractCount = Math.min(3, heapSize);

  for (let e = 0; e < extractCount; e++) {
    const maxVal = arr[0];
    [arr[0], arr[heapSize - 1]] = [arr[heapSize - 1], arr[0]];
    heapSize--;
    swaps++;

    yield { type: "extract", nodeId: "0", tree: heapLayout(arr, heapSize), narrate: `Extract max ${maxVal}. Swap root with last, shrink heap to ${heapSize}.`, line: { js: 10, py: 10 }, comparisons: comps, insertions: swaps };

    // Sift down root
    let idx = 0;
    while (true) {
      let largest = idx;
      const l = 2 * idx + 1;
      const r = 2 * idx + 2;
      comps++;

      if (l < heapSize && arr[l] > arr[largest]) largest = l;
      if (r < heapSize && arr[r] > arr[largest]) largest = r;

      yield { type: "compare", nodeId: String(idx), tree: heapLayout(arr, heapSize), narrate: `Sift down: compare ${arr[idx]} with children.${largest !== idx ? ` Swap with ${arr[largest]}.` : " Heap property restored."}`, line: { js: 5, py: 5 }, comparisons: comps, insertions: swaps };

      if (largest === idx) break;

      [arr[idx], arr[largest]] = [arr[largest], arr[idx]];
      swaps++;

      yield { type: "swap", nodeId: String(idx), targetId: String(largest), tree: heapLayout(arr, heapSize), narrate: `Swap ${arr[largest]} and ${arr[idx]}.`, line: { js: 8, py: 8 }, comparisons: comps, insertions: swaps };

      idx = largest;
    }
  }

  yield { type: "done", tree: heapLayout(arr, heapSize), narrate: `Done! Extracted ${extractCount} max elements. ${comps} comparisons, ${swaps} swaps.`, comparisons: comps, insertions: swaps };
}

/* ---- Trie Insert + Search ---- */

type TrieNode = {
  char: string;
  children: Map<string, number>;
  isEnd: boolean;
};

class InternalTrie {
  nodes = new Map<number, TrieNode>();
  root: number;
  private nextId = 0;

  constructor() {
    this.root = this.nextId++;
    this.nodes.set(this.root, { char: "root", children: new Map(), isEnd: false });
  }

  private getWidth(id: number): number {
    const node = this.nodes.get(id)!;
    if (node.children.size === 0) return 1;
    let w = 0;
    for (const childId of node.children.values()) w += this.getWidth(childId);
    return Math.max(w, 1);
  }

  private getMaxDepth(id: number, depth: number): number {
    const node = this.nodes.get(id)!;
    let max = depth;
    for (const childId of node.children.values()) {
      max = Math.max(max, this.getMaxDepth(childId, depth + 1));
    }
    return max;
  }

  getLayout(): TreeVizData {
    const SVG_W = 760, SVG_H = 460, PAD = 50;
    const totalDepth = this.getMaxDepth(this.root, 0);
    const ySpace = totalDepth > 0 ? Math.min((SVG_H - 2 * PAD) / totalDepth, 80) : 0;

    const vizNodes: TreeNodeViz[] = [];
    const vizEdges: TreeEdgeViz[] = [];

    const layout = (id: number, depth: number, left: number, right: number) => {
      const node = this.nodes.get(id)!;
      const children = [...node.children.entries()].sort((a, b) => a[0].localeCompare(b[0]));

      vizNodes.push({
        id: String(id),
        value: 0,
        label: node.char,
        x: (left + right) / 2,
        y: PAD + depth * ySpace,
        endMarker: node.isEnd,
      });

      if (children.length === 0) return;

      const childWidths = children.map(([, cId]) => this.getWidth(cId));
      const totalWidth = childWidths.reduce((a, b) => a + b, 0);
      let currentLeft = left;

      for (let i = 0; i < children.length; i++) {
        const childRight = currentLeft + (childWidths[i] / totalWidth) * (right - left);
        vizEdges.push({ from: String(id), to: String(children[i][1]) });
        layout(children[i][1], depth + 1, currentLeft, childRight);
        currentLeft = childRight;
      }
    };

    layout(this.root, 0, PAD, SVG_W - PAD);
    return { nodes: vizNodes, edges: vizEdges };
  }
}

export function* trieInsertSearch(input: TreeInput): Generator<any> {
  const trie = new InternalTrie();
  const words = input.words || [];
  const searchWord = input.searchWord || "";
  let ops = 0;

  yield { type: "init", tree: trie.getLayout(), narrate: `Trie: inserting ${words.length} words, then searching for "${searchWord}".`, line: { js: 4, py: 4 }, comparisons: 0, insertions: 0 };

  // Insert phase
  for (const word of words) {
    let current = trie.root;
    for (let ci = 0; ci < word.length; ci++) {
      const ch = word[ci];
      const node = trie.nodes.get(current)!;
      ops++;

      if (node.children.has(ch)) {
        current = node.children.get(ch)!;
        yield { type: "traverse", nodeId: String(current), tree: trie.getLayout(), narrate: `"${word}": '${ch}' exists — traverse to it. (${word.slice(0, ci + 1)})`, line: { js: 6, py: 6 }, comparisons: ops, insertions: 0 };
      } else {
        const newId = trie.nodes.size;
        trie.nodes.set(newId, { char: ch, children: new Map(), isEnd: false });
        node.children.set(ch, newId);
        current = newId;
        yield { type: "create", nodeId: String(newId), tree: trie.getLayout(), narrate: `"${word}": create node '${ch}'. (${word.slice(0, ci + 1)})`, line: { js: 7, py: 7 }, comparisons: ops, insertions: 0 };
      }
    }
    trie.nodes.get(current)!.isEnd = true;
    yield { type: "word-complete", nodeId: String(current), tree: trie.getLayout(), narrate: `"${word}" complete — mark as end of word.`, line: { js: 9, py: 9 }, comparisons: ops, insertions: 0 };
  }

  yield { type: "build-done", tree: trie.getLayout(), narrate: `All ${words.length} words inserted. Now searching for "${searchWord}"...`, line: { js: 10, py: 10 }, comparisons: ops, insertions: 0 };

  // Search phase
  let current = trie.root;
  let found = true;
  for (let ci = 0; ci < searchWord.length; ci++) {
    const ch = searchWord[ci];
    const node = trie.nodes.get(current)!;
    ops++;

    if (node.children.has(ch)) {
      current = node.children.get(ch)!;
      yield { type: "search-traverse", nodeId: String(current), tree: trie.getLayout(), narrate: `Search "${searchWord}": '${ch}' found — follow edge. (${searchWord.slice(0, ci + 1)})`, line: { js: 12, py: 12 }, comparisons: ops, insertions: 0 };
    } else {
      found = false;
      yield { type: "not-found", tree: trie.getLayout(), narrate: `Search "${searchWord}": '${ch}' not found — word doesn't exist.`, line: { js: 13, py: 13 }, comparisons: ops, insertions: 0 };
      break;
    }
  }

  if (found) {
    const isEnd = trie.nodes.get(current)!.isEnd;
    if (isEnd) {
      yield { type: "found", nodeId: String(current), tree: trie.getLayout(), narrate: `"${searchWord}" found! Node is marked as end of word.`, line: { js: 14, py: 14 }, comparisons: ops, insertions: 0 };
    } else {
      yield { type: "not-found", tree: trie.getLayout(), narrate: `"${searchWord}" path exists but node is NOT end of word — not a stored word.`, line: { js: 14, py: 14 }, comparisons: ops, insertions: 0 };
    }
  }

  yield { type: "done", tree: trie.getLayout(), narrate: `Done! Trie has ${trie.nodes.size} nodes. ${ops} operations.`, comparisons: ops, insertions: 0 };
}

/* ---- Segment Tree Build + Query ---- */

function segLayout(tree: number[], ranges: Array<[number, number] | null>): TreeVizData {
  const SVG_W = 760, SVG_H = 460, PAD = 50;

  const validNodes: number[] = [];
  const findValid = (i: number) => {
    if (i >= tree.length || ranges[i] === null) return;
    validNodes.push(i);
    findValid(2 * i);
    findValid(2 * i + 1);
  };
  findValid(1);

  if (validNodes.length === 0) return { nodes: [], edges: [] };

  const maxDepth = Math.max(...validNodes.map(i => Math.floor(Math.log2(i))));
  const ySpace = Math.min((SVG_H - 2 * PAD) / Math.max(maxDepth, 1), 80);

  const vizNodes: TreeNodeViz[] = [];
  const vizEdges: TreeEdgeViz[] = [];

  for (const i of validNodes) {
    const depth = Math.floor(Math.log2(i));
    const posInLevel = i - Math.pow(2, depth);
    const x = SVG_W * (2 * posInLevel + 1) / Math.pow(2, depth + 1);
    const y = PAD + depth * ySpace;
    const [l, r] = ranges[i]!;

    vizNodes.push({
      id: String(i),
      value: tree[i],
      x,
      y,
      sublabel: `[${l},${r}]`,
    });

    const left = 2 * i;
    const right = 2 * i + 1;
    if (left < tree.length && ranges[left] !== null)
      vizEdges.push({ from: String(i), to: String(left) });
    if (right < tree.length && ranges[right] !== null)
      vizEdges.push({ from: String(i), to: String(right) });
  }

  return { nodes: vizNodes, edges: vizEdges };
}

export function* segTreeBuildQuery(input: TreeInput): Generator<any> {
  const arr = input.values;
  const n = arr.length;
  const size = 4 * n;
  const tree = new Array(size).fill(0);
  const ranges: Array<[number, number] | null> = new Array(size).fill(null);

  let ops = 0;

  yield { type: "init", tree: { nodes: [], edges: [] }, narrate: `Segment Tree: building from array [${arr.join(", ")}], then querying a range sum.`, line: { js: 1, py: 1 }, comparisons: 0, insertions: 0 };

  // Build
  function* buildGen(node: number, s: number, e: number): Generator<any> {
    ranges[node] = [s, e];
    if (s === e) {
      tree[node] = arr[s];
      ops++;
      yield { type: "build-leaf", nodeId: String(node), tree: segLayout(tree, ranges), narrate: `Leaf node: arr[${s}] = ${arr[s]}.`, line: { js: 2, py: 2 }, comparisons: ops, insertions: 0 };
      return;
    }
    const mid = (s + e) >> 1;
    yield* buildGen(2 * node, s, mid);
    yield* buildGen(2 * node + 1, mid + 1, e);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
    ops++;
    yield { type: "build-merge", nodeId: String(node), tree: segLayout(tree, ranges), narrate: `Merge: [${s},${e}] = ${tree[2 * node]} + ${tree[2 * node + 1]} = ${tree[node]}.`, line: { js: 5, py: 5 }, comparisons: ops, insertions: 0 };
  }

  yield* buildGen(1, 0, n - 1);

  const [ql, qr] = input.queryRange || [1, n - 2];

  yield { type: "build-done", tree: segLayout(tree, ranges), narrate: `Tree built! Root sum = ${tree[1]}. Now querying sum of range [${ql},${qr}].`, line: { js: 6, py: 6 }, comparisons: ops, insertions: 0 };

  // Query
  let queryResult = 0;

  function* queryGen(node: number, s: number, e: number, l: number, r: number): Generator<any> {
    if (l > e || r < s) {
      ops++;
      yield { type: "query-exclude", nodeId: String(node), tree: segLayout(tree, ranges), narrate: `[${s},${e}] outside query [${l},${r}] — skip. Return 0.`, line: { js: 7, py: 7 }, comparisons: ops, insertions: 0 };
      return;
    }
    if (l <= s && e <= r) {
      ops++;
      queryResult += tree[node];
      yield { type: "query-include", nodeId: String(node), tree: segLayout(tree, ranges), narrate: `[${s},${e}] fully inside [${l},${r}] — take value ${tree[node]}. Running sum = ${queryResult}.`, line: { js: 8, py: 8 }, comparisons: ops, insertions: 0 };
      return;
    }
    ops++;
    yield { type: "query-split", nodeId: String(node), tree: segLayout(tree, ranges), narrate: `[${s},${e}] partially overlaps [${l},${r}] — split into children.`, line: { js: 9, py: 9 }, comparisons: ops, insertions: 0 };
    const mid = (s + e) >> 1;
    yield* queryGen(2 * node, s, mid, l, r);
    yield* queryGen(2 * node + 1, mid + 1, e, l, r);
  }

  yield* queryGen(1, 0, n - 1, ql, qr);

  yield { type: "done", tree: segLayout(tree, ranges), narrate: `Done! Sum of range [${ql},${qr}] = ${queryResult}. ${ops} operations.`, comparisons: ops, insertions: 0 };
}

/* ---- TREE_ALGOS config ---- */

export const TREE_ALGOS: Record<string, any> = {
  bstInsert: {
    label: "BST Insert",
    fn: bstInsert,
    complexity: { avg: "O(log n)", best: "O(log n)", space: "O(n)" },
    info: "Traverse the tree comparing values: go left if smaller, right if larger. Insert at the first empty spot found.",
    why: "Foundation of all tree-based data structures. Used in databases, file systems, and symbol tables.",
    code: {
      js: `function insert(root, val) {\n  if (!root) return { val, L: null, R: null };\n  if (val < root.val)\n    root.L = insert(root.L, val);\n  else\n    root.R = insert(root.R, val);\n  return root;\n}`,
      py: `def insert(root, val):\n    if not root:\n        return Node(val)\n    if val < root.val:\n        root.left = insert(root.left, val)\n    else:\n        root.right = insert(root.right, val)\n    return root`,
    },
  },
  bstSearch: {
    label: "BST Search",
    fn: bstSearch,
    complexity: { avg: "O(log n)", best: "O(1)", space: "O(1)" },
    info: "Start at root. If target equals node, found. If smaller, go left. If larger, go right. Repeat until found or null.",
    why: "Efficient lookup in sorted data. Average O(log n) makes BST search practical for dictionaries and sets.",
    code: {
      js: `function search(root, target) {\n  if (!root) return null;\n  if (target === root.val) return root;\n  if (target < root.val)\n    return search(root.left, target);\n  return search(root.right, target);\n}`,
      py: `def search(root, target):\n    if not root:\n        return None\n    if target == root.val:\n        return root\n    if target < root.val:\n        return search(root.left, target)\n    return search(root.right, target)`,
    },
  },
  bstDelete: {
    label: "BST Delete",
    fn: bstDelete,
    complexity: { avg: "O(log n)", best: "O(log n)", space: "O(1)" },
    info: "Find the node. Leaf → remove. One child → replace with child. Two children → replace with in-order successor, then delete successor.",
    why: "Dynamic sets need deletion. The three cases show why BST delete is trickier than insert — maintaining the BST property requires care.",
    code: {
      js: `function deleteNode(root, val) {\n  if (!root) return null;\n  if (val < root.val)\n    root.L = deleteNode(root.L, val);\n  else if (val > root.val)\n    root.R = deleteNode(root.R, val);\n  else {\n    if (!root.L) return root.R;\n    if (!root.R) return root.L;\n    let s = root.R;\n    while (s.L) s = s.L;\n    root.val = s.val;\n    root.R = deleteNode(root.R, s.val);\n  }\n  return root;\n}`,
      py: `def delete(root, val):\n    if not root: return None\n    if val < root.val:\n        root.left = delete(root.left, val)\n    elif val > root.val:\n        root.right = delete(root.right, val)\n    else:\n        if not root.left: return root.right\n        if not root.right: return root.left\n        s = root.right\n        while s.left: s = s.left\n        root.val = s.val\n        root.right = delete(root.right, s.val)\n    return root`,
    },
  },
  avlInsert: {
    label: "AVL Insert",
    fn: avlInsert,
    complexity: { avg: "O(log n)", best: "O(log n)", space: "O(n)" },
    info: "Insert like BST, then check balance factors up the tree. If any node is unbalanced (|balance| > 1), rotate to fix: LL, RR, LR, or RL.",
    why: "Guarantees O(log n) for all operations. Regular BSTs can degrade to O(n) with sorted input — AVL prevents this via rotations.",
    code: {
      js: `function insert(root, val) {\n  if (!root) return { val, L: null, R: null, h: 1 };\n  if (val < root.val) root.L = insert(root.L, val);\n  else root.R = insert(root.R, val);\n  root.h = 1 + Math.max(h(root.L), h(root.R));\n  const bal = h(root.L) - h(root.R);\n  if (bal > 1 && val < root.L.val)\n    return rotateR(root);\n  if (bal < -1 && val > root.R.val)\n    return rotateL(root);\n  if (bal > 1 && val > root.L.val)\n    { root.L = rotateL(root.L); return rotateR(root); }\n  if (bal < -1 && val < root.R.val)\n    { root.R = rotateR(root.R); return rotateL(root); }\n  return root;\n}`,
      py: `def insert(root, val):\n    if not root: return Node(val)\n    if val < root.val:\n        root.left = insert(root.left, val)\n    else:\n        root.right = insert(root.right, val)\n    root.height = 1 + max(h(root.left), h(root.right))\n    bal = h(root.left) - h(root.right)\n    if bal > 1 and val < root.left.val:\n        return rotate_right(root)\n    if bal < -1 and val > root.right.val:\n        return rotate_left(root)\n    if bal > 1 and val > root.left.val:\n        root.left = rotate_left(root.left)\n        return rotate_right(root)\n    if bal < -1 and val < root.right.val:\n        root.right = rotate_right(root.right)\n        return rotate_left(root)\n    return root`,
    },
  },
  avlDelete: {
    label: "AVL Delete",
    fn: avlDelete,
    complexity: { avg: "O(log n)", best: "O(log n)", space: "O(n)" },
    info: "Delete like BST (3 cases), then walk up checking balance factors. Rotate at any unbalanced ancestor — may need multiple rotations.",
    why: "Completes the AVL toolkit. Deletion can unbalance multiple ancestors, unlike insert which unbalances at most one.",
    code: {
      js: `function deleteAVL(root, val) {\n  if (!root) return null;\n  if (val < root.val)\n    root.L = deleteAVL(root.L, val);\n  else if (val > root.val)\n    root.R = deleteAVL(root.R, val);\n  else {\n    if (!root.L) return root.R;\n    if (!root.R) return root.L;\n    let s = min(root.R);\n    root.val = s.val;\n    root.R = deleteAVL(root.R, s.val);\n  }\n  return rebalance(root);\n}`,
      py: `def delete_avl(root, val):\n    if not root: return None\n    if val < root.val:\n        root.left = delete_avl(root.left, val)\n    elif val > root.val:\n        root.right = delete_avl(root.right, val)\n    else:\n        if not root.left: return root.right\n        if not root.right: return root.left\n        s = find_min(root.right)\n        root.val = s.val\n        root.right = delete_avl(root.right, s.val)\n    return rebalance(root)`,
    },
  },
  heapBuild: {
    label: "Heap Build & Extract",
    fn: heapBuildExtract,
    complexity: { avg: "O(n)", best: "O(n)", space: "O(1)" },
    info: "Build a max-heap in O(n) by sifting down from the last parent. Extract max by swapping root with last, shrinking, and sifting down.",
    why: "Heaps power priority queues, heap sort, and schedulers. Build is O(n), not O(n log n) — a subtle but important result.",
    code: {
      js: `function buildHeap(arr) {\n  for (let i = Math.floor(arr.length/2)-1; i>=0; i--)\n    siftDown(arr, arr.length, i);\n}\nfunction siftDown(arr, n, i) {\n  let largest = i;\n  let l = 2*i+1, r = 2*i+2;\n  if (l < n && arr[l] > arr[largest]) largest = l;\n  if (r < n && arr[r] > arr[largest]) largest = r;\n  if (largest !== i) {\n    [arr[i], arr[largest]] = [arr[largest], arr[i]];\n    siftDown(arr, n, largest);\n  }\n}`,
      py: `def build_heap(arr):\n    for i in range(len(arr)//2 - 1, -1, -1):\n        sift_down(arr, len(arr), i)\n\ndef sift_down(arr, n, i):\n    largest = i\n    l, r = 2*i+1, 2*i+2\n    if l < n and arr[l] > arr[largest]:\n        largest = l\n    if r < n and arr[r] > arr[largest]:\n        largest = r\n    if largest != i:\n        arr[i], arr[largest] = arr[largest], arr[i]\n        sift_down(arr, n, largest)`,
    },
  },
  trieInsert: {
    label: "Trie Insert & Search",
    fn: trieInsertSearch,
    complexity: { avg: "O(L)", best: "O(L)", space: "O(N*L)" },
    info: "Insert words character by character, creating nodes as needed. Search by following edges — if path exists and ends at a word node, found.",
    why: "Tries enable prefix-based operations: autocomplete, spell check, IP routing. O(L) lookup regardless of dictionary size.",
    code: {
      js: `class TrieNode {\n  constructor() {\n    this.children = {};\n    this.end = false;\n  }\n}\nfunction insert(root, word) {\n  let node = root;\n  for (const ch of word) {\n    if (!node.children[ch])\n      node.children[ch] = new TrieNode();\n    node = node.children[ch];\n  }\n  node.end = true;\n}\nfunction search(root, word) {\n  let node = root;\n  for (const ch of word) {\n    if (!node.children[ch]) return false;\n    node = node.children[ch];\n  }\n  return node.end;\n}`,
      py: `class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.end = False\n\ndef insert(root, word):\n    node = root\n    for ch in word:\n        if ch not in node.children:\n            node.children[ch] = TrieNode()\n        node = node.children[ch]\n    node.end = True\n\ndef search(root, word):\n    node = root\n    for ch in word:\n        if ch not in node.children:\n            return False\n        node = node.children[ch]\n    return node.end`,
    },
  },
  segTree: {
    label: "Segment Tree",
    fn: segTreeBuildQuery,
    complexity: { avg: "O(n)", best: "O(n)", space: "O(4n)" },
    info: "Build a binary tree where each node stores the sum of a range. Query any range in O(log n) by combining at most 2 nodes per level.",
    why: "Essential for competitive programming. Supports range queries and point updates in O(log n) — arrays can only do one in O(1).",
    code: {
      js: `function build(arr, t, node, s, e) {\n  if (s === e) { t[node] = arr[s]; return; }\n  const mid = (s + e) >> 1;\n  build(arr, t, 2*node, s, mid);\n  build(arr, t, 2*node+1, mid+1, e);\n  t[node] = t[2*node] + t[2*node+1];\n}\nfunction query(t, node, s, e, l, r) {\n  if (l > e || r < s) return 0;\n  if (l <= s && e <= r) return t[node];\n  const mid = (s + e) >> 1;\n  return query(t, 2*node, s, mid, l, r)\n       + query(t, 2*node+1, mid+1, e, l, r);\n}`,
      py: `def build(arr, t, node, s, e):\n    if s == e:\n        t[node] = arr[s]\n        return\n    mid = (s + e) // 2\n    build(arr, t, 2*node, s, mid)\n    build(arr, t, 2*node+1, mid+1, e)\n    t[node] = t[2*node] + t[2*node+1]\n\ndef query(t, node, s, e, l, r):\n    if l > e or r < s: return 0\n    if l <= s and e <= r: return t[node]\n    mid = (s + e) // 2\n    return query(t, 2*node, s, mid, l, r) \\\n         + query(t, 2*node+1, mid+1, e, l, r)`,
    },
  },
};
