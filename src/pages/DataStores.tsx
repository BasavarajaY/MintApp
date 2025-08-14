import { useEffect, useCallback } from "react";
import {
  fetchDataStores,
  fetchDataStoresTaskStatus,
  migrateDataStores,
} from "../api/auth";
import AppSpinner from "../components/common/AppSpinner";
import ProfileBanner from "./ProfileBanner";
import { Form } from "react-bootstrap";
import { useMigration } from "../hooks/useMigration";
import { useWebSocketManager } from "../hooks/useWebSocketManager";
import StatusProgressBar from "../components/common/StatusProgressBar";
import type { DataStoresItem } from "../types";
import { useCommonTableState } from "../hooks/useCommonStates";
import TableSortable from "../components/common/TableSortable";

const DataStores: React.FC = () => {
  const {
    data: dataStoresData,
    setData: setDataStoresData,
    filteredData: filteredDataStores,
    setFilteredData: setFilteredDataStores,
    loading,
    setLoading,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    requestSort,
    sortConfig,
    selectedItems: selectedDataStores,
    setSelectedItems: setSelectedDataStores,
    handleSelect,
    handleSelectAll,
    isMigrated,
    setIsMigrated,
  } = useCommonTableState<DataStoresItem>("DataStoreName");

  // ✅ Extract WebSocket handler and wrap it
  const { connectWebSocket: rawConnectWebSocket } =
    useWebSocketManager<DataStoresItem>(
      setDataStoresData,
      setFilteredDataStores,
      fetchDataStoresTaskStatus
    );

  const connectWebSocket = useCallback(
    (taskId: string) => rawConnectWebSocket(taskId),
    [rawConnectWebSocket]
  );

  // ✅ useMigration hook
  const { handleMigrate } = useMigration<DataStoresItem, "DataStoreName">({
    moduleType: "datastores",
    setData: setDataStoresData,
    setFilteredData: setFilteredDataStores,
    connectWebSocket,
    setIsMigrated,
    matchKey: "DataStoreName",
  });

  useEffect(() => {
    const loadDataStores = async () => {
      try {
        const response = await fetchDataStores();
        const data = response.data?.results || [];
        setDataStoresData(data);
        setFilteredDataStores(data);
      } catch (err) {
        console.error("Error fetching DataStores:", err);
        setError("Failed to load DataStores data.");
      } finally {
        setLoading(false);
      }
    };

    loadDataStores();
  }, []);

  useEffect(() => {
    let filtered = dataStoresData.filter((v) =>
      v.DataStoreName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply sorting if active
    if (sortConfig) {
      const key: keyof DataStoresItem = sortConfig.key;
      const direction = sortConfig.direction;

      filtered = [...filtered].sort((a, b) => {
        if ((a[key] ?? "") < (b[key] ?? "")) {
          return direction === "asc" ? -1 : 1;
        }
        if ((a[key] ?? "") > (b[key] ?? "")) {
          return direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredDataStores(filtered);

    setSelectedDataStores((prevSelected) =>
      prevSelected.filter((name) =>
        filtered.some((item) => item.DataStoreName === name)
      )
    );
  }, [searchTerm, dataStoresData, sortConfig]);

  if (loading) return <AppSpinner text="Loading Data Stores..." />;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0" style={{ color: "#003DA5" }}>
          Data Stores
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
            onClick={() => {
              handleMigrate(
                selectedDataStores,
                dataStoresData,
                migrateDataStores
              );
            }}
            disabled={selectedDataStores.length === 0}
            data-bs-toggle="tooltip"
            title="Migrate selected Data Stores"
          >
            <i className="bi bi-cloud-upload me-1"></i>
          </button>
        </div>
      </div>
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
                      filteredDataStores.length > 0 &&
                      selectedDataStores.length === filteredDataStores.length
                    }
                    onChange={(e) =>
                      handleSelectAll(
                        filteredDataStores.map((u) => u.DataStoreName),
                        e.target.checked
                      )
                    }
                  />
                </th>
                <TableSortable<DataStoresItem>
                  columnKey="DataStoreName"
                  label="DataStore Name"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <th className="py-2 px-3">Integration Flow</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">No. of Messages</th>
                <th className="py-2 px-3">No. of OverdueMessages</th>
                {isMigrated && <th className="py-2 px-3">Status</th>}
                {isMigrated && <th className="py-2 px-3">Progress</th>}
              </tr>
            </thead>
            <tbody>
              {filteredDataStores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-3">
                    No Data Stores records found.
                  </td>
                </tr>
              ) : (
                filteredDataStores.map((datastore) => (
                  <tr key={datastore.DataStoreName}>
                    <td className="py-2 px-3">
                      <Form.Check
                        type="checkbox"
                        checked={selectedDataStores.includes(
                          datastore.DataStoreName
                        )}
                        onChange={(e) =>
                          handleSelect(
                            datastore.DataStoreName,
                            e.target.checked
                          )
                        }
                      />
                    </td>
                    <td className="py-2 px-3">
                      {datastore.IntegrationFlow || "—"}
                    </td>
                    <td className="py-2 px-3">{datastore.Type || "—"}</td>
                    <td className="py-2 px-3">
                      {datastore.NumberOfMessages || "—"}
                    </td>
                    <td className="py-2 px-3">
                      {datastore.NumberOfOverdueMessages || "—"}
                    </td>
                    {isMigrated && (
                      <>
                        <td className="py-2 px-3 text-capitalize">
                          {datastore.process_status ? (
                            <span
                              className={`badge ${
                                datastore.process_status === "success"
                                  ? "bg-success"
                                  : datastore.process_status === "pending"
                                  ? "bg-warning text-dark"
                                  : datastore.process_status === "failed"
                                  ? "bg-danger"
                                  : "bg-secondary"
                              }`}
                            >
                              {datastore.process_status.replace(/_/g, " ")}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div style={{ marginTop: "6px" }}>
                            <StatusProgressBar
                              percentage={datastore.progress_percentage}
                              status={datastore.process_status}
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

export default DataStores;
