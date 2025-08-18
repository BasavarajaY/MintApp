import React, { useEffect, useState } from "react";

const ProfileBanner: React.FC = () => {
  const [name, setName] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedProfile");
    if (stored) {
      const selectedProfile = JSON.parse(stored);
      setName(selectedProfile.mint_profile_name || "N/A");
      setSource(selectedProfile.mint_profile_source_runtime || "N/A");
      setDestination(selectedProfile.mint_profile_destination_runtime || "N/A");
    }
  }, []);

  if (!name) return null;

  return (
    <div
      className="card shadow-sm mb-3 border-0"
      style={{
        borderLeft: "6px solid #003DA5",
        background: "linear-gradient(120deg, #e3f0fc 0%, #f5f8fa 100%)",
      }}
    >
      <div
        className="alert alert-info d-flex justify-content-between align-items-center rounded shadow-sm mb-1"
        style={{ borderLeft: "6px solid #003DA5" }}
      >
        <div>
          <span className="fw-bold text-primary">Profile:</span>{" "}
          <span className="fw-semibold">{name}</span>
        </div>
        <div>
          <span className="fw-bold text-primary">Source:</span>{" "}
          <span className="fw-semibold">{source}</span>
        </div>
        <div>
          <span className="fw-bold text-primary">Destination:</span>{" "}
          <span className="fw-semibold">{destination}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileBanner;
