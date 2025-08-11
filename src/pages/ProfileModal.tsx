import React, { useEffect, useState } from "react";

interface ProfileModalProps {
  show: boolean;
  onClose: () => void;
  onAdd: (profile: {
    id?: number;
    name: string;
    environment: string;
    source: string;
    destination: string;
  }) => void;
  initialData?: {
    id?: number;
    name: string;
    environment: string;
    source: string;
    destination: string;
  };
  isEdit?: boolean;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  show,
  onClose,
  onAdd,
  initialData,
  isEdit,
}) => {
  const [id, setId] = useState<number | undefined>(undefined);
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  useEffect(() => {
    if (initialData) {
      setId(initialData.id);
      setName(initialData.name || "");
      setEnvironment(initialData.environment || "");
      setSource(initialData.source || "");
      setDestination(initialData.destination || "");
    } else {
      setId(undefined);
      setName("");
      setEnvironment("");
      setSource("");
      setDestination("");
    }
  }, [initialData]);

  const handleSubmit = () => {
    onAdd({ id, name, environment, source, destination });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal d-block" tabIndex={-1} role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {isEdit ? "Edit Profile" : "Add Profile"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Profile Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter profile name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Environment</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter environment"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Source</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter source system"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Destination</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter destination system"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!name || !environment || !source || !destination}
            >
              {isEdit ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
