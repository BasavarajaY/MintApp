import { useEffect, useRef } from "react";
import { fetchTaskStatus } from "../api/auth";

interface StatusUpdate {
  process_key: string;
  process_status: string;
  progress_percentage: number;
}

interface Props {
  taskId: string;
  selectedKeys: string[];
  updateFn: (updates: StatusUpdate[]) => void;
  intervalMs?: number;
}

export function usePollingStatus({
  taskId,
  selectedKeys,
  updateFn,
  intervalMs = 10000, // ✅ default 10s
}: Props) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!taskId || selectedKeys.length === 0) return;

    const poll = async () => {
      try {
        const response = await fetchTaskStatus(taskId);
        const data = response.data as StatusUpdate[];

        const allDone = data.every((item) => item.process_status === "success" && item.progress_percentage === 100);

        updateFn(data);

        // If all tasks are complete, stop polling
        if (allDone && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    // Initial call
    poll();

    // Start polling
    intervalRef.current = setInterval(poll, intervalMs);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [taskId, selectedKeys, updateFn, intervalMs]);
}

export default usePollingStatus;
