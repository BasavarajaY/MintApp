import { useEffect, useCallback } from "react";
import {
  fetchCertToServKey,
  fetchCertToServKeyTaskStatus,
  migrateCertToServKey,
} from "../api/auth";
import AppSpinner from "../components/common/AppSpinner";
import ProfileBanner from "./ProfileBanner";
import { Form } from "react-bootstrap";
import { useMigration } from "../hooks/useMigration";
import { useWebSocketManager } from "../hooks/useWebSocketManager";
import { useCommonTableState } from "../hooks/useCommonStates";
import TableSortable from "../components/common/TableSortable";
import ErrorState from "../components/common/ErrorState";
import PageHeader from "./PageHeader";
import StatusAndProgress from "./StatusAndProgress";
import type { CertToServKeyItem } from "../types";

const CertToServKey: React.FC = () => {
  const {
    data: CertToServKeyData,
    setData: setCertToServKeyData,
    filteredData: filteredVals,
    setFilteredData: setFilteredVals,
    loading,
    setLoading,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    requestSort,
    sortConfig,
    selectedItems: selectedVals,
    handleSelect,
    handleSelectAll,
    isMigrated,
    setIsMigrated,
  } = useCommonTableState<CertToServKeyItem>("Id");

  // ✅ Extract WebSocket handler and wrap it
  const { connectWebSocket: rawConnectWebSocket } =
    useWebSocketManager<CertToServKeyItem>(
      setCertToServKeyData,
      setFilteredVals,
      fetchCertToServKeyTaskStatus
    );

  const connectWebSocket = useCallback(
    (taskId: string) => rawConnectWebSocket(taskId),
    [rawConnectWebSocket]
  );

  // ✅ useMigration hook
  const { handleMigrate } = useMigration<CertToServKeyItem, "Id">({
    moduleType: "service-key-certificates",
    setData: setCertToServKeyData,
    setFilteredData: setFilteredVals,
    connectWebSocket,
    setIsMigrated,
    matchKey: "Id",
  });

  useEffect(() => {
    const loadOAuthCreds = async () => {
      try {
        const response = await fetchCertToServKey();
        const data = response.data?.results || [];
        console.log(data);
        setCertToServKeyData(data);
        setFilteredVals(data);
      } catch (err) {
        setError("Failed to load Service Key Certificates data.");
      } finally {
        setLoading(false);
      }
    };

    loadOAuthCreds();
  }, []);

  if (loading) return <AppSpinner text="Loading Service Key Certificates..." />;
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
        title="Certificates to Service Key"
        searchPlaceholder="Search..."
        searchTerm={searchTerm}
        setSearchTerm={(val) => setSearchTerm(val)}
        onMigrate={() =>
          handleMigrate(selectedVals, CertToServKeyData, migrateCertToServKey)
        }
        disableMigrate={selectedVals.length === 0}
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
                      filteredVals.length > 0 &&
                      selectedVals.length === filteredVals.length
                    }
                    onChange={(e) =>
                      handleSelectAll(
                        filteredVals.map((u) => u.Id),
                        e.target.checked
                      )
                    }
                  />
                </th>
                <TableSortable<CertToServKeyItem>
                  columnKey="Id"
                  label="Id"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <TableSortable<CertToServKeyItem>
                  columnKey="User"
                  label="User"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />

                <th>LastModified By</th>
                <th>Created By</th>
                {isMigrated && <th className="py-2 px-3">Status</th>}
                {isMigrated && <th className="py-2 px-3">Progress</th>}
              </tr>
            </thead>
            <tbody>
              {filteredVals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-3">
                    No Service Key Certificates records found.
                  </td>
                </tr>
              ) : (
                filteredVals.map((filteredVal) => (
                  <tr key={filteredVal.Id}>
                    <td className="py-2 px-3">
                      <Form.Check
                        type="checkbox"
                        checked={selectedVals.includes(filteredVal.Id)}
                        onChange={(e) =>
                          handleSelect(filteredVal.Id, e.target.checked)
                        }
                      />
                    </td>
                    <td className="py-2 px-3">{filteredVal.Id || "—"}</td>
                    <td className="py-2 px-3">{filteredVal.User || "—"}</td>
                    <td className="py-2 px-3">
                      {filteredVal.LastModifiedBy || "—"}
                    </td>
                    <td className="py-2 px-3">
                      {filteredVal.CreatedBy || "—"}
                    </td>
                    {isMigrated && <StatusAndProgress {...filteredVal} />}
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

export default CertToServKey;
