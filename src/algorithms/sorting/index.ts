// Step types: compare | swap | sorted | pivot | current | done | set

export function* bubbleSort(arr) {
  const a = [...arr];
  const n = a.length;
  let comps = 0,
    swaps = 0,
    passes = 0;
  for (let i = 0; i < n - 1; i++) {
    passes++;
    for (let j = 0; j < n - i - 1; j++) {
      comps++;
      yield {
        type: "compare",
        i: j,
        j: j + 1,
        comps,
        swaps,
        passes,
        arr: [...a],
        line: 4,
        narrate: `Comparing [${j}]=${a[j]} with [${j + 1}]=${a[j + 1]}. ${a[j] > a[j + 1] ? "Out of order → swap." : "In order → move on."}`,
      };
      if (a[j] > a[j + 1]) {
        swaps++;
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        yield {
          type: "swap",
          i: j,
          j: j + 1,
          comps,
          swaps,
          passes,
          arr: [...a],
          line: 5,
          narrate: `Swapped ${a[j + 1]} ↔ ${a[j]}. Larger value bubbles right.`,
        };
      }
    }
    yield {
      type: "sorted",
      idx: n - 1 - i,
      comps,
      swaps,
      passes,
      arr: [...a],
      line: 3,
      narrate: `Pass ${passes} done. Element at position ${n - 1 - i} is in its final place.`,
    };
  }
  yield {
    type: "sorted",
    idx: 0,
    comps,
    swaps,
    passes,
    arr: [...a],
    line: 0,
    narrate: "All elements sorted!",
  };
  yield {
    type: "done",
    comps,
    swaps,
    passes,
    arr: [...a],
    narrate: `Done! ${comps} comparisons, ${swaps} swaps across ${passes} passes.`,
  };
}

export function* selectionSort(arr) {
  const a = [...arr];
  const n = a.length;
  let comps = 0,
    swaps = 0,
    passes = 0;
  for (let i = 0; i < n - 1; i++) {
    passes++;
    let minIdx = i;
    yield {
      type: "current",
      idx: i,
      comps,
      swaps,
      passes,
      arr: [...a],
      line: 3,
      narrate: `Pass ${passes}: scanning from position ${i} to find the minimum of the unsorted region.`,
    };
    for (let j = i + 1; j < n; j++) {
      comps++;
      yield {
        type: "compare",
        i: j,
        j: minIdx,
        comps,
        swaps,
        passes,
        arr: [...a],
        line: 5,
        narrate: `Is [${j}]=${a[j]} < current min [${minIdx}]=${a[minIdx]}? ${a[j] < a[minIdx] ? "Yes — new minimum!" : "No."}`,
      };
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      swaps++;
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      yield {
        type: "swap",
        i,
        j: minIdx,
        comps,
        swaps,
        passes,
        arr: [...a],
        line: 7,
        narrate: `Minimum found at [${minIdx}]=${a[i]}. Placed at position ${i}.`,
      };
    }
    yield {
      type: "sorted",
      idx: i,
      comps,
      swaps,
      passes,
      arr: [...a],
      line: 2,
      narrate: `Position ${i} locked. Sorted region grows by 1.`,
    };
  }
  yield {
    type: "sorted",
    idx: n - 1,
    comps,
    swaps,
    passes,
    arr: [...a],
    line: 0,
    narrate: "Last element sorted!",
  };
  yield {
    type: "done",
    comps,
    swaps,
    passes,
    arr: [...a],
    narrate: `Done! Only ${swaps} swaps — selection sort minimizes writes.`,
  };
}

export function* insertionSort(arr) {
  const a = [...arr];
  const n = a.length;
  let comps = 0,
    swaps = 0,
    passes = 0;
  yield {
    type: "sorted",
    idx: 0,
    comps,
    swaps,
    passes,
    arr: [...a],
    line: 1,
    narrate:
      "Single element is trivially sorted. Starting to insert remaining elements.",
  };
  for (let i = 1; i < n; i++) {
    passes++;
    const key = a[i];
    let j = i - 1;
    yield {
      type: "current",
      idx: i,
      comps,
      swaps,
      passes,
      arr: [...a],
      line: 2,
      narrate: `Picking up key=${key} at position ${i}. Inserting into sorted left portion.`,
    };
    while (j >= 0 && a[j] > key) {
      comps++;
      swaps++;
      a[j + 1] = a[j];
      yield {
        type: "swap",
        i: j + 1,
        j,
        comps,
        swaps,
        passes,
        arr: [...a],
        line: 4,
        narrate: `${a[j]} > ${key} → shift right to make room.`,
      };
      j--;
    }
    a[j + 1] = key;
    yield {
      type: "sorted",
      idx: i,
      comps,
      swaps,
      passes,
      arr: [...a],
      line: 7,
      narrate: `Inserted ${key} at position ${j + 1}. Left side is sorted up to index ${i}.`,
    };
  }
  yield {
    type: "done",
    comps,
    swaps,
    passes,
    arr: [...a],
    narrate: `Done! Like sorting cards in hand — ${passes} insertions.`,
  };
}

