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
      className="alert alert-info p-3 mb-3 d-flex justify-content-between align-items-center"
      style={{ borderLeft: "6px solid #003DA5" }}
    >
      <div>
        <strong style={{ color: "#003DA5" }}>Profile:</strong>{" "}
        <strong>{name}</strong>
      </div>
      <div>
        <strong style={{ color: "#003DA5" }}>Source:</strong>{" "}
        <strong>{source}</strong>
      </div>
      <div>
        <strong style={{ color: "#003DA5" }}>Destination:</strong>{" "}
        <strong>{destination}</strong>
      </div>
    </div>
  );
};

export default ProfileBanner;
