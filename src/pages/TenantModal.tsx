// src/pages/TenantModal.tsx
import React, { useEffect, useState } from "react";

interface TenantModalProps {
  show: boolean;
  onClose: () => void;
  onAdd: (tenant: any) => void;
  initialData?: any;
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

  // Common fields
  const [tenantTokenUrl, setTenantTokenUrl] = useState("");
  const [tenantClientId, setTenantClientId] = useState("");
  const [tenantClientSecret, setTenantClientSecret] = useState("");
  const [tenantApiUrl, setTenantApiUrl] = useState("");

  // Neo (Source) fields
  const [tenantNeoDomain, setTenantNeoDomain] = useState("");
  const [tenantNeoClientId, setTenantNeoClientId] = useState("");
  const [tenantNeoClientSecret, setTenantNeoClientSecret] = useState("");
  const [tenantNeoAccountId, setTenantNeoAccountId] = useState("");
  const [tenantNeoIflowHost, setTenantNeoIflowHost] = useState("");
  const [tenantNeoIflowUser, setTenantNeoIflowUser] = useState("");
  const [tenantNeoIflowPassword, setTenantNeoIflowPassword] = useState("");

  // CF (Target) fields
  const [tenantCfDomain, setTenantCfDomain] = useState("");
  const [tenantCfUser, setTenantCfUser] = useState("");
  const [tenantCfPassword, setTenantCfPassword] = useState("");
  const [tenantCfOrgId, setTenantCfOrgId] = useState("");
  const [tenantCfSpaceName, setTenantCfSpaceName] = useState("");