export function* mergeSort(arr) {
  const a = [...arr];
  let comps = 0,
    swaps = 0,
    passes = 0;

  function* ms(l, r) {
    if (l >= r) return;
    passes++;
    const m = Math.floor((l + r) / 2);
    yield* ms(l, m);
    yield* ms(m + 1, r);
    const L = a.slice(l, m + 1),
      R = a.slice(m + 1, r + 1);
    let i = 0,
      j = 0,
      k = l;
    while (i < L.length && j < R.length) {
      comps++;
      yield {
        type: "compare",
        i: l + i,
        j: m + 1 + j,
        comps,
        swaps,
        passes,
        arr: [...a],
        line: 10,
        narrate: `Merging halves: ${L[i]} vs ${R[j]}. Taking ${L[i] <= R[j] ? L[i] : R[j]}.`,
      };
      a[k++] = L[i] <= R[j] ? L[i++] : R[j++];
      swaps++;
      yield {
        type: "current",
        idx: k - 1,
        comps,
        swaps,
        passes,
        arr: [...a],
        line: 11,
        narrate: `Placed element at position ${k - 1} in merged output.`,
      };
    }
    while (i < L.length) {
      a[k++] = L[i++];
      swaps++;
      yield {
        type: "current",
        idx: k - 1,
        comps,
        swaps,
        passes,
        arr: [...a],
        line: 12,
        narrate: "Copying remaining left.",
      };
    }
    while (j < R.length) {
      a[k++] = R[j++];
      swaps++;
      yield {
        type: "current",
        idx: k - 1,
        comps,
        swaps,
        passes,
        arr: [...a],
        line: 13,
        narrate: "Copying remaining right.",
      };
    }
    for (let x = l; x <= r; x++)
      yield {
        type: "sorted",
        idx: x,
        comps,
        swaps,
        passes,
        arr: [...a],
        line: 5,
        narrate: `Subarray [${l}..${r}] fully merged and sorted.`,
      };
  }
  yield* ms(0, a.length - 1);
  yield {
    type: "done",
    comps,
    swaps,
    passes,
    arr: [...a],
    narrate: `Done! Merge sort: always O(n log n) — ${passes} merge passes.`,
  };
}

export function* quickSort(arr) {
  const a = [...arr];
  let comps = 0,
    swaps = 0,
    passes = 0;

  function* qs(lo, hi) {
    if (lo >= hi) {
      if (lo === hi)
        yield {
          type: "sorted",
          idx: lo,
          comps,
          swaps,
          passes,
          arr: [...a],
          line: 1,
          narrate: `Single element at ${lo} — already sorted.`,
        };
      return;
    }
    passes++;
    const pivot = a[hi];
    let i = lo - 1;
    yield {
      type: "pivot",
      idx: hi,
      comps,
      swaps,
      passes,
      arr: [...a],
      line: 8,
      narrate: `Pivot = ${pivot} at [${hi}]. Partitioning: smaller left, larger right.`,
    };
    for (let j = lo; j < hi; j++) {
      comps++;
      yield {
        type: "compare",
        i: j,
        j: hi,
        comps,
        swaps,
        passes,
        arr: [...a],
        line: 10,
        narrate: `Is ${a[j]} ≤ pivot ${pivot}? ${a[j] <= pivot ? "Yes → belongs left." : "No → stays right."}`,
      };
      if (a[j] <= pivot) {
        i++;
        swaps++;
        [a[i], a[j]] = [a[j], a[i]];
        yield {
          type: "swap",
          i,
          j,
          comps,
          swaps,
          passes,
          arr: [...a],
          line: 12,
          narrate: `${a[j]} ≤ pivot → swapped to left partition at [${i}].`,
        };
      }
    }
    swaps++;
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    yield {
      type: "swap",
      i: i + 1,
      j: hi,
      comps,
      swaps,
      passes,
      arr: [...a],
      line: 15,
      narrate: `Pivot ${a[i + 1]} placed at final position [${i + 1}]. Left < pivot < Right.`,
    };
    yield {
      type: "sorted",
      idx: i + 1,
      comps,
      swaps,
      passes,
      arr: [...a],
      line: 16,
      narrate: `Position ${i + 1} is locked forever.`,
    };
    yield* qs(lo, i);
    yield* qs(i + 2, hi);
  }
  yield* qs(0, a.length - 1);
  yield {
    type: "done",
    comps,
    swaps,
    passes,
    arr: [...a],
    narrate: `Done! Quick sort: divide-and-conquer at its best. ${swaps} swaps.`,
  };
}

