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
import StatusProgressBar from "../components/common/StatusProgressBar";
import type { UserCredItem } from "../types";
import { useCommonTableState } from "../hooks/useCommonStates";
import TableSortable from "../components/common/TableSortable";

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
    setSelectedItems: setSelectedUsers,
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
        console.error("Error fetching User Credentials:", err);
        setError("Failed to load User Credentials data.");
      } finally {
        setLoading(false);
      }
    };

    loadUserCreds();
  }, []);

  useEffect(() => {
    let filtered = userCredData.filter((v) =>
      v.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply sorting if active
    if (sortConfig) {
      const key: keyof UserCredItem = sortConfig.key;
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
  }, [searchTerm, userCredData, sortConfig]);

  // // Handle sort request
  // const requestSort = (key: keyof UserCredItem) => {
  //   let direction: "asc" | "desc" = "asc";
  //   if (
  //     sortConfig &&
  //     sortConfig.key === key &&
  //     sortConfig.direction === "asc"
  //   ) {
  //     direction = "desc";
  //   }
  //   setSortConfig({ key, direction });
  // };

  // // Sort arrow indicator
  // const getSortArrow = (key: keyof UserCredItem) => {
  //   if (sortConfig?.key === key) {
  //     return (
  //       <span style={{ color: "#003DA5" }}>
  //         {sortConfig.direction === "asc" ? " ▲" : " ▼"}
  //       </span>
  //     );
  //   }
  //   return <span style={{ color: "#003DA5", opacity: 0.3 }}>▲</span>; // Light faded arrow for inactive columns
  // };

  if (loading) return <AppSpinner text="Loading User Credentials..." />;
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
              handleMigrate(selectedUsers, userCredData, migrateUserCreds);
            }}
            disabled={selectedUsers.length === 0}
            data-bs-toggle="tooltip"
            title="Migrate selected users"
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
                {/* <th
                  onClick={() => requestSort("Name")}
                  style={{ cursor: "pointer" }}
                >
                  Name{" "}
                  <span style={{ color: "#003DA5" }}>
                    {sortConfig?.key === "Name"
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : "▲"}{" "}
                  </span>
                </th> */}
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

export default UserCredentials;
