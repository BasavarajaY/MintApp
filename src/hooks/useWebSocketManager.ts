import { useCallback } from "react";
import toast from "react-hot-toast";
import type { MigrationStatus } from "../types";

// T must extend MigrationStatus to ensure all migration fields exist
export const useWebSocketManager = <T extends MigrationStatus>(
  setData: React.Dispatch<React.SetStateAction<T[]>>,
  setFilteredData: React.Dispatch<React.SetStateAction<T[]>>,
  fetchTaskStatus: (taskId: string) => Promise<any>
) => {
  const activeSockets = new Map<string, WebSocket>();

  const connectWebSocket = useCallback(
    (taskId: string) => {
      const webSocketURL = import.meta.env.VITE_WEBSOCKET_URL;
      const wsUrl = `${webSocketURL}`;

      if (activeSockets.has(taskId)) return;

      const ws = new WebSocket(wsUrl);
      activeSockets.set(taskId, ws);

      ws.onopen = async () => {
        console.log(`✅ WebSocket connected for task ${taskId}`);

        try {
          const response = await fetchTaskStatus(taskId);
          const resultList: MigrationStatus[] = response.data.flat();

          const updateStatus = (list: T[]) =>
            list.map((v) => {
              const result = resultList.find((r) => r.task_id === v.task_id);
              return result ? { ...v, ...result } : v; // ✅ merge migration fields
            });

          setData((prev) => updateStatus(prev));
          setFilteredData((prev) => updateStatus(prev));
        } catch (err) {
          console.error("Initial WebSocket fetch error:", err);
        }
      };

      ws.onmessage = async (event) => {
        try {
          const data: MigrationStatus = JSON.parse(event.data);

          const updateStatus = (list: T[]) =>
            list.map((v) => (v.task_id === data.task_id ? { ...v, ...data } : v));

          setData((prev) => updateStatus(prev));
          setFilteredData((prev) => updateStatus(prev));

          if (data.process_status === "success" || data.process_status === "failed") {
            ws.close();
            activeSockets.delete(taskId);

            const result = await fetchTaskStatus(taskId);
            const flat: MigrationStatus[] = result.data.flat();
            const taskResult = flat.find((r) => r.task_id === data.task_id);

            if (taskResult?.success_message) toast.success(taskResult.success_message);
            if (taskResult?.error_message) toast.error(taskResult.error_message);
          }
        } catch (err) {
          console.error("WebSocket message error:", err);
        }
      };

      ws.onclose = () => {
        console.log(`🛑 WebSocket closed for task ${taskId}`);
        activeSockets.delete(taskId);
      };

      ws.onerror = (err) => {
        console.error(`❌ WebSocket error for task ${taskId}`, err);
        setTimeout(() => {
          if (!activeSockets.has(taskId)) connectWebSocket(taskId);
        }, 3000);
      };
    },
    [setData, setFilteredData, fetchTaskStatus]
  );

  return { connectWebSocket };
};