export function* heapSort(arr) {
  const a = [...arr];
  const n = a.length;
  let comps = 0,
    swaps = 0,
    passes = 0;

  function* heapify(size, root) {
    let largest = root;
    const l = 2 * root + 1,
      r = 2 * root + 2;
    comps++;
    yield {
      type: "compare",
      i: l < size ? l : root,
      j: root,
      comps,
      swaps,
      passes,
      arr: [...a],
      line: 3,
      narrate: `Heapify: comparing node ${root} with left child ${l < size ? l : "N/A"}.`,
    };
    if (l < size && a[l] > a[largest]) largest = l;
    if (r < size) {
      comps++;
      if (a[r] > a[largest]) largest = r;
    }
    if (largest !== root) {
      swaps++;
      [a[root], a[largest]] = [a[largest], a[root]];
      yield {
        type: "swap",
        i: root,
        j: largest,
        comps,
        swaps,
        passes,
        arr: [...a],
        line: 7,
        narrate: `${a[largest]} > parent → swap to maintain max-heap property.`,
      };
      yield* heapify(size, largest);
    }
  }

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    passes++;
    yield {
      type: "current",
      idx: i,
      comps,
      swaps,
      passes,
      arr: [...a],
      line: 12,
      narrate: `Building max-heap: heapifying subtree rooted at ${i}.`,
    };
    yield* heapify(n, i);
  }
  yield {
    type: "current",
    idx: 0,
    comps,
    swaps,
    passes,
    arr: [...a],
    line: 13,
    narrate: "Max-heap built! Root is now the maximum element.",
  };

  // Extract
  for (let i = n - 1; i > 0; i--) {
    swaps++;
    [a[0], a[i]] = [a[i], a[0]];
    yield {
      type: "swap",
      i: 0,
      j: i,
      comps,
      swaps,
      passes,
      arr: [...a],
      line: 16,
      narrate: `Root (max=${a[i]}) swapped to position ${i} — its final place.`,
    };
    yield {
      type: "sorted",
      idx: i,
      comps,
      swaps,
      passes,
      arr: [...a],
      line: 17,
      narrate: `Position ${i} sorted. Heap size shrinks to ${i}.`,
    };
    yield* heapify(i, 0);
  }
  yield {
    type: "sorted",
    idx: 0,
    comps,
    swaps,
    passes,
    arr: [...a],
    line: 0,
    narrate: "Last element sorted!",
  };
  yield {
    type: "done",
    comps,
    swaps,
    passes,
    arr: [...a],
    narrate: `Done! Heap sort: always O(n log n), zero extra memory. ${passes} heapify calls.`,
  };
}

export function* countingSort(arr: number[]) {
  const a = [...arr];
  const n = a.length;

  let passes = 0;
  let writes = 0;

  const max = Math.max(...a);
  const count = new Array(max + 1).fill(0);

  yield {
    type: "current",
    idx: 0,
    comps: 0,
    swaps: 0,
    passes,
    arr: [...a],
    line: 2,
    narrate: `Max value = ${max}. Creating count array.`,
  };

  for (let i = 0; i < n; i++) {
    count[a[i]]++;

    yield {
      type: "current",
      idx: i,
      comps: 0,
      swaps: 0,
      passes,
      arr: [...a],
      line: 4,
      narrate: `Counting: value ${a[i]} → count[${a[i]}] = ${count[a[i]]}`,
    };
  }

  yield {
    type: "current",
    idx: 0,
    comps: 0,
    swaps: 0,
    passes,
    arr: [...a],
    line: 6,
    narrate: "Rebuilding sorted array from counts.",
  };

  let pos = 0;

  for (let v = 0; v <= max; v++) {
    while (count[v] > 0) {
      a[pos] = v;
      count[v]--;
      writes++;
      passes++;

      yield {
        type: "current",
        idx: pos,
        comps: 0,
        swaps: writes,
        passes,
        arr: [...a],
        line: 9,
        narrate: `Placed ${v} at position ${pos}`,
      };

      pos++;
    }
  }

  for (let i = 0; i < n; i++) {
    yield {
      type: "sorted",
      idx: i,
      comps: 0,
      swaps: writes,
      passes,
      arr: [...a],
    };
  }

  yield {
    type: "done",
    comps: 0,
    swaps: writes,
    passes,
    arr: [...a],
    narrate: `Done! Counting sort: O(n+k). Writes: ${writes}.`,
  };
}

