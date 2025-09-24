import { useEffect, useCallback } from "react";
import {
  fetchCustomTags,
  fetchCustomTagsTaskStatus,
  migrateCustomTags,
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
import type { CustomTagsItem } from "../types";

const CustomTags: React.FC = () => {
  const {
    data: CustomTagsData,
    setData: setCustomTagsData,
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
  } = useCommonTableState<CustomTagsItem>("tagName");

  // ✅ Extract WebSocket handler and wrap it
  const { connectWebSocket: rawConnectWebSocket } =
    useWebSocketManager<CustomTagsItem>(
      setCustomTagsData,
      setFilteredVals,
      fetchCustomTagsTaskStatus
    );

  const connectWebSocket = useCallback(
    (taskId: string) => rawConnectWebSocket(taskId),
    [rawConnectWebSocket]
  );

  // ✅ useMigration hook
  const { handleMigrate } = useMigration<CustomTagsItem, "tagName">({
    moduleType: "custom-tags",
    setData: setCustomTagsData,
    setFilteredData: setFilteredVals,
    connectWebSocket,
    setIsMigrated,
    matchKey: "tagName",
  });

  useEffect(() => {
    const loadOAuthCreds = async () => {
      try {
        const response = await fetchCustomTags();
        const data = response.data?.results || [];
        console.log(data);
        setCustomTagsData(data);
        setFilteredVals(data);
      } catch (err) {
        setError("Failed to load Custom Tags data.");
      } finally {
        setLoading(false);
      }
    };

    loadOAuthCreds();
  }, []);

  if (loading) return <AppSpinner text="Loading Custom Tags..." />;
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
        title="Custom Tags"
        searchPlaceholder="Search..."
        searchTerm={searchTerm}
        setSearchTerm={(val) => setSearchTerm(val)}
        onMigrate={() =>
          handleMigrate(selectedVals, CustomTagsData, migrateCustomTags)
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
                        filteredVals.map((u) => u.tagName),
                        e.target.checked
                      )
                    }
                  />
                </th>
                <TableSortable<CustomTagsItem>
                  columnKey="tagName"
                  label="Tag Name"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <th>Permitted Values</th>
                <th>Mandatory</th>
                {isMigrated && <th className="py-2 px-3">Status</th>}
                {isMigrated && <th className="py-2 px-3">Progress</th>}
              </tr>
            </thead>
            <tbody>
              {filteredVals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-3">
                    No Custom Tags records found.
                  </td>
                </tr>
              ) : (
                filteredVals.map((filteredVal) => (
                  <tr key={filteredVal.tagName}>
                    <td className="py-2 px-3">
                      <Form.Check
                        type="checkbox"
                        checked={selectedVals.includes(filteredVal.tagName)}
                        onChange={(e) =>
                          handleSelect(filteredVal.tagName, e.target.checked)
                        }
                      />
                    </td>
                    <td className="py-2 px-3">{filteredVal.tagName || "—"}</td>
                    <td className="py-2 px-3">
                      {filteredVal.permittedValues || "—"}
                    </td>
                    <td className="py-2 px-3">
                      {filteredVal.isMandatory || "—"}
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

export default CustomTags;
