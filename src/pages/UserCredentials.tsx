import { useEffect, useCallback } from "react";
import {
  fetchNumberRangesTaskStatus,
  fetchUserCredentials,
  migrateUserCreds,
} from "../api/auth";
import AppSpinner from "../components/common/AppSpinner";
import ProfileBanner from "./ProfileBanner";
import { Form } from "react-bootstrap";
import { useMigration } from "../hooks/useMigration";
import { useWebSocketManager } from "../hooks/useWebSocketManager";
import type { UserCredItem } from "../types";
import { useCommonTableState } from "../hooks/useCommonStates";
import TableSortable from "../components/common/TableSortable";
import ErrorState from "../components/common/ErrorState";
import PageHeader from "./PageHeader";
import StatusAndProgress from "./StatusAndProgress";

const UserCredentials: React.FC = () => {
  const {
    data: userCredData,
    setData: setUserCredData,
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
  } = useCommonTableState<UserCredItem>("Name");

  // ✅ Extract WebSocket handler and wrap it
  const { connectWebSocket: rawConnectWebSocket } =
    useWebSocketManager<UserCredItem>(
      setUserCredData,
      setFilteredUsers,
      fetchNumberRangesTaskStatus
    );

  const connectWebSocket = useCallback(
    (taskId: string) => rawConnectWebSocket(taskId),
    [rawConnectWebSocket]
  );

  // ✅ useMigration hook
  const { handleMigrate } = useMigration<UserCredItem, "Name">({
    moduleType: "user-credentials",
    setData: setUserCredData,
    setFilteredData: setFilteredUsers,
    connectWebSocket,
    setIsMigrated,
    matchKey: "Name",
  });

  useEffect(() => {
    const loadUserCreds = async () => {
      try {
        const response = await fetchUserCredentials();
        const data = response.data?.result || [];
        setUserCredData(data);
        setFilteredUsers(data);
      } catch (err) {
        setError("Failed to load User Credentials data.");
      } finally {
        setLoading(false);
      }
    };

    loadUserCreds();
  }, []);

  if (loading) return <AppSpinner text="Loading User Credentials..." />;
  // if (error) return <div className="text-danger">{error}</div>;
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
        title="User Credentials"
        searchPlaceholder="Search..."
        searchTerm={searchTerm}
        setSearchTerm={(val) => setSearchTerm(val)}
        onMigrate={() =>
          handleMigrate(selectedUsers, userCredData, migrateUserCreds)
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
                <TableSortable<UserCredItem>
                  columnKey="Name"
                  label="Name"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <TableSortable<UserCredItem>
                  columnKey="Kind"
                  label="Type"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <TableSortable<UserCredItem>
                  columnKey="Description"
                  label="Description"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <TableSortable<UserCredItem>
                  columnKey="User"
                  label="User"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <th className="py-2 px-3">Company Id</th>
                {isMigrated && <th className="py-2 px-3">Status</th>}
                {isMigrated && <th className="py-2 px-3">Progress</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-3">
                    No User records found.
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
                    <td className="py-2 px-3">{user.Kind || "—"}</td>
                    <td className="py-2 px-3">{user.Description || "—"}</td>
                    <td className="py-2 px-3">{user.User || "—"}</td>
                    <td className="py-2 px-3">{user.CompanyId || "—"}</td>
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

export default UserCredentials;