export function* radixSort(arr) {
  const a = [...arr];
  const n = a.length;
  let passes = 0,
    swaps = 0;
  const max = Math.max(...a);

  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    passes++;
    const output = new Array(n).fill(0);
    const count = new Array(10).fill(0);
    const digit = (v) => Math.floor(v / exp) % 10;

    yield {
      type: "current",
      idx: 0,
      comps: 0,
      swaps,
      passes,
      arr: [...a],
      line: 3,
      narrate: `Pass ${passes}: sorting by digit at place value ${exp}. Looking at the ${exp === 1 ? "ones" : exp === 10 ? "tens" : "hundreds"} digit.`,
    };

    for (let i = 0; i < n; i++) {
      count[digit(a[i])]++;
      yield {
        type: "compare",
        i,
        j: i,
        comps: i + 1,
        swaps,
        passes,
        arr: [...a],
        line: 5,
        narrate: `${a[i]} → digit ${digit(a[i])} → count[${digit(a[i])}]=${count[digit(a[i])]}.`,
      };
    }

    for (let i = 1; i < 10; i++) count[i] += count[i - 1];

    for (let i = n - 1; i >= 0; i--) {
      output[count[digit(a[i])] - 1] = a[i];
      count[digit(a[i])]--;
    }

    for (let i = 0; i < n; i++) {
      a[i] = output[i];
      swaps++;
      yield {
        type: "current",
        idx: i,
        comps: n,
        swaps,
        passes,
        arr: [...a],
        line: 10,
        narrate: `Placed ${a[i]} at position ${i} after digit-${exp} sort.`,
      };
    }
  }
  for (let i = 0; i < a.length; i++)
    yield {
      type: "sorted",
      idx: i,
      comps: n * passes,
      swaps,
      passes,
      arr: [...a],
      line: 0,
      narrate: "",
    };
  yield {
    type: "done",
    comps: n * passes,
    swaps,
    passes,
    arr: [...a],
    narrate: `Done! Radix sort: O(nk) — sorts integers by digits, no comparisons between elements!`,
  };
}

