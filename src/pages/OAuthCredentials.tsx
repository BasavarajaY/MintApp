import { useEffect, useCallback } from "react";
import {
  fetchOAuthCredentials,
  fetchOAuthCredTaskStatus,
  migrateOAuthCreds,
} from "../api/auth";
import AppSpinner from "../components/common/AppSpinner";
import ProfileBanner from "./ProfileBanner";
import { Form } from "react-bootstrap";
import { useMigration } from "../hooks/useMigration";
import { useWebSocketManager } from "../hooks/useWebSocketManager";
import type { OAuthCredItem } from "../types";
import { useCommonTableState } from "../hooks/useCommonStates";
import TableSortable from "../components/common/TableSortable";
import ErrorState from "../components/common/ErrorState";
import PageHeader from "./PageHeader";
import StatusAndProgress from "./StatusAndProgress";

const OAuthCredentials: React.FC = () => {
  const {
    data: oAuthCredData,
    setData: setOAuthCredData,
    filteredData: filteredUsers,
    setFilteredData: setFilteredUsers,
    loading,
    setLoading,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    requestSort,
    sortConfig,
    selectedItems: selectedUsers,
    handleSelect,
    handleSelectAll,
    isMigrated,
    setIsMigrated,
  } = useCommonTableState<OAuthCredItem>("Name");

  // ✅ Extract WebSocket handler and wrap it
  const { connectWebSocket: rawConnectWebSocket } =
    useWebSocketManager<OAuthCredItem>(
      setOAuthCredData,
      setFilteredUsers,
      fetchOAuthCredTaskStatus
    );

  const connectWebSocket = useCallback(
    (taskId: string) => rawConnectWebSocket(taskId),
    [rawConnectWebSocket]
  );

  // ✅ useMigration hook
  const { handleMigrate } = useMigration<OAuthCredItem, "Name">({
    moduleType: "oauth2-credentials",
    setData: setOAuthCredData,
    setFilteredData: setFilteredUsers,
    connectWebSocket,
    setIsMigrated,
    matchKey: "Name",
  });

  useEffect(() => {
    const loadOAuthCreds = async () => {
      try {
        const response = await fetchOAuthCredentials();
        const data = response.data?.results || [];
        console.log(data);
        setOAuthCredData(data);
        setFilteredUsers(data);
      } catch (err) {
        setError("Failed to load OAuth Credentials data.");
      } finally {
        setLoading(false);
      }
    };

    loadOAuthCreds();
  }, []);

  if (loading) return <AppSpinner text="Loading OAuth Credentials..." />;
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
        title="OAuth Credentials"
        searchPlaceholder="Search..."
        searchTerm={searchTerm}
        setSearchTerm={(val) => setSearchTerm(val)}
        onMigrate={() =>
          handleMigrate(selectedUsers, oAuthCredData, migrateOAuthCreds)
        }
        disableMigrate={selectedUsers.length === 0}
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
                      filteredUsers.length > 0 &&
                      selectedUsers.length === filteredUsers.length
                    }
                    onChange={(e) =>
                      handleSelectAll(
                        filteredUsers.map((u) => u.Name),
                        e.target.checked
                      )
                    }
                  />
                </th>
                <TableSortable<OAuthCredItem>
                  columnKey="Name"
                  label="Name"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <TableSortable<OAuthCredItem>
                  columnKey="Description"
                  label="Description"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <TableSortable<OAuthCredItem>
                  columnKey="TokenServiceUrl"
                  label="Token Service URL"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <TableSortable<OAuthCredItem>
                  columnKey="ClientId"
                  label="Client ID"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                {isMigrated && <th className="py-2 px-3">Status</th>}
                {isMigrated && <th className="py-2 px-3">Progress</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-3">
                    No OAuth Credentials records found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.Name}>
                    <td className="py-2 px-3">
                      <Form.Check
                        type="checkbox"
                        checked={selectedUsers.includes(user.Name)}
                        onChange={(e) =>
                          handleSelect(user.Name, e.target.checked)
                        }
                      />
                    </td>
                    <td className="py-2 px-3">{user.Name || "—"}</td>
                    <td className="py-2 px-3">{user.Description || "—"}</td>
                    <td className="py-2 px-3">{user.TokenServiceUrl || "—"}</td>
                    <td className="py-2 px-3">{user.ClientId || "—"}</td>
                    {isMigrated && <StatusAndProgress {...user} />}
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

export default OAuthCredentials;
