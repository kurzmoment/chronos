/** Column layout jen pro skutečný časový překryv (ne za sebou jdoucí bloky). */

export type TimedSpan = {
  startMin: number;
  endMin: number;
};

export type LaidOutSpan<T extends TimedSpan> = T & {
  column: number;
  totalColumns: number;
};

export const MIN_COLUMN_WIDTH_PX = 140;

/** Skutečný překryv — dotykající se konce/začátku (06:15–06:30 a 06:30–07:00) není překryv. */
export function spansOverlap(a: TimedSpan, b: TimedSpan): boolean {
  return a.startMin < b.endMin && b.startMin < a.endMin;
}

function assignColumns<T extends TimedSpan>(group: T[]): LaidOutSpan<T>[] {
  const sorted = [...group].sort(
    (a, b) => a.startMin - b.startMin || b.endMin - a.endMin
  );
  const columnEnds: number[] = [];
  const placed: { item: T; column: number }[] = [];

  for (const item of sorted) {
    let column = columnEnds.findIndex((end) => end < item.startMin);
    if (column === -1) {
      column = columnEnds.length;
      columnEnds.push(0);
    }
    columnEnds[column] = item.endMin;
    placed.push({ item, column });
  }

  const totalColumns = Math.max(1, columnEnds.length);
  return placed.map(({ item, column }) => ({
    ...item,
    column,
    totalColumns,
  }));
}

/** Spojité komponenty překryvu (ne řetězení „za sebou“). */
function overlapGroups<T extends TimedSpan>(items: T[]): T[][] {
  if (items.length === 0) return [];
  const parent = items.map((_, i) => i);

  function find(i: number): number {
    if (parent[i] !== i) parent[i] = find(parent[i]);
    return parent[i];
  }
  function unite(i: number, j: number) {
    const a = find(i);
    const b = find(j);
    if (a !== b) parent[a] = b;
  }

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (spansOverlap(items[i], items[j])) unite(i, j);
    }
  }

  const map = new Map<number, T[]>();
  for (let i = 0; i < items.length; i++) {
    const root = find(i);
    const list = map.get(root) ?? [];
    list.push(items[i]);
    map.set(root, list);
  }
  return [...map.values()];
}

export function layoutOverlappingEvents<T extends TimedSpan>(
  items: T[]
): LaidOutSpan<T>[] {
  return overlapGroups(items).flatMap((group) => assignColumns(group));
}

export function eventColumnStyle(column: number, totalColumns: number) {
  const gapPx = 8;
  const padPx = 12;
  const useFixedWidth = totalColumns > 1;

  const width = useFixedWidth
    ? `${MIN_COLUMN_WIDTH_PX}px`
    : `calc((100% - ${padPx * 2}px - ${(totalColumns - 1) * gapPx}px) / ${totalColumns})`;

  const left = useFixedWidth
    ? `${padPx + column * (MIN_COLUMN_WIDTH_PX + gapPx)}px`
    : `calc(${padPx}px + ${column} * ((100% - ${padPx * 2}px - ${(totalColumns - 1) * gapPx}px) / ${totalColumns} + ${gapPx}px))`;

  return {
    left,
    width,
    zIndex: 10 + column,
  } as const;
}