export const SORT_ALGOS = {
  bubble: {
    label: "Bubble",
    fn: bubbleSort,
    complexity: { avg: "O(n²)", best: "O(n)", space: "O(1)" },
    category: "comparison",
    why: "Simplest sort. Never use in production for large data, but great for teaching swapping and passes.",
    info: 'Repeatedly compares adjacent pairs and swaps if out of order. Each full pass "bubbles" the largest unseen element to the end.',
    code: {
      js: `function bubbleSort(arr) {\n  let n = arr.length;\n  for (let i = 0; i < n - 1; i++) {\n    for (let j = 0; j < n - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}`,
      py: `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n - 1):\n        for j in range(n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr`,
    },
  },
  selection: {
    label: "Selection",
    fn: selectionSort,
    complexity: { avg: "O(n²)", best: "O(n²)", space: "O(1)" },
    category: "comparison",
    why: "Minimizes the number of swaps — at most n-1. Good when write operations are expensive.",
    info: "Finds the minimum of the unsorted region each pass and places it at the start. The sorted region grows left to right.",
    code: {
      js: `function selectionSort(arr) {\n  let n = arr.length;\n  for (let i = 0; i < n - 1; i++) {\n    let minIdx = i;\n    for (let j = i + 1; j < n; j++) {\n      if (arr[j] < arr[minIdx]) minIdx = j;\n    }\n    if (minIdx !== i)\n      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];\n  }\n  return arr;\n}`,
      py: `def selection_sort(arr):\n    n = len(arr)\n    for i in range(n - 1):\n        min_idx = i\n        for j in range(i + 1, n):\n            if arr[j] < arr[min_idx]:\n                min_idx = j\n        if min_idx != i:\n            arr[i], arr[min_idx] = arr[min_idx], arr[i]\n    return arr`,
    },
  },
  insertion: {
    label: "Insertion",
    fn: insertionSort,
    complexity: { avg: "O(n²)", best: "O(n)", space: "O(1)" },
    category: "comparison",
    why: "Best for small or nearly-sorted data. Used internally by TimSort and std::sort for small subarrays.",
    info: 'Builds a sorted array element by element. Each new element is "inserted" into its correct position — like sorting cards in your hand.',
    code: {
      js: `function insertionSort(arr) {\n  for (let i = 1; i < arr.length; i++) {\n    let key = arr[i], j = i - 1;\n    while (j >= 0 && arr[j] > key) {\n      arr[j + 1] = arr[j];\n      j--;\n    }\n    arr[j + 1] = key;\n  }\n  return arr;\n}`,
      py: `def insertion_sort(arr):\n    for i in range(1, len(arr)):\n        key = arr[i]\n        j = i - 1\n        while j >= 0 and arr[j] > key:\n            arr[j + 1] = arr[j]\n            j -= 1\n        arr[j + 1] = key\n    return arr`,
    },
  },
  merge: {
    label: "Merge",
    fn: mergeSort,
    complexity: { avg: "O(n log n)", best: "O(n log n)", space: "O(n)" },
    category: "comparison",
    why: "Stable, predictable O(n log n). Used when you need guaranteed performance or sorting linked lists.",
    info: "Divide and conquer: split array in half recursively, sort each half, merge back. Stable — preserves order of equal elements.",
    code: {
      js: `function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const m = Math.floor(arr.length / 2);\n  const L = mergeSort(arr.slice(0, m));\n  const R = mergeSort(arr.slice(m));\n  return merge(L, R);\n}\nfunction merge(L, R) {\n  const out = [];\n  let i = 0, j = 0;\n  while (i < L.length && j < R.length)\n    out.push(L[i] <= R[j] ? L[i++] : R[j++]);\n  return [...out, ...L.slice(i), ...R.slice(j)];\n}`,
      py: `def merge_sort(arr):\n    if len(arr) <= 1: return arr\n    m = len(arr) // 2\n    L = merge_sort(arr[:m])\n    R = merge_sort(arr[m:])\n    return merge(L, R)\ndef merge(L, R):\n    out, i, j = [], 0, 0\n    while i < len(L) and j < len(R):\n        if L[i] <= R[j]: out.append(L[i]); i += 1\n        else: out.append(R[j]); j += 1\n    return out + L[i:] + R[j:]`,
    },
  },
  quick: {
    label: "Quick",
    fn: quickSort,
    complexity: { avg: "O(n log n)", best: "O(n log n)", space: "O(log n)" },
    category: "comparison",
    why: "Fastest in practice for most random data. Used in most std library sort implementations.",
    info: "Picks a pivot, partitions array around it, recursively sorts sub-arrays. Pivot lands in its final place after each partition.",
    code: {
      js: `function quickSort(arr, lo=0, hi=arr.length-1) {\n  if (lo >= hi) return arr;\n  const p = partition(arr, lo, hi);\n  quickSort(arr, lo, p - 1);\n  quickSort(arr, p + 1, hi);\n  return arr;\n}\nfunction partition(arr, lo, hi) {\n  const pivot = arr[hi];\n  let i = lo - 1;\n  for (let j = lo; j < hi; j++)\n    if (arr[j] <= pivot) [arr[++i], arr[j]] = [arr[j], arr[i]];\n  [arr[i+1], arr[hi]] = [arr[hi], arr[i+1]];\n  return i + 1;\n}`,
      py: `def quick_sort(arr, lo=0, hi=None):\n    if hi is None: hi = len(arr) - 1\n    if lo >= hi: return arr\n    p = partition(arr, lo, hi)\n    quick_sort(arr, lo, p - 1)\n    quick_sort(arr, p + 1, hi)\n    return arr\ndef partition(arr, lo, hi):\n    pivot, i = arr[hi], lo - 1\n    for j in range(lo, hi):\n        if arr[j] <= pivot:\n            i += 1\n            arr[i], arr[j] = arr[j], arr[i]\n    arr[i+1], arr[hi] = arr[hi], arr[i+1]\n    return i + 1`,
    },
  },
  heap: {
    label: "Heap",
    fn: heapSort,
    complexity: { avg: "O(n log n)", best: "O(n log n)", space: "O(1)" },
    category: "comparison",
    why: "O(n log n) guaranteed, O(1) space. Used in priority queues and systems where worst-case matters.",
    info: "Builds a max-heap, then repeatedly extracts the max to the end. Combines heap data structure with sorting.",
    code: {
      js: `function heapSort(arr) {\n  const n = arr.length;\n  for (let i = Math.floor(n/2)-1; i >= 0; i--)\n    heapify(arr, n, i);\n  for (let i = n-1; i > 0; i--) {\n    [arr[0], arr[i]] = [arr[i], arr[0]];\n    heapify(arr, i, 0);\n  }\n}\nfunction heapify(arr, n, i) {\n  let lg = i, l = 2*i+1, r = 2*i+2;\n  if (l < n && arr[l] > arr[lg]) lg = l;\n  if (r < n && arr[r] > arr[lg]) lg = r;\n  if (lg !== i) {\n    [arr[i], arr[lg]] = [arr[lg], arr[i]];\n    heapify(arr, n, lg);\n  }\n}`,
      py: `def heap_sort(arr):\n    n = len(arr)\n    for i in range(n//2 - 1, -1, -1):\n        heapify(arr, n, i)\n    for i in range(n-1, 0, -1):\n        arr[0], arr[i] = arr[i], arr[0]\n        heapify(arr, i, 0)\ndef heapify(arr, n, i):\n    lg, l, r = i, 2*i+1, 2*i+2\n    if l < n and arr[l] > arr[lg]: lg = l\n    if r < n and arr[r] > arr[lg]: lg = r\n    if lg != i:\n        arr[i], arr[lg] = arr[lg], arr[i]\n        heapify(arr, n, lg)`,
    },
  },
  counting: {
    label: "Counting",
    fn: countingSort,
    complexity: { avg: "O(n+k)", best: "O(n+k)", space: "O(k)" },
    category: "non-comparison",
    why: "Beats O(n log n) for small integer ranges. Used in radix sort, histogram problems.",
    info: "Counts occurrences of each value, then rebuilds the array in order. No comparisons between elements!",
    code: {
      js: `function countingSort(arr) {\n  const max = Math.max(...arr);\n  const count = new Array(max + 1).fill(0);\n  for (const v of arr) count[v]++;\n  const out = [];\n  for (let v = 0; v <= max; v++)\n    while (count[v]-- > 0) out.push(v);\n  return out;\n}`,
      py: `def counting_sort(arr):\n    max_val = max(arr)\n    count = [0] * (max_val + 1)\n    for v in arr:\n        count[v] += 1\n    out = []\n    for v, c in enumerate(count):\n        out.extend([v] * c)\n    return out`,
    },
  },
  radix: {
    label: "Radix",
    fn: radixSort,
    complexity: { avg: "O(nk)", best: "O(nk)", space: "O(n+k)" },
    category: "non-comparison",
    why: "Sorts integers digit by digit — can beat O(n log n) for fixed-width integers. Used in networking (IP sort) and databases.",
    info: "Sorts numbers digit by digit from least significant to most significant using counting sort at each digit position.",
    code: {
      js: `function radixSort(arr) {\n  const max = Math.max(...arr);\n  for (let exp = 1; max/exp > 1; exp *= 10)\n    countByDigit(arr, exp);\n  return arr;\n}\nfunction countByDigit(arr, exp) {\n  const count = new Array(10).fill(0);\n  const n = arr.length;\n  const out = new Array(n);\n  const digit = v => Math.floor(v / exp) % 10;\n  for (let i = 0; i < n; i++) count[digit(arr[i])]++;\n  for (let i = 1; i < 10; i++) count[i] += count[i-1];\n  for (let i = n-1; i >= 0; i--)\n    out[--count[digit(arr[i])]] = arr[i];\n  arr.splice(0, n, ...out);\n}`,
      py: `def radix_sort(arr):\n    max_val = max(arr)\n    exp = 1\n    while max_val // exp > 0:\n        counting_by_digit(arr, exp)\n        exp *= 10\n    return arr\ndef counting_by_digit(arr, exp):\n    n = len(arr)\n    out = [0] * n\n    count = [0] * 10\n    digit = lambda v: (v // exp) % 10\n    for v in arr: count[digit(v)] += 1\n    for i in range(1, 10): count[i] += count[i-1]\n    for i in range(n-1, -1, -1):\n        out[count[digit(arr[i])]-1] = arr[i]\n        count[digit(arr[i])] -= 1\n    arr[:] = out`,
    },
  },
};
