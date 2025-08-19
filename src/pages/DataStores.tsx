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
import type { DataStoresItem } from "../types";
import { useCommonTableState } from "../hooks/useCommonStates";
import TableSortable from "../components/common/TableSortable";
import ErrorState from "../components/common/ErrorState";
import PageHeader from "./PageHeader";
import StatusAndProgress from "./StatusAndProgress";

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
        setError("Failed to load DataStores data.");
      } finally {
        setLoading(false);
      }
    };

    loadDataStores();
  }, []);

  if (loading) return <AppSpinner text="Loading Data Stores..." />;
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
        title="Data Stores"
        searchPlaceholder="Search..."
        searchTerm={searchTerm}
        setSearchTerm={(val) => setSearchTerm(val)}
        onMigrate={() =>
          handleMigrate(selectedDataStores, dataStoresData, migrateDataStores)
        }
        disableMigrate={selectedDataStores.length === 0}
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
                    {isMigrated && <StatusAndProgress {...datastore} />}
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
