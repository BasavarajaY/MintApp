// src/hooks/useWebSocketManager.ts
import { useCallback } from "react";
import toast from "react-hot-toast";
import { fetchUserCredTaskStatus } from "../api/auth"; // You may need to make this dynamic

export const useWebSocketManager = <T extends { task_id?: string }>(
  setData: React.Dispatch<React.SetStateAction<T[]>>,
  setFilteredData: React.Dispatch<React.SetStateAction<T[]>>
) => {
  const activeSockets = new Map<string, WebSocket>();

  const connectWebSocket = useCallback(
    (taskId: string) => {
      const webSocketURL = "wss://mint-fastapi-app.cfapps.eu10-004.hana.ondemand.com/api/web/websocket/updates";
      // const webSocketURL = import.meta.env.VITE_WEBSOCKET_URL;
      const wsUrl = `${webSocketURL}`;

      if (activeSockets.has(taskId)) return;

      const ws = new WebSocket(wsUrl);
      activeSockets.set(taskId, ws);

      ws.onopen = async () => {
        console.log(`✅ WebSocket connected for task ${taskId}`);

        try {
          const response = await fetchUserCredTaskStatus(taskId); // You can abstract this API too
          const resultList = response.data.flat();

          const updateStatus = (list: T[]) =>
            list.map((v) => {
              const result = resultList.find((r: any) => r.task_id === v.task_id);
              if (result) {
                return {
                  ...v,
                  process_status: result.process_status,
                  progress_percentage: result.progress_percentage,
                };
              }
              return v;
            });

          setData((prev) => updateStatus(prev));
          setFilteredData((prev) => updateStatus(prev));
        } catch (err) {
          console.error("Initial WebSocket fetch error:", err);
        }
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          const updateStatus = (list: T[]) =>
            list.map((v) =>
              v.task_id === data.task_id
                ? {
                    ...v,
                    process_status: data.process_status,
                    progress_percentage: data.progress_percentage,
                  }
                : v
            );

          setData((prev) => updateStatus(prev));
          setFilteredData((prev) => updateStatus(prev));

          if (
            data.process_status === "success" ||
            data.process_status === "failed"
          ) {
            ws.close();
            activeSockets.delete(taskId);

            const result = await fetchUserCredTaskStatus(taskId);
            const flat = result.data.flat();
            const taskResult = flat.find((r: any) => r.task_id === data.task_id);

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
    [setData, setFilteredData]
  );

  return { connectWebSocket };
};
