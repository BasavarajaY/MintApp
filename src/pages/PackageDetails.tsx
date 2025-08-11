// src/components/PackageDetails.tsx
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import AppSpinner from "../components/common/AppSpinner";

interface PackageDetailsProps {
  packageId: string;
  fetchDetails: (packageId: string) => Promise<any[]>;
}

const PackageDetails: React.FC<PackageDetailsProps> = ({
  packageId,
  fetchDetails,
}) => {
  const [details, setDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const response = await fetchDetails(packageId);
        setDetails(response);
      } catch (error) {
        console.error("Failed to fetch package details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [packageId, fetchDetails]);

  if (loading) return <AppSpinner />;

  if (!details.length)
    return <div className="text-muted">No details found.</div>;

  return (
    <div className="d-flex flex-wrap gap-3">
      {details.map((detail, i) => (
        <Card
          key={i}
          //   style={{
          //     width: "260px",
          //     border: "2px solid green",
          //     backgroundColor: "#d1e7dd",
          //   }}
          style={{
            width: "460px",
            border: "1px solid #ccc",
            backgroundColor: "#eaecf4ff",
            color: "#003DA5",
            borderRadius: "15px",
          }}
        >
          <Card.Body>
            <div className="justify-content-center align-items-center">
              <h6 className="text-center mb-1">{detail.title || "—"}</h6>
              <p className="text-center mb-0">
                <strong>ID:</strong> {detail.id || "N/A"}
              </p>
              <p className="text-center mb-0 text-muted">
                {detail.description || "No description."}
              </p>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default PackageDetails;
