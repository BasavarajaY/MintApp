import { useEffect, useCallback } from "react";
import {
  fetchNumberRanges,
  fetchNumberRangesTaskStatus,
  migrateNumberRanges,
} from "../api/auth";
import AppSpinner from "../components/common/AppSpinner";
import ProfileBanner from "./ProfileBanner";
import { Form } from "react-bootstrap";
import { useMigration } from "../hooks/useMigration";
import { useWebSocketManager } from "../hooks/useWebSocketManager";
import StatusProgressBar from "../components/common/StatusProgressBar";
import type { NumberRangesItem } from "../types";
import { useCommonTableState } from "../hooks/useCommonStates";
import TableSortable from "../components/common/TableSortable";
import ErrorState from "../components/common/ErrorState";
import PageHeader from "./PageHeader";

const NumberRanges: React.FC = () => {
  const {
    data: numberRangesData,
    setData: setNumberRangesData,
    filteredData: filteredNumbers,
    setFilteredData: setFilteredNumbers,
    loading,
    setLoading,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    requestSort,
    sortConfig,
    selectedItems: selectedNumbers,
    handleSelect,
    handleSelectAll,
    isMigrated,
    setIsMigrated,
  } = useCommonTableState<NumberRangesItem>("Name");

  // ✅ Extract WebSocket handler and wrap it
  const { connectWebSocket: rawConnectWebSocket } =
    useWebSocketManager<NumberRangesItem>(
      setNumberRangesData,
      setFilteredNumbers,
      fetchNumberRangesTaskStatus
    );

  const connectWebSocket = useCallback(
    (taskId: string) => rawConnectWebSocket(taskId),
    [rawConnectWebSocket]
  );

  // ✅ useMigration hook
  const { handleMigrate } = useMigration<NumberRangesItem, "Name">({
    moduleType: "number-ranges",
    setData: setNumberRangesData,
    setFilteredData: setFilteredNumbers,
    connectWebSocket,
    setIsMigrated,
    matchKey: "Name",
  });

  useEffect(() => {
    const loadOAuthCreds = async () => {
      try {
        const response = await fetchNumberRanges();
        const data = response.data?.results || [];
        console.log(data);
        setNumberRangesData(data);
        setFilteredNumbers(data);
      } catch (err) {
        setError("Failed to load OAuth Credentials data.");
      } finally {
        setLoading(false);
      }
    };

    loadOAuthCreds();
  }, []);

  if (loading) return <AppSpinner text="Loading Number Ranges..." />;
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
        title="Number Ranges"
        searchPlaceholder="Search..."
        searchTerm={searchTerm}
        setSearchTerm={(val) => setSearchTerm(val)}
        onMigrate={() =>
          handleMigrate(selectedNumbers, numberRangesData, migrateNumberRanges)
        }
        disableMigrate={selectedNumbers.length === 0}
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
                      filteredNumbers.length > 0 &&
                      selectedNumbers.length === filteredNumbers.length
                    }
                    onChange={(e) =>
                      handleSelectAll(
                        filteredNumbers.map((u) => u.Name),
                        e.target.checked
                      )
                    }
                  />
                </th>
                <TableSortable<NumberRangesItem>
                  columnKey="Name"
                  label="Name"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <th>Description</th>
                <TableSortable<NumberRangesItem>
                  columnKey="MinValue"
                  label="Min. Value"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <TableSortable<NumberRangesItem>
                  columnKey="MaxValue"
                  label="Max. Value"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <TableSortable<NumberRangesItem>
                  columnKey="Rotate"
                  label="Rotate"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <th>Current Value</th>
                <th>DeployedBy</th>

                {isMigrated && <th className="py-2 px-3">Status</th>}
                {isMigrated && <th className="py-2 px-3">Progress</th>}
              </tr>
            </thead>
            <tbody>
              {filteredNumbers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-3">
                    No Number Ranges records found.
                  </td>
                </tr>
              ) : (
                filteredNumbers.map((number) => (
                  <tr key={number.Name}>
                    <td className="py-2 px-3">
                      <Form.Check
                        type="checkbox"
                        checked={selectedNumbers.includes(number.Name)}
                        onChange={(e) =>
                          handleSelect(number.Name, e.target.checked)
                        }
                      />
                    </td>
                    <td className="py-2 px-3">{number.Name || "—"}</td>
                    <td className="py-2 px-3">{number.Description || "—"}</td>
                    <td className="py-2 px-3">{number.MinValue || "—"}</td>
                    <td className="py-2 px-3">{number.MaxValue || "—"}</td>
                    <td className="py-2 px-3">{number.Rotate || "—"}</td>
                    <td className="py-2 px-3">{number.CurrentValue || "—"}</td>
                    <td className="py-2 px-3">{number.DeployedBy || "—"}</td>
                    {isMigrated && (
                      <>
                        <td className="py-2 px-3 text-capitalize">
                          {number.process_status ? (
                            <span
                              className={`badge ${
                                number.process_status === "success"
                                  ? "bg-success"
                                  : number.process_status === "pending"
                                  ? "bg-warning text-dark"
                                  : number.process_status === "failed"
                                  ? "bg-danger"
                                  : "bg-secondary"
                              }`}
                            >
                              {number.process_status.replace(/_/g, " ")}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div style={{ marginTop: "6px" }}>
                            <StatusProgressBar
                              percentage={number.progress_percentage}
                              status={number.process_status}
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

export default NumberRanges;
