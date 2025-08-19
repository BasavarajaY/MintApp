import { useEffect, useCallback } from "react";
import {
  fetchCustomContent,
  fetchCustomContentTaskStatus,
  migrateCustomContent,
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
import type { CustomContentItem } from "../types";
import StatusAndProgress from "./StatusAndProgress";

const CustomContent: React.FC = () => {
  const {
    data: customContentData,
    setData: setCustomContentData,
    filteredData: filteredCustomContent,
    setFilteredData: setFilteredCustomContent,
    loading,
    setLoading,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    requestSort,
    sortConfig,
    selectedItems: selectedCustomContent,
    handleSelect,
    handleSelectAll,
    isMigrated,
    setIsMigrated,
    formatDate,
  } = useCommonTableState<CustomContentItem>("Name");

  // ✅ Extract WebSocket handler and wrap it
  const { connectWebSocket: rawConnectWebSocket } =
    useWebSocketManager<CustomContentItem>(
      setCustomContentData,
      setFilteredCustomContent,
      fetchCustomContentTaskStatus
    );

  const connectWebSocket = useCallback(
    (taskId: string) => rawConnectWebSocket(taskId),
    [rawConnectWebSocket]
  );

  // ✅ useMigration hook
  const { handleMigrate } = useMigration<CustomContentItem, "Name">({
    moduleType: "custom-content",
    setData: setCustomContentData,
    setFilteredData: setFilteredCustomContent,
    connectWebSocket,
    setIsMigrated,
    matchKey: "Name",
  });

  useEffect(() => {
    const loadAccessPols = async () => {
      try {
        const response = await fetchCustomContent();
        const data = response.data?.results || [];
        setCustomContentData(data);
        setFilteredCustomContent(data);
      } catch (err) {
        setError("Failed to load Custom Content data.");
      } finally {
        setLoading(false);
      }
    };

    loadAccessPols();
  }, []);

  if (loading) return <AppSpinner text="Loading Custom Content..." />;
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
        title="Custom Content"
        searchPlaceholder="Search..."
        searchTerm={searchTerm}
        setSearchTerm={(val) => setSearchTerm(val)}
        onMigrate={() =>
          handleMigrate(
            selectedCustomContent,
            customContentData,
            migrateCustomContent
          )
        }
        disableMigrate={selectedCustomContent.length === 0}
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
                      filteredCustomContent.length > 0 &&
                      selectedCustomContent.length ===
                        filteredCustomContent.length
                    }
                    onChange={(e) =>
                      handleSelectAll(
                        filteredCustomContent.map((u) => u.Name),
                        e.target.checked
                      )
                    }
                  />
                </th>
                <TableSortable<CustomContentItem>
                  columnKey="Name"
                  label="Name"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <th className="py-2 px-3">Description</th>
                <th className="py-2 px-3">Supported Platform</th>
                <th className="py-2 px-3">Modified By</th>
                <th className="py-2 px-3">Creation Date</th>
                {/* <th className="py-2 px-3">Modified Date</th> */}
                {isMigrated && <th className="py-2 px-3">Status</th>}
                {isMigrated && <th className="py-2 px-3">Progress</th>}
              </tr>
            </thead>
            <tbody>
              {filteredCustomContent.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-3">
                    No Custom Content records found.
                  </td>
                </tr>
              ) : (
                filteredCustomContent.map((content) => (
                  <tr key={content.Name}>
                    <td className="py-2 px-3">
                      <Form.Check
                        type="checkbox"
                        checked={selectedCustomContent.includes(content.Name)}
                        onChange={(e) =>
                          handleSelect(content.Name, e.target.checked)
                        }
                      />
                    </td>
                    <td className="py-2 px-3 text-break">
                      {content.Name || "—"}
                    </td>
                    <td className="py-2 px-3 text-break">
                      {content.ShortText || "—"}
                    </td>
                    <td className="py-2 px-3">
                      {content.SupportedPlatform || "—"}
                    </td>
                    <td className="py-2 px-3">{content.ModifiedBy || "—"}</td>
                    <td className="py-2 px-3">
                      {formatDate(content.CreationDate) || "—"}
                    </td>
                    {/* <td className="py-2 px-3">
                      {formatDate(content.ModifiedDate) || "—"}
                    </td> */}

                    {isMigrated && <StatusAndProgress {...content} />}
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

export default CustomContent;
