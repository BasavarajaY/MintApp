import { useEffect, useState } from "react";
import {
  fetchUserCredentials,
  fetchUserCredTaskStatus,
  migrateUserCreds,
} from "../api/auth";
import AppSpinner from "../components/common/AppSpinner";
import ProfileBanner from "./ProfileBanner";
import { Form } from "react-bootstrap";
import toast from "react-hot-toast";
import type { UserCredItem } from "../types";
import StatusProgressBar from "../components/common/StatusProgressBar";
import { useMigration } from "../hooks/useMigration";
import { useWebSocketManager } from "../hooks/useWebSocketManager";

// interface UserCredItem {
//   Name: string;
//   Kind: string;
//   Description: string;
//   User: string;
//   Password: string;
//   CompanyId: string;
//   task_id?: string;
//   process_status?: string;
//   progress_percentage?: number;
// }

const UserCredentials: React.FC = () => {
  const [userCredData, setUserCredData] = useState<UserCredItem[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserCredItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isMigrated, setIsMigrated] = useState<boolean>(false);

  useEffect(() => {
    loadUserCreds();
  }, []);
  const activeSockets = new Map<string, WebSocket>(); // task_id => WebSocket
  const loadUserCreds = async () => {
    try {
      const response = await fetchUserCredentials();
      const data = response.data?.result || [];
      setUserCredData(data);
      setFilteredUsers(data);
    } catch (err: any) {
      console.error("Error fetching User Credentials:", err);
      setError("Failed to load User Credentials data.");
    } finally {
      setLoading(false);
    }
  };
  // Handle search filtering
  useEffect(() => {
    const filtered = userCredData.filter((v) =>
      v.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
    setSelectedUsers([]); // Clear selections on search
  }, [searchTerm, userCredData]);
  // Checkbox handlers
  const handleSelect = (userName: string, checked: boolean) => {
    setSelectedUsers((prev) =>
      checked ? [...prev, userName] : prev.filter((v) => v !== userName)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allUsers = filteredUsers.map((v) => v.Name);
      setSelectedUsers(allUsers);
    } else {
      setSelectedUsers([]);
    }
  };
  //   const handleMigrate = async () => {
  //     if (selectedUsers.length === 0) {
  //       toast("Please select users to migrate");
  //       return;
  //     }

  //     try {
  //       // Step 1: Find full user objects based on selected names
  //       const selectedObjects = userCredData.filter((user) =>
  //         selectedUsers.includes(user.Name)
  //       );

  //       // Step 2: Prepare payload
  //       const aData = selectedObjects.map((user) => ({
  //         Name: user.Name,
  //         Kind: user.Kind,
  //         Description: user.Description,
  //         User: user.User,
  //         Password: user.Password,
  //         CompanyId: user.CompanyId,
  //       }));

  //       const payload = {
  //         module_type: "user-credentials", // ✅ Correct module type
  //         data: aData,
  //         created_by: 1,
  //       };

  //       // Step 3: API call
  //       const migrateResponse = await migrateUserCreds(payload);
  //       const taskId = migrateResponse.data?.task_id;

  //       toast.success(
  //         `${selectedUsers.length} user credential(s) migrated. Listening for updates...`
  //       );

  //       if (taskId) {
  //         toast.success("Task submitted. Migration started.");
  //         setIsMigrated(true);

  //         const tagTaskId = (list: UserCredItem[]) =>
  //           list.map((v) =>
  //             selectedUsers.includes(v.Name)
  //               ? {
  //                   ...v,
  //                   task_id: taskId,
  //                   process_status: "pending",
  //                   progress_percentage: 0,
  //                 }
  //               : v
  //           );

  //         setUserCredData((prev) => tagTaskId(prev));
  //         setFilteredUsers((prev) => tagTaskId(prev));

  //         // Optional: Enable WebSocket here
  //         connectWebSocket(taskId);
  //       }
  //     } catch (error) {
  //       console.error("Migration error:", error);
  //       toast.error("Migration failed");
  //     }
  //   };
  //   const connectWebSocket = (taskId: string) => {
  //     const webSocketURL =
  //       "wss://mint-fastapi-app.cfapps.eu10-004.hana.ondemand.com/api/web/websocket/updates";
  //     const wsUrl = `${webSocketURL}`;

  //     if (activeSockets.has(taskId)) return; // Already connected

  //     const ws = new WebSocket(wsUrl);
  //     activeSockets.set(taskId, ws);

  //     ws.onopen = async () => {
  //       console.log(`✅ WebSocket connected for task ${taskId}`);

  //       // ✅ Fetch initial status when connected
  //       try {
  //         const response = await fetchUserCredTaskStatus(taskId);

  //         // Assume response.data is an array of results
  //         const resultList = response.data.flat() as {
  //           task_id: string;
  //           process_status: string;
  //           progress_percentage: number;
  //           success_message?: string;
  //           error_message?: string;
  //           process_key?: string;
  //         }[];

  //         // Step 1: Update progress & status for each task_id
  //         const updateStatus = (list: UserCredItem[]) =>
  //           list.map((v) => {
  //             const result = resultList.find((r) => r.task_id === v.task_id);
  //             if (result) {
  //               return {
  //                 ...v,
  //                 process_status: result.process_status,
  //                 progress_percentage: result.progress_percentage,
  //               };
  //             }
  //             return v;
  //           });

  //         setUserCredData((prev) => updateStatus(prev));
  //         setFilteredUsers((prev) => updateStatus(prev));
  //       } catch (err) {
  //         console.error("Error fetching initial task status:", err);
  //       }
  //     };

  //     ws.onmessage = async (event) => {
  //       try {
  //         const data = JSON.parse(event.data); // { task_id, process_status, progress_percentage }

  //         const updateStatus = (list: UserCredItem[]) =>
  //           list.map((v) =>
  //             v.task_id === data.task_id
  //               ? {
  //                   ...v,
  //                   process_status: data.process_status,
  //                   progress_percentage: data.progress_percentage,
  //                 }
  //               : v
  //           );

  //         setUserCredData((prev) => updateStatus(prev));
  //         setFilteredUsers((prev) => updateStatus(prev));

  //         // If task has completed
  //         if (
  //           data.process_status === "success" ||
  //           data.process_status === "failed"
  //         ) {
  //           // ✅ Close WebSocket for that task
  //           ws.close();
  //           activeSockets.delete(taskId);

  //           // ✅ Fetch final result for that task
  //           const result = await fetchUserCredTaskStatus(taskId);
  //           const flattened = result.data.flat(); // assuming array of arrays

  //           const taskResult = flattened.find(
  //             (r: any) => r.task_id === data.task_id
  //           );
  //           if (taskResult) {
  //             if (taskResult.success_message) {
  //               toast.success(`✅ ${taskResult.success_message}`);
  //             }
  //             if (taskResult.error_message) {
  //               toast.error(`❌ ${taskResult.error_message}`);
  //             }
  //           }
  //         }
  //       } catch (err) {
  //         console.error("Error parsing WebSocket message:", err);
  //       }
  //     };

  //     ws.onclose = () => {
  //       console.log(`🛑 WebSocket closed for task ${taskId}`);
  //       activeSockets.delete(taskId);
  //     };

  //     ws.onerror = (err) => {
  //       console.error(`❌ WebSocket error for task ${taskId}`, err);

  //       setTimeout(() => {
  //         if (!activeSockets.has(taskId)) {
  //           console.log(`🔁 Reconnecting WebSocket for task ${taskId}`);
  //           connectWebSocket(taskId);
  //         }
  //       }, 3000);
  //     };
  //   };
  const connectWebSocket = useWebSocketManager(
    setUserCredData,
    setFilteredUsers
  );
  const { handleMigrate } = useMigration<UserCredItem>({
    moduleType: "user-credentials",
    setData: setUserCredData,
    setFilteredData: setFilteredUsers,
    // connectWebSocket,
  });

  //   handleMigrate(selectedUsers, userCredData, migrateUserCreds);

  if (loading) return <AppSpinner />;
  if (error) return <div className="text-danger">{error}</div>;
  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0" style={{ color: "#003DA5" }}>
          User Credintials
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
            onClick={() =>
              handleMigrate(selectedUsers, userCredData, migrateUserCreds)
            }
            disabled={selectedUsers.length === 0}
            data-bs-toggle="tooltip"
            title="Migrate selected users"
          >
            <i className="bi bi-cloud-upload me-1"></i>
          </button>
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
                      filteredUsers.length > 0 &&
                      selectedUsers.length === filteredUsers.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Description</th>
                <th className="py-2 px-3">User</th>
                <th className="py-2 px-3">Company Id</th>
                {isMigrated && <th className="py-2 px-3">Status</th>}
                {isMigrated && <th className="py-2 px-3">Progress</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-3">
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
                    )}

                    {isMigrated && (
                      <td className="py-2 px-3">
                        <div style={{ marginTop: "6px" }}>
                          <StatusProgressBar
                            percentage={user.progress_percentage}
                            status={user.process_status}
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
export default UserCredentials;
