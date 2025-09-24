// src/hooks/useMigration.ts
import { useState } from "react";
import toast from "react-hot-toast";

interface UseMigrationParams<T, K extends keyof T> {
  moduleType: string;
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  setFilteredData: React.Dispatch<React.SetStateAction<T[]>>;
  connectWebSocket?: (taskId: string) => void;
  setIsMigrated?: React.Dispatch<React.SetStateAction<boolean>>;
  matchKey: K; // ✅ now required so we don't hardcode Name
}

type MigrateFunction<T> = (
  payload: {
    module_type: string;
    data: T[];
    created_by: number;
  }
) => Promise<{ data: { task_id: string } }>;

// ✅ Type guard to check if "payload" exists
function hasPayload(obj: any): obj is { payload: any } {
  return obj && typeof obj === "object" && "payload" in obj;
}

export const useMigration = <T, K extends keyof T>({
  moduleType,
  setData,
  setFilteredData,
  connectWebSocket,
  setIsMigrated,
  matchKey,
}: UseMigrationParams<T, K>) => {
  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigrate = async (
    selectedItems: string[],
    fullData: T[],
    migrateFn: MigrateFunction<T>
  ) => {
    if (selectedItems.length === 0) {
      toast("Please select items to migrate");
      return;
    }

    // ✅ Filter selected objects based on matchKey
    const selectedObjects: T[] = fullData.filter((item) =>
      selectedItems.includes(String(item[matchKey]))
    );

    // ✅ Use payload if present, else fallback to full object
    const finalPayload = selectedObjects.map((item) =>
      hasPayload(item) ? item.payload : item
    );

    const payload = {
      module_type: moduleType,
      data: finalPayload,
      created_by: 1,
    };

    try {
      setIsMigrating(true);
      const response = await migrateFn(payload);
      const taskId = response.data?.task_id;

      toast.success(`${selectedObjects.length} item(s) migrated.`);

      if (taskId) {
        toast.success("Task submitted. Migration started.");

        // ✅ Optional migrated state flag
        if (setIsMigrated) setIsMigrated(true);

        // ✅ Tag migrated items with task_id and reset progress
        const tagTaskId = (list: T[]) =>
          list.map((v) =>
            selectedItems.includes(String(v[matchKey]))
              ? {
                  ...v,
                  task_id: taskId,
                  process_status: "pending",
                  progress_percentage: 0,
                }
              : v
          );

        setData((prev) => tagTaskId(prev));
        setFilteredData((prev) => tagTaskId(prev));

        // ✅ Start WebSocket updates
        if (connectWebSocket) {
          connectWebSocket(taskId);
        }
      }
    } catch (error) {
      console.error("Migration error:", error);
      toast.error("Migration failed");
    } finally {
      setIsMigrating(false);
    }
  };

  return { handleMigrate, isMigrating };
};
