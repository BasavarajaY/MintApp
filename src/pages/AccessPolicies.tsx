import { useEffect, useCallback } from "react";
import {
  fetchAccessPols,
  fetchAccessPolsTaskStatus,
  migrateAccessPols,
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
import type { AccessPolsItem } from "../types";
import StatusAndProgress from "./StatusAndProgress";

const AccessPolicies: React.FC = () => {
  const {
    data: accessPolsData,
    setData: setAccessPolsData,
    filteredData: filteredAccessPols,
    setFilteredData: setFilteredAccessPols,
    loading,
    setLoading,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    requestSort,
    sortConfig,
    selectedItems: selectedAccessPols,
    handleSelect,
    handleSelectAll,
    isMigrated,
    setIsMigrated,
  } = useCommonTableState<AccessPolsItem>("RoleName");

  // ✅ Extract WebSocket handler and wrap it
  const { connectWebSocket: rawConnectWebSocket } =
    useWebSocketManager<AccessPolsItem>(
      setAccessPolsData,
      setFilteredAccessPols,
      fetchAccessPolsTaskStatus
    );

  const connectWebSocket = useCallback(
    (taskId: string) => rawConnectWebSocket(taskId),
    [rawConnectWebSocket]
  );

  // ✅ useMigration hook
  const { handleMigrate } = useMigration<AccessPolsItem, "RoleName">({
    moduleType: "access-policies",
    setData: setAccessPolsData,
    setFilteredData: setFilteredAccessPols,
    connectWebSocket,
    setIsMigrated,
    matchKey: "RoleName",
  });

  useEffect(() => {
    const loadAccessPols = async () => {
      try {
        const response = await fetchAccessPols();
        const data = response.data?.results || [];
        setAccessPolsData(data);
        setFilteredAccessPols(data);
      } catch (err) {
        setError("Failed to load Access Policies data.");
      } finally {
        setLoading(false);
      }
    };

    loadAccessPols();
  }, []);

  if (loading) return <AppSpinner text="Loading Access Policies..." />;
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
        title="Access Policies"
        searchPlaceholder="Search..."
        searchTerm={searchTerm}
        setSearchTerm={(val) => setSearchTerm(val)}
        onMigrate={() =>
          handleMigrate(selectedAccessPols, accessPolsData, migrateAccessPols)
        }
        disableMigrate={selectedAccessPols.length === 0}
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
                      filteredAccessPols.length > 0 &&
                      selectedAccessPols.length === filteredAccessPols.length
                    }
                    onChange={(e) =>
                      handleSelectAll(
                        filteredAccessPols.map((u) => u.RoleName),
                        e.target.checked
                      )
                    }
                  />
                </th>
                <TableSortable<AccessPolsItem>
                  columnKey="Id"
                  label="Id"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <TableSortable<AccessPolsItem>
                  columnKey="RoleName"
                  label="Role Name"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <th className="py-2 px-3">Description</th>
                {isMigrated && <th className="py-2 px-3">Status</th>}
                {isMigrated && <th className="py-2 px-3">Progress</th>}
              </tr>
            </thead>
            <tbody>
              {filteredAccessPols.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-3">
                    No Access Policies records found.
                  </td>
                </tr>
              ) : (
                filteredAccessPols.map((accesspol) => (
                  <tr key={accesspol.RoleName}>
                    <td className="py-2 px-3">
                      <Form.Check
                        type="checkbox"
                        checked={selectedAccessPols.includes(
                          accesspol.RoleName
                        )}
                        onChange={(e) =>
                          handleSelect(accesspol.RoleName, e.target.checked)
                        }
                      />
                    </td>
                    <td className="py-2 px-3">{accesspol.Id || "—"}</td>
                    <td className="py-2 px-3">{accesspol.RoleName || "—"}</td>
                    <td className="py-2 px-3">
                      {accesspol.Description || "—"}
                    </td>
                    {isMigrated && <StatusAndProgress {...accesspol} />}
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

export default AccessPolicies;
