// src/pages/TenantModal.tsx
import React, { useEffect, useState } from "react";

interface TenantModalProps {
  show: boolean;
  onClose: () => void;
  onAdd: (tenant: { name: string; type: string }) => void;
  initialData?: {
    tenant_id?: number;
    tenant_name: string;
    tenant_type: { id: string; name: string };
  };
  isEdit?: boolean;
}

const TenantModal: React.FC<TenantModalProps> = ({
  show,
  onClose,
  onAdd,
  initialData,
  isEdit,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.tenant_name || "");
      setType(initialData.tenant_type?.id || "");
    } else {
      setName("");
      setType("");
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!name || !type) return;
    onAdd({ name, type });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal d-block" tabIndex={-1} role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {isEdit ? "Edit Tenant" : "Add Tenant"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Tenant Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter tenant name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Tenant Type</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Select tenant type</option>
                <option value="100001">Source</option>
                <option value="100002">Target</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!name || !type}
            >
              {isEdit ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantModal;
