import { useEffect, useCallback } from "react";
import {
  fetchPublicCerts,
  fetchPublicCertsTaskStatus,
  migratePublicCerts,
} from "../api/auth";
import AppSpinner from "../components/common/AppSpinner";
import ProfileBanner from "./ProfileBanner";
import { Form } from "react-bootstrap";
import { useMigration } from "../hooks/useMigration";
import { useWebSocketManager } from "../hooks/useWebSocketManager";
import StatusProgressBar from "../components/common/StatusProgressBar";
import type { PublicCertsItem } from "../types";
import { useCommonTableState } from "../hooks/useCommonStates";
import TableSortable from "../components/common/TableSortable";

const PublicCertificates: React.FC = () => {
  const {
    data: publicCertsData,
    setData: setPublicCertsData,
    filteredData: filteredPublicCerts,
    setFilteredData: setFilteredPublicCerts,
    loading,
    setLoading,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    requestSort,
    sortConfig,
    selectedItems: selectedPublicCerts,
    setSelectedItems: setSelectedPublicCerts,
    handleSelect,
    handleSelectAll,
    isMigrated,
    setIsMigrated,
  } = useCommonTableState<PublicCertsItem>("Alias");

  // ✅ Extract WebSocket handler and wrap it
  const { connectWebSocket: rawConnectWebSocket } =
    useWebSocketManager<PublicCertsItem>(
      setPublicCertsData,
      setFilteredPublicCerts,
      fetchPublicCertsTaskStatus
    );

  const connectWebSocket = useCallback(
    (taskId: string) => rawConnectWebSocket(taskId),
    [rawConnectWebSocket]
  );

  // ✅ useMigration hook
  const { handleMigrate } = useMigration<PublicCertsItem, "Alias">({
    moduleType: "custom-public-certificates",
    setData: setPublicCertsData,
    setFilteredData: setFilteredPublicCerts,
    connectWebSocket,
    setIsMigrated,
    matchKey: "Alias",
  });

  useEffect(() => {
    const loadPublicCertificates = async () => {
      try {
        const response = await fetchPublicCerts();
        const data = response.data?.results || [];
        setPublicCertsData(data);
        setFilteredPublicCerts(data);
      } catch (err) {
        console.error("Error fetching Public Certificates:", err);
        setError("Failed to load Public Certificates data.");
      } finally {
        setLoading(false);
      }
    };

    loadPublicCertificates();
  }, []);

  useEffect(() => {
    let filtered = publicCertsData.filter((v) =>
      v.Alias.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig) {
      const key: keyof PublicCertsItem = sortConfig.key;
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

    setFilteredPublicCerts(filtered);

    setSelectedPublicCerts((prevSelected) =>
      prevSelected.filter((name) =>
        filtered.some((item) => item.Alias === name)
      )
    );
  }, [searchTerm, publicCertsData, sortConfig]);

  if (loading) return <AppSpinner text="Loading Public Certificates..." />;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0" style={{ color: "#003DA5" }}>
          Custom Public Certificates
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
              handleMigrate(
                selectedPublicCerts,
                publicCertsData,
                migratePublicCerts
              );
            }}
            disabled={selectedPublicCerts.length === 0}
            data-bs-toggle="tooltip"
            title="Migrate selected Public Certificates"
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
                      filteredPublicCerts.length > 0 &&
                      selectedPublicCerts.length === filteredPublicCerts.length
                    }
                    onChange={(e) =>
                      handleSelectAll(
                        filteredPublicCerts.map((u) => u.Alias),
                        e.target.checked
                      )
                    }
                  />
                </th>
                <TableSortable<PublicCertsItem>
                  columnKey="Alias"
                  label="Alias"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
                <th className="py-2 px-3">Hexalias</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Owner</th>
                {isMigrated && <th className="py-2 px-3">Status</th>}
                {isMigrated && <th className="py-2 px-3">Progress</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPublicCerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-3">
                    No Public Certificates records found.
                  </td>
                </tr>
              ) : (
                filteredPublicCerts.map((Cert) => (
                  <tr key={Cert.Alias}>
                    <td className="py-2 px-3">
                      <Form.Check
                        type="checkbox"
                        checked={selectedPublicCerts.includes(Cert.Alias)}
                        onChange={(e) =>
                          handleSelect(Cert.Alias, e.target.checked)
                        }
                      />
                    </td>
                    <td className="py-2 px-3">{Cert.Hexalias || "—"}</td>
                    <td className="py-2 px-3">{Cert.Type || "—"}</td>
                    <td className="py-2 px-3">{Cert.Owner || "—"}</td>
                    {isMigrated && (
                      <>
                        <td className="py-2 px-3 text-capitalize">
                          {Cert.process_status ? (
                            <span
                              className={`badge ${
                                Cert.process_status === "success"
                                  ? "bg-success"
                                  : Cert.process_status === "pending"
                                  ? "bg-warning text-dark"
                                  : Cert.process_status === "failed"
                                  ? "bg-danger"
                                  : "bg-secondary"
                              }`}
                            >
                              {Cert.process_status.replace(/_/g, " ")}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div style={{ marginTop: "6px" }}>
                            <StatusProgressBar
                              percentage={Cert.progress_percentage}
                              status={Cert.process_status}
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

export default PublicCertificates;
