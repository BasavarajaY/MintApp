// src/components/ProfileModal.tsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { fetchTenants } from "../api/auth";

interface ProfileModalProps {
  show: boolean;
  handleClose: () => void;
  handleSave: (profile: any) => void;
  initialData?: any; // For edit mode
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  show,
  handleClose,
  handleSave,
  initialData,
}) => {
  const [profileName, setProfileName] = useState("");
  const [sourceTenant, setSourceTenant] = useState("");
  const [targetTenant, setTargetTenant] = useState("");
  const [tenants, setTenants] = useState<any[]>([]);

  // Load tenants when modal opens
  useEffect(() => {
    const loadTenants = async () => {
      try {
        const { data } = await fetchTenants();
        setTenants(data.tenants || []);
      } catch (err) {
        console.error("Error loading tenants:", err);
      }
    };
    if (show) {
      loadTenants();
    }
  }, [show]);

  // Pre-fill in edit mode
  useEffect(() => {
    if (initialData) {
      setProfileName(initialData.mint_profile_name || "");
      setSourceTenant(String(initialData.mint_profile_primary_tenant_id || ""));
      setTargetTenant(
        String(initialData.mint_profile_secondary_tenant_id || "")
      );
    } else {
      setProfileName("");
      setSourceTenant("");
      setTargetTenant("");
    }
  }, [initialData]);

  const onSave = () => {
    if (!profileName || !sourceTenant || !targetTenant) {
      alert("Please fill all fields.");
      return;
    }
    handleSave({
      name: profileName,
      environment: null,
      source: "",
      destination: "",
      sourceTenantId: Number(sourceTenant),
      targetTenantId: Number(targetTenant),
    });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {initialData ? "Edit Profile" : "Add Profile"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Profile Name */}
          <Form.Group className="mb-3">
            <Form.Label>Profile Name</Form.Label>
            <Form.Control
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              required
            />
          </Form.Group>

          {/* Source Tenant */}
          <Form.Group className="mb-3">
            <Form.Label>Source Tenant</Form.Label>
            <Form.Select
              value={sourceTenant}
              onChange={(e) => setSourceTenant(e.target.value)}
              required
            >
              <option value="">-- Select Source Tenant --</option>
              {tenants
                ?.filter(
                  (t: any) => Number(t.tenant_type?.taxonomy_id) === 100001
                )
                .map((t: any) => (
                  <option key={t.tenant_id} value={t.tenant_id}>
                    {t.tenant_name}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          {/* Target Tenant */}
          <Form.Group className="mb-3">
            <Form.Label>Target Tenant</Form.Label>
            <Form.Select
              value={targetTenant}
              onChange={(e) => setTargetTenant(e.target.value)}
              required
            >
              <option value="">-- Select Target Tenant --</option>
              {tenants
                ?.filter(
                  (t: any) => Number(t.tenant_type?.taxonomy_id) === 100002
                )
                .map((t: any) => (
                  <option key={t.tenant_id} value={t.tenant_id}>
                    {t.tenant_name}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSave}>
          {initialData ? "Update Profile" : "Save Profile"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProfileModal;
