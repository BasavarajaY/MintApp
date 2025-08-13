import React, { useEffect, useState, useCallback } from "react";
import { fetchPackages, migratePackages } from "../api/auth";
import { Card, Collapse, Form, Button } from "react-bootstrap";
import AppSpinner from "../components/common/AppSpinner";
import PackageDetails from "./PackageDetails";
import ProfileBanner from "./ProfileBanner";
import { useMigration } from "../hooks/useMigration";
import type { PackageItem } from "../types";
import { useCommonTableState } from "../hooks/useCommonStates";
import { useWebSocketManager } from "../hooks/useWebSocketManager";

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
    selectedItems: selectedPackages,
    setSelectedItems: setSelectedPackages,
    handleSelect,
    handleSelectAll,
    setIsMigrated,
  } = useCommonTableState<PackageItem>("Name");

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(
    null
  );

  // ✅ Extract WebSocket handler and wrap it
  const { connectWebSocket: rawConnectWebSocket } =
    useWebSocketManager<PackageItem>(
      setPackageData,
      setFilteredPackages,
      fetchPackages
    );

  const connectWebSocket = useCallback(
    (taskId: string) => rawConnectWebSocket(taskId),
    [rawConnectWebSocket]
  );

  // ✅ useMigration hook
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
        console.error("Error fetching packages:", err);
        setError("Failed to load package data.");
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, []);

  // 🔍 Search filter logic
  useEffect(() => {
    const filtered = packageData.filter((v) =>
      v.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPackages(filtered);
    setSelectedPackages([]);
  }, [searchTerm, packageData]);

  const handleToggle = (index: number, pkg: PackageItem) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
    setExpandedPackageId((prev) => (prev === pkg.Id ? null : pkg.Id));
  };

  const handleMigration = async () => {
    await handleMigrate(selectedPackages, packageData, migratePackages);
    setIsMigrated(true);
  };
  const getPackageDetails = async (): Promise<any[]> => {
    // const res = await fetchPackageDetails(packageId);
    // return res.data.results;
    const data = [
      {
        id: 1,
        title: "Pipeline Generic - Script Collection",
        description: "Type: Script Collection",
      },
      {
        id: 2,
        title: "Pipeline Generic Step04 - Receiver Determination",
        description: "Type: IFlow",
      },
      {
        id: 3,
        title:
          "Pipeline Template Step07 - Outbound Processing One-to-Many with One Message Type",
        description: "Type: IFlow",
      },
      {
        id: 4,
        title: "Pipeline Template Step01 - Inbound Processing At Least Once",
        description: "Type: IFlow",
      },
      {
        id: 5,
        title: "MessageMapping",
        description: "Type: Message Mapping",
      },
    ];
    return data;
  };

  if (loading) return <AppSpinner />;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div style={{ width: "100vw", padding: "24px", boxSizing: "border-box" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0" style={{ color: "#003DA5" }}>
          Packages
        </h4>
        <div className="d-flex gap-2 align-items-center">
          <Form.Control
            type="text"
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "300px", fontSize: "16px" }}
          />
          <Button
            variant="outline-success"
            onClick={handleMigration}
            disabled={selectedPackages.length === 0}
            title="Migrate selected packages"
          >
            <i className="bi bi-cloud-upload me-1" />
            Migrate
          </Button>
        </div>
      </div>

      <ProfileBanner />

      {filteredPackages.length === 0 ? (
        <p className="text-muted">No matching packages found.</p>
      ) : (
        <Card className="mb-2 p-2">
          <Form.Check
            type="checkbox"
            className="mb-2"
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
            label="Select All"
          />
          {filteredPackages.map((pkg, index) => (
            <Card
              key={pkg.Id}
              className="mb-2"
              style={{
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                color: "#003DA5",
                width: "100%",
              }}
            >
              <Card.Header
                className="d-flex justify-content-between align-items-center"
                onClick={() => handleToggle(index, pkg)}
                style={{ cursor: "pointer" }}
              >
                <div>
                  <Form.Check
                    type="checkbox"
                    checked={selectedPackages.includes(pkg.Id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleSelect(pkg.Id, e.target.checked)}
                    className="me-2 d-inline-block bg-light"
                  />
                  <strong>{pkg.Name}</strong> (v{pkg.Version})
                </div>
                <span>{expandedIndex === index ? "▲" : "▼"}</span>
                {/* <i
                  className={`bi ${
                    expandedIndex === index
                      ? "bi-chevron-up"
                      : "bi-chevron-down"
                  }`}
                ></i> */}
              </Card.Header>

              <Collapse in={expandedIndex === index}>
                <div>
                  <Card.Body>
                    {expandedPackageId === pkg.Id && (
                      <PackageDetails
                        packageId={pkg.Id}
                        fetchDetails={getPackageDetails}
                      />
                    )}
                  </Card.Body>
                </div>
              </Collapse>
            </Card>
          ))}
        </Card>
      )}
    </div>
  );
};

export default Packages;
