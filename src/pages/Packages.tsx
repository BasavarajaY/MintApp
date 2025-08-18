import React, { useEffect, useCallback } from "react";
import {
  fetchPackages,
  fetchPackagesTaskStatus,
  migratePackages,
} from "../api/auth";
import { Form } from "react-bootstrap";
import AppSpinner from "../components/common/AppSpinner";
import ProfileBanner from "./ProfileBanner";
import { useMigration } from "../hooks/useMigration";
import type { PackageItem } from "../types";
import { useCommonTableState } from "../hooks/useCommonStates";
import { useWebSocketManager } from "../hooks/useWebSocketManager";
import ErrorState from "../components/common/ErrorState";
import PageHeader from "./PageHeader";
import StatusProgressBar from "../components/common/StatusProgressBar";
import TableSortable from "../components/common/TableSortable";

const Packages: React.FC = () => {
  const {
    data: packageData,
    setData: setPackageData,
    filteredData: filteredPackages,
    setFilteredData: setFilteredPackages,
    loading,
    setLoading,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    requestSort,
    sortConfig,
    selectedItems: selectedPackages,
    handleSelect,
    handleSelectAll,
    isMigrated,
    setIsMigrated,
  } = useCommonTableState<PackageItem>("Id");

  const { connectWebSocket: rawConnectWebSocket } =
    useWebSocketManager<PackageItem>(
      setPackageData,
      setFilteredPackages,
      fetchPackagesTaskStatus
    );

  const connectWebSocket = useCallback(
    (taskId: string) => rawConnectWebSocket(taskId),
    [rawConnectWebSocket]
  );

  const { handleMigrate } = useMigration<PackageItem, "Id">({
    moduleType: "prepackaged-content",
    setData: setPackageData,
    setFilteredData: setFilteredPackages,
    connectWebSocket,
    setIsMigrated,
    matchKey: "Id",
  });

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const response = await fetchPackages();
        const data = response.data.results || [];
        setPackageData(data);
        setFilteredPackages(data);
      } catch (err: any) {
        setError("Failed to load package data.");
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, []);

  if (loading) return <AppSpinner text="Loading Packages..." />;
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
        title="Packages"
        searchPlaceholder="Search..."
        searchTerm={searchTerm}
        setSearchTerm={(val) => setSearchTerm(val)}
        onMigrate={() =>
          handleMigrate(selectedPackages, packageData, migratePackages)
        }
        disableMigrate={selectedPackages.length === 0}
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
                      filteredPackages.length > 0 &&
                      selectedPackages.length === filteredPackages.length
                    }
                    onChange={(e) =>
                      handleSelectAll(
                        filteredPackages.map((u) => u.Id),
                        e.target.checked
                      )
                    }
                  />
                </th>
                <TableSortable<PackageItem>
                  columnKey="Name"
                  label="Name"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <th>Version</th>
                {isMigrated && <th>Status</th>}
                {isMigrated && <th>Progress</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-3">
                    No Packages records found.
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg) => (
                  <tr key={pkg.Id}>
                    <td className="py-2 px-3">
                      <Form.Check
                        type="checkbox"
                        checked={selectedPackages.includes(pkg.Id)}
                        onChange={(e) => handleSelect(pkg.Id, e.target.checked)}
                      />
                    </td>
                    <td className="py-1 px-3">{pkg.Name || "—"}</td>
                    <td className="py-2 px-3">{pkg.Version || "—"}</td>
                    {isMigrated && (
                      <>
                        <td className="py-2 px-3 text-capitalize">
                          {pkg.process_status ? (
                            <span
                              className={`badge ${
                                pkg.process_status === "success"
                                  ? "bg-success"
                                  : pkg.process_status === "pending"
                                  ? "bg-warning text-dark"
                                  : pkg.process_status === "failed"
                                  ? "bg-danger"
                                  : "bg-secondary"
                              }`}
                            >
                              {pkg.process_status.replace(/_/g, " ")}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div style={{ marginTop: "6px" }}>
                            <StatusProgressBar
                              percentage={pkg.progress_percentage}
                              status={pkg.process_status}
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

export default Packages;