  // Load data for Edit
  useEffect(() => {
    if (initialData) {
      setName(initialData.tenant_name || "");

      // Normalize tenant_type
      let tenantTypeValue = "";
      if (typeof initialData.tenant_type === "string") {
        tenantTypeValue = initialData.tenant_type;
      } else if (typeof initialData.tenant_type === "object") {
        tenantTypeValue = initialData.tenant_type?.taxonomy_id || "";
      }
      setType(tenantTypeValue);

      // preload common
      setTenantTokenUrl(initialData.tenant_token_url || "");
      setTenantClientId(initialData.tenant_client_id || "");
      setTenantClientSecret(initialData.tenant_client_secret || "");
      setTenantApiUrl(initialData.tenant_api_url || "");

      // preload Neo
      setTenantNeoDomain(initialData.tenant_neo_domain || "");
      setTenantNeoClientId(initialData.tenant_neo_client_id || "");
      setTenantNeoClientSecret(initialData.tenant_neo_client_secret || "");
      setTenantNeoAccountId(initialData.tenant_neo_account_id || "");
      setTenantNeoIflowHost(initialData.tenant_neo_iflow_host || "");
      setTenantNeoIflowUser(initialData.tenant_neo_iflow_user || "");
      setTenantNeoIflowPassword(initialData.tenant_neo_iflow_password || "");

      // preload CF
      setTenantCfDomain(initialData.tenant_cf_domain || "");
      setTenantCfUser(initialData.tenant_cf_user || "");
      setTenantCfPassword(initialData.tenant_cf_password || "");
      setTenantCfOrgId(initialData.tenant_cf_org_id || "");
      setTenantCfSpaceName(initialData.tenant_cf_space_name || "");
    } else {
      // reset for Add
      setName("");
      setType("");
      setTenantTokenUrl("");
      setTenantClientId("");
      setTenantClientSecret("");
      setTenantApiUrl("");
      setTenantNeoDomain("");
      setTenantNeoClientId("");
      setTenantNeoClientSecret("");
      setTenantNeoAccountId("");
      setTenantNeoIflowHost("");
      setTenantNeoIflowUser("");
      setTenantNeoIflowPassword("");
      setTenantCfDomain("");
      setTenantCfUser("");
      setTenantCfPassword("");
      setTenantCfOrgId("");
      setTenantCfSpaceName("");
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!name || !type) return;

    onAdd({
      name,
      type,
      tokenUrl: tenantTokenUrl,
      clientId: tenantClientId,
      clientSecret: tenantClientSecret,
      apiUrl: tenantApiUrl,

      // Neo fields
      neoDomain: type === "100001" ? tenantNeoDomain : null,
      neoClientId: type === "100001" ? tenantNeoClientId : null,
      neoClientSecret: type === "100001" ? tenantNeoClientSecret : null,
      neoAccountId: type === "100001" ? tenantNeoAccountId : null,
      neoIflowHost: type === "100001" ? tenantNeoIflowHost : null,
      neoIflowUser: type === "100001" ? tenantNeoIflowUser : null,
      neoIflowPassword: type === "100001" ? tenantNeoIflowPassword : null,

      // CF fields
      cfDomain: type === "100002" ? tenantCfDomain : null,
      cfUser: type === "100002" ? tenantCfUser : null,
      cfPassword: type === "100002" ? tenantCfPassword : null,
      cfOrgId: type === "100002" ? tenantCfOrgId : null,
      cfSpaceName: type === "100002" ? tenantCfSpaceName : null,
    });

    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal d-block" tabIndex={-1} role="dialog">
      <div className="modal-dialog modal-lg" role="document">
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
            {/* Tenant Name */}
            <div className="mb-3">
              <label className="form-label">Tenant Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter tenant name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Tenant Type */}
            <div className="mb-3">
              <label className="form-label">Tenant Type</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="">Select tenant type</option>
                <option value="100001">Source</option>
                <option value="100002">Target</option>
              </select>
            </div>

            {/* Common fields */}
            <div className="mb-3">
              <label className="form-label">Tenant Token URL</label>
              <input
                type="text"
                className="form-control"
                value={tenantTokenUrl}
                onChange={(e) => setTenantTokenUrl(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Tenant Client ID</label>
              <input
                type="text"
                className="form-control"
                value={tenantClientId}
                onChange={(e) => setTenantClientId(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Tenant Client Secret</label>
              <input
                type="password"
                className="form-control"
                value={tenantClientSecret}
                onChange={(e) => setTenantClientSecret(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Tenant API URL</label>
              <input
                type="text"
                className="form-control"
                value={tenantApiUrl}
                onChange={(e) => setTenantApiUrl(e.target.value)}
                required
              />
            </div>

            {/* Neo Fields (Source only) */}
            {type === "100001" && (
              <>
                <h6 className="mt-4">Tenant Type : Source</h6>
                <div className="mb-3">
                  <label className="form-label">Tenant Neo Domain</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tenantNeoDomain}
                    onChange={(e) => setTenantNeoDomain(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tenant Neo Client ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tenantNeoClientId}
                    onChange={(e) => setTenantNeoClientId(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tenant Neo Client Secret</label>
                  <input
                    type="password"
                    className="form-control"
                    value={tenantNeoClientSecret}
                    onChange={(e) => setTenantNeoClientSecret(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tenant Neo Account ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tenantNeoAccountId}
                    onChange={(e) => setTenantNeoAccountId(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tenant Neo IFlow Host</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tenantNeoIflowHost}
                    onChange={(e) => setTenantNeoIflowHost(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tenant Neo IFlow User</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tenantNeoIflowUser}
                    onChange={(e) => setTenantNeoIflowUser(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Tenant Neo IFlow Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={tenantNeoIflowPassword}
                    onChange={(e) => setTenantNeoIflowPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {/* CF Fields (Target only) */}
            {type === "100002" && (
              <>
                <h6 className="mt-4">Tenant Type : Target</h6>
                <div className="mb-3">
                  <label className="form-label">Tenant CF Domain</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tenantCfDomain}
                    onChange={(e) => setTenantCfDomain(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tenant CF User</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tenantCfUser}
                    onChange={(e) => setTenantCfUser(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tenant CF Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={tenantCfPassword}
                    onChange={(e) => setTenantCfPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tenant CF Org ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tenantCfOrgId}
                    onChange={(e) => setTenantCfOrgId(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tenant CF Space Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tenantCfSpaceName}
                    onChange={(e) => setTenantCfSpaceName(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
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
