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
import StatusProgressBar from "../components/common/StatusProgressBar";
import type { OAuthCredItem } from "../types";
import { useCommonTableState } from "../hooks/useCommonStates";
import TableSortable from "../components/common/TableSortable";

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
    setSelectedItems: setSelectedUsers,
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
        console.error("Error fetching OAuth Credentials:", err);
        setError("Failed to load OAuth Credentials data.");
      } finally {
        setLoading(false);
      }
    };

    loadOAuthCreds();
  }, []);

  useEffect(() => {
    let filtered = oAuthCredData.filter((v) =>
      v.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply sorting if active
    if (sortConfig) {
      const key: keyof OAuthCredItem = sortConfig.key;
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

    setFilteredUsers(filtered);

    // Keep only selected users still in the filtered list
    setSelectedUsers((prevSelected) =>
      prevSelected.filter((name) => filtered.some((item) => item.Name === name))
    );
  }, [searchTerm, oAuthCredData, sortConfig]);

  if (loading) return <AppSpinner />;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0" style={{ color: "#003DA5" }}>
          User Credentials
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
              handleMigrate(selectedUsers, oAuthCredData, migrateOAuthCreds);
            }}
            disabled={selectedUsers.length === 0}
            data-bs-toggle="tooltip"
            title="Migrate selected OAuth Credentials"
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
                    <td className="py-2 px-3">{user.Description || "—"}</td>
                    <td className="py-2 px-3">{user.TokenServiceUrl || "—"}</td>
                    <td className="py-2 px-3">{user.ClientId || "—"}</td>
                    {isMigrated && (
                      <>
                        <td className="py-2 px-3 text-capitalize">
                          {user.process_status ? (
                            <span
                              className={`badge ${
                                user.process_status === "success"
                                  ? "bg-success"
                                  : user.process_status === "pending"
                                  ? "bg-warning text-dark"
                                  : user.process_status === "failed"
                                  ? "bg-danger"
                                  : "bg-secondary"
                              }`}
                            >
                              {user.process_status.replace(/_/g, " ")}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div style={{ marginTop: "6px" }}>
                            <StatusProgressBar
                              percentage={user.progress_percentage}
                              status={user.process_status}
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

export default OAuthCredentials;
