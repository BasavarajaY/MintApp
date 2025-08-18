// src/pages/Variables.tsx

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  createVariables,
  fetchVariables,
  fetchVariablesTaskStatus,
  migrateVariables,
} from "../api/auth";
import AppSpinner from "../components/common/AppSpinner";
import { Form } from "react-bootstrap";
import VariableModal from "./VariableModal";
import toast from "react-hot-toast";
import ProfileBanner from "./ProfileBanner";
import type { VariableItem } from "../types";
import StatusProgressBar from "../components/common/StatusProgressBar";
import { useCommonTableState } from "../hooks/useCommonStates";
import { useWebSocketManager } from "../hooks/useWebSocketManager";
import { useMigration } from "../hooks/useMigration";
import TableSortable from "../components/common/TableSortable";
import ErrorState from "../components/common/ErrorState";

const Variables: React.FC = () => {
  const {
    data: variablesData,
    setData: setVariablesData,
    filteredData: filteredVars,
    setFilteredData: setFilteredVars,
    loading,
    setLoading,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    requestSort,
    sortConfig,
    selectedItems: selectedVars,
    handleSelect,
    handleSelectAll,
    isMigrated,
    setIsMigrated,
  } = useCommonTableState<VariableItem>("VariableName");
  const [showModal, setShowModal] = useState(false);

  // ✅ Extract WebSocket handler and wrap it
  const { connectWebSocket: rawConnectWebSocket } =
    useWebSocketManager<VariableItem>(
      setVariablesData,
      setFilteredVars,
      fetchVariablesTaskStatus
    );

  const connectWebSocket = useCallback(
    (taskId: string) => rawConnectWebSocket(taskId),
    [rawConnectWebSocket]
  );

  // ✅ useMigration hook
  const { handleMigrate } = useMigration<VariableItem, "VariableName">({
    moduleType: "variables",
    setData: setVariablesData,
    setFilteredData: setFilteredVars,
    connectWebSocket,
    setIsMigrated,
    matchKey: "VariableName",
  });

  useEffect(() => {
    loadVariables();
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
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
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
  };
  const toDotNetDate = (date: string | Date): string => {
    const timestamp = new Date(date).getTime();
    return `/Date(${timestamp})/`;
  };

  if (loading) return <AppSpinner text="Loading Variables..." />;
  // // if (error) return <div className="text-danger">{error}</div>;
  if (error) {
    return (
      <ErrorState
        message={error || "Failed to load data."}
        onRetry={() => window.location.reload()}
      />
    );
  }

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
              width: "350px",
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="btn btn-outline-success fw-bold"
            onClick={() => {
              handleMigrate(selectedVars, variablesData, migrateVariables);
            }}
            disabled={selectedVars.length === 0}
            data-bs-toggle="tooltip"
            title="Migrate selected variables"
          >
            <i className="bi bi-cloud-upload me-1"></i>
          </button>

          {/* <button
            disabled
            className="btn btn-outline-primary fw-bold"
            onClick={() => setShowModal(true)}
          >
            ＋
          </button> */}
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
                    onChange={(e) =>
                      handleSelectAll(
                        filteredVars.map((u) => u.VariableName),
                        e.target.checked
                      )
                    }
                  />
                </th>
                {/* <th className="py-2 px-3">Variable Name</th> */}
                <TableSortable<VariableItem>
                  columnKey="VariableName"
                  label="Variable Name"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <TableSortable<VariableItem>
                  columnKey="IntegrationFlow"
                  label="Integration Flow"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <TableSortable<VariableItem>
                  columnKey="Visibility"
                  label="Visibility"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <TableSortable<VariableItem>
                  columnKey="UpdatedAt"
                  label="Updated At"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <TableSortable<VariableItem>
                  columnKey="RetainUntil"
                  label="Retain Until"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
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
