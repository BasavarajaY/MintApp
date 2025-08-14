import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";
import { fetchMintProfiles } from "../api/auth";

interface Profile {
  mint_profile_id?: number;
  mint_profile_name: string;
  mint_profile_environment_id: number;
  mint_profile_source_runtime: string;
  mint_profile_destination_runtime: string;
}

interface Props {
  show: boolean;
  onClose: () => void;
}

const ProfSettingModal: React.FC<Props> = ({ show, onClose }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<
    number | undefined
  >(undefined);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      loadProfilesAndPreselect();
    }
  }, [show]);

  const loadProfilesAndPreselect = async () => {
    setLoading(true);
    try {
      const response = await fetchMintProfiles();
      const fetchedProfiles = response.data;
      setProfiles(fetchedProfiles);

      // Try to preselect from sessionStorage
      const stored = sessionStorage.getItem("selectedProfile");
      if (stored) {
        const parsed = JSON.parse(stored);
        const match = fetchedProfiles.find(
          (p: Profile) => p.mint_profile_id === parsed.mint_profile_id
        );
        if (match) {
          setSelectedProfileId(match.mint_profile_id);
          setSelectedProfile(match);
          return; // ✅ stop here, we already set it
        }
      }

      // If no stored profile, default to first profile
      if (fetchedProfiles.length > 0) {
        setSelectedProfileId(fetchedProfiles[0].mint_profile_id);
        setSelectedProfile(fetchedProfiles[0]);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const profileId = value ? parseInt(value, 10) : undefined;
    setSelectedProfileId(profileId);
    const profile = profiles.find((p) => p.mint_profile_id === profileId);
    setSelectedProfile(profile || null);
  };

  const handleSaveProfile = () => {
    if (!selectedProfile) return;

    sessionStorage.setItem("selectedProfile", JSON.stringify(selectedProfile));

    toast.success(`Profile "${selectedProfile.mint_profile_name}" saved!`, {
      position: "bottom-right",
    });

    onClose();
    // navigate("/app/dashboard/tenants", { replace: true });
    // Redirect to tenants and reload
    window.location.href = "/app/dashboard/tenants";
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Select Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Select a profile</Form.Label>
          <Form.Select value={selectedProfileId} onChange={handleSelectChange}>
            <option value="" disabled>
              -- Select Profile --
            </option>
            {profiles.map((profile) => (
              <option
                key={profile.mint_profile_id}
                value={profile.mint_profile_id}
              >
                {profile.mint_profile_name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center p-4">
            <Spinner />
          </div>
        ) : (
          <>
            {selectedProfile && (
              <div
                className="mt-3 p-3 border rounded"
                style={{
                  backgroundColor: "#9eeaf9",
                }}
              >
                <h5>{selectedProfile.mint_profile_name}</h5>
                <p>
                  Environment:{" "}
                  {selectedProfile.mint_profile_environment_id || "N/A"}
                </p>
                <p>
                  Source: {selectedProfile.mint_profile_source_runtime || "N/A"}
                </p>
                <p>
                  Destination:{" "}
                  {selectedProfile.mint_profile_destination_runtime || "N/A"}
                </p>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSaveProfile}
          disabled={!selectedProfile}
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProfSettingModal;
