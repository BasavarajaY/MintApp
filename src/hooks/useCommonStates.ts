// src/hooks/useCommonTableState.ts
import { useEffect, useState } from "react";

export const useCommonTableState = <T>(filterKey: keyof T) => {
  const [data, setData] = useState<T[]>([]);
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isMigrated, setIsMigrated] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);
//   const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: "asc" | "desc" }>({
//   key: "yourDefaultColumn" as keyof T,
//   direction: "asc",
// });

  useEffect(() => {
    let filtered = filterBySearch(data, searchTerm, filterKey);

    // Apply sorting if active
    if (sortConfig) {
      const { key, direction } = sortConfig;
      filtered = [...filtered].sort((a, b) => {
        const aValue = (a[key] ?? "") as string | number;
        const bValue = (b[key] ?? "") as string | number;

        if (aValue < bValue) return direction === "asc" ? -1 : 1;
        if (aValue > bValue) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(filtered);

    // Keep only selected items that still exist in filtered list
    setSelectedItems((prev) =>
      prev.filter((name) =>
        filtered.some(
          (item) => String(item[filterKey]) === String(name)
        )
      )
    );
  }, [searchTerm, data, sortConfig, filterKey]);

  function filterBySearch(
    items: T[],
    term: string,
    key: keyof T
  ): T[] {
    return items.filter((item) =>
      String(item[key] ?? "")
        .toLowerCase()
        .includes(term.toLowerCase())
    );
  }

  // Helpers
  const handleSelect = (name: string, checked: boolean) => {
    setSelectedItems((prev) =>
      checked ? [...prev, name] : prev.filter((v) => v !== name)
    );
  };

  const handleSelectAll = (allNames: string[], checked: boolean) => {
    setSelectedItems(checked ? allNames : []);
  };

  const requestSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  return {
    data,
    setData,
    filteredData,
    setFilteredData,
    loading,
    setLoading,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    sortConfig,
    setSortConfig,
    requestSort,
    selectedItems,
    setSelectedItems,
    handleSelect,
    handleSelectAll,
    isMigrated,
    setIsMigrated,
  };
};
