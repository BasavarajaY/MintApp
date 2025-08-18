import { useEffect, useCallback } from "react";
import {
  fetchValueMappings,
  fetchValueMappingsTaskStatus,
  migrateValueMappings,
} from "../api/auth";
import AppSpinner from "../components/common/AppSpinner";
import ProfileBanner from "./ProfileBanner";
import { Form } from "react-bootstrap";
import { useMigration } from "../hooks/useMigration";
import { useWebSocketManager } from "../hooks/useWebSocketManager";
import StatusProgressBar from "../components/common/StatusProgressBar";
import type { ValueMappingsItem } from "../types";
import { useCommonTableState } from "../hooks/useCommonStates";
import TableSortable from "../components/common/TableSortable";
import ErrorState from "../components/common/ErrorState";
import PageHeader from "./PageHeader";

const ValueMappings: React.FC = () => {
  const {
    data: ValMapsData,
    setData: setValueMappingsData,
    filteredData: filteredValMaps,
    setFilteredData: setFilteredValMaps,
    loading,
    setLoading,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    requestSort,
    sortConfig,
    selectedItems: selectedValMaps,
    handleSelect,
    handleSelectAll,
    isMigrated,
    setIsMigrated,
  } = useCommonTableState<ValueMappingsItem>("Name");

  // ✅ Extract WebSocket handler and wrap it
  const { connectWebSocket: rawConnectWebSocket } =
    useWebSocketManager<ValueMappingsItem>(
      setValueMappingsData,
      setFilteredValMaps,
      fetchValueMappingsTaskStatus
    );

  const connectWebSocket = useCallback(
    (taskId: string) => rawConnectWebSocket(taskId),
    [rawConnectWebSocket]
  );

  // ✅ useMigration hook
  const { handleMigrate } = useMigration<ValueMappingsItem, "Name">({
    moduleType: "value-mappings",
    setData: setValueMappingsData,
    setFilteredData: setFilteredValMaps,
    connectWebSocket,
    setIsMigrated,
    matchKey: "Name",
  });

  useEffect(() => {
    const loadOAuthCreds = async () => {
      try {
        const response = await fetchValueMappings();
        const data = response.data?.results || [];
        console.log(data);
        setValueMappingsData(data);
        setFilteredValMaps(data);
      } catch (err) {
        setError("Failed to load Value Mappings data.");
      } finally {
        setLoading(false);
      }
    };

    loadOAuthCreds();
  }, []);

  if (loading) return <AppSpinner text="Loading Value Mappings..." />;
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
      <PageHeader
        title="Value Mappings"
        searchPlaceholder="Search..."
        searchTerm={searchTerm}
        setSearchTerm={(val) => setSearchTerm(val)}
        onMigrate={() =>
          handleMigrate(selectedValMaps, ValMapsData, migrateValueMappings)
        }
        disableMigrate={selectedValMaps.length === 0}
      />

      <ProfileBanner />

      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "10px",
          color: "#003DA5",
        }}
      >
        <div style={{ maxHeight: "500px", overflowY: "auto" }}>
          <table className="table table-appblue sticky-table">
            <thead style={{ backgroundColor: "#f5f5f5" }}>
              <tr>
                <th className="py-2 px-3">
                  <Form.Check
                    type="checkbox"
                    checked={
                      filteredValMaps.length > 0 &&
                      selectedValMaps.length === filteredValMaps.length
                    }
                    onChange={(e) =>
                      handleSelectAll(
                        filteredValMaps.map((u) => u.Name),
                        e.target.checked
                      )
                    }
                  />
                </th>
                <TableSortable<ValueMappingsItem>
                  columnKey="Id"
                  label="Id"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <TableSortable<ValueMappingsItem>
                  columnKey="Name"
                  label="Name"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <TableSortable<ValueMappingsItem>
                  columnKey="Description"
                  label="Description"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <th>Version</th>
                <th>PackageId</th>
                {isMigrated && <th className="py-2 px-3">Status</th>}
                {isMigrated && <th className="py-2 px-3">Progress</th>}
              </tr>
            </thead>
            <tbody>
              {filteredValMaps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-3">
                    No Value Mappings records found.
                  </td>
                </tr>
              ) : (
                filteredValMaps.map((ValueMap) => (
                  <tr key={ValueMap.Name}>
                    <td className="py-2 px-3">
                      <Form.Check
                        type="checkbox"
                        checked={selectedValMaps.includes(ValueMap.Name)}
                        onChange={(e) =>
                          handleSelect(ValueMap.Name, e.target.checked)
                        }
                      />
                    </td>
                    <td className="py-2 px-3">{ValueMap.Id || "—"}</td>
                    <td className="py-2 px-3">{ValueMap.Name || "—"}</td>
                    <td className="py-2 px-3">{ValueMap.Description || "—"}</td>
                    <td className="py-2 px-3">{ValueMap.Version || "—"}</td>
                    <td className="py-2 px-3">{ValueMap.PackageId || "—"}</td>
                    {isMigrated && (
                      <>
                        <td className="py-2 px-3 text-capitalize">
                          {ValueMap.process_status ? (
                            <span
                              className={`badge ${
                                ValueMap.process_status === "success"
                                  ? "bg-success"
                                  : ValueMap.process_status === "pending"
                                  ? "bg-warning text-dark"
                                  : ValueMap.process_status === "failed"
                                  ? "bg-danger"
                                  : "bg-secondary"
                              }`}
                            >
                              {ValueMap.process_status.replace(/_/g, " ")}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div style={{ marginTop: "6px" }}>
                            <StatusProgressBar
                              percentage={ValueMap.progress_percentage}
                              status={ValueMap.process_status}
                            />
                          </div>
                        </td>
                      </>
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

export default ValueMappings;
