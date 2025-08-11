// src/pages/Variables.tsx

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  createVariables,
  fetchTaskStatus,
  fetchVariables,
  migrateVariables,
} from "../api/auth";
import AppSpinner from "../components/common/AppSpinner";
import { Form } from "react-bootstrap";
import VariableModal from "./VariableModal";
import toast from "react-hot-toast";
import ProfileBanner from "./ProfileBanner";
import type { VariableItem } from "../types";
import StatusProgressBar from "../components/common/StatusProgressBar";

const Variables: React.FC = () => {
  const [variablesData, setVariablesData] = useState<VariableItem[]>([]);
  const [filteredVars, setFilteredVars] = useState<VariableItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedVars, setSelectedVars] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [pollTaskId, setPollTaskId] = useState<string | null>(null);
  const [pollingKeys, setPollingKeys] = useState<string[]>([]);
  const [isMigrated, setIsMigrated] = useState<boolean>(false);
  // ✅ Define update function with proper type
  /*const updateFn = useCallback(
    (
      updates: {
        process_key: string;
        process_status: string;
        progress_percentage: number;
      }[]
    ) => {
      const updateList = (list: VariableItem[]) =>
        list.map((v) => {
          const match = updates.find((u) => u.process_key === v.VariableName);
          return match
            ? {
                ...v,
                process_status: match.process_status,
                progress_percentage: match.progress_percentage,
              }
            : v;
        });

      setVariablesData((prev) => updateList(prev));
      setFilteredVars((prev) => updateList(prev));
    },
    [] // ✅ Stable dependency
  );

  // ✅ Call usePollingStatus *after* state and updateFn are defined
  usePollingStatus({
    taskId: pollTaskId || "",
    selectedKeys: pollingKeys,
    updateFn,
  });*/

  useEffect(() => {
    loadVariables();
  }, []);

  useEffect(() => {
    return () => {
      activeSockets.forEach((socket) => socket.close());
      activeSockets.clear();
    };
  }, []);

  const loadVariables = async () => {
    try {
      const response = await fetchVariables();
      const data = response.data.results;
      setVariablesData(data);
      setFilteredVars(data);
    } catch (err: any) {
      console.error("Error fetching variables:", err);
      setError("Failed to load variable data.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    const match = /\/Date\((\d+)\)\//.exec(dateStr);
    if (!match) return "—";
    const timestamp = parseInt(match[1], 10);
    const date = new Date(timestamp);
    // return date.toUTCString(); // 👉 Wed, 30 Jul 2025 12:17:04 GMT
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  // Handle search filtering
  useEffect(() => {
    const filtered = variablesData.filter((v) =>
      v.VariableName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVars(filtered);
    setSelectedVars([]); // Clear selections on search
  }, [searchTerm, variablesData]);

  // Checkbox handlers
  const handleSelect = (variableName: string, checked: boolean) => {
    setSelectedVars((prev) =>
      checked ? [...prev, variableName] : prev.filter((v) => v !== variableName)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allNames = filteredVars.map((v) => v.VariableName);
      setSelectedVars(allNames);
    } else {
      setSelectedVars([]);
    }
  };

  const handleAddVariable = async (variable: VariableItem) => {
    const payload = {
      module_type: "variables",
      data: [
        {
          VariableName: variable.VariableName,
          IntegrationFlow: variable.IntegrationFlow,
          Visibility: variable.Visibility,
          UpdatedAt: toDotNetDate(new Date()),
          RetainUntil: toDotNetDate(variable.RetainUntil),
        },
      ],
      created_by: 1,
    };
    await createVariables(payload);
    toast.success("Variable added successfully!");
    await loadVariables();
    // const newEntry = {
    //   ...newVar,
    //   UpdatedAt: new Date().toISOString(), // fallback timestamp
    //   RetainUntil: new Date(newVar.RetainUntil).toISOString(),
    // };
    // const updated = [...variablesData, newEntry];
    // setVariablesData(updated);
    // setFilteredVars(updated);
  };
  const toDotNetDate = (date: string | Date): string => {
    const timestamp = new Date(date).getTime();
    return `/Date(${timestamp})/`;
  };

  const handleMigrate = async () => {
    if (selectedVars.length === 0) {
      toast("Please select variables to migrate");
      return;
    }

    try {
      const selectedObjects = variablesData.filter((v) =>
        selectedVars.includes(v.VariableName)
      );

      const aData = selectedObjects.map((variable) => ({
        VariableName: variable.VariableName,
        IntegrationFlow: variable.IntegrationFlow,
        Visibility: variable.Visibility,
        UpdatedAt: toDotNetDate(new Date()),
        RetainUntil: toDotNetDate(variable.RetainUntil),
      }));

      const payload = {
        module_type: "variables",
        data: aData,
        created_by: 1,
      };

      const migrateResponse = await migrateVariables(payload);
      const taskId = migrateResponse.data?.task_id;

      toast.success(
        `${selectedVars.length} variable(s) migrated. Listening for updates...`
      );
      // if (taskId) {
      //   toast.success("Task submitted. Migration started..");
      //   setPollTaskId(taskId); // ✅ this triggers the hook to start
      //   setPollingKeys([...selectedVars]);
      // }

      if (taskId) {
        toast.success("Task submitted. Migration started..");
        setIsMigrated(true);
        const tagTaskId = (list: VariableItem[]) =>
          list.map((v) =>
            selectedVars.includes(v.VariableName)
              ? {
                  ...v,
                  task_id: taskId,
                  process_status: "pending",
                  progress_percentage: 0,
                }
              : v
          );

        setVariablesData((prev) => tagTaskId(prev));
        setFilteredVars((prev) => tagTaskId(prev));

        // connectWebSocket(taskId); //
        if (taskId) {
          connectWebSocket(taskId); //
        }
      }
    } catch (error) {
      console.error("Migration error:", error);
      toast.error("Migration failed");
    }
  };

  const activeSockets = new Map<string, WebSocket>(); // task_id => WebSocket

  const connectWebSocket = (taskId: string) => {
    const webSocketURL =
      "wss://mint-fastapi-app.cfapps.eu10-004.hana.ondemand.com/api/web/websocket/updates";
    const wsUrl = `${webSocketURL}`;

    if (activeSockets.has(taskId)) return; // Already connected

    const ws = new WebSocket(wsUrl);
    activeSockets.set(taskId, ws);

    ws.onopen = async () => {
      console.log(`✅ WebSocket connected for task ${taskId}`);

      // ✅ Fetch initial status when connected
      try {
        // const response = await fetchTaskStatus(taskId);
        // const { process_status, progress_percentage } = response.data[0];

        // const updateStatus = (list: VariableItem[]) =>
        //   list.map((v) =>
        //     v.task_id === taskId
        //       ? {
        //           ...v,
        //           process_status,
        //           progress_percentage,
        //         }
        //       : v
        //   );

        // setVariablesData((prev) => updateStatus(prev));
        // setFilteredVars((prev) => updateStatus(prev));
        const response = await fetchTaskStatus(taskId);

        // Assume response.data is an array of results
        const resultList = response.data.flat() as {
          task_id: string;
          process_status: string;
          progress_percentage: number;
          success_message?: string;
          error_message?: string;
          process_key?: string;
        }[];

        // Step 1: Update progress & status for each task_id
        const updateStatus = (list: VariableItem[]) =>
          list.map((v) => {
            const result = resultList.find((r) => r.task_id === v.task_id);
            if (result) {
              return {
                ...v,
                process_status: result.process_status,
                progress_percentage: result.progress_percentage,
              };
            }
            return v;
          });

        setVariablesData((prev) => updateStatus(prev));
        setFilteredVars((prev) => updateStatus(prev));

        // // Step 2: Show success/error toasts or logs
        // resultList.forEach((item) => {
        //   if (item.success_message) {
        //     toast.success(`✅ ${item.success_message}`);
        //   }
        //   if (item.error_message) {
        //     toast.error(`❌ ${item.error_message}`);
        //   }
        // });
      } catch (err) {
        console.error("Error fetching initial task status:", err);
      }
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data); // { task_id, process_status, progress_percentage }

        const updateStatus = (list: VariableItem[]) =>
          list.map((v) =>
            v.task_id === data.task_id
              ? {
                  ...v,
                  process_status: data.process_status,
                  progress_percentage: data.progress_percentage,
                }
              : v
          );

        setVariablesData((prev) => updateStatus(prev));
        setFilteredVars((prev) => updateStatus(prev));

        // If task has completed
        if (
          data.process_status === "success" ||
          data.process_status === "failed"
        ) {
          // ✅ Close WebSocket for that task
          ws.close();
          activeSockets.delete(taskId);

          // ✅ Fetch final result for that task
          const result = await fetchTaskStatus(taskId);
          const flattened = result.data.flat(); // assuming array of arrays

          const taskResult = flattened.find(
            (r: any) => r.task_id === data.task_id
          );
          if (taskResult) {
            if (taskResult.success_message) {
              toast.success(`✅ ${taskResult.success_message}`);
            }
            if (taskResult.error_message) {
              toast.error(`❌ ${taskResult.error_message}`);
            }
          }
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      console.log(`🛑 WebSocket closed for task ${taskId}`);
      activeSockets.delete(taskId);
    };

    ws.onerror = (err) => {
      console.error(`❌ WebSocket error for task ${taskId}`, err);

      setTimeout(() => {
        if (!activeSockets.has(taskId)) {
          console.log(`🔁 Reconnecting WebSocket for task ${taskId}`);
          connectWebSocket(taskId);
        }
      }, 3000);
    };
  };

  if (loading) return <AppSpinner />;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0" style={{ color: "#003DA5" }}>
          Variables
        </h4>

        <div className="d-flex gap-2 align-items-center">
          <input
            type="text"
            placeholder="Search..."
            className="form-control"
            style={{
              border: "1px solid #003DA5",
              borderRadius: "5px",
              color: "#003DA5",
              maxWidth: "240px",
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="btn btn-outline-success fw-bold"
            onClick={handleMigrate}
            disabled={selectedVars.length === 0}
            data-bs-toggle="tooltip"
            title="Migrate selected variables"
          >
            <i className="bi bi-cloud-upload me-1"></i>
          </button>

          <button
            className="btn btn-outline-primary fw-bold"
            onClick={() => setShowModal(true)}
          >
            ＋
          </button>
          <VariableModal
            show={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleAddVariable}
          />
        </div>
      </div>
      <div>
        <ProfileBanner />
      </div>
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "10px",
          color: "#003DA5",
        }}
      >
        {/* Table */}
        <div>
          <table
            className="table table-appblue"
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              color: "#003DA5",
            }}
          >
            <thead style={{ backgroundColor: "#f5f5f5" }}>
              <tr>
                <th className="py-2 px-3">
                  <Form.Check
                    type="checkbox"
                    checked={
                      filteredVars.length > 0 &&
                      selectedVars.length === filteredVars.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="py-2 px-3">Variable Name</th>
                <th className="py-2 px-3">Integration Flow</th>
                <th className="py-2 px-3">Visibility</th>
                <th className="py-2 px-3">Updated At</th>
                <th className="py-2 px-3">Retain Until</th>
                {isMigrated && <th className="py-2 px-3">Status</th>}
                {isMigrated && <th className="py-2 px-3">Progress</th>}
              </tr>
            </thead>
            <tbody>
              {filteredVars.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-3">
                    No variable records found.
                  </td>
                </tr>
              ) : (
                filteredVars.map((variable) => (
                  <tr key={variable.VariableName}>
                    <td className="py-2 px-3">
                      <Form.Check
                        type="checkbox"
                        checked={selectedVars.includes(variable.VariableName)}
                        onChange={(e) =>
                          handleSelect(variable.VariableName, e.target.checked)
                        }
                      />
                    </td>
                    <td className="py-2 px-3">
                      {variable.VariableName || "—"}
                    </td>
                    <td className="py-2 px-3">
                      {variable.IntegrationFlow || "—"}
                    </td>
                    <td className="py-2 px-3">{variable.Visibility || "—"}</td>
                    <td className="py-2 px-3">
                      {formatDate(variable.UpdatedAt)}
                    </td>
                    <td className="py-2 px-3">
                      {formatDate(variable.RetainUntil)}
                    </td>
                    {isMigrated && (
                      <td className="py-2 px-3 text-capitalize">
                        {variable.process_status ? (
                          <span
                            className={`badge ${
                              variable.process_status === "success"
                                ? "bg-success"
                                : variable.process_status === "pending"
                                ? "bg-warning text-dark"
                                : variable.process_status === "failed"
                                ? "bg-danger"
                                : "bg-secondary"
                            }`}
                          >
                            {variable.process_status.replace(/_/g, " ")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    )}

                    {isMigrated && (
                      <td className="py-2 px-3">
                        <div style={{ marginTop: "6px" }}>
                          <StatusProgressBar
                            percentage={variable.progress_percentage}
                            status={variable.process_status}
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Variables;
