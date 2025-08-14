// src/pages/Tenant.tsx
import React, { useEffect, useState } from "react";
import {
  createSourceTenant,
  createTargetTenant,
  fetchTenants,
  // updateTenant,
  deleteTenant,
} from "../api/auth";
import AddTenantModal from "./TenantModal";
import toast from "react-hot-toast";
import AppSpinner from "../components/common/AppSpinner";

const Tenants: React.FC = () => {
  const [tenantsData, setTenantsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const loadTenant = async () => {
      try {
        const { data } = await fetchTenants();
        setTenantsData(data.tenants);
        setFilteredData(data.tenants);
      } catch (err: any) {
        console.error("Error fetching tenant:", err);
        setError("Failed to load tenant data.");
      } finally {
        setLoading(false);
      }
    };

    loadTenant();
  }, []);

  useEffect(() => {
    const filtered = tenantsData.filter((tenant: any) =>
      tenant.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, tenantsData]);

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "—";
    const date = new Date(timestamp * 1000);
    // return date.toLocaleString();
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const handleAddTenant = async (tenant: { name: string; type: string }) => {
    const payload = {
      tenant_name: tenant.name,
      tenant_type: tenant.type,
      tenant_token_url: "",
      tenant_client_id: "",
      tenant_client_secret: "",
      tenant_api_url: "",
      tenant_neo_domain: null,
      tenant_neo_client_id: null,
      tenant_neo_client_secret: null,
      tenant_neo_account_id: null,
      tenant_neo_iflow_host: null,
      tenant_neo_iflow_user: null,
      tenant_neo_iflow_password: null,
      tenant_cf_domain: "",
      tenant_cf_user: "",
      tenant_cf_password: "",
      tenant_cf_org_id: "",
      tenant_cf_space_name: "",
      created_by: null,
    };

    if (tenant.type === "100001") {
      await createSourceTenant(payload);
    } else {
      await createTargetTenant(payload);
    }

    toast.success("Tenant added successfully!");
    await loadTenants();
  };

  const loadTenants = async () => {
    try {
      const { data } = await fetchTenants();
      setTenantsData(data.tenants);
      setFilteredData(data.tenants);
    } catch (err: any) {
      console.error("Error fetching tenant:", err);
      setError("Failed to load tenant data.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTenant = (tenant: any) => {
    setSelectedTenant(tenant);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDeleteTenant = async (tenantId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this tenant?"
    );
    if (!confirmDelete) return;

    try {
      await deleteTenant(tenantId);
      toast.success("Tenant deleted successfully");
      await loadTenants();
    } catch (err) {
      toast.error("Failed to delete tenant");
    }
  };

  if (loading) return <AppSpinner text="Loading Tenants..." />;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0" style={{ color: "#003DA5" }}>
          Tenants
        </h4>
        <div className="d-flex gap-2 align-items-center">
          <input
            type="text"
            placeholder="Search..."
            className="form-control"
            style={{
              border: "1px solid #003DA5",
              borderRadius: "5px",
              color: "#003DA5",
              maxWidth: "240px",
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <>
            <button
              className="btn btn-outline-primary fw-bold"
              onClick={() => {
                setShowModal(true);
                setIsEdit(false);
                setSelectedTenant(null);
              }}
            >
              ＋
            </button>
            <AddTenantModal
              show={showModal}
              onClose={() => {
                setShowModal(false);
                setSelectedTenant(null);
                setIsEdit(false);
              }}
              onAdd={handleAddTenant}
              initialData={selectedTenant}
              isEdit={isEdit}
            />
          </>
        </div>
      </div>

      {!loading && !error && (
        <div
          className="p-3"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #ccc",
            borderRadius: "4px",
            color: "#003DA5",
          }}
        >
          <table
            className="table table-appblue"
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
            }}
          >
            <thead style={{ backgroundColor: "#f5f5f5" }}>
              <tr>
                <th className="py-2 px-3">Tenant Id</th>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Tenant Type</th>
                <th className="py-2 px-3">Created By</th>
                <th className="py-2 px-3">Created On</th>
                <th className="py-2 px-3">Modified On</th>
                <th className="py-2 px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-3">
                    No tenant records found.
                  </td>
                </tr>
              ) : (
                filteredData.map((tenant: any) => (
                  <tr key={tenant.tenant_id}>
                    <td className="py-2 px-3">{tenant.tenant_id || "—"}</td>
                    <td className="py-2 px-3">{tenant.tenant_name || "—"}</td>
                    <td className="py-2 px-3">
                      {tenant.tenant_type?.name || "—"}
                    </td>
                    <td className="py-2 px-3">{tenant.created_by ?? "—"}</td>
                    <td className="py-2 px-3">
                      {formatDate(tenant.created_on)}
                    </td>
                    <td className="py-2 px-3">
                      {formatDate(tenant.modified_on)}
                    </td>
                    <td className="py-2 px-3">
                      <div className="d-flex gap-3 align-items-center">
                        <i
                          className="bi bi-pencil-square"
                          style={{
                            color: "#FFC107",
                            cursor: "pointer",
                            fontSize: "1.2rem",
                          }}
                          title="Edit"
                          onClick={() => handleEditTenant(tenant)}
                        ></i>
                        <i
                          className="bi bi-trash"
                          style={{
                            color: "#DC3545",
                            cursor: "pointer",
                            fontSize: "1.2rem",
                          }}
                          title="Delete"
                          onClick={() => handleDeleteTenant(tenant.tenant_id)}
                        ></i>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Tenants;
