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
import type { PublicCertsItem } from "../types";
import { useCommonTableState } from "../hooks/useCommonStates";
import TableSortable from "../components/common/TableSortable";
import ErrorState from "../components/common/ErrorState";
import PageHeader from "./PageHeader";
import StatusAndProgress from "./StatusAndProgress";

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
        setError("Failed to load Public Certificates data.");
      } finally {
        setLoading(false);
      }
    };

    loadPublicCertificates();
  }, []);

  if (loading) return <AppSpinner text="Loading Public Certificates..." />;
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
        title="Custom Public Certificates"
        searchPlaceholder="Search..."
        searchTerm={searchTerm}
        setSearchTerm={(val) => setSearchTerm(val)}
        onMigrate={() =>
          handleMigrate(
            selectedPublicCerts,
            publicCertsData,
            migratePublicCerts
          )
        }
        disableMigrate={selectedPublicCerts.length === 0}
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
                    {isMigrated && <StatusAndProgress {...Cert} />}
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
