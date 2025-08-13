interface SortableThProps<T> {
  columnKey: keyof T;
  label: string;
  sortConfig: { key: keyof T; direction: "asc" | "desc" } | null;
  requestSort: (key: keyof T) => void;
}

function TableSortable<T>({
  columnKey,
  label,
  sortConfig,
  requestSort,
}: SortableThProps<T>) {
  const isActive = sortConfig?.key === columnKey;
  const arrow = isActive ? (sortConfig!.direction === "asc" ? "▲" : "▼") : "▲"; // default arrow when inactive

  return (
    <th
      onClick={() => requestSort(columnKey)}
      style={{ cursor: "pointer", userSelect: "none" }}
    >
      {label} <span style={{ color: "#003DA5" }}>{arrow}</span>
    </th>
  );
}

export default TableSortable;
